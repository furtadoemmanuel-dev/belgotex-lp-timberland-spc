"""Prepara os assets da LP a partir dos arquivos do fornecedor e da marca.

Uso: python3 scripts/prepare-assets.py
Gera originais redimensionados em src/assets (o Astro produz AVIF/WebP no build).
"""
from pathlib import Path
from PIL import Image
import fitz  # PyMuPDF

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT.parent / "arquivos do fornecedor" / "Timberland"
BRAND = ROOT.parent / "assets_belgotex"
OUT = ROOT / "src" / "assets"


def save(img, dest, max_side):
    img = img.convert("RGB")
    img.thumbnail((max_side, max_side), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "JPEG", quality=86, optimize=True, progressive=True)
    print(f"{dest.relative_to(ROOT)}  {img.size[0]}x{img.size[1]}")


def crop_square(img, cx, cy, side):
    w, h = img.size
    side = min(side, w, h)
    x = max(0, min(int(w * cx - side / 2), w - side))
    y = max(0, min(int(h * cy - side / 2), h - side))
    return img.crop((x, y, x + side, y + side))


# Logo e brandmark em SVG (vetor original dos PDFs da marca)
for name in ("logo", "b_"):
    doc = fitz.open(BRAND / f"{name}.pdf")
    svg = doc[0].get_svg_image(text_as_path=True)
    (OUT / "brand" / f"{'logo' if name == 'logo' else 'brandmark'}.raw.svg").write_text(svg)

# Padrões (swatches)
patterns = {
    "001-canyon-oak": SRC / "Cores Padrão/001-CanyonOak.jpg",
    "002-classic-oak": SRC / "Cores Padrão/002-ClassicOak.jpg",
    "003-pacific-oak": SRC / "Cores Padrão/003-PacificOak.jpg",
    "004-woodland-oak": SRC / "Cores Padrão/004-WoodlandOak.jpg",
    "005-silver-oak": SRC / "Cores Padrão/005-SilverOak.jpg",
    "hb-001-harmony-oak": SRC / "Cores HB/001 - Harmony Oak_edit.jpg",
    "hb-002-serenity-oak": SRC / "Cores HB/002 - Serenity Oak_edit.jpg",
}
for slug, path in patterns.items():
    save(Image.open(path), OUT / "patterns" / f"{slug}.jpg", 1800)

# Closes de textura (recortes 1:1 em resolução nativa)
closeups = {
    "close-canyon": (SRC / "Cores Padrão/001-CanyonOak.jpg", .5, .5, 900),
    "close-pacific": (SRC / "Cores Padrão/003-PacificOak.jpg", .35, .6, 900),
    "close-harmony-hb": (SRC / "ambientadas/Harmony_angleswatch.jpg", .5, .55, 2200),
    "close-silver": (SRC / "Cores Padrão/005-SilverOak.jpg", .5, .45, 700),
    # v02: "Veja de perto" mostra as 5 cores Regular
    "close-classic": (SRC / "Cores Padrão/002-ClassicOak.jpg", .5, .5, 900),
    "close-woodland": (SRC / "Cores Padrão/004-WoodlandOak.jpg", .5, .5, 900),
}
for slug, (path, cx, cy, side) in closeups.items():
    save(crop_square(Image.open(path), cx, cy, side), OUT / "closeups" / f"{slug}.jpg", 1200)

# Ambientes (padrão identificado por nome de arquivo ou pela análise de cor — ver PENDENCIAS.md)
envs = {
    "canyon-oak-xl-living": "Cores XL/001 - Canyon Oak/EWH-7002-Room Scene.jpg",
    "canyon-oak-office": "ambientadas/1.jpg",
    "classic-oak-living": "ambientadas/classic oak.jpg",
    "pacific-oak-kitchen": "ambientadas/pacific.jpg",
    "pacific-oak-hall": "ambientadas/2.jpg",
    "woodland-oak-bedroom": "ambientadas/Woodland oak.jpg",
    "silver-oak-living": "ambientadas/silver oak.jpg",
    "silver-oak-lounge": "ambientadas/3.jpg",
    "harmony-oak-hb-bedroom": "ambientadas/Harmony.jpg",
    "serenity-oak-hb-kids": "ambientadas/Serenity.jpg",
    "serenity-oak-hb-detail": "ambientadas/Serenity_angleswatch.jpg",
}
for slug, rel in envs.items():
    save(Image.open(SRC / rel), OUT / "environments" / f"{slug}.jpg", 2400)


# SVGs limpos: viewBox justo, cor herdada (currentColor), sem metadados do Inkscape
import re
for name, out in (("logo", "logo"), ("b_", "brandmark")):
    page = fitz.open(BRAND / f"{name}.pdf")[0]
    r = fitz.Rect()
    for d in page.get_drawings():
        if d["rect"].width < page.rect.width * 0.95:  # ignora o retângulo da página
            r |= d["rect"]
    pad = 2
    svg = (OUT / "brand" / f"{out}.raw.svg").read_text()
    svg = re.sub(r'<svg[^>]*>', f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{r.x0-pad:.1f} {r.y0-pad:.1f} {r.width+2*pad:.1f} {r.height+2*pad:.1f}">', svg, count=1)
    svg = re.sub(r'\s(inkscape:[a-z]+)="[^"]*"', "", svg)
    svg = re.sub(r'fill="#[0-9a-fA-F]{6}"', 'fill="currentColor"', svg)
    (OUT / "brand" / f"{out}.svg").write_text(svg)
    (OUT / "brand" / f"{out}.raw.svg").unlink()
    print(out, "viewBox", r)

# Película decorativa da vista explodida (src/components/Layers.astro): um trecho de régua do Canyon Oak
(OUT / "layers").mkdir(exist_ok=True)
canyon = Image.open(OUT / "patterns" / "001-canyon-oak.jpg").convert("RGB")
canyon.crop((0, 512, 694, 768)).save(OUT / "layers" / "decor-canyon-oak.jpg", quality=86)
print("layers/decor-canyon-oak.jpg")

# Réguas dos 3 formatos em escala (FormatScale.astro), com a textura original de cada formato
(OUT / "formats").mkdir(exist_ok=True)
# Padrão (123,5 × 19,2 → 6,43:1): régua quase inteira da 2ª fileira do Canyon Oak
im = Image.open(SRC / "Cores Padrão" / "001-CanyonOak.jpg").convert("RGB")
k = im.width / 1800
y0, y1 = int(514 * k), int(766 * k)
w = int((y1 - y0) * 6.43)
im.crop((int(1678 * k) - w, y0, int(1678 * k), y1)).resize((1286, 200), Image.LANCZOS).save(OUT / "formats" / "padrao.jpg", quality=86)
# XL (184,2 × 23 → 8:1): régua escaneada do Canyon Oak XL, sem a borda do scan
im = Image.open(SRC / "Cores XL" / "001 - Canyon Oak" / "Plank_EWH-7002_1.jpg").convert("RGB").rotate(90, expand=True)
w, h = im.size
m = int(h * 0.03)
im = im.crop((m, m, w - m, h - m))
w, h = im.size
tw = int(h * 8.0087)
im.crop(((w - tw) // 2, 0, (w - tw) // 2 + tw, h)).resize((1600, 200), Image.LANCZOS).save(OUT / "formats" / "xl.jpg", quality=86)
# HB (71 × 14,2 → 5:1): faixa de dentro de uma régua da espinha de peixe do Harmony Oak
im = Image.open(SRC / "Cores HB" / "001 - Harmony Oak_swatch.jpg").convert("RGB").rotate(45, expand=True)
im.crop((1240, 2800, 3200, 3192)).resize((1000, 200), Image.LANCZOS).save(OUT / "formats" / "hb.jpg", quality=86)
print("formats/padrao.jpg, hb.jpg, xl.jpg")
