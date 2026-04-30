import type { IStorage } from "../storage";

/**
 * Fire-and-forget helper that records a user's most recent activity.
 * Call this from login, signup, match create, challenge create/accept,
 * and tournament join paths.
 *
 * Never throws — activity tracking should never block a user's request.
 */
export function touchUserActivity(storage: IStorage, userId: string | undefined | null): void {
  if (!userId) return;
  Promise.resolve(storage.touchUserActivity(userId)).catch((err) => {
    console.warn(`[activity] Failed to touch user ${userId}:`, err?.message || err);
  });
}
