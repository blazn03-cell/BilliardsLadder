// In-Memory Revenue Configuration Service
// Provides in-memory storage for revenue configurations with database fallback

import { DEFAULT_REVENUE_CONFIG, type RevenueConfig, validateRevenueConfig, ALTERNATIVE_CONFIGS } from "../config/revenueConfig";

export class RevenueConfigService {
  private static instance: RevenueConfigService;
  private activeConfig: RevenueConfig | null = null;
  private storedConfigs: Map<string, RevenueConfig> = new Map();

  private constructor() {
    // Constructor kept minimal to avoid circular import issues
  }

  public static getInstance(): RevenueConfigService {
    if (!RevenueConfigService.instance) {
      RevenueConfigService.instance = new RevenueConfigService();
    }
    return RevenueConfigService.instance;
  }

  // Initialize with in-memory default configuration
  async initialize(): Promise<void> {
    try {
      // Initialize stored configurations
      this.storedConfigs.set(DEFAULT_REVENUE_CONFIG.id, DEFAULT_REVENUE_CONFIG);
      ALTERNATIVE_CONFIGS.forEach(config => {
        this.storedConfigs.set(config.id, config);
      });

      // Use default configuration for in-memory storage
      this.activeConfig = { ...DEFAULT_REVENUE_CONFIG };
      console.log("Revenue configuration initialized with default settings (in-memory mode)");
    } catch (error) {
      console.warn("Failed to initialize revenue configuration, using default:", error);
      this.activeConfig = { ...DEFAULT_REVENUE_CONFIG };
    }
  }

  // Get current active configuration
  getActiveConfig(): RevenueConfig {
    if (!this.activeConfig) {
      return { ...DEFAULT_REVENUE_CONFIG };
    }
    return { ...this.activeConfig };
  }

  // Save a new configuration and make it active (in-memory storage)
  async setActiveConfig(config: RevenueConfig): Promise<{ success: boolean; errors?: string[] }> {
    try {
      // Validate configuration
      const errors = validateRevenueConfig(config);
      if (errors.length > 0) {
        return { success: false, errors };
      }

      // Store configuration in memory
      const configWithTimestamp = {
        ...config,
        lastModified: new Date(),
        modifiedBy: config.modifiedBy || "admin"
      };
      
      this.storedConfigs.set(config.id, configWithTimestamp);
      
      // Update in-memory active config
      this.activeConfig = { ...configWithTimestamp };

      console.log(`Revenue configuration '${config.name}' activated (in-memory mode)`);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        errors: [`Configuration error: ${error.message}`] 
      };
    }
  }

  // Get all configurations from in-memory storage
  async getAllConfigs(): Promise<RevenueConfig[]> {
    try {
      const configs = Array.from(this.storedConfigs.values());
      // Sort by last modified date
      return configs.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
    } catch (error) {
      console.error("Failed to load configurations from memory:", error);
      return [{ ...DEFAULT_REVENUE_CONFIG }];
    }
  }

  // Activate an existing configuration by ID (in-memory storage)
  async activateConfig(configId: string, modifiedBy: string = "admin"): Promise<{ success: boolean; errors?: string[] }> {
    try {
      // Find the configuration to activate
      const config = this.storedConfigs.get(configId);

      if (!config) {
        return { success: false, errors: ["Configuration not found"] };
      }

      // Update the configuration with new metadata
      const updatedConfig = {
        ...config,
        lastModified: new Date(),
        modifiedBy: modifiedBy
      };

      // Store the updated configuration
      this.storedConfigs.set(configId, updatedConfig);

      // Update in-memory active config
      this.activeConfig = { ...updatedConfig };

      console.log(`Revenue configuration '${config.name}' activated by ${modifiedBy} (in-memory mode)`);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        errors: [`Configuration error: ${error.message}`] 
      };
    }
  }

  // Add a new configuration to in-memory storage
  addConfiguration(config: RevenueConfig): { success: boolean; errors?: string[] } {
    try {
      const errors = validateRevenueConfig(config);
      if (errors.length > 0) {
        return { success: false, errors };
      }

      const configWithTimestamp = {
        ...config,
        lastModified: new Date(),
        modifiedBy: config.modifiedBy || "admin"
      };

      this.storedConfigs.set(config.id, configWithTimestamp);
      console.log(`Revenue configuration '${config.name}' added to memory`);
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        errors: [`Configuration error: ${error.message}`] 
      };
    }
  }

  // PART 2: Two-Phase Revenue Split Logic
  // Determine current phase based on active halls count
  getCurrentPhase(activeHallsCount: number): 'growth' | 'expansion' {
    return activeHallsCount >= 20 ? 'expansion' : 'growth';
  }

  // Calculate revenue splits based on phase (ALL IN CENTS)
  calculateRevenueSplit(activeHallsCount: number): {
    phase: 'growth' | 'expansion';
    baseFeePerHall: number; // cents
    matchesPerHall: number;
    revenuePerHall: number; // cents (V = $4,000)
    totalRevenue: number; // cents
    splits: {
      owner: number; // cents
      partner: number; // cents
      founder: number; // cents
      subscriptionBonus?: number; // cents (expansion phase only)
    };
    subscriptionsHeld: boolean;
  } {
    const phase = this.getCurrentPhase(activeHallsCount);
    const baseFeePerHall = 10000; // $100 in cents
    const matchesPerHall = 40;
    const revenuePerHall = baseFeePerHall * matchesPerHall; // $4,000 in cents = 400,000 cents
    const totalRevenue = revenuePerHall * activeHallsCount;

    if (phase === 'growth') {
      // Growth Phase: 40% Owner, 33% Partner, remainder to Founder
      // Calculate owner and partner first, then assign remainder to ensure 100% allocation
      const owner = Math.floor(totalRevenue * 0.40); // 40%
      const partner = Math.floor(totalRevenue * 0.33); // 33%
      const founder = totalRevenue - owner - partner; // Remainder (~27%)
      
      return {
        phase,
        baseFeePerHall,
        matchesPerHall,
        revenuePerHall,
        totalRevenue,
        splits: {
          owner,
          partner,
          founder,
        },
        subscriptionsHeld: true, // Subscriptions not paid in growth phase
      };
    } else {
      // Expansion Phase: 40% Owner, 35% Partner, remainder to Founder + subs
      // Calculate owner and partner first, then assign remainder to ensure 100% allocation
      const maxSubBonusPerHall = 10000; // $100 per hall in cents
      const partnerSubBonus = Math.min(maxSubBonusPerHall * activeHallsCount, maxSubBonusPerHall * activeHallsCount);
      
      const owner = Math.floor(totalRevenue * 0.40); // 40%
      const partner = Math.floor(totalRevenue * 0.35); // 35% base
      const founder = totalRevenue - owner - partner; // Remainder (~25%)

      return {
        phase,
        baseFeePerHall,
        matchesPerHall,
        revenuePerHall,
        totalRevenue,
        splits: {
          owner,
          partner,
          founder,
          subscriptionBonus: partnerSubBonus, // Partner gets up to $100/hall
        },
        subscriptionsHeld: false, // Subscriptions flow to Founder in expansion
      };
    }
  }

  // PART 3: Player Subscription Splits (ALL IN CENTS)
  getSubscriptionSplits(tier: 'rookie' | 'basic' | 'premium' | 'family' | 'elite'): {
    tier: string;
    totalCents: number;
    splits: {
      tournamentSpecials: { cents: number; percentage: number };
      operatorCut: { cents: number; percentage: number };
      playerIncentives: { cents: number; percentage: number };
      trusteesAdmin: { cents: number; percentage: number };
      growthFund: { cents: number; percentage: number };
      founder: { cents: number; percentage: number };
    };
  } {
    const subscriptionSplits = {
      rookie: {
        tier: 'Rookie Pass',
        totalCents: 999, // $9.99
        splits: {
          tournamentSpecials: { cents: 280, percentage: 28 },
          operatorCut: { cents: 250, percentage: 25 },
          playerIncentives: { cents: 200, percentage: 20 },
          trusteesAdmin: { cents: 150, percentage: 15 },
          growthFund: { cents: 100, percentage: 10 },
          founder: { cents: 19, percentage: 2 },
        },
      },
      basic: {
        tier: 'Basic',
        totalCents: 2499, // $24.99
        splits: {
          tournamentSpecials: { cents: 700, percentage: 28 },
          operatorCut: { cents: 625, percentage: 25 },
          playerIncentives: { cents: 500, percentage: 20 },
          trusteesAdmin: { cents: 350, percentage: 14 },
          growthFund: { cents: 200, percentage: 8 },
          founder: { cents: 124, percentage: 5 },
        },
      },
      premium: {
        tier: 'Premium',
        totalCents: 3499, // $34.99
        splits: {
          tournamentSpecials: { cents: 980, percentage: 28 },
          operatorCut: { cents: 875, percentage: 25 },
          playerIncentives: { cents: 700, percentage: 20 },
          trusteesAdmin: { cents: 455, percentage: 13 },
          growthFund: { cents: 245, percentage: 7 },
          founder: { cents: 244, percentage: 7 },
        },
      },
      family: {
        tier: 'Family',
        totalCents: 4499, // $44.99
        splits: {
          tournamentSpecials: { cents: 1260, percentage: 28 },
          operatorCut: { cents: 1125, percentage: 25 },
          playerIncentives: { cents: 900, percentage: 20 },
          trusteesAdmin: { cents: 585, percentage: 13 },
          growthFund: { cents: 315, percentage: 7 },
          founder: { cents: 314, percentage: 7 },
        },
      },
      elite: {
        tier: 'Elite',
        totalCents: 9900, // $99
        splits: {
          tournamentSpecials: { cents: 2772, percentage: 28 },
          operatorCut: { cents: 2475, percentage: 25 },
          playerIncentives: { cents: 1980, percentage: 20 },
          trusteesAdmin: { cents: 1287, percentage: 13 },
          growthFund: { cents: 693, percentage: 7 },
          founder: { cents: 693, percentage: 7 },
        },
      },
    };

    return subscriptionSplits[tier];
  }

  // Helper: Format cents to dollars for display
  formatCentsToDollars(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

// Global service instance
const revenueConfigService = RevenueConfigService.getInstance();

// Exported functions for backward compatibility
export async function initializeRevenueConfig(): Promise<void> {
  await revenueConfigService.initialize();
}

export function getActiveConfig(): RevenueConfig {
  return revenueConfigService.getActiveConfig();
}

export async function setActiveConfig(config: RevenueConfig): Promise<{ success: boolean; errors?: string[] }> {
  return await revenueConfigService.setActiveConfig(config);
}

export async function getAllConfigs(): Promise<RevenueConfig[]> {
  return await revenueConfigService.getAllConfigs();
}

export async function activateConfig(configId: string, modifiedBy: string = "admin"): Promise<{ success: boolean; errors?: string[] }> {
  return await revenueConfigService.activateConfig(configId, modifiedBy);
}