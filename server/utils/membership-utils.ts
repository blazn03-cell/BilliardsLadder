// League membership utility functions for all subscription tiers

export interface LeagueMembershipBenefits {
  leagueFeeRate: number; // Decimal (0.04 = 4%)
  freeTournaments: boolean;
  tournamentEntryFee: number; // Cents
  perks: string[];
}

export function getLeagueMembershipBenefits(membershipTier: string): LeagueMembershipBenefits {
  switch (membershipTier) {
    case 'rookie':
      return {
        leagueFeeRate: 0.04, // 4% stake fee
        freeTournaments: false,
        tournamentEntryFee: 3000, // $30
        perks: [
          'Jump in the ladder',
          '4% stake fee',
          'Tournament entry: $30'
        ]
      };

    case 'basic':
    case 'standard':
      return {
        leagueFeeRate: 0.04, // 4% stake fee
        freeTournaments: false,
        tournamentEntryFee: 2500, // $25
        perks: [
          'Jump in the ladder',
          '4% stake fee',
          'Tournament entry: $25–30'
        ]
      };

    case 'premium':
    case 'pro':
      return {
        leagueFeeRate: 0.03, // 3% stake fee
        freeTournaments: true,
        tournamentEntryFee: 0, // FREE tournament entry
        perks: [
          'FREE tournament entry (worth $25–30)',
          'Lower stake fees (3%)',
          'Premium perks (priority seeding, livestream)',
          'Advanced analytics & coaching tools'
        ]
      };

    case 'family':
      return {
        leagueFeeRate: 0.04, // 4% stake fee
        freeTournaments: true,
        tournamentEntryFee: 0,
        perks: [
          'Up to 4 family members',
          '4% stake fee per match',
          'FREE tournament entry',
          'Family leaderboard'
        ]
      };

    case 'elite':
      return {
        leagueFeeRate: 0.02, // 2% stake fee
        freeTournaments: true,
        tournamentEntryFee: 0,
        perks: [
          'Lowest stake fees (2%)',
          'FREE tournament entry',
          'VIP seeding & livestream',
          'Priority matchmaking',
          'Dedicated support'
        ]
      };

    default: // 'none' or no membership
      return {
        leagueFeeRate: 0.15, // 15% stake fee for non-members
        freeTournaments: false,
        tournamentEntryFee: 3000, // $30 for non-members
        perks: []
      };
  }
}

export function calculateLeagueFees(challengeAmount: number, membershipTier: string): number {
  const benefits = getLeagueMembershipBenefits(membershipTier);
  const leagueFee = challengeAmount * benefits.leagueFeeRate;
  
  // For Basic tier: "5% league dues (rounded up)"
  if (membershipTier === 'basic') {
    return Math.ceil(leagueFee);
  }
  
  return Math.round(leagueFee);
}

export function getTournamentEntryFee(membershipTier: string): number {
  const benefits = getLeagueMembershipBenefits(membershipTier);
  return benefits.tournamentEntryFee;
}