// ====== إدارة كاش أوزان النماذج المحلية (Cache API) ======
// فحص ما إذا كانت أوزان Whisper / Piper مخزنة محلياً عند فتح الموقع،
// فتُحمَّل فوراً دون استهلاك إنترنت بعد أول استخدام.

// أسماء كاشات النماذج
const WHISPER_CACHE = 'transformers-cache' // transformers.js v4
const WHISPER_CACHE_LEGACY = 'transformers-models' // إصدارات سابقة
export const PIPER_CACHE_NAME = 'piper-voices'

const WHISPER_MODEL = 'whisper-small'

/**
 * يفحص الكاش المحلي ويعيد حالة أوزان النماذج.
 * @returns {Promise<{
 *   whisper: boolean,          // نموذج Whisper مخزّن؟
 *   piperAr: boolean,          // صوت Piper العربي مخزّن؟
 *   piperEn: boolean,          // صوت Piper الإنجليزي مخزّن؟
 *   totalMB: number,           // الحجم التقريبي الكلي (MB)
 *   anyCached: boolean,        // يوجد أي أوزان مخزنة؟
 * }>}
 */
export async function checkModelCache() {
  const result = {
    whisper: false,
    piperAr: false,
    piperEn: false,
    totalMB: 0,
    anyCached: false,
  }

  try {
    if (typeof caches === 'undefined') return result

    // ===== Whisper (transformers.js) =====
    for (const cacheName of [WHISPER_CACHE, WHISPER_CACHE_LEGACY]) {
      try {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()
        const whisperHits = keys.filter((k) => k.url.includes(WHISPER_MODEL))
        if (whisperHits.length > 0) {
          result.whisper = true
          for (const hit of whisperHits.slice(0, 20)) {
            result.totalMB += await estimateSize(cache, hit)
          }
          break
        }
      } catch {
        /* ignore */
      }
    }

    // ===== Piper voices =====
    try {
      const cache = await caches.open(PIPER_CACHE_NAME)
      const keys = await cache.keys()
      // أي صوت Piper مخزّن (.onnx) يُحتسب — الأصوات تُنزَّل On-Demand حسب اختيار المستخدم
      const voiceOnnx = keys.filter((k) => k.url.endsWith('.onnx'))
      if (voiceOnnx.length > 0) {
        result.piperAr = true
        for (const hit of voiceOnnx.slice(0, 5)) {
          result.totalMB += await estimateSize(cache, hit)
        }
      }
    } catch {
      /* ignore */
    }

    result.totalMB = Math.round(result.totalMB * 10) / 10
    result.anyCached = result.whisper || result.piperAr || result.piperEn
  } catch {
    /* ignore */
  }

  return result
}

/** تقدير حجم الملف المخزّن في الكاش (MB) */
async function estimateSize(cache, request) {
  try {
    const resp = await cache.match(request)
    if (!resp) return 0
    const len = resp.headers?.get('content-length')
    if (len) return Number(len) / 1048576
    const blob = await resp.clone().blob()
    return blob.size / 1048576
  } catch {
    return 0
  }
}

/**
 * يخزّن استجابة في كاش (Cache API) — تُستخدم في الـ workers.
 * @returns {Promise<Response>} الاستجابة نفسها
 */
export async function cacheFetch(url, cacheName, fetchImpl = fetch) {
  try {
    if (typeof caches === 'undefined') return fetchImpl(url)

    const cache = await caches.open(cacheName)
    const cached = await cache.match(url)
    if (cached) return cached

    const resp = await fetchImpl(url)
    if (resp && resp.ok) {
      try {
        await cache.put(url, resp.clone())
      } catch {
        /* تجاوز سعة الكاش — نتجاهل */
      }
    }
    return resp
  } catch {
    return fetchImpl(url)
  }
}

/** يتحقق هل صوت Piper معيّن مخزّن محلياً */
export async function isPiperVoiceCached(voice) {
  try {
    if (typeof caches === 'undefined') return false
    const cache = await caches.open(PIPER_CACHE_NAME)
    const keys = await cache.keys()
    return keys.some((k) => k.url.includes(voice) && k.url.endsWith('.onnx'))
  } catch {
    return false
  }
}
