'use strict';
const crypto = require('crypto');

const AK = process.env.ALIBABA_AK;
const SK = process.env.ALIBABA_SK;
const AP = process.env.ALIBABA_APPKEY;
const VO = process.env.ALIBABA_TTS_VOICE || 'aitong';
const RG = process.env.ALIBABA_REGION || 'cn-shanghai';

let _token, _exp = 0;

function pct(s) {
  return encodeURIComponent(s).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase()).replace(/%20/g, '+');
}

async function getToken() {
  if (_token && Date.now() < _exp - 120000) return _token;
  const p = { Action:'CreateToken', Version:'2019-02-28', Format:'JSON', RegionId:RG, AccessKeyId:AK,
    Timestamp:new Date().toISOString().replace(/\.\d{3}Z/,'Z'), SignatureMethod:'HMAC-SHA1', SignatureVersion:'1.0',
    SignatureNonce:crypto.randomUUID().replace(/-/g,'') };
  const k = Object.keys(p).sort();
  const c = k.map(k => pct(k)+'='+pct(p[k])).join('&');
  const s = 'POST&'+pct('/')+'&'+pct(c);
  p.Signature = crypto.createHmac('sha1',SK+'&').update(s).digest('base64');
  const b = Object.entries(p).map(([k,v])=>encodeURIComponent(k)+'='+encodeURIComponent(v)).join('&');
  const r = await fetch(`https://nls-meta.${RG}.aliyuncs.com/`, { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:b });
  const d = await r.json();
  if (!d.Token?.Id) throw new Error('Token fail: '+JSON.stringify(d));
  _token = d.Token.Id; _exp = d.Token.ExpireTime * 1000; return _token;
}

async function synth(text) {
  const t = await getToken();
  const r = await fetch(`https://nls-gateway-${RG}.aliyuncs.com/stream/v1/tts?${new URLSearchParams({appkey:AP,token:t,text,format:'mp3',sample_rate:'16000',voice:VO})}`);
  if (!r.ok) throw new Error(`TTS ${r.status}: ${(await r.text()).slice(0,200)}`);
  return Buffer.from(await r.arrayBuffer());
}

exports.handler = function(req, resp, context) {
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

  let body = '';
  try {
    body = req.body || '';
    const { text } = JSON.parse(body);
    if (!text || typeof text !== 'string') {
      resp.setStatusCode(400);
      resp.setHeader('Content-Type', 'application/json');
      resp.send(JSON.stringify({ error: 'text required' }));
      return;
    }

    synth(text).then(audio => {
      resp.setStatusCode(200);
      resp.setHeader('Content-Type', 'audio/mpeg');
      resp.send(audio);
    }).catch(err => {
      console.error('[TTS]', err);
      resp.setStatusCode(500);
      resp.setHeader('Content-Type', 'application/json');
      resp.send(JSON.stringify({ error: err.message }));
    });
  } catch (err) {
    resp.setStatusCode(400);
    resp.setHeader('Content-Type', 'application/json');
    resp.send(JSON.stringify({ error: 'bad request: ' + err.message }));
  }
};
