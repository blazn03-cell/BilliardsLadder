// Transparency logging stubs
export async function logTransparencyEvent(event: any): Promise<void> {
  // stub
}

export async function getTransparencyLogs(filter?: any): Promise<any[]> {
  return [];
}

export async function createTransparencyLog(entry: any): Promise<any> {
  return { ...entry, id: `${Date.now()}`, createdAt: new Date() };
}

export const transparencyLogger = {
  async logStreakBonus(playerId: string, streakCount: number, amount: number): Promise<void> {
    // stub
  },
  async logWeeklyPrize(playerId: string, amount: number, participants?: number): Promise<void> {
    // stub
  },
  async logMilestone(playerId: string, milestone: string, reward: number): Promise<void> {
    // stub
  },
  async log(event: string, data: any): Promise<void> {
    // stub
  },
};
