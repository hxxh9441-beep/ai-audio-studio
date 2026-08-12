# 🚀 النشر المباشر (Deployment)

مجلد البناء النهائي: **`dist/`** — يُبنى بالأمر `npm run build` ويحتوي كل شيء جاهزاً.

## ☁️ Cloudflare Pages (الأفضل — يدعم الترويسات كاملة)

1. شغّل: `npm run build`
2. ارفع مجلد **`dist`** (Cloudflare Dashboard → Workers & Pages → Create → Upload assets)
   أو اربط مستودع Git بالإعدادات:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. الترويسات تُطبَّق تلقائياً من ملف `_headers`:
   - `Cross-Origin-Opener-Policy: same-origin`
   - `Cross-Origin-Embedder-Policy: require-corp`
   - → تعطّل **WebGPU كامل** + **SharedArrayBuffer** (أداء أفضل للمعالجة المحلية)

## 🐙 GitHub Pages (يعمل — بدون عزل كامل)

1. شغّل: `npm run build`
2. ارفع مجلد `dist` إلى فرع `gh-pages`:
   ```bash
   npx gh-pages -d dist
   ```
3. ملاحظات:
   - `base: './'` مضبوط مسبقاً — يعمل تحت أي مسار (`/username/repo/`)
   - GitHub Pages **لا يدعم الترويسات المخصصة** → يعمل بوضع التوافق (WASM/WebGPU بدون SAB) — الجودة نفسها
   - `404.html` يُنشأ تلقائياً بعد كل بناء (احتياط SPA لأي مسار)

## 🧪 التحقق محلياً قبل النشر

```bash
npm run build
npm run preview
# افتح http://localhost:4173 وتحقق: التوليد + الكاش + وضع الأوفلاين
```

> **تذكير:** أول استخدام لكل لغة يحتاج إنترنت لتنزيل النموذج
> (Whisper ~460MB · Piper ~63MB لكل لغة) — بعدها يعمل التطبيق أوفلاين بالكامل.
