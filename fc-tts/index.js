/**
 * 阿里云函数计算 (FC) TTS 代理
 * 接收 POST { text } → 调用阿里云语音合成 → 返回 MP3 音频
 *
 * 环境变量（在 FC 控制台 / s.yaml 中配置）：
 *   ALIBABA_AK        — RAM 用户 AccessKey ID
 *   ALIBABA_SK        — RAM 用户 AccessKey Secret
 *   ALIBABA_APPKEY    — 智能语音交互控制台创建的 AppKey
 *   ALIBABA_TTS_VOICE — 音色（默认 clara，可换 emily / luna / harry 等）
 *   ALIBABA_REGION    — 区域（默认 cn-shanghai，需与 FC 部署区域一致）
 */

'use strict';

const crypto = require('crypto');

// ====== 配置 ======

const AK       = process.env.ALIBABA_AK;
const SK       = process.env.ALIBABA_SK;
const APPKEY   = process.env.ALIBABA_APPKEY;
const VOICE    = process.env.ALIBABA_TTS_VOICE || 'aitong';
const REGION   = process.env.ALIBABA_REGION || 'cn-shanghai';

// ====== Token 缓存 ======

let _token   = null;
let _expires = 0;

// ====== 阿里云 REST API 签名工具 ======

function percentEncode(s) {
  return encodeURIComponent(s)
    .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%20/g, '+');
}

/**
 * 使用阿里云标准 REST API 签名（HMAC-SHA1）获取 Token
 */
async function getToken() {
  if (_token && Date.now() < _expires - 120_000) return _token;

  const params = {
    Action:            'CreateToken',
    Version:           '2019-02-28',
    Format:            'JSON',
    RegionId:          REGION,
    AccessKeyId:       AK,
    Timestamp:         new Date().toISOString().replace(/\.\d{3}Z/, 'Z'),
    SignatureMethod:   'HMAC-SHA1',
    SignatureVersion:  '1.0',
    SignatureNonce:    crypto.randomUUID().replace(/-/g, ''),
  };

  // 按 key 排序后构建 canonicalized query string
  const keys = Object.keys(params).sort();
  const canonicalized = keys
    .map((k) => percentEncode(k) + '=' + percentEncode(params[k]))
    .join('&');

  const stringToSign = 'POST&' + percentEncode('/') + '&' + percentEncode(canonicalized);
  const signature = crypto.createHmac('sha1', SK + '&')
    .update(stringToSign)
    .digest('base64');

  // 加入签名后发送请求
  params.Signature = signature;
  const body = Object.entries(params)
    .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
    .join('&');

  const resp = await fetch(`https://nls-meta.${REGION}.aliyuncs.com/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
    body,
  });

  const data = await resp.json();
  if (!data.Token || !data.Token.Id) {
    throw new Error(`获取 Token 失败: ${JSON.stringify(data)}`);
  }

  _token   = data.Token.Id;
  _expires = data.Token.ExpireTime * 1000;
  return _token;
}

// ====== 语音合成 ======

async function synthesize(text) {
  const token = await getToken();

  const params = new URLSearchParams({
    appkey:      APPKEY,
    token:       token,
    text:        text,
    format:      'mp3',
    sample_rate: '16000',
    voice:       VOICE,
  });

  const url = `https://nls-gateway-${REGION}.aliyuncs.com/stream/v1/tts?${params.toString()}`;

  const resp = await fetch(url, { method: 'GET' });

  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`TTS API ${resp.status}: ${errBody.slice(0, 200)}`);
  }

  return Buffer.from(await resp.arrayBuffer());
}

// ====== FC HTTP Handler ======

module.exports.handler = (req, resp, context) => {
  // CORS
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    resp.send('');
    return;
  }

  if (req.method !== 'POST') {
    resp.setStatusCode(405);
    resp.setHeader('Content-Type', 'application/json');
    resp.send(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // 校验配置
  if (!AK || !SK || !APPKEY) {
    resp.setStatusCode(500);
    resp.setHeader('Content-Type', 'application/json');
    resp.send(JSON.stringify({
      error: '缺少阿里云配置，请设置 ALIBABA_AK / ALIBABA_SK / ALIBABA_APPKEY',
    }));
    return;
  }

  let body = '';
  try {
    body = req.body || '';
    const { text } = JSON.parse(body);

    if (!text || typeof text !== 'string') {
      resp.setStatusCode(400);
      resp.setHeader('Content-Type', 'application/json');
      resp.send(JSON.stringify({ error: 'text 字段必填且为字符串' }));
      return;
    }

    synthesize(text)
      .then((audio) => {
        resp.setStatusCode(200);
        resp.setHeader('Content-Type', 'audio/mpeg');
        resp.setHeader('Cache-Control', 'public, max-age=86400');
        resp.send(audio);
      })
      .catch((err) => {
        console.error('[TTS]', err);
        resp.setStatusCode(500);
        resp.setHeader('Content-Type', 'application/json');
        resp.send(JSON.stringify({ error: err.message }));
      });
  } catch (err) {
    resp.setStatusCode(400);
    resp.setHeader('Content-Type', 'application/json');
    resp.send(JSON.stringify({ error: `请求格式错误: ${err.message}` }));
  }
};
