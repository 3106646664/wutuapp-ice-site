"""Acquire public runtime dependencies observed on the supplied reference page."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import urllib.request, re, json, hashlib

ROOT=Path(__file__).resolve().parent
PUBLIC=ROOT/'public'
BASE='https://www.igloo.inc/'
paths=set()
for p in ['index-2eb69c09.js','App3D-f554a111.js','exrworker-41cbee65.js','bitmapworker-046527f8.js','msdfworker-ac346fa7.js','audioworker-036a09db.js','favicon32-af94112f.png','favicon16-9e4401be.png']:
 paths.add('assets/'+p)
for group,names in {
 'geometries': 'mountain ground igloo intro_particles blurrytext shattered_ring2 floor blurrytext_cylinder smoke_trail shattered_ring_smoke ceilingsmoke pudgy overpass_logo abstractlogo shattered_ring',
 'geometries/igloo':'igloo_cage igloo_outline patch',
 'geometries/cubes':'background_shapes cube3 cube1 cube2',
}.items():
 for name in names.split():paths.add(f'assets/{group}/{name}.drc')
for group,names in {
 'images':'scroll-datatexture frost-datatexture bokeh caustics clouds_noise wind_noise perlin-datatexture mosaic numbers-datatexture shapes_blurred floor_color overpass_logo_dark_color abstractlogo_dark_color pudgy_dark_color shattered_ring2_color shattered_ring2_ao shattered_ring_ao shattered_ring_color',
 'images/noises':'blue-8-128-rgb',
 'images/ui':'logo-datatexture sound-datatexture close-datatexture arrow-datatexture visit-datatexture',
 'images/cubes':'dot_pattern cube_scene blurrytext_atlas cube1_roughness cube1_normal cube2_roughness cube2_normal cube3_roughness cube3_normal pudgy_color abstractlogo_color overpass_logo_color',
 'images/igloo':'triangles_tiling igloo_scene mountain_color ground_color ground_glow ground_sansigloo_color igloo_color igloo_exploded_color numbers',
 'images/volumes':'peachesbody_64 x_64 medium_32',
 'fonts':'IBMPlexMono-Medium-datatexture',
}.items():
 for name in names.split():paths.add(f'assets/{group}/{name}.ktx2')
paths.add('assets/fonts/IBMPlexMono-Medium.json')
paths.update('assets/images/'+p for p in ['cubes/bg.png','cubes/advect.png','cubes_env.exr','perlin-datatexture.png','uv/uvchecker-srgb.png'])
for name in 'music-highq room wind beeps igloo beeps2 beeps3 click-project enter-project leave-project shard circles project-text logo particles ui-long ui-short manifesto'.split():paths.add(f'assets/audio/{name}.ogg')
for group,names in {'draco':'draco_wasm_wrapper.js draco_decoder.wasm','basis':'basis_transcoder.js basis_transcoder.wasm'}.items():
 for name in names.split():paths.add(f'assets/libs/{group}/{name}')
entry=(ROOT/'research/index-2eb69c09.js').read_text(encoding='utf-8')
paths.update(re.findall(r'https://www\.igloo\.inc/(assets/[^)"\s]+\.woff2?)',entry))

def get(path):
 dest=PUBLIC/path;dest.parent.mkdir(parents=True,exist_ok=True)
 if not dest.exists():
  req=urllib.request.Request(BASE+path,headers={'User-Agent':'Mozilla/5.0'})
  with urllib.request.urlopen(req,timeout=45) as r:data=r.read()
  if data.startswith(b'<!doctype html>'):raise ValueError('HTML response for '+path)
  dest.write_bytes(data)
 data=dest.read_bytes()
 return {'path':path,'source':BASE+path,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}

records=[];failed=[]
with ThreadPoolExecutor(max_workers=8) as pool:
 futures={pool.submit(get,p):p for p in sorted(paths)}
 for future in as_completed(futures):
  try:records.append(future.result())
  except Exception as e:failed.append({'path':futures[future],'error':str(e)})
  if (len(records)+len(failed))%20==0:print('Downloaded',len(records),'failures',len(failed),flush=True)
(ROOT/'research/assets-manifest.json').write_text(json.dumps({'reference':BASE,'assets':sorted(records,key=lambda x:x['path']),'failed':failed},indent=2),encoding='utf-8')
html=(ROOT/'research/original.html').read_text(encoding='utf-8').replace(BASE,'/')
html=html.replace('<meta name="twitter:url" content="https://www.igloo.inc">','').replace('<meta property="og:url" content="https://www.igloo.inc">','')
html=html.replace('<meta charset="utf-8"/>','<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>')
(PUBLIC/'reference.html').write_text(html,encoding='utf-8')
patched=entry.replace(BASE,'/')
(PUBLIC/'assets/index-2eb69c09.js').write_text(patched,encoding='utf-8')
print(json.dumps({'assets':len(records),'bytes':sum(r['bytes'] for r in records),'failed':failed}))
