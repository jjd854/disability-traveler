import { NextResponse } from "next/server";

type SubscribeBody = {
  email?: unknown;
  token?: unknown;
};

type RecaptchaVerifyResponse = {
  success: boolean;
  score?: number;
  "error-codes"?: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function safeJson(res: Response): Promise<unknown> {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      return (await res.json()) as unknown;
    } catch {
      return null;
    }
  }
  try {
    const text = await res.text();
    return text ? { raw: text } : null;
  } catch {
    return null;
  }
}

function toRecaptchaResponse(value: unknown): RecaptchaVerifyResponse | null {
  if (!isRecord(value)) return null;
  if (typeof value.success !== "boolean") return null;

  const out: RecaptchaVerifyResponse = { success: value.success };

  if (typeof value.score === "number") out.score = value.score;
  if (Array.isArray(value["error-codes"]) && value["error-codes"].every((x) => typeof x === "string")) {
    out["error-codes"] = value["error-codes"];
  }

  return out;
}

export async function POST(req: Request) {
  try {
    // 0) Parse body safely
    let rawBody: unknown;
    try {
      rawBody = (await req.json()) as unknown;
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const body: SubscribeBody = isRecord(rawBody) ? (rawBody as SubscribeBody) : {};

    const email = String(body.email ?? "").trim().toLowerCase();
    const token = String(body.token ?? "").trim();

    if (!email || !token) {
      return NextResponse.json({ error: "Missing email or captcha token." }, { status: 400 });
    }

    const SECRET = process.env.RECAPTCHA_SECRET_KEY;
    if (!SECRET) {
      return NextResponse.json(
        { error: "Missing RECAPTCHA_SECRET_KEY on server." },
        { status: 500 }
      );
    }

    // 1) Verify reCAPTCHA v3 token with Google
    let verifyRes: Response;
    try {
      verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret: SECRET, response: token }).toString(),
      });
    } catch {
      return NextResponse.json(
        { error: "Captcha verification request failed." },
        { status: 502 }
      );
    }

    const verifyRaw = await safeJson(verifyRes);
    const verifyJson = toRecaptchaResponse(verifyRaw);

    if (!verifyRes.ok) {
      return NextResponse.json(
        { error: "Captcha verification error.", details: verifyRaw },
        { status: 502 }
      );
    }

    if (!verifyJson?.success) {
      return NextResponse.json(
        { error: "Captcha verification failed.", details: verifyJson?.["error-codes"] ?? null },
        { status: 400 }
      );
    }

    // Optional: enforce minimum score
    if (typeof verifyJson.score === "number" && verifyJson.score < 0.5) {
      return NextResponse.json(
        { error: "Captcha score too low.", score: verifyJson.score },
        { status: 400 }
      );
    }

    // 2) Add the email to Brevo
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const BREVO_LIST_ID_RAW = process.env.BREVO_LIST_ID;

    if (!BREVO_API_KEY || !BREVO_LIST_ID_RAW) {
      return NextResponse.json({ error: "Missing Brevo credentials." }, { status: 500 });
    }

    const listId = Number(BREVO_LIST_ID_RAW);
    if (!Number.isFinite(listId)) {
      return NextResponse.json({ error: "BREVO_LIST_ID must be a number." }, { status: 500 });
    }

    let brevoRes: Response;
    try {
      brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "api-key": BREVO_API_KEY,
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          listIds: [listId],
          updateEnabled: true,
        }),
      });
    } catch {
      return NextResponse.json(
        { error: "Brevo request failed. Please try again." },
        { status: 502 }
      );
    }

    const brevoJson = await safeJson(brevoRes);

    if (!brevoRes.ok) {
      return NextResponse.json(
        { error: "Brevo API error.", details: brevoJson },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Subscribe API error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
