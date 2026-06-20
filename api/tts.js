// Vercel Edge Function: 阿里云 TTS 代理
// ⚠️ 生产环境在国内建议直接部署 fc-tts/ 到阿里云函数计算，
//    前端配置 VITE_VERCEL_TTS_URL 指向 FC 地址。
//    此 Edge Function 保留供开发/测试或海外部署场景使用。
// Edge Runtime 原生支持 fetch + Web Crypto API，无需额外依赖
import { synthesize } from "./_tts-core.js";

export const config = { runtime: "edge" };

export default async function handler(req) {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const audio = await synthesize(text);

    return new Response(audio, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("TTS error:", err);
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
