import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

WATERMARK_TEXT = "For NeverExpire Reminders Only"

# Only raster images can be watermarked with Pillow; PDFs are left as-is.
WATERMARKABLE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def watermarked_path_for(source_path: Path) -> Path:
    return source_path.with_name(f"{source_path.stem}_wm{source_path.suffix}")


def apply_watermark(source_path: str | Path) -> Path | None:
    """Write a watermarked copy of an image alongside source_path.

    Returns the path of the watermarked copy, or None if the file type can't
    be watermarked (e.g. PDF) - in which case no file is written and the
    original should be served as-is.
    """
    path = Path(source_path)
    if path.suffix.lower() not in WATERMARKABLE_EXTENSIONS:
        return None

    image = Image.open(path).convert("RGBA")

    font_size = max(14, min(image.width, image.height) // 10)
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except OSError:
        font = ImageFont.load_default()

    # Render the text on its own layer, then rotate it to follow the
    # document's diagonal (bottom-left to top-right) before pasting it
    # centered over the document.
    measurer = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    bbox = measurer.textbbox((0, 0), WATERMARK_TEXT, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    text_layer = Image.new("RGBA", (text_width, text_height), (0, 0, 0, 0))
    ImageDraw.Draw(text_layer).text(
        (-bbox[0], -bbox[1]), WATERMARK_TEXT, font=font, fill=(255, 255, 255, 140)
    )

    angle = math.degrees(math.atan2(image.height, image.width))
    rotated = text_layer.rotate(angle, expand=True, resample=Image.BICUBIC)

    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    x = (image.width - rotated.width) // 2
    y = (image.height - rotated.height) // 2
    overlay.paste(rotated, (x, y), rotated)

    watermarked = Image.alpha_composite(image, overlay)
    if path.suffix.lower() in (".jpg", ".jpeg", ".gif"):
        watermarked = watermarked.convert("RGB")

    out_path = watermarked_path_for(path)
    watermarked.save(out_path)
    return out_path
