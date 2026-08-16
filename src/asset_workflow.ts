import { z } from "zod";
import { findAsset, storeAsset, type StoredAsset } from "./asset_store.js";
import { generateGameImage } from "./game_image_generator.js";
import { moderationState } from "./moderation_policy.js";

export const assetRequest = z.object({
  assetId: z.string().regex(/^[a-zA-Z0-9_-]{8,64}$/),
  prompt: z.string().min(8).max(800),
  playerId: z.string().min(1).max(100).optional(),
  liveEventId: z.string().min(1).max(100).optional()
}).strict();

export async function createAsset(input: z.infer<typeof assetRequest>): Promise<StoredAsset> {
  const existing = await findAsset(input.assetId);
  if (existing) return existing;

  const image = await generateGameImage(input.assetId, input.prompt);
  return storeAsset(
    {
      id: input.assetId,
      prompt: input.prompt,
      playerId: input.playerId,
      liveEventId: input.liveEventId,
      moderation: moderationState({
        playerGenerated: input.playerId !== undefined,
        liveEventId: input.liveEventId
      }),
      createdAt: new Date().toISOString()
    },
    image
  );
}
