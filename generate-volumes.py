"""Generate signed-distance + gradient volumes from our own vector contours."""
from pathlib import Path
import numpy as np, cv2, json, struct
root=Path(__file__).resolve().parent
contours=json.loads((root/'research/personal-contours.json').read_text())
size=64
template=(root/'public/assets/images/volumes/x_64.ktx2').read_bytes()
for name,shapes in contours.items():
 mask=np.zeros((size,size),np.uint8)
 for c in shapes:
  part=np.zeros_like(mask)
  def xy(poly):return np.rint(np.array(poly)*39+31.5).astype(np.int32)
  cv2.fillPoly(part,[xy(c['shape'])],1)
  for hole in c['holes']:cv2.fillPoly(part,[xy(hole)],0)
  mask|=part
 outside=cv2.distanceTransform(1-mask,cv2.DIST_L2,cv2.DIST_MASK_PRECISE)
 inside=cv2.distanceTransform(mask,cv2.DIST_L2,cv2.DIST_MASK_PRECISE)
 planar=cv2.GaussianBlur((outside-inside)/size,(3,3),.65)
 height=(np.abs(np.arange(size)-31.5)-6)/size
 q0=np.broadcast_to(planar,(size,size,size));q1=np.broadcast_to(height[:,None,None],q0.shape)
 sdf=np.minimum(np.maximum(q0,q1),0)+np.sqrt(np.maximum(q0,0)**2+np.maximum(q1,0)**2)
 dz,dy,dx=np.gradient(sdf)
 norm=np.sqrt(dx*dx+dy*dy+dz*dz)+1e-8
 data=np.stack([dx/norm*.5+.5,dy/norm*.5+.5,dz/norm*.5+.5,sdf*.25+.5],axis=-1)
 payload=(np.clip(data,0,1)*255).astype(np.uint8).tobytes()
 header=template[:12]+struct.pack('<13I2Q',37,1,size,size,size,0,1,1,0,104,92,196,24,0,0)
 result=header+struct.pack('<3Q',224,len(payload),len(payload))+template[104:220]+b'\0'*4+payload
 dest=root/f'public/assets/images/volumes/{name}.ktx2';dest.write_bytes(result)
 print(name,len(result),'bytes SDF volume')
