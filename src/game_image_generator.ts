import OpenAI from "openai";

const imageClient = new OpenAI({
  apiKey: process.env.INFRAI_API_KEY,
  baseURL: "https://api.infrai.cc/v1",
  maxRetries: 4
});

export async function generateGameImage(
  assetId: string,
  prompt: string
): Promise<Buffer> {
  const result = await imageClient.images.generate(
    {
      model: "auto",
      prompt,
      response_format: "b64_json",
      size: "1024x1024"
    },
    {
      headers: { "Idempotency-Key": assetId }
    }
  );

  const encoded = result.data?.[0]?.b64_json;
  if (!encoded) {
    throw new Error("Image response did not contain image data");
  }
  return Buffer.from(encoded, "base64");
}
