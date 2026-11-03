#!/usr/bin/env node
/**
 * 友链巡检：解析 docs/.vuepress/data/friends.ts 中的 friends，
 * 探测 url / logo 可达性，写出 friend-link-report.json。
 * 有失败 exit 1，全通过 exit 0。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const FRIENDS_TS = resolve(ROOT, 'docs/.vuepress/data/friends.ts')
const REPORT_PATH = resolve(ROOT, 'friend-link-report.json')

const TIMEOUT_MS = 15_000
const CONCURRENCY = 4
const USER_AGENT =
  'Mozilla/5.0 (compatible; FriendLinkCheck/1.0; +https://jiangbyte.cn/friends.html)'

/**
 * 从 friends.ts 抽出 export const friends = [...] 数组字面量。
 */
function extractFriendsArrayLiteral(source) {
  // 1. 定位 friends 导出起点
  const marker = /export\s+const\s+friends\s*(?::\s*[^=]+)?=\s*\[/u
  const match = marker.exec(source)
  if (!match) {
    throw new Error('未找到 export const friends = [...]')
  }

  // 2. 从开括号起做括号配对，避开字符串内的 []
  const start = match.index + match[0].length - 1
  let depth = 0
  let inSingle = false
  let inDouble = false
  let inTemplate = false
  let escaped = false

  for (let i = start; i < source.length; i++) {
    const ch = source[i]

    if (escaped) {
      escaped = false
      continue
    }
    if ((inSingle || inDouble || inTemplate) && ch === '\\') {
      escaped = true
      continue
    }
    if (!inDouble && !inTemplate && ch === "'") {
      inSingle = !inSingle
      continue
    }
    if (!inSingle && !inTemplate && ch === '"') {
      inDouble = !inDouble
      continue
    }
    if (!inSingle && !inDouble && ch === '`') {
      inTemplate = !inTemplate
      continue
    }
    if (inSingle || inDouble || inTemplate) continue

    if (ch === '[') depth++
    else if (ch === ']') {
      depth--
      if (depth === 0) return source.slice(start, i + 1)
    }
  }

  throw new Error('friends 数组括号未闭合')
}

/**
 * 解析数组字面量中的友链对象（name / url / logo）。
 */
function parseFriends(arrayLiteral) {
  const friends = []
  const objectRe = /\{([^{}]*)\}/gu
  let objectMatch

  while ((objectMatch = objectRe.exec(arrayLiteral)) !== null) {
    const body = objectMatch[1]
    const name = pickStringField(body, 'name')
    const url = pickStringField(body, 'url')
    const logo = pickStringField(body, 'logo')
    if (!name || !url) continue
    friends.push({ name, url, ...(logo ? { logo } : {}) })
  }

  return friends
}

function pickStringField(body, field) {
  const re = new RegExp(
    `${field}\\s*:\\s*(?:'((?:\\\\'|[^'])*)'|"((?:\\\\"|[^"])*)")`,
    'u',
  )
  const m = re.exec(body)
  if (!m) return undefined
  const raw = m[1] ?? m[2] ?? ''
  return raw.replace(/\\(['"\\])/gu, '$1')
}

/**
 * 探测单个 URL 是否可达。
 */
async function probe(targetUrl) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: '*/*',
      },
    })
    // 读一点 body 再丢弃，避免部分站点对空连接不友好；失败不影响判定
    try {
      await res.arrayBuffer()
    } catch {
      /* ignore */
    }

    if (res.status >= 400) {
      return { ok: false, status: res.status, error: `HTTP ${res.status}` }
    }
    return { ok: true, status: res.status }
  } catch (err) {
    const message =
      err?.name === 'AbortError'
        ? `超时 ${TIMEOUT_MS}ms`
        : String(err?.message || err)
    return { ok: false, status: null, error: message }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * 有限并发执行异步任务。
 */
async function mapPool(items, limit, mapper) {
  const results = new Array(items.length)
  let next = 0

  async function worker() {
    while (next < items.length) {
      const index = next++
      results[index] = await mapper(items[index], index)
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    worker(),
  )
  await Promise.all(workers)
  return results
}

async function main() {
  // 1. 解析 friends.ts
  const source = readFileSync(FRIENDS_TS, 'utf8')
  const literal = extractFriendsArrayLiteral(source)
  const friends = parseFriends(literal)

  if (friends.length === 0) {
    console.log('friends 列表为空，跳过巡检。')
    const emptyReport = {
      checkedAt: new Date().toISOString(),
      total: 0,
      failed: 0,
      results: [],
    }
    writeFileSync(REPORT_PATH, JSON.stringify(emptyReport, null, 2) + '\n')
    process.exit(0)
  }

  // 2. 展开待探测目标：url + 可选 logo
  const targets = []
  for (const friend of friends) {
    targets.push({
      name: friend.name,
      field: 'url',
      url: friend.url,
    })
    if (friend.logo) {
      targets.push({
        name: friend.name,
        field: 'logo',
        url: friend.logo,
      })
    }
  }

  console.log(`开始巡检：${friends.length} 个友链，${targets.length} 个 URL`)

  // 3. 有限并发探测
  const results = await mapPool(targets, CONCURRENCY, async (target) => {
    const outcome = await probe(target.url)
    const row = {
      name: target.name,
      field: target.field,
      url: target.url,
      ok: outcome.ok,
      status: outcome.status,
      error: outcome.error ?? null,
    }
    const mark = outcome.ok ? 'OK' : 'FAIL'
    const detail = outcome.ok
      ? `HTTP ${outcome.status}`
      : outcome.error || `HTTP ${outcome.status}`
    console.log(`[${mark}] ${target.name} (${target.field}) ${target.url} → ${detail}`)
    return row
  })

  const failures = results.filter((r) => !r.ok)
  const report = {
    checkedAt: new Date().toISOString(),
    total: results.length,
    failed: failures.length,
    results,
    failures,
  }

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n')
  console.log(
    `\n完成：${results.length} 项，失败 ${failures.length}，报告 ${REPORT_PATH}`,
  )

  process.exit(failures.length > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(2)
})
