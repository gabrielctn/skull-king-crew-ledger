"""Package original Skull Ledger artwork into platform image sizes.

Requires ffmpeg. Artwork is authored separately; this script only resizes,
pads safe areas, and converts pixel formats for Expo and PWA delivery.
"""
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
ICON = ROOT / "assets/brand/ledger-icon-source.png"
LEDGER = ROOT / "assets/illustrations/ledger.png"


def export(source: Path, destination: str, filters: str, pixel_format: str) -> None:
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(source), "-vf", filters, "-pix_fmt", pixel_format,
        "-frames:v", "1", "-update", "1", str(ROOT / destination),
    ], check=True)


for destination, size in [
    ("assets/icon.png", 1024),
    ("assets/favicon.png", 48),
    ("web/icons/icon-192.png", 192),
    ("web/icons/icon-512.png", 512),
    ("web/icons/icon-512-maskable.png", 512),
    ("web/icons/apple-touch-icon.png", 180),
]:
    export(ICON, destination, f"scale={size}:{size}:flags=lanczos", "rgb24")

for destination, size in [
    ("assets/adaptive-icon.png", 580),
    ("assets/splash-icon.png", 720),
]:
    export(
        LEDGER, destination,
        f"scale={size}:{size}:flags=lanczos,format=rgba,"
        "pad=1024:1024:(ow-iw)/2:(oh-ih)/2:color=black@0",
        "rgba",
    )
