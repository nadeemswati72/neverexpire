"""Generate placeholder avatar and document-mockup images for the rich demo dataset.

These are clearly-labelled generic "SPECIMEN" card graphics — not a replica of any
real government document — used purely so the UI has real images to render/watermark.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def _font(size: int, bold: bool = False):
    name = "arialbd.ttf" if bold else "arial.ttf"
    try:
        return ImageFont.truetype(name, size)
    except OSError:
        return ImageFont.load_default()


def generate_avatar(initials: str, color_hex: str, size: int = 200) -> Image.Image:
    """A flat portrait-style avatar: gradient circle background + bold initials."""
    img = Image.new("RGB", (size, size), color="white")
    draw = ImageDraw.Draw(img)

    base = tuple(int(color_hex.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4))
    light = tuple(min(255, c + 60) for c in base)

    for y in range(size):
        t = y / size
        row_color = tuple(int(light[i] + (base[i] - light[i]) * t) for i in range(3))
        draw.line([(0, y), (size, y)], fill=row_color)

    font = _font(size // 3, bold=True)
    bbox = draw.textbbox((0, 0), initials, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((size - tw) / 2 - bbox[0], (size - th) / 2 - bbox[1]), initials, font=font, fill="white")

    return img


def generate_document_card(
    title: str,
    subtitle: str,
    fields: list[tuple[str, str]],
    accent_hex: str,
    size: tuple[int, int] = (640, 400),
) -> Image.Image:
    """A generic specimen ID/certificate-style card image."""
    w, h = size
    img = Image.new("RGB", (w, h), color="#f4f6fb")
    draw = ImageDraw.Draw(img)

    accent = tuple(int(accent_hex.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4))

    # Header bar
    header_h = 70
    draw.rectangle([(0, 0), (w, header_h)], fill=accent)
    draw.text((24, 14), title, font=_font(28, bold=True), fill="white")
    draw.text((24, 46), subtitle, font=_font(14), fill="white")
    draw.text((w - 160, 24), "SPECIMEN", font=_font(16, bold=True), fill="white")

    # Subtle background pattern (diagonal hairlines) below header
    for x in range(-h, w, 26):
        draw.line([(x, header_h), (x + h, h)], fill="#e7ebf5", width=1)

    # Photo placeholder box (silhouette)
    box_x, box_y, box_w, box_h = 24, header_h + 24, 130, 160
    draw.rectangle([(box_x, box_y), (box_x + box_w, box_y + box_h)], fill="#d7dde8", outline="#b7c0d4", width=2)
    cx, cy = box_x + box_w // 2, box_y + box_h // 2
    draw.ellipse([(cx - 24, cy - 46), (cx + 24, cy - 2)], fill="#aeb8cc")
    draw.ellipse([(cx - 40, cy + 6), (cx + 40, cy + 70)], fill="#aeb8cc")

    # Field text lines
    text_x = box_x + box_w + 28
    y = header_h + 28
    for label, value in fields:
        draw.text((text_x, y), label.upper(), font=_font(11, bold=True), fill="#8a93a8")
        draw.text((text_x, y + 15), value, font=_font(18), fill="#1b2436")
        y += 48

    # Footer strip
    draw.rectangle([(0, h - 26), (w, h)], fill="#e4e8f2")
    draw.text((24, h - 22), "Demo document · generated for presentation purposes only", font=_font(11), fill="#8a93a8")

    return img


def save_avatar(dest_dir: Path, filename: str, initials: str, color_hex: str) -> Path:
    dest_dir.mkdir(parents=True, exist_ok=True)
    path = dest_dir / filename
    generate_avatar(initials, color_hex).save(path, quality=90)
    return path


def save_document_card(dest_dir: Path, filename: str, title: str, subtitle: str, fields: list[tuple[str, str]], accent_hex: str) -> Path:
    dest_dir.mkdir(parents=True, exist_ok=True)
    path = dest_dir / filename
    generate_document_card(title, subtitle, fields, accent_hex).save(path, quality=90)
    return path
