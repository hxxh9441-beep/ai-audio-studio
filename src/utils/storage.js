// ===== تخزين محلي آمن (كل البيانات تبقى على الجهاز) =====

const PREFIX = 'local-voice:'

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      /* تجاهل (قد يكون التخزين ممتلئاً) */
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key)
    } catch {
      /* ignore */
    }
  },

  /** يجمع إحصائيات الاستخدام محلياً — تُعرض فقط لصاحب الجهاز */
  getStats() {
    return this.get('stats', { sessions: 0, sttCount: 0, ttsCount: 0, lastUsed: null })
  },

  recordUse(kind) {
    const stats = this.getStats()
    stats[kind === 'stt' ? 'sttCount' : 'ttsCount'] += 1
    stats.lastUsed = Date.now()
    this.set('stats', stats)
  },
}
