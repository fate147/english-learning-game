/**
 * ⚠️ 已废弃 — 请使用 fc-tts/（阿里云函数计算 TTS 代理）
 *
 * 旧版 Supabase Edge Function TTS（微软 Edge TTS WebSocket）
 * 保留仅作参考，不再维护。国内网络下推荐使用阿里云 TTS。
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Edge TTS WebSocket 相关常量
const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const WSS_URL = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}`;
const VOICE_NAME = "en-US-JennyNeural";

function uuid(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createSSML(text: string, requestId: string): string {
  const now = new Date().toISOString();
  return (
    `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>` +
    `<voice name='${VOICE_NAME}'>` +
    `<prosody pitch='+0Hz' rate='+0%' volume='+0%'>` +
    `${escapeXml(text)}` +
    `</prosody></voice></speak>`
  );
}

async function ttsWebSocket(text: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const requestId = uuid();
    const wsUrl = `${WSS_URL}&ConnectionId=${uuid()}`;
    const ws = new WebSocket(wsUrl);
    const audioChunks: ArrayBuffer[] = [];
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        ws.close();
        reject(new Error("TTS WebSocket timeout"));
      }
    }, 15000);

    ws.onopen = () => {
      // 发送配置消息
      const configMsg = `Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataOptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`;
      ws.send(configMsg);

      // 发送 SSML
      const ssml = createSSML(text, requestId);
      const ssmlMsg = `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${new Date().toISOString()}Z\r\nPath:ssml\r\n\r\n${ssml}`;
      ws.send(ssmlMsg);
    };

    ws.onmessage = (event) => {
      if (event.data instanceof Uint8Array) {
        // Deno WebSocket 返回 Uint8Array
        const buf = event.data.buffer;
        if (buf.byteLength > 2) {
          const headerLen = new DataView(buf).getUint16(0);
          const audioData = buf.slice(2 + headerLen);
          if (audioData.byteLength > 0) {
            audioChunks.push(audioData);
          }
        }
      } else if (typeof event.data === "string") {
        if (event.data.includes("Path:turn.end")) {
          clearTimeout(timeout);
          resolved = true;
          ws.close();
          // 合并所有音频块
          const totalLen = audioChunks.reduce((acc, c) => acc + c.byteLength, 0);
          const result = new Uint8Array(totalLen);
          let offset = 0;
          for (const chunk of audioChunks) {
            result.set(new Uint8Array(chunk), offset);
            offset += chunk.byteLength;
          }
          resolve(result.buffer);
        }
      }
    };

    ws.onerror = (err) => {
      clearTimeout(timeout);
      if (!resolved) {
        resolved = true;
        reject(new Error(`TTS WebSocket error: ${err}`));
      }
    };

    ws.onclose = () => {
      clearTimeout(timeout);
      if (!resolved) {
        resolved = true;
        if (audioChunks.length > 0) {
          const totalLen = audioChunks.reduce((acc, c) => acc + c.byteLength, 0);
          const result = new Uint8Array(totalLen);
          let offset = 0;
          for (const chunk of audioChunks) {
            result.set(new Uint8Array(chunk), offset);
            offset += chunk.byteLength;
          }
          resolve(result.buffer);
        } else {
          reject(new Error("TTS WebSocket closed without audio"));
        }
      }
    };
  });
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "text is required" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const audio = await ttsWebSocket(text);

    return new Response(audio, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("TTS error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
