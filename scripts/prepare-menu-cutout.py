"""Encode generated menu cutouts with their original transparency preserved."""
import pathlib, sys
from PIL import Image
root=pathlib.Path(__file__).resolve().parents[1]
name=sys.argv[1]
assert name in ['wraps-rolls','fried-chicken','pizzas','sandwiches']
target=root/'public/images/menu-cutouts'/f'{name}.webp'
target.parent.mkdir(parents=True,exist_ok=True)
with Image.open(sys.argv[2]) as source:
    image=source.convert('RGBA')
    assert image.getchannel('A').getextrema()==(0,255)
    image.thumbnail((800,800),Image.Resampling.LANCZOS)
    image.save(target,format='WEBP',quality=84,method=6)
print(target.name,target.stat().st_size)
