import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }
  const data = new Uint8Array(await request.arrayBuffer());
  if (data.byteLength === 0) {
    return new Response("Empty body", { status: 400 });
  }
  const directory = path.join(process.cwd(), "public", "models");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "card.usdz"), data);
  return Response.json({ bytes: data.byteLength });
}
