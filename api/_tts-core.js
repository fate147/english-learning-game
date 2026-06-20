/**
 * 阿里云 TTS 核心逻辑
 * 被 api/tts.js（Vercel Edge Function）和 vite dev 中间件复用
 * 使用 Web Crypto API（Edge Runtime / Node 18+ 均支持）
 *
 * 环境变量：
 *   ALIBABA_AK        — RAM 用户 AccessKey ID
 *   ALIBABA_SK        — RAM 用户 AccessKey Secret
 *   ALIBABA_APPKEY    — 智能语音交互控制台创建的 AppKey
 *   ALIBABA_TTS_VOICE — 音色（默认 clara，可换 emily / luna / harry 等）
 *   ALIBABA_REGION    — 区域（默认 cn-shanghai）
 */

const DEFAULT_VOICE  = 'aitong';
const DEFAULT_REGION = 'cn-shanghai';

// ====== 环境变量读取 ======

function ak()     { return process.env.ALIBABA_AK     || ''; }
function sk()     { return process.env.ALIBABA_SK     || ''; }
function appkey() { return process.env.ALIBABA_APPKEY || ''; }
function voice()  { return process.env.ALIBABA_TTS_VOICE || import.meta?.env?.VITE_ALIBABA_TTS_VOICE || DEFAULT_VOICE; }
function region() { return process.env.ALIBABA_REGION || DEFAULT_REGION; }

// ====== Token 缓存 ======

let _token   = null;
let _expires = 0;

// ====== Web Crypto HMAC-SHA1 ======

async function hmacSha1(secret, data) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  // covert ArrayBuffer to base64
  const bytes = new Uint8Array(sig);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ====== 阿里云 REST API 签名工具 ======

function percentEncode(s) {
  return encodeURIComponent(s)
    .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%20/g, '+');
}

/**
 * 使用阿里云标准 REST API 签名（HMAC-SHA1）获取 Token
 * 参考：https://help.aliyun.com/zh/nls/developer-reference/token
 */
async function getToken() {
  if (_token && Date.now() < _expires - 120_000) return _token;

  const r = region();
  const _ak = ak();
  const _sk = sk();

  const params = {
    Action:            'CreateToken',
    Version:           '2019-02-28',
    Format:            'JSON',
    RegionId:          r,
    AccessKeyId:       _ak,
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
  const signature = await hmacSha1(_sk + '&', stringToSign);

  // 加入签名后发送请求
  params.Signature = signature;
  const body = Object.entries(params)
    .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
    .join('&');

  const resp = await fetch(`https://nls-meta.${r}.aliyuncs.com/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
    body,
  });

  const data = await resp.json();
  if (!data.Token || !data.Token.Id) {
    throw new Error(`阿里云 Token 获取失败: ${JSON.stringify(data)}`);
  }

  _token   = data.Token.Id;
  _expires = data.Token.ExpireTime * 1000;
  return _token;
}

// ====== 语音合成 ======

/**
 * 合成英文文本为 MP3 音频
 * @param {string} text — 要朗读的英文文本
 * @returns {Promise<Uint8Array>}
 */
export async function synthesize(text) {
  const _ak = ak(), _sk = sk(), _appkey = appkey();
  if (!_ak || !_sk || !_appkey) {
    throw new Error(
      '缺少阿里云 TTS 配置。请在 .env / Vercel 环境变量中设置:\n' +
      '  ALIBABA_AK, ALIBABA_SK, ALIBABA_APPKEY',
    );
  }

  const token = await getToken();

  const params = new URLSearchParams({
    appkey:      _appkey,
    token:       token,
    text:        text,
    format:      'mp3',
    sample_rate: '16000',
    voice:       voice(),
  });

  const r   = region();
  const url = `https://nls-gateway-${r}.aliyuncs.com/stream/v1/tts?${params}`;

  const resp = await fetch(url, { method: 'GET' });

  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`TTS API ${resp.status}: ${errBody.slice(0, 300)}`);
  }

  const arrayBuf = await resp.arrayBuffer();
  return new Uint8Array(arrayBuf);
}
