"""Gera as texturas para download, já com a legenda da cor: public/downloads/timberland-spc-<padrão>.jpg

Uso: python3 scripts/make-downloads.py
Fontes: DM Serif Display e DM Sans (convertidas dos arquivos do @fontsource para scripts/fonts).
"""
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "downloads"
OUT.mkdir(parents=True, exist_ok=True)
patterns = json.loads((ROOT / "src/content/patterns.json").read_text())
formats = {f["id"]: f["label"] for f in json.loads((ROOT / "src/content/formats.json").read_text())}

W = 1600
INK, MUTED, PAPER, LINE = (35, 31, 32), (85, 88, 92), (245, 245, 244), (207, 208, 209)
serif = ImageFont.truetype(str(ROOT / "scripts/fonts/DMSerifDisplay.ttf"), 64)


def sans(size, weight):
    f = ImageFont.truetype(str(ROOT / "scripts/fonts/DMSansVariable.ttf"), size)
    try:
        f.set_variation_by_axes([weight])
    except Exception:
        pass
    return f


label, small, brand = sans(22, 600), sans(22, 400), sans(26, 600)

for p in patterns:
    tex = Image.open(ROOT / "src/assets/patterns" / f"{p['slug']}.jpg").convert("RGB")
    tex = tex.resize((W, round(tex.height * W / tex.width)), Image.LANCZOS)
    band = 210
    img = Image.new("RGB", (W, tex.height + band), PAPER)
    img.paste(tex, (0, 0))
    d = ImageDraw.Draw(img)
    y0 = tex.height
    d.line([(0, y0), (W, y0)], fill=LINE, width=2)
    pad = 64
    d.text((pad, y0 + 38), "TIMBERLAND SPC · PISO VINÍLICO", font=label, fill=MUTED)
    d.text((pad, y0 + 70), f"{p['code']} {p['name']}", font=serif, fill=INK)
    fmts = " · ".join(formats[f] for f in p["formats"])
    d.text((pad, y0 + 152), f"Formato: {fmts}", font=small, fill=MUTED)
    right = "Belgotex do Brasil"
    tw = d.textlength(right, font=brand)
    d.text((W - pad - tw, y0 + 72), right, font=brand, fill=INK)
    note = "Imagem ilustrativa: a cor pode variar em relação ao produto."
    nw = d.textlength(note, font=small)
    d.text((W - pad - nw, y0 + 152), note, font=small, fill=MUTED)
    dest = OUT / f"timberland-spc-{p['slug'].removeprefix('hb-')}{'-hb' if p['slug'].startswith('hb-') else ''}.jpg"
    img.save(dest, "JPEG", quality=86, optimize=True, progressive=True)
    print(dest.relative_to(ROOT), img.size, round(dest.stat().st_size / 1024), "KB")
