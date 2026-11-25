"""Optimize generated transparent assets without changing their alpha or composition."""
import argparse
import pathlib
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument('name', choices=['burgers', 'shawarmas', 'mandi', 'desserts', 'drinks'])
parser.add_argument('source', type=pathlib.Path)
args = parser.parse_args()
root = pathlib.Path(__file__).resolve().parents[1]
target = root / 'public/images/promotions' / f'{args.name}-cutout.webp'
target.parent.mkdir(parents=True, exist_ok=True)
with Image.open(args.source) as original:
    image = original.convert('RGBA')
    assert image.getchannel('A').getextrema()[0] == 0, 'Expected genuine transparent pixels'
    image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
    image.save(target, format='WEBP', quality=86, method=6)
with Image.open(target) as check:
    assert check.mode == 'RGBA'
    assert check.getchannel('A').getextrema() == (0, 255)
    print(target.name, check.size, target.stat().st_size, 'bytes; alpha verified')
