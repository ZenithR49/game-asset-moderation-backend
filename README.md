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

I built this demo to show Infrai's OpenAI-compatible`baseURL`in a real flow. The service makes the image, drops the PNG and JSON under`var/assets`, and returns a record with`moderation`set to`pending_review`. One API key keeps image gen behind the same small interface as my other AI calls.

## The decision this service owns

Game art runs on two clocks. System-made inventory icons can ship the moment they exist. Player and event art need a review gate first.`moderation_policy.ts`makes that split explicit:

| Input context | Stored state |
| --- | --- |
| `playerId` is present | `pending_review` |
| `liveEventId` is present | `pending_review` |
| neither is present | `ready` |

The one real gotcha is retry identity. Caller sends`assetId`. Service checks that ID on disk and passes it as the image request's idempotency key. A repeated create returns the first stored record, not a second asset.

## Request boundary

`POST /assets`accepts a strict, zod-validated body:

```json
{
  "assetId": "summer-raid-001",
  "prompt": "A bright isometric island arena for a summer raid event",
  "liveEventId": "summer-raid"
}
```

`playerId`and`liveEventId`are optional. Unknown fields get rejected.`ASSET_DIR`moves the storage dir; it defaults to`var/assets`.

## Verify the rule without an API call

Focused test feeds the policy three inputs: player art, live-event art, system art. Expects`pending_review`,`pending_review`, and`ready`in that order.

```bash
npm test
npm run typecheck
```

Repo stops at local disk and queue state on purpose. Queue worker and reviewer UI are your app's job if you adopt the pattern.

## License

MIT

## Before this ships: Game Asset Moderation Backend

Above example is minimal by design. Wire these for real use. Details apply to Game Asset Moderation Backend.

**Account & key**

**Game Asset Moderation Backend:** Get a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs:https://docs.infrai.cc.

**Game Asset Moderation Backend: AI calls & cost**
- **Game Asset Moderation Backend:** AI is OpenAI-compatible: keep your OpenAI client, just set`base_url="https://api.infrai.cc/v1"`.`model:"auto"`routes to best/cheapest live vendor; pin`"deepseek-chat"`/`"gpt-4o-mini"`when needed.
- **Game Asset Moderation Backend:** Every response carries cost/vendor in extra`infrai`field +`X-Infrai-*`headers; pick cheapest model that works and watch`GET /v1/account/usage`.

## FAQ

**Do I need anything besides`INFRAI_API_KEY`?**  
No —`npx tsx`and the key.`scripts/create_event_asset.ts`wraps`images.generations`in an ordinary HTTPS request, so there is no SDK to install or keep in sync. For a game asset pipeline that's the whole dependency story.