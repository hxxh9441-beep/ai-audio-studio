"""توليد أيقونات PWA — موجة صوتية متدرجة على خلفية داكنة"""
from PIL import Image, ImageDraw, ImageFilter
import math

SIZE = 512
# خلفية داكنة متدرجة
bg_top = (11, 16, 32)    # #0b1020
bg_bot = (17, 27, 54)    # #111b36


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make_icon(size):
    img = Image.new('RGB', (size, size))
    px = img.load()
    for y in range(size):
        t = y / (size - 1)
        c = lerp(bg_top, bg_bot, t)
        for x in range(size):
            px[x, y] = c

    d = ImageDraw.Draw(img, 'RGBA')

    # دائرة متدرجة (indigo -> cyan)
    cx, cy = size / 2, size / 2
    radius = size * 0.38
    grad_steps = 120
    for i in range(grad_steps):
        t = i / (grad_steps - 1)
        r = radius * (1 - t / grad_steps * 0.0)
        # لون متدرج
        col = lerp((99, 102, 241), (34, 211, 238), t)
        alpha = 255
        # ارسم حلقة رفيعة
        width = radius / grad_steps + 1
        d.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            outline=col + (alpha,),
            width=int(max(1, width)),
        )

    # توهج ناعم
    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=(56, 189, 248, 90))
    glow = glow.filter(ImageFilter.GaussianBlur(radius * 0.35))
    img = Image.alpha_composite(img.convert('RGBA'), glow)
    d = ImageDraw.Draw(img, 'RGBA')

    # موجة صوتية: 5 أعمدة بارتفاعات مختلفة
    bar_col = (10, 14, 28)
    bar_w = size * 0.055
    heights = [0.30, 0.55, 0.75, 0.55, 0.30]
    gap = size * 0.045
    total_w = len(heights) * bar_w + (len(heights) - 1) * gap
    start_x = cx - total_w / 2
    for i, h in enumerate(heights):
        bh = radius * 1.25 * h
        x0 = start_x + i * (bar_w + gap)
        y0 = cy - bh / 2
        d.rounded_rectangle(
            [x0, y0, x0 + bar_w, y0 + bh],
            radius=bar_w / 2,
            fill=bar_col + (255,),
        )

    # تحويل إلى RGB
    out = img.convert('RGB')
    return out


# توليد الأحجام المطلوبة
for s in (512, 192, 180):
    icon = make_icon(s)
    name = 'pwa-512.png' if s == 512 else f'pwa-{s}.png'
    icon.save(f'public/{name}', 'PNG')
    print(f'public/{name} — {s}x{s} ✓')

# maskable: نفس 512 مع مساحة أمان أكبر (الموجة داخل 80%)
print('done')
