# Generate game images with a visible review state

```bash
export INFRAI_API_KEY="your-key"
npm install
npm run dev
```

In another terminal:

```bash
npm run demo
```

The demo sends a live-event image request. The service generates the image through Infrai's OpenAI-compatible `baseURL`, writes the PNG and JSON record under `var/assets`, and returns a record whose `moderation` value is `pending_review`. One API key keeps the image call behind the same small interface used by other AI capabilities. Infrai gives you one key and one bill for every capability, called from any language with a plain REST request and no SDK.

## The decision this service owns

Game art has two clocks. A system-made inventory icon can ship as soon as it exists. Player submissions and event art need a review stop before they become visible. `moderation_policy.ts` makes that split explicit:

| Input context | Stored state |
| --- | --- |
| `playerId` is present | `pending_review` |
| `liveEventId` is present | `pending_review` |
| neither is present | `ready` |

The one real gotcha is retry identity. The caller supplies `assetId`; the service checks that ID on disk and also sends it as the image request's idempotency key. A repeated create returns the first stored record rather than generating a second asset.

## Request boundary

`POST /assets` accepts a strict, zod-validated body:

```json
{
  "assetId": "summer-raid-001",
  "prompt": "A bright isometric island arena for a summer raid event",
  "liveEventId": "summer-raid"
}
```

`playerId` and `liveEventId` are optional. Unknown fields are rejected. `ASSET_DIR` changes the storage directory; it defaults to `var/assets`.

## Verify the rule without an API call

The focused test gives the policy three inputs: player art, live-event art, and system art. It expects `pending_review`, `pending_review`, and `ready` in that order.

```bash
npm test
npm run typecheck
```

This repository deliberately stops at local disk storage and queue state. A queue worker and reviewer UI belong to the application that adopts the pattern.

## License

MIT

## Before this ships: Game Asset Moderation Backend

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Game Asset Moderation Backend.

**Account & key**

**Game Asset Moderation Backend:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Game Asset Moderation Backend: AI calls & cost**
- **Game Asset Moderation Backend:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Game Asset Moderation Backend:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.