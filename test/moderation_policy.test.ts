import assert from "node:assert/strict";
import test from "node:test";
import { moderationState } from "../src/moderation_policy.js";

test("queues player and live-event assets while releasing system art", () => {
  assert.equal(moderationState({ playerGenerated: true }), "pending_review");
  assert.equal(
    moderationState({ playerGenerated: false, liveEventId: "summer-raid" }),
    "pending_review"
  );
  assert.equal(moderationState({ playerGenerated: false }), "ready");
});
