"""Representative source-frame comparison, without changing requested delivery settings."""
import json
import math
import pathlib
import subprocess
import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw

root = pathlib.Path(__file__).resolve().parents[1] / 'public/images/cinematic hero section'
out = root / 'quality-tests'
out.mkdir(exist_ok=True)
ff = imageio_ffmpeg.get_ffmpeg_exe()
source = r'C:\Users\alwin\Downloads\restro_enhanced_clean.mp4'
results = []
thumbs = []
for index in [1, 601, 1001, 1675]:
    reference = out / f'source-{index:05d}.png'
    subprocess.run([ff, '-hide_banner', '-loglevel', 'error', '-nostdin', '-y', '-i', source, '-vf',
                    f'select=eq(n\\,{index - 1}),scale=1280:720:flags=lanczos', '-frames:v', '1', str(reference)], check=True)
    original = np.asarray(Image.open(reference).convert('RGB')).astype(float)
    for quality in [70, 75, 80]:
        encoded = out / f'frame-{index:05d}-q{quality}.webp'
        subprocess.run([ff, '-hide_banner', '-loglevel', 'error', '-nostdin', '-y', '-i', str(reference), '-c:v', 'libwebp',
                        '-quality', str(quality), '-compression_level', '6', '-lossless', '0', str(encoded)], check=True)
        im = Image.open(encoded).convert('RGB')
        decoded = np.asarray(im).astype(float)
        mse = float(np.mean((original - decoded) ** 2))
        results.append({'sourceFrame': index, 'quality': quality, 'bytes': encoded.stat().st_size,
                        'psnrDb': round(10 * math.log10(255 ** 2 / mse), 3),
                        'meanRgbDifference': [round(float(x), 3) for x in (decoded - original).mean(axis=(0, 1))]})
        im.thumbnail((384, 216))
        thumb = Image.new('RGB', (384, 240), '#17130f'); thumb.paste(im, (0, 24))
        ImageDraw.Draw(thumb).text((8, 6), f'Frame {index} / q{quality} / {encoded.stat().st_size:,} bytes', fill='white')
        thumbs.append(thumb)
sheet = Image.new('RGB', (1152, 960))
for i, thumb in enumerate(thumbs):
    sheet.paste(thumb, (i % 3 * 384, i // 3 * 240))
sheet.save(root / 'quality-comparison.jpg', quality=92)
(root / 'quality-comparison.json').write_text(json.dumps({'samples': results,
    'decision': 'Retain explicitly requested desktop q80/mobile q75. Lower desktop qualities reduce bytes but also measured source similarity. Frames are loaded progressively; the full sequence is not an initial download.'}, indent=2))
print(json.dumps(results, indent=2))
