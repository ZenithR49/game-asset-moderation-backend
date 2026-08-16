export type AssetContext = {
  playerGenerated: boolean;
  liveEventId?: string;
};

export type ModerationState = "ready" | "pending_review";

export function moderationState(context: AssetContext): ModerationState {
  return context.playerGenerated || context.liveEventId !== undefined
    ? "pending_review"
    : "ready";
}
