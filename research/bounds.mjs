import draco from 'draco3d';
import fs from 'node:fs';
const m=await draco.createDecoderModule({});
for(const n of ['pudgy','overpass_logo','abstractlogo']){
const decoder=new m.Decoder(),b=new m.DecoderBuffer(),raw=fs.readFileSync(`public/assets/geometries/${n}.drc`);b.Init(new Int8Array(raw),raw.length);const mesh=new m.Mesh();decoder.DecodeBufferToMesh(b,mesh);const attr=decoder.GetAttribute(mesh,decoder.GetAttributeId(mesh,m.POSITION)),a=new m.DracoFloat32Array();decoder.GetAttributeFloatForAllPoints(mesh,attr,a);let min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<a.size();i++){min[i%3]=Math.min(min[i%3],a.GetValue(i));max[i%3]=Math.max(max[i%3],a.GetValue(i));}console.log(n,{points:mesh.num_points(),min,max});m.destroy(a);m.destroy(mesh);m.destroy(b);m.destroy(decoder);
}
