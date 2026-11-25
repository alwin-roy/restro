"""Prepare the supplied Restro mascot footage; no generated/redesigned character.
Usage: python scripts/prepare-mascot.py "path/to/source.mp4"
Requires local Python OpenCV, NumPy, Pillow and imageio-ffmpeg (build tools only).
"""
from __future__ import annotations
import argparse, json, pathlib, subprocess
import cv2
import numpy as np
from PIL import Image, ImageDraw
import imageio_ffmpeg

FPS = 24
SIZE = 512
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'public' / 'animations'
WORK = ROOT / '.next' / 'mascot-work'


def silhouette(frame):
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    seed = ((hsv[:, :, 1] > 40) | (hsv[:, :, 2] < 105)).astype(np.uint8) * 255
    count, labels, stats, _ = cv2.connectedComponentsWithStats(seed)
    if count < 2:
        raise ValueError('Character not found')
    mask = (labels == 1 + np.argmax(stats[1:, 4])).astype(np.uint8) * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    # Flood from every source boundary, including gaps next to the cropped
    # peeking hands. A single corner seed would fill those gaps as opaque gray.
    flood = cv2.copyMakeBorder(mask, 1, 1, 1, 1, cv2.BORDER_CONSTANT, value=0)
    cv2.floodFill(flood, None, (0, 0), 255)
    return mask | cv2.bitwise_not(flood[1:-1, 1:-1])


def matte(frame, mask):
    # Solve boundary alpha against the neutral source backdrop, using the nearest
    # opaque interior pixel as the foreground estimate. Internal white eyes/teeth
    # are protected by hole-filling the silhouette before this trimap is made.
    core = cv2.erode(mask, np.ones((5, 5), np.uint8))
    outer = cv2.dilate(mask, np.ones((5, 5), np.uint8))
    _, labels = cv2.distanceTransformWithLabels(255-core, cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL)
    colors = np.zeros((labels.max()+1, 3), np.float32)
    colors[labels[core > 0]] = frame[core > 0]
    foreground = colors[labels]
    rgb = frame.astype(np.float32)
    border = np.concatenate((frame[:3].reshape(-1, 3), frame[-3:].reshape(-1, 3)))
    background = np.median(border, axis=0).astype(np.float32)
    direction = foreground-background
    alpha = np.clip(((rgb-background)*direction).sum(2)/(direction*direction).sum(2).clip(1), 0, 1)
    alpha[core > 0] = 1
    alpha[outer == 0] = 0
    color = np.clip((rgb-background*(1-alpha[:, :, None]))/alpha[:, :, None].clip(.01), 0, 255)
    # Premultiply while resizing to avoid introducing gray/black edge fringes.
    return np.dstack((color[:, :, ::-1]*alpha[:, :, None], alpha*255)).astype(np.float32)


def encode(name, frames):
    command = [imageio_ffmpeg.get_ffmpeg_exe(), '-hide_banner', '-loglevel', 'error', '-y',
               '-f', 'rawvideo', '-pixel_format', 'rgba', '-video_size', f'{SIZE}x{SIZE}',
               '-framerate', str(FPS), '-i', 'pipe:0', '-an', '-c:v', 'libvpx-vp9',
               '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '30', '-deadline', 'good',
               '-cpu-used', '4', '-row-mt', '1', '-auto-alt-ref', '0', str(OUTPUT/name)]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    for frame in frames:
        process.stdin.write(frame.tobytes())
    process.stdin.close()
    if process.wait() != 0:
        raise RuntimeError(f'Encoding failed: {name}')


def sample(frames, start, end, count):
    return [frames[int(round(t*FPS))] for t in np.linspace(start, end, count, endpoint=False)]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=pathlib.Path)
    args = parser.parse_args()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    WORK.mkdir(parents=True, exist_ok=True)
    capture = cv2.VideoCapture(str(args.source))
    if capture.get(cv2.CAP_PROP_FPS) != FPS:
        raise ValueError('This edit is authored for the supplied 24fps footage')
    tracks = []
    while True:
        ok, frame = capture.read()
        if not ok: break
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        body = ((hsv[:, :, 1] > 65) & (hsv[:, :, 2] > 140)).astype(np.uint8)*255
        _, labels, stats, _ = cv2.connectedComponentsWithStats(body)
        if len(stats) > 1:
            x, y, w, h = stats[1+np.argmax(stats[1:, 4]), :4]
            tracks.append((x+w/2, h))
        else:
            tracks.append(tracks[-1] if tracks else (960, 700))
    capture.release()
    tracks = np.asarray(tracks)
    # Smooth source-camera tracking rather than tracking limbs, preserving the
    # actual leg/arm motion and vertical bounce recorded in the original footage.
    smooth = np.stack([np.median(tracks[max(0,i-2):i+3],axis=0) for i in range(len(tracks))])
    frames = {}
    required = set(range(12, 61)) | set(range(72, 104)) | set(range(115, 259))
    peek_scale = 360/np.median(smooth[12:61, 1])
    capture = cv2.VideoCapture(str(args.source))
    for i in range(len(tracks)):
        ok, frame = capture.read()
        if not ok: raise ValueError('Unexpected end of source')
        if i not in required: continue
        mask = silhouette(frame)
        x, y, w, h = cv2.boundingRect(mask)
        x, y = max(0, x-8), max(0, y-8)
        w, h = min(frame.shape[1]-x, w+16), min(frame.shape[0]-y, h+16)
        rgba = matte(frame[y:y+h, x:x+w], mask[y:y+h, x:x+w])
        is_peeking = 72 <= i < 104
        scale = peek_scale if is_peeking else 360/smooth[i, 1]
        # The native source clips the peeking character at the right edge.
        # Keep that exact cut at canvas x=256; runtime aligns it to the viewport
        # edge. Centering a partially visible torso would destroy the peek.
        pivot_x = frame.shape[1] if is_peeking else smooth[i, 0]
        matrix = np.array([[scale,0,SIZE/2-(pivot_x-x)*scale], [0,scale,490-(970-y)*scale]],np.float32)
        placed = cv2.warpAffine(rgba, matrix, (SIZE,SIZE), flags=cv2.INTER_AREA, borderMode=cv2.BORDER_CONSTANT)
        alpha = placed[:,:,3:4]/255
        placed[:,:,:3] = np.where(alpha>.001, placed[:,:,:3]/alpha.clip(.001), 0)
        frames[i] = np.clip(placed,0,255).astype(np.uint8)
    capture.release()
    # Retain the source poses at clip joins. No synthetic limbs,
    # CSS dancing, optical-flow hallucination, or ghosting crossfades are used.
    run = sample(frames,.5,2.5,72)
    peek = sample(frames,3.0,4.3,36)
    # Use intact recorded running frames for re-entry; the source's 4.45-4.7s
    # hop crops the lettuce off the top of the original 1080p frame.
    arrival = [cv2.flip(frame,1) for frame in sample(frames,.5,1.,18)]
    dance = sample(frames,4.8,10.3,132)
    turn = sample(frames,10.3,10.75,12)
    back = [cv2.flip(frame,1) for frame in run]
    cycle = run+peek+arrival+dance+turn+back
    encode('shawarma-run.webm',run)
    encode('shawarma-dance-wave.webm',dance+turn)
    encode('shawarma-peek.webm',peek)
    encode('shawarma-cycle.webm',cycle)
    Image.fromarray(dance[0]).save(OUTPUT/'shawarma-poster.png', optimize=True)
    # An alpha probe is decoded in-browser before revealing the actual mascot.
    # Browsers that decode VP9 without its alpha plane keep the PNG, not a box.
    probe = np.zeros((SIZE,SIZE,4),np.uint8)
    probe[SIZE//2:,SIZE//2:] = [255,0,0,255]
    encode('alpha-probe.webm',[probe]*2)
    timeline = {'fps':FPS,'width':SIZE,'height':SIZE,'duration':len(cycle)/FPS,
                'runRightEnd':3,'peekEnd':4.5,'arrivalEnd':5.25,'danceEnd':8.75,'waveEnd':10.75,'turnEnd':11.25,'runLeftEnd':14.25,
                'peekSlideDuration':.3,'peekEdgeFraction':.5,
                'sourceSegments':{'running':[.5,2.5],'peeking':[3.,4.3],'arrivalRunning':[.5,1.],'danceWave':[4.8,10.3],'turn':[10.3,10.75]},
                'notes':'Run retimed to 3s; return mirrors original forward running. Clip cuts use original poses and need animator-authored transitions for a perfect pose match.'}
    (OUTPUT/'timeline.json').write_text(json.dumps(timeline,indent=2)+'\n')
    sheet=Image.new('RGB',(4*256,3*280),'#663377');draw=ImageDraw.Draw(sheet)
    for n,i in enumerate([0,48,71,78,84,96,107,117,126,180,234,294]):
        im=Image.fromarray(cycle[i]);im.thumbnail((256,256)); tile=Image.new('RGBA',(256,256),'#663377');tile.alpha_composite(im)
        x=n%4*256;y=n//4*280;sheet.paste(tile.convert('RGB'),(x,y));draw.text((x+8,y+260),f'{i/FPS:.2f}s',fill='white')
    sheet.save(WORK/'processed-contact-sheet.jpg')
    print(json.dumps({'frames':len(cycle),'duration':len(cycle)/FPS,'files':{p.name:p.stat().st_size for p in OUTPUT.iterdir()}},indent=2))

if __name__ == '__main__': main()
