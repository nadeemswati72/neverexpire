import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

WATERMARK_TEXT = "NeverExpire"
WATERMARK_SUBTEXT = "For Reminder Use Only"
WATERMARKABLE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def watermarked_path_for(source_path: Path, tag: str | None = None) -> Path:
    """
    Path for the watermarked copy. When `tag` is given (e.g. a recipient's user id),
    a separate cached copy is used so each recipient gets their own personalized watermark.
    """
    suffix = f"_wm_{tag}" if tag else "_wm"
    return source_path.with_name(f"{source_path.stem}{suffix}{source_path.suffix}")


def apply_watermark(source_path: str | Path, subtext: str | None = None, tag: str | None = None) -> Path | None:
    path = Path(source_path)
    if path.suffix.lower() not in WATERMARKABLE_EXTENSIONS:
        return None

    watermark_subtext = subtext or WATERMARK_SUBTEXT

    image = Image.open(path).convert("RGBA")
    w, h = image.size

    font_size = max(18, min(w, h) // 16)
    sub_font_size = max(10, font_size // 2)

    try:
        font = ImageFont.truetype("arial.ttf", font_size)
        sub_font = ImageFont.truetype("arial.ttf", sub_font_size)
    except OSError:
        # arial.ttf only exists on Windows dev machines — Railway's Linux container
        # falls back here. load_default() with a size arg (Pillow >= 10.1) gives a
        # scalable font instead of a tiny fixed-size bitmap, so the watermark stays
        # legible in production.
        font = ImageFont.load_default(size=font_size)
        sub_font = ImageFont.load_default(size=sub_font_size)

    # Build a single tile with both lines
    dummy = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    bb1 = dummy.textbbox((0, 0), WATERMARK_TEXT, font=font)
    bb2 = dummy.textbbox((0, 0), watermark_subtext, font=sub_font)
    tile_w = max(bb1[2] - bb1[0], bb2[2] - bb2[0]) + font_size * 3
    tile_h = (bb1[3] - bb1[1]) + (bb2[3] - bb2[1]) + font_size * 2

    tile = Image.new("RGBA", (tile_w, tile_h), (0, 0, 0, 0))
    td = ImageDraw.Draw(tile)
    # Draw semi-opaque background box for better contrast
    box_padding = font_size // 2
    td.rectangle(
        [(0, 0), (tile_w, tile_h)],
        fill=(0, 0, 0, 120)
    )
    # Main text (increased opacity from 110 to 220 for better visibility)
    td.text((font_size, font_size // 2), WATERMARK_TEXT, font=font, fill=(255, 255, 255, 220))
    # Sub text (increased opacity from 90 to 190)
    td.text((font_size, font_size // 2 + (bb1[3] - bb1[1]) + 4), watermark_subtext, font=sub_font, fill=(255, 255, 255, 190))

    # Rotate tile ~30 degrees
    angle = 25
    rotated_tile = tile.rotate(angle, expand=True, resample=Image.BICUBIC)

    # Tile the rotated stamp across the full image
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    rw, rh = rotated_tile.size
    step_x = int(rw * 1.2)
    step_y = int(rh * 1.2)

    for y in range(-rh, h + rh, step_y):
        for x in range(-rw, w + rw, step_x):
            overlay.paste(rotated_tile, (x, y), rotated_tile)

    watermarked = Image.alpha_composite(image, overlay)
    if path.suffix.lower() in (".jpg", ".jpeg", ".gif"):
        watermarked = watermarked.convert("RGB")

    out_path = watermarked_path_for(path, tag=tag)
    watermarked.save(out_path)
    return out_path
