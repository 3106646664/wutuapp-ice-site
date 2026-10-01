import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import {SVGLoader} from 'three/addons/loaders/SVGLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {DOMParser} from '@xmldom/xmldom';
import draco from 'draco3d';
globalThis.DOMParser=class extends DOMParser {
 parseFromString(...args){const doc=super.parseFromString(...args);for(const node of [doc,doc.documentElement])node.querySelectorAll=(query)=>query.split(',').flatMap(tag=>Array.from(node.getElementsByTagName(tag.trim())));return doc;}
};
const encoder=await draco.createEncoderModule({});
const logo=JSON.parse(fs.readFileSync('source/liu-logo.json','utf8'));
const body=logo.components.map(c=>`<path d="${c.path}" fill="white" fill-rule="evenodd"/>`).join('');
fs.mkdirSync('public/personal',{recursive:true});
fs.writeFileSync('public/personal/logo.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="240 215 575 625">${body}</svg>`);
// The user-provided avatar is versioned in public/personal/avatar.jpg.
const svgs={
 liu:`<svg xmlns="http://www.w3.org/2000/svg">${body}</svg>`,
 journal:`<svg xmlns="http://www.w3.org/2000/svg"><path fill="white" fill-rule="evenodd" d="M10 10 H210 V260 H10 Z M37 35 V235 H180 V35 Z"/><path fill="white" d="M20 10 H42 V260 H20 Z M67 64 H157 V75 H67 Z M67 97 H157 V108 H67 Z M67 130 H139 V141 H67 Z M67 164 H157 V175 H67 Z"/></svg>`,
 experiment:`<svg xmlns="http://www.w3.org/2000/svg"><path fill="white" d="M60 10 H34 V70 L5 96 L34 123 V180 H60 V112 L32 96 L60 78 Z M140 10 H166 V70 L195 96 L166 123 V180 H140 V112 L168 96 L140 78 Z M113 30 L83 157 H104 L134 30 Z"/></svg>`,
};
const contours={};
function simplify(points,tolerance){
 if(points.length<3)return points;
 const a=points[0],b=points.at(-1),dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy;let max=0,index=0;
 for(let i=1;i<points.length-1;i++){const q=points[i],t=l?Math.max(0,Math.min(1,((q.x-a.x)*dx+(q.y-a.y)*dy)/l)):0;const d=(q.x-a.x-dx*t)**2+(q.y-a.y-dy*t)**2;if(d>max){max=d;index=i;}}
 if(max>tolerance*tolerance)return [...simplify(points.slice(0,index+1),tolerance).slice(0,-1),...simplify(points.slice(index),tolerance)];
 return [a,b];
}
function pathFrom(points,Shape=THREE.Path){const s=new Shape();const ps=simplify([...points,points[0]],1.1);s.moveTo(ps[0].x,ps[0].y);for(const p of ps.slice(1))s.lineTo(p.x,p.y);return s;}
for(const [name,svg] of Object.entries(svgs)){
 const raw=new SVGLoader().parse(svg).paths.flatMap(p=>SVGLoader.createShapes(p));
 const curves=raw.map(s=>s.extractPoints(4));
 const shapes=curves.map(c=>{const s=pathFrom(c.shape,THREE.Shape);s.holes=c.holes.map(h=>pathFrom(h));return s;});
 const merged=mergeGeometries(shapes.map(s=>new THREE.ExtrudeGeometry(s,{depth:name==='liu'?65:24,bevelEnabled:true,bevelSize:name==='liu'?6:3,bevelThickness:name==='liu'?5:2,bevelSegments:3,curveSegments:4,steps:1})),false);
 merged.computeBoundingBox();
 const bounds=merged.boundingBox; const size=bounds.getSize(new THREE.Vector3());const center=bounds.getCenter(new THREE.Vector3());const scale=1.3/Math.max(size.x,size.y);
 merged.translate(-center.x,-center.y,-center.z);merged.scale(scale,-scale,-scale);merged.computeVertexNormals();
 contours[name]=curves.map(s=>({shape:s.shape.map(p=>[(p.x-center.x)*scale,(center.y-p.y)*scale]),holes:s.holes.map(h=>h.map(p=>[(p.x-center.x)*scale,(center.y-p.y)*scale]))}));
 const e=new encoder.Encoder(),builder=new encoder.MeshBuilder(),mesh=new encoder.Mesh();
 const vertices=merged.attributes.position.count,faces=Uint32Array.from({length:vertices},(_,i)=>i);
 builder.AddFacesToMesh(mesh,vertices/3,faces);
 for(const [a,key,n] of [['position','POSITION',3],['normal','NORMAL',3],['uv','TEX_COORD',2]])builder.AddFloatAttributeToMesh(mesh,encoder[key],vertices,n,merged.attributes[a].array);
 e.SetSpeedOptions(5,5);e.SetAttributeQuantization(encoder.POSITION,14);e.SetAttributeQuantization(encoder.NORMAL,10);e.SetAttributeQuantization(encoder.TEX_COORD,12);
 const out=new encoder.DracoInt8Array();const len=e.EncodeMeshToDracoBuffer(mesh,out);if(len<=0)throw Error('Encoding failed '+name);const bytes=new Uint8Array(len);for(let i=0;i<len;i++)bytes[i]=out.GetValue(i);
 // The reference runtime expects an attribute manifest before the Draco payload.
 const meta=Buffer.from(JSON.stringify({attributes:[['position',7],['normal',7],['uv',7]],userData:{origin:'personal-vector',name}}));
 const length=Buffer.alloc(4);length.writeUInt32LE(meta.length);
 fs.writeFileSync(`public/assets/geometries/${name}.drc`,Buffer.concat([length,meta,bytes]));
 console.log(name,vertices,'vertices',len,'bytes');
 encoder.destroy(out);encoder.destroy(mesh);encoder.destroy(builder);encoder.destroy(e);
}
fs.writeFileSync('research/personal-contours.json',JSON.stringify(contours));
