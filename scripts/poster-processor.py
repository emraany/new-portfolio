#!/usr/bin/env python3
"""
Poster Processor Script — Emraan Yusuf Film Portfolio
Phase 2B

Reads raw screenshots from /screenshots/[project-name]/ and outputs
cinematic 2:3 portrait posters to /public/posters/[project-name].jpg

Usage:
    python poster-processor.py                              # process all projects
    python poster-processor.py --project conflict-coordinate  # single project
"""

import argparse
import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

# ---------------------------------------------------------------------------
# Path resolution — script works from /scripts/ or the repo root
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
SCREENSHOTS_DIR = REPO_ROOT / "screenshots"
POSTERS_DIR = REPO_ROOT / "public" / "posters"

# ---------------------------------------------------------------------------
# Design system constants (from CLAUDE.md)
# ---------------------------------------------------------------------------
TEXT_PRIMARY = (232, 228, 220)   # #e8e4dc  warm off-white
SHADOW_COLOR = (10, 10, 10)      # #0a0a0a  near-black
POSTER_RATIO = (2, 3)            # width : height  →  portrait

# Target output size (width, height).  2:3 at a comfortable resolution.
OUTPUT_WIDTH  = 800
OUTPUT_HEIGHT = 1200

# ---------------------------------------------------------------------------
# System font search paths (macOS-first, then Linux fallback)
# ---------------------------------------------------------------------------
SERIF_FONT_CANDIDATES = [
    # macOS — Georgia
    "/Library/Fonts/Georgia.ttf",
    "/System/Library/Fonts/Supplemental/Georgia.ttf",
    # macOS — Times New Roman
    "/Library/Fonts/Times New Roman.ttf",
    "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
    # macOS — Palatino
    "/Library/Fonts/Palatino.ttf",
    "/System/Library/Fonts/Supplemental/Palatino.ttf",
    # Linux fallback
    "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSerif.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
]

SERIF_BOLD_CANDIDATES = [
    "/Library/Fonts/Georgia Bold.ttf",
    "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
    "/Library/Fonts/Times New Roman Bold.ttf",
    "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSerifBold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
]


def _load_font(candidates: list[str], size: int) -> ImageFont.ImageFont:
    """Try each candidate path in order; fall back to PIL default."""
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    # PIL built-in bitmap font — no size control, but always available
    return ImageFont.load_default()


# ---------------------------------------------------------------------------
# Step 1: Crop to 2:3 portrait
# ---------------------------------------------------------------------------
def crop_portrait(img: Image.Image) -> Image.Image:
    """
    Center-crop the source image to a 2:3 portrait aspect ratio.
    Prefers the top-center region (most visually interesting for screenshots
    because the UI chrome is usually at the top).
    """
    src_w, src_h = img.size
    target_ratio = POSTER_RATIO[0] / POSTER_RATIO[1]  # 0.666…
    src_ratio = src_w / src_h

    if src_ratio > target_ratio:
        # Image is wider than 2:3 → crop sides
        new_w = int(src_h * target_ratio)
        left = (src_w - new_w) // 2
        img = img.crop((left, 0, left + new_w, src_h))
    elif src_ratio < target_ratio:
        # Image is taller than 2:3 → crop bottom (keep top-center)
        new_h = int(src_w / target_ratio)
        # Bias crop start slightly toward top (25% down from center)
        top = max(0, int((src_h - new_h) * 0.25))
        img = img.crop((0, top, src_w, top + new_h))

    return img.resize((OUTPUT_WIDTH, OUTPUT_HEIGHT), Image.LANCZOS)


# ---------------------------------------------------------------------------
# Step 2: Crush blacks — deepen shadows, increase contrast
# ---------------------------------------------------------------------------
def crush_blacks(img: Image.Image) -> Image.Image:
    """
    Apply an S-curve-inspired lookup table:
    - Shadows pulled down (values 0-80 crushed toward 0)
    - Midtones slightly lifted
    - Highlights preserved
    """
    arr = np.array(img, dtype=np.float32)

    # Build a 256-entry LUT
    lut = np.zeros(256, dtype=np.float32)
    for i in range(256):
        x = i / 255.0
        # S-curve: shadows crushed, midtones normal, highlights held
        if x < 0.35:
            # Crush shadows aggressively
            y = x * 0.65
        elif x < 0.70:
            # Midtones: slight contrast boost
            y = 0.35 * 0.65 + (x - 0.35) * 1.15
        else:
            # Highlights: hold near full
            y = 0.35 * 0.65 + 0.35 * 1.15 + (x - 0.70) * 1.05
        lut[i] = min(255.0, y * 255.0)

    # Apply per channel (RGB, ignore alpha if present)
    result = arr.copy()
    for c in range(min(3, arr.shape[2])):
        channel = arr[:, :, c]
        indices = np.clip(channel, 0, 255).astype(np.uint8)
        result[:, :, c] = lut[indices]

    return Image.fromarray(np.clip(result, 0, 255).astype(np.uint8), img.mode)


# ---------------------------------------------------------------------------
# Step 3: Color grade — warm amber/gold tones, slight desaturation
# ---------------------------------------------------------------------------
def color_grade(img: Image.Image) -> Image.Image:
    """
    1. Desaturate ~15% (blend toward luminance)
    2. Push warmth: boost R ~8%, boost G ~3%, reduce B ~8%
    """
    arr = np.array(img, dtype=np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

    # Luminance (Rec.709)
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b

    # Desaturate 15%
    desat = 0.15
    r = r * (1 - desat) + lum * desat
    g = g * (1 - desat) + lum * desat
    b = b * (1 - desat) + lum * desat

    # Warm colour push
    r = r * 1.08
    g = g * 1.03
    b = b * 0.92

    arr[:, :, 0] = r
    arr[:, :, 1] = g
    arr[:, :, 2] = b

    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), img.mode)


# ---------------------------------------------------------------------------
# Step 4: Film grain — baked-in noise
# ---------------------------------------------------------------------------
def add_film_grain(img: Image.Image, amplitude: int = 15) -> Image.Image:
    """
    Add random luminance noise (amplitude ~12-18) baked into the image.
    Noise is generated fresh each call so every poster has unique grain.
    """
    arr = np.array(img, dtype=np.int16)
    noise = np.random.randint(-amplitude, amplitude + 1,
                              size=(arr.shape[0], arr.shape[1], 1),
                              dtype=np.int16)
    # Broadcast noise to all RGB channels (luminance-style grain)
    noise = np.repeat(noise, min(3, arr.shape[2]), axis=2)
    arr[:, :, :min(3, arr.shape[2])] += noise
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), img.mode)


# ---------------------------------------------------------------------------
# Step 5: Vignette — radial gradient, edges ~60% darkened
# ---------------------------------------------------------------------------
def add_vignette(img: Image.Image, strength: float = 0.60) -> Image.Image:
    """
    Create an elliptical vignette mask: transparent at center, opaque-dark
    at corners (up to `strength` * 255 darkness).
    """
    w, h = img.size
    # Normalised distance from centre for every pixel
    xs = np.linspace(-1, 1, w)
    ys = np.linspace(-1, 1, h)
    xv, yv = np.meshgrid(xs, ys)
    dist = np.sqrt(xv ** 2 + yv ** 2)          # 0 at centre, √2 at corners

    # Map distance → vignette factor (0 = no darken, 1 = full strength)
    vig = np.clip(dist / np.sqrt(2), 0, 1)      # normalise to [0, 1]
    vig = vig ** 1.5                             # smooth falloff curve
    vig = vig * strength                          # scale to strength

    arr = np.array(img, dtype=np.float32)
    for c in range(min(3, arr.shape[2])):
        arr[:, :, c] = arr[:, :, c] * (1 - vig)

    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), img.mode)


# ---------------------------------------------------------------------------
# Step 6: Title overlay
# ---------------------------------------------------------------------------
def format_title(project_slug: str) -> str:
    """Convert 'conflict-coordinate' → 'CONFLICT COORDINATE'."""
    return project_slug.replace("-", " ").upper()


def add_title_overlay(img: Image.Image, project_slug: str) -> Image.Image:
    """
    Burn the project title and byline onto the bottom of the poster.

    Layout (bottom-up):
        "A EMRAAN YUSUF FILM"   — small caps, smaller font, secondary
        "PROJECT TITLE"         — large, bold serif
    Both sit on a semi-transparent dark rectangle for readability.
    """
    draw = ImageDraw.Draw(img)
    w, h = img.size

    title_text  = format_title(project_slug)
    byline_text = "A EMRAAN YUSUF FILM"

    # Font sizes — scale relative to poster width
    title_size  = max(36, w // 18)
    byline_size = max(18, w // 38)
    padding     = w // 28   # ~28px at 800px wide

    font_title  = _load_font(SERIF_BOLD_CANDIDATES, title_size)
    font_byline = _load_font(SERIF_FONT_CANDIDATES, byline_size)

    # Measure text blocks
    t_bbox  = draw.textbbox((0, 0), title_text,  font=font_title)
    b_bbox  = draw.textbbox((0, 0), byline_text, font=font_byline)
    t_w = t_bbox[2] - t_bbox[0]
    t_h = t_bbox[3] - t_bbox[1]
    b_w = b_bbox[2] - b_bbox[0]
    b_h = b_bbox[3] - b_bbox[1]

    line_gap   = padding // 2
    block_h    = t_h + line_gap + b_h + padding * 2
    rect_top   = h - block_h - padding

    # Dark backdrop rectangle
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rectangle(
        [(0, rect_top), (w, h)],
        fill=(10, 10, 10, 200),   # #0a0a0a at ~78% opacity
    )
    # Merge overlay (img must be RGBA temporarily)
    base = img.convert("RGBA")
    base.alpha_composite(overlay)
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)

    # Draw byline (smaller, slightly dimmer) — sits ABOVE title in the block
    # Visual order from bottom: title → byline (reading upward)
    title_y  = rect_top + padding
    byline_y = title_y + t_h + line_gap

    # Title
    title_x = (w - t_w) // 2
    # Subtle shadow (RGB image — use 3-tuple)
    draw.text((title_x + 2, title_y + 2), title_text,
              font=font_title, fill=(0, 0, 0))
    draw.text((title_x, title_y), title_text,
              font=font_title, fill=TEXT_PRIMARY)

    # Byline
    byline_x = (w - b_w) // 2
    draw.text((byline_x + 1, byline_y + 1), byline_text,
              font=font_byline, fill=(0, 0, 0))
    draw.text((byline_x, byline_y), byline_text,
              font=font_byline, fill=(138, 134, 128))  # TEXT_SECONDARY #8a8680

    return img


# ---------------------------------------------------------------------------
# Master pipeline
# ---------------------------------------------------------------------------
def process_project(project_slug: str) -> bool:
    """
    Run the full pipeline for one project.
    Returns True on success, False if skipped.
    """
    src_dir = SCREENSHOTS_DIR / project_slug

    if not src_dir.exists():
        print(f"  [WARN] Screenshots folder not found: {src_dir}")
        return False

    # Find images (sorted; take the first)
    image_extensions = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}
    candidates = sorted(
        p for p in src_dir.iterdir()
        if p.is_file() and p.suffix.lower() in image_extensions
    )

    if not candidates:
        print(f"  [WARN] No images found in {src_dir} — skipping.")
        return False

    src_path = candidates[0]
    out_path = POSTERS_DIR / f"{project_slug}.jpg"

    print(f"  Processing : {project_slug}")
    print(f"    Source   : {src_path.name}")

    # Ensure output directory exists
    POSTERS_DIR.mkdir(parents=True, exist_ok=True)

    # Load
    img = Image.open(src_path).convert("RGB")

    # Pipeline
    img = crop_portrait(img)
    img = crush_blacks(img)
    img = color_grade(img)
    img = add_film_grain(img, amplitude=15)
    img = add_vignette(img, strength=0.60)
    img = add_title_overlay(img, project_slug)

    # Save — web-optimised JPEG, progressive encoding
    img.save(
        out_path,
        format="JPEG",
        quality=88,
        optimize=True,
        progressive=True,
    )

    print(f"    Output   : {out_path.relative_to(REPO_ROOT)}")
    return True


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------
def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate cinematic 2:3 portrait posters from raw screenshots."
    )
    parser.add_argument(
        "--project",
        metavar="PROJECT_SLUG",
        help="Process a single project by its folder name (e.g. conflict-coordinate). "
             "Omit to process all projects found in /screenshots/.",
    )
    args = parser.parse_args()

    if args.project:
        slugs = [args.project]
    else:
        if not SCREENSHOTS_DIR.exists():
            print(f"[ERROR] Screenshots directory not found: {SCREENSHOTS_DIR}")
            sys.exit(1)
        slugs = sorted(
            p.name for p in SCREENSHOTS_DIR.iterdir()
            if p.is_dir() and not p.name.startswith(".")
        )
        if not slugs:
            print(f"[WARN] No project folders found in {SCREENSHOTS_DIR}.")
            return

    print(f"\nPoster Processor — Emraan Yusuf Film Portfolio")
    print(f"{'─' * 50}")
    print(f"Screenshots : {SCREENSHOTS_DIR}")
    print(f"Output      : {POSTERS_DIR}")
    print(f"Projects    : {', '.join(slugs)}")
    print(f"{'─' * 50}\n")

    successes = 0
    for slug in slugs:
        ok = process_project(slug)
        if ok:
            successes += 1
        print()

    print(f"{'─' * 50}")
    print(f"Done. {successes}/{len(slugs)} poster(s) generated.")
    print(f"{'─' * 50}\n")


if __name__ == "__main__":
    main()
