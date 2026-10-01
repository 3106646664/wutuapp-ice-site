"""Local subset SDF atlas, compatible with the reference site's animated meshes."""
from pathlib import Path
import json, struct, math
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parent
corpus=(root/'personal-config.json').read_text(encoding='utf-8')+(root/'build.mjs').read_text(encoding='utf-8')+(root/'public/index.html').read_text(encoding='utf-8')
chars=sorted(set(chr(i) for i in range(32,127))|set(c for c in corpus if ord(c)>127))
cell=80; em=48; width=1280; height=2**math.ceil(math.log2(math.ceil(len(chars)/16)*cell))
atlas=np.zeros((height,width,4),np.uint8);atlas[:,:,3]=255
font=ImageFont.truetype('C:/Windows/Fonts/msyhbd.ttc',em)
glyphs=[]
for i,c in enumerate(chars):
    advance=font.getlength(c)/em
    glyph={'unicode':ord(c),'advance':advance}
    if not c.isspace():
        tile=Image.new('L',(cell,cell));ImageDraw.Draw(tile).text((8,60),c,font=font,fill=255,anchor='ls')
        mask=(np.array(tile)>127).astype(np.uint8)
        inside=cv2.distanceTransform(mask,cv2.DIST_L2,cv2.DIST_MASK_PRECISE)
        outside=cv2.distanceTransform(1-mask,cv2.DIST_L2,cv2.DIST_MASK_PRECISE)
        sdf=np.clip(.5+(inside-outside)/12,0,1)*255
        x=(i%16)*cell;y=(i//16)*cell
        atlas[y:y+cell,x:x+cell,:3]=sdf.astype(np.uint8)[:,:,None]
        glyph.update(planeBounds={'left':-8/em,'bottom':-20/em,'right':72/em,'top':60/em},atlasBounds={'left':x,'bottom':height-y-cell,'right':x+cell,'top':height-y})
    glyphs.append(glyph)
data={'atlas':{'type':'msdf','distanceRange':12,'size':em,'width':width,'height':height,'yOrigin':'bottom'},'metrics':{'emSize':1,'lineHeight':1.45,'ascender':1.1,'descender':-.3},'glyphs':glyphs,'kerning':[]}
dest=root/'public/assets/fonts';(dest/'PersonalChinese.json').write_text(json.dumps(data,ensure_ascii=False),encoding='utf-8')
template=(root/'public/assets/images/volumes/liu.ktx2').read_bytes()
payload=atlas[::-1].copy().tobytes()
header=template[:12]+struct.pack('<13I2Q',37,1,width,height,0,0,1,1,0,104,92,196,24,0,0)
(dest/'PersonalChinese-datatexture.ktx2').write_bytes(header+struct.pack('<3Q',224,len(payload),len(payload))+template[104:220]+b'\0'*4+payload)
print(f'Chinese SDF atlas: {len(chars)} glyphs, {width}x{height}')
