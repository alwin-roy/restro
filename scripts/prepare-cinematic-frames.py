"""Encode complete WebP sequences; inspect every output before publishing manifest."""
import argparse
import hashlib
import json
import pathlib
import shutil
import subprocess
import time

import imageio_ffmpeg
from PIL import Image, ImageStat

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/images/cinematic hero section'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=pathlib.Path)
    parser.add_argument('--ffprobe', required=True)
    args = parser.parse_args()
    ffmpeg = shutil.which('ffmpeg') or imageio_ffmpeg.get_ffmpeg_exe()
    OUT.mkdir(parents=True, exist_ok=True)
    probe = json.loads(subprocess.check_output([args.ffprobe, '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(args.source)]))
    video = next(s for s in probe['streams'] if s['codec_type'] == 'video')
    duration = float(video['duration'])
    manifest = {'version': 1, 'duration': duration, 'containerDuration': float(probe['format']['duration']),
                'source': {'name': args.source.name, 'bytes': args.source.stat().st_size,
                           'sha256': hashlib.file_digest(args.source.open('rb'), 'sha256').hexdigest(),
                           'width': video['width'], 'height': video['height'], 'frameRate': video['avg_frame_rate']},
                'sceneAnchors': [{'time': t, 'label': label} for t, label in [(0, 'Arrival'), (3.2, 'Enter Restro'), (7, 'Dining room'), (19.5, 'Open kitchen'), (25, 'Preparation'), (34.5, 'Table'), (41.5, 'Guests'), (49.5, 'Closing'), (54, 'Footer')]],
                'sceneNote': 'Editorial anchors observed in continuous footage, not detected hard cuts.',
                'sequences': {}}
    (OUT / 'source-inspection.json').write_text(json.dumps(probe, indent=2))
    for name, width, fps, quality in [('desktop', 1280, 30, 80), ('mobile', 960, 24, 75)]:
        folder = OUT / name
        folder.mkdir(exist_ok=True)
        if list(folder.glob('frame-*.webp')):
            raise RuntimeError(f'Refusing to overwrite existing sequence: {folder}')
        started = time.monotonic()
        with (OUT / f'{name}-ffmpeg.log').open('w') as log:
            subprocess.run([ffmpeg, '-hide_banner', '-nostdin', '-i', str(args.source), '-map', '0:v:0', '-an',
                            '-vf', f'fps={fps},scale={width}:-2:flags=lanczos', '-c:v', 'libwebp', '-quality', str(quality),
                            '-compression_level', '6', '-lossless', '0', '-threads', '4', '-start_number', '1',
                            str(folder / 'frame-%05d.webp')], check=True, stdout=log, stderr=log)
        files = sorted(folder.glob('frame-*.webp'))
        black = []
        sizes = []
        for index, path in enumerate(files, 1):
            assert path.name == f'frame-{index:05d}.webp'
            with Image.open(path) as im:
                im.load()
                assert im.size == (width, width * 9 // 16)
                assert not getattr(im, 'is_animated', False)
                gray = im.convert('L')
                if ImageStat.Stat(gray).mean[0] < 2:
                    black.append(index)
            sizes.append(path.stat().st_size)
        assert abs(len(files) / fps - duration) <= 1 / fps + .001
        assert not black, f'Unexpected black frames: {black}'
        manifest['sequences'][name] = {'frameCount': len(files), 'fps': fps, 'width': width, 'height': width * 9 // 16,
                                      'pattern': f'/images/cinematic%20hero%20section/{name}/frame-%05d.webp',
                                      'startIndex': 1, 'endIndex': len(files), 'totalBytes': sum(sizes),
                                      'averageFrameBytes': sum(sizes) / len(sizes), 'minFrameBytes': min(sizes), 'maxFrameBytes': max(sizes),
                                      'quality': quality, 'compressionLevel': 6, 'lossless': False, 'encoder': 'libwebp',
                                      'verifiedDecodedFrames': len(files), 'blackFrames': black, 'processingSeconds': round(time.monotonic() - started, 2)}
        print(name, json.dumps(manifest['sequences'][name]), flush=True)
    shutil.copyfile(OUT / 'desktop/frame-00001.webp', OUT / 'poster.webp')
    manifest['totalBytes'] = sum(s['totalBytes'] for s in manifest['sequences'].values())
    (OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')


if __name__ == '__main__':
    main()
