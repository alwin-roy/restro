"""Build seek-friendly delivery assets without modifying the supplied master."""
import pathlib, subprocess, json, sys
import imageio_ffmpeg
import cv2
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parents[1]
source=pathlib.Path(sys.argv[1]); ff=imageio_ffmpeg.get_ffmpeg_exe()
out=ROOT/'public/videos'; images=ROOT/'public/images/cinematic'
out.mkdir(parents=True,exist_ok=True); images.mkdir(parents=True,exist_ok=True)
for name,width,crf in [('desktop',1600,25),('mobile',960,28)]:
 subprocess.run([ff,'-y','-i',str(source),'-an','-vf',f'scale={width}:-2,fps=24','-c:v','libx264','-preset','fast','-crf',str(crf),'-g','8','-keyint_min','8','-sc_threshold','0','-pix_fmt','yuv420p','-movflags','+faststart',str(out/f'restro-{name}.mp4')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 print(name,(out/f'restro-{name}.mp4').stat().st_size,flush=True)
c=cv2.VideoCapture(str(source))
for name,t in [('poster',0),('interior',6),('kitchen',20),('preparation',26),('table',38),('guests',44),('final',55.7)]:
 c.set(cv2.CAP_PROP_POS_MSEC,t*1000); ok,frame=c.read()
 if not ok: raise RuntimeError(name)
 im=Image.fromarray(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)); im.thumbnail((1600,900)); im.save(images/f'{name}.webp',quality=84)
c.release()
print('complete',flush=True)

