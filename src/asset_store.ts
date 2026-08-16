import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ModerationState } from "./moderation_policy.js";

export type StoredAsset = {
  id: string;
  prompt: string;
  playerId?: string;
  liveEventId?: string;
  moderation: ModerationState;
  imagePath: string;
  createdAt: string;
};

const root = process.env.ASSET_DIR ?? "var/assets";

export async function findAsset(id: string): Promise<StoredAsset | undefined> {
  try {
    return JSON.parse(await readFile(join(root, `${id}.json`), "utf8")) as StoredAsset;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

export async function storeAsset(
  record: Omit<StoredAsset, "imagePath">,
  image: Buffer
): Promise<StoredAsset> {
  await mkdir(root, { recursive: true });
  const imagePath = join(root, `${record.id}.png`);
  const stored = { ...record, imagePath };
  await writeFile(imagePath, image);
  await writeFile(join(root, `${record.id}.json`), JSON.stringify(stored, null, 2));
  return stored;
}
