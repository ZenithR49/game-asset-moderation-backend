import { createServer } from "node:http";
import { ZodError } from "zod";
import { assetRequest, createAsset } from "./asset_workflow.js";

const port = Number(process.env.PORT ?? 3000);

const server = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/assets") {
    response.writeHead(404).end();
    return;
  }

  try {
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(Buffer.from(chunk));
    const body = assetRequest.parse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    const asset = await createAsset(body);
    response.writeHead(201, { "content-type": "application/json" });
    response.end(JSON.stringify(asset));
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      response.writeHead(400, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "Invalid asset request" }));
      return;
    }
    console.error(error);
    response.writeHead(502, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Image generation failed" }));
  }
});

server.listen(port, () => console.log(`Asset service listening on http://localhost:${port}`));
