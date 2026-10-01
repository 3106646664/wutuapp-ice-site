import fs from 'node:fs';
import crypto from 'node:crypto';
import draco from 'draco3d';
const manifest=JSON.parse(fs.readFileSync('research/assets-manifest.json','utf8'));
const patched=new Set(['assets/index-2eb69c09.js','assets/App3D-f554a111.js']);
let unchanged=0;
for(const asset of manifest.assets){const data=fs.readFileSync('public/'+asset.path);const hash=crypto.createHash('sha256').update(data).digest('hex');if(!patched.has(asset.path)){if(hash!==asset.sha256)throw Error('Changed source asset: '+asset.path);unchanged++;}}
const decoder=await draco.createDecoderModule({});
const models=[];
for(const name of ['liu','journal','experiment']){
 const file=fs.readFileSync('public/assets/geometries/'+name+'.drc');const n=file.readUInt32LE(0),info=JSON.parse(file.subarray(4,4+n).toString());const raw=file.subarray(4+n);
 const dec=new decoder.Decoder(),b=new decoder.DecoderBuffer(),mesh=new decoder.Mesh();b.Init(new Int8Array(raw),raw.length);const result=dec.DecodeBufferToMesh(b,mesh);if(!result.ok())throw Error(result.error_msg());
 for(let i=0;i<info.attributes.length;i++){const attr=dec.GetAttributeByUniqueId(mesh,i);if(!attr.ptr)throw Error('Missing attribute '+i+' in '+name);}
 if(mesh.num_points()<100||mesh.num_faces()<100)throw Error('Incomplete mesh: '+name);
 models.push({name,points:mesh.num_points(),faces:mesh.num_faces(),manifest:info.attributes});decoder.destroy(b);decoder.destroy(mesh);decoder.destroy(dec);
 const volume=fs.readFileSync('public/assets/images/volumes/'+name+'.ktx2');if(volume.readUInt32LE(12)!==37||volume.readUInt32LE(24)!==64||volume.readUInt32LE(28)!==64||volume.readBigUInt64LE(88)!==1048576n)throw Error('Invalid SDF volume '+name);
}
const paths=[...manifest.assets.map(a=>'/'+a.path),'/','/reference/','/reference/portfolio/pudgy-penguins','/portfolio/journal','/portfolio/experiments','/portfolio/about','/personal/site.css','/personal/site.js','/personal/settings.js','/personal/logo.svg','/personal/avatar.jpg',...models.flatMap(x=>['/assets/geometries/'+x.name+'.drc','/assets/images/volumes/'+x.name+'.ktx2'])];
let fetched=0;
for(let i=0;i<paths.length;i+=8){const checks=await Promise.all(paths.slice(i,i+8).map(async p=>{const response=await fetch('http://localhost:4173'+p);if(response.status!==200)throw Error('HTTP '+response.status+' '+p);if(p.endsWith('.js')&&!response.headers.get('content-type').includes('javascript'))throw Error('Bad JS MIME '+p);await response.arrayBuffer();return p;}));fetched+=checks.length;}
const report={sourceAssets:manifest.assets.length,sourceAssetsByteIdentical:unchanged,adaptedRuntimeFiles:[...patched],HTTPChecks:fetched,models,allPassed:true};
fs.writeFileSync('research/verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));

