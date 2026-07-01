'use strict';
const crypto = require('crypto');
const https = require('https');

function httpPost(url, body, contentType) {
  return new Promise(function(resolve, reject) {
    var u = new URL(url);
    var options = { hostname: u.hostname, port: 443, path: u.pathname + u.search, method: 'POST', headers: { 'Content-Type': contentType } };
    var req = https.request(options, function(res) {
      var chunks = [];
      res.on('data', function(c) { chunks.push(c); });
      res.on('end', function() { resolve({ status: res.statusCode, data: Buffer.concat(chunks) }); });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function httpGet(url) {
  return new Promise(function(resolve, reject) {
    https.get(url, function(res) {
      var chunks = [];
      res.on('data', function(c) { chunks.push(c); });
      res.on('end', function() { resolve({ status: res.statusCode, data: Buffer.concat(chunks) }); });
    }).on('error', reject);
  });
}

function pct(s) {
  return encodeURIComponent(s).replace(/[!'()*]/g, function(c) { return '%' + c.charCodeAt(0).toString(16).toUpperCase(); }).replace(/%20/g, '+');
}

async function getToken(AK, SK, RG) {
  var p = {
    Action: 'CreateToken', Version: '2019-02-28', Format: 'JSON', RegionId: RG,
    AccessKeyId: AK, Timestamp: new Date().toISOString().replace(/\.\d{3}Z/, 'Z'),
    SignatureMethod: 'HMAC-SHA1', SignatureVersion: '1.0', SignatureNonce: crypto.randomUUID().replace(/-/g, '')
  };
  var k = Object.keys(p).sort();
  var c = k.map(function(k) { return pct(k) + '=' + pct(p[k]); }).join('&');
  var s = 'POST&' + pct('/') + '&' + pct(c);
  p.Signature = crypto.createHmac('sha1', SK + '&').update(s).digest('base64');
  var b = Object.entries(p).map(function(arr) { return encodeURIComponent(arr[0]) + '=' + encodeURIComponent(arr[1]); }).join('&');
  var r = await httpPost('https://nls-meta.' + RG + '.aliyuncs.com/', b, 'application/x-www-form-urlencoded');
  var d = JSON.parse(r.data.toString());
  if (!d.Token || !d.Token.Id) throw new Error('Token fail');
  return d.Token.Id;
}

async function synth(token, appkey, voice, region, text) {
  var params = 'appkey=' + encodeURIComponent(appkey) + '&token=' + encodeURIComponent(token) + '&text=' + encodeURIComponent(text) + '&format=mp3&sample_rate=16000&voice=' + encodeURIComponent(voice);
  var r = await httpGet('https://nls-gateway-' + region + '.aliyuncs.com/stream/v1/tts?' + params);
  if (r.status !== 200) throw new Error('TTS fail');
  return r.data;
}

module.exports.handler = function(event, context, callback) {
  try {
    var text = '';
    if (Buffer.isBuffer(event)) { text = JSON.parse(event.toString()).text; }
    else if (event && event.body) {
      var bodyStr = typeof event.body === 'string' ? event.body : Buffer.isBuffer(event.body) ? event.body.toString() : JSON.stringify(event.body);
      text = JSON.parse(bodyStr).text;
    } else if (typeof event === 'string') { text = JSON.parse(event).text; }

    if (!text) { callback(null, { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'text required' }) }); return; }

    var AK = process.env.ALIBABA_AK;
    var SK = process.env.ALIBABA_SK;
    var AP = process.env.ALIBABA_APPKEY;
    var VO = process.env.ALIBABA_TTS_VOICE || 'aitong';
    var RG = process.env.ALIBABA_REGION || 'cn-shanghai';

    getToken(AK, SK, RG).then(function(token) {
      return synth(token, AP, VO, RG, text);
    }).then(function(audio) {
      callback(null, { statusCode: 200, headers: { 'Content-Type': 'audio/mpeg', 'Access-Control-Allow-Origin': '*' }, body: audio.toString('base64'), isBase64Encoded: true });
    }).catch(function(err) {
      callback(null, { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.message }) });
    });
  } catch (e) {
    callback(null, { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: e.message }) });
  }
};
