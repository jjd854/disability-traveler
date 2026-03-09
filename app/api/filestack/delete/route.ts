export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";

type FilestackPolicy = {
  expiry: number;
  call: Array<"remove">;
};

type DeleteRequestBody = {
  handle: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function signFilestackPolicy(policyObj: FilestackPolicy, secret: string) {
  const policy = Buffer.from(JSON.stringify(policyObj)).toString("base64");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(policy)
    .digest("hex");
  return { policy, signature };
}

export async function POST(req: Request) {
  try {
    const raw = (await req.json()) as unknown;

    if (!isRecord(raw) || typeof raw.handle !== "string" || raw.handle.trim() === "") {
      return NextResponse.json({ ok: false, message: "Missing handle" }, { status: 400 });
    }

    const { handle } = raw as DeleteRequestBody;

    const apiKey = process.env.NEXT_PUBLIC_FILESTACK_API_KEY;
    const secret = process.env.FILESTACK_SECRET_KEY;

    if (!apiKey || !secret) {
      return NextResponse.json(
        { ok: false, message: "Server missing Filestack keys" },
        { status: 500 }
      );
    }

    // Policy valid for 5 minutes
    const expiry = Math.floor(Date.now() / 1000) + 300;
    const { policy, signature } = signFilestackPolicy({ expiry, call: ["remove"] }, secret);

    const url = `https://www.filestackapi.com/api/file/${encodeURIComponent(handle)}?key=${encodeURIComponent(
      apiKey
    )}&policy=${encodeURIComponent(policy)}&signature=${encodeURIComponent(signature)}`;

    const res = await fetch(url, { method: "DELETE" });
    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, message: "Filestack delete failed", status: res.status, details: text },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

