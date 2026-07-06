/**
 * 本地 TTS 服务 — Windows SAPI 包装成 HTTP 接口
 * 用法: node tts-server.mjs
 * 测试: http://localhost:9300/tts?text=Hello
 */
import { createServer } from 'http'
import { spawnSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { networkInterfaces } from 'os'

const PORT = 9300
const TMP_WAV = join(tmpdir(), 'tts_tmp.wav')

/** 执行 PowerShell 并返回 stdout, stderr, exit code */
function ps(script) {
  const r = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-c', `try { ${script} } catch { write-error $_; exit 1 }`,
  ], { timeout: 15000, maxBuffer: 1024 * 1024 })
  return {
    ok: r.status === 0 && !r.error,
    stdout: r.stdout?.toString()?.trim() || '',
    stderr: r.stderr?.toString()?.trim() || '',
    status: r.status,
  }
}

/** 列出可用语音 */
function listVoices() {
  const r = ps(`
    Add-Type -AssemblyName System.Speech
    $s = New-Object System.Speech.Synthesis.SpeechSynthesizer
    $s.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }
  `)
  return r.ok ? r.stdout.split('\n').map(s => s.trim()).filter(Boolean) : []
}

/** 选最高优先级的语音 */
function findVoice(voices) {
  const order = ['Jenny', 'Aria', 'Zira', 'Mark', 'David', 'Hazel', 'Susan']
  for (const want of order) {
    const found = voices.find(v => v.includes(want))
    if (found) return found
  }
  return voices[0] || ''
}

let _voices = []
let _voice  = ''

function initEngine() {
  if (_voices.length) return { voices: _voices, voice: _voice }
  _voices = listVoices()
  _voice  = findVoice(_voices)
  return { voices: _voices, voice: _voice }
}

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://x')
  const ok = (data, type = 'text/plain') => {
    res.writeHead(200, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*' })
    res.end(data)
  }
  const cors = { 'Access-Control-Allow-Origin': '*' }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors)
    res.end()
    return
  }

  // === TTS ===
  if (url.pathname === '/tts') {
    const text = url.searchParams.get('text')
    if (!text) {
      res.writeHead(400, { ...cors, 'Content-Type': 'text/plain' })
      res.end('missing text')
      return
    }

    const safe = text.replace(/'/g, "''").replace(/"/g, '\\"')
    initEngine()

    const voiceLine = _voice ? `$s.SelectVoice('${_voice}')` : ''
    const r = ps(`
      Add-Type -AssemblyName System.Speech
      $s = New-Object System.Speech.Synthesis.SpeechSynthesizer
      ${voiceLine}
      $s.SetOutputToWaveFile('${TMP_WAV.replace(/\\/g, '\\\\')}')
      $s.Speak('${safe}')
      $s.Dispose()
    `)

    if (!r.ok || !existsSync(TMP_WAV)) {
      const err = r.stderr || '合成失败'
      console.error(`[tts-error] "${text.slice(0, 40)}…" → ${err}`)
      res.writeHead(500, { ...cors, 'Content-Type': 'text/plain' })
      res.end(`synthesis failed: ${err}`)
      return
    }

    const wav = readFileSync(TMP_WAV)
    res.writeHead(200, {
      'Content-Type': 'audio/wav',
      'Access-Control-Allow-Origin': '*',
      'Content-Length': wav.length,
    })
    res.end(wav)
    return
  }

  // === 诊断页 ===
  if (url.pathname === '/') {
    const { voices, voice } = initEngine()
    const ip = getLocalIP()
    ok(`
📢 本地 TTS 服务
────────────────────
语音列表: ${voices.length ? '\n  ' + voices.join('\n  ') : '(无)'}
选中语音: ${voice || '(无)'}
本地:     http://localhost:${PORT}
局域网:   http://${ip}:${PORT}
测试:     http://localhost:${PORT}/tts?text=Hello
    `.trim())
    return
  }

  // === 调试 ===
  if (url.pathname === '/debug') {
    const raw = ps(`
      Add-Type -AssemblyName System.Speech
      $s = New-Object System.Speech.Synthesis.SpeechSynthesizer
      $s.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }
    `)
    ok(JSON.stringify({
      ok: raw.ok,
      status: raw.status,
      stdout: raw.stdout,
      stderr: raw.stderr,
      hasVoices: raw.stdout ? raw.stdout.split('\n').filter(Boolean).length : 0,
    }, null, 2), 'application/json')
    return
  }

  res.writeHead(404, cors)
  res.end()
})

server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP()
  const info = initEngine()
  console.log(`\n  📢 TTS 服务已启动`)
  console.log(`  地址:  http://${ip}:${PORT}  |  http://localhost:${PORT}`)
  console.log(`  语音:  ${info.voice || '⚠ 未找到英文语音'}`)
  console.log(`  测试:  http://localhost:${PORT}/tts?text=Hello\n`)

  if (!info.voices.length) {
    console.log(`  ⚠ 没找到语音引擎，试试运行：`)
    console.log(`    powershell -c "Add-Type -AssemblyName System.Speech; ` +
                `[System.Speech.Synthesis.SpeechSynthesizer]::new()"`)
    console.log()
  }
})

function getLocalIP() {
  const ifs = networkInterfaces()
  for (const name of Object.keys(ifs)) {
    for (const iface of ifs[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address
    }
  }
  return '127.0.0.1'
}
