import fs from 'node:fs';
const cfg=JSON.parse(fs.readFileSync('personal-config.json','utf8'));
const read=p=>fs.readFileSync(p,'utf8');
const write=(p,s)=>fs.writeFileSync(p,s);
const runtimeVersion='20261001-layout3';
let source=read('research/app-readable.js');
const changes=[];
function patch(before,after){if(!source.includes(before))throw Error('Patch anchor not found: '+before.slice(0,100));source=source.replace(before,after);changes.push(before.slice(0,100));}
const personalConfig=`
if(window.__PERSONAL__){
 const cfg=window.__PERSONAL_CONFIG__;
 Be.manifesto={title:'////// 在这里，慢慢构建',text:cfg.manifesto};
 Be.colorProjectTitle='#e3eff9';Be.colorProjectText='#f0f6fb';
 Be.copyright='© 2026 借忧杂货铺';
 Be.rights='复刻来源：Igloo Inc.\\nigloo.inc\\n\\nwutuapp.com\\n想法、实践与日常。';
 Be.scroll='向下滚动，继续探索';Be.click='点击，打开这一页';Be.close='关闭';Be.muted=false;
 Be.follow='/// 下一段探索，由你开始';
 Be.social=[{name:'博客',link:'https://wutuapp.com'}];
 Be.cubes=cfg.entries.map((e,i)=>({title:'收藏 · 0'+(i+1)+' '+e.name,hash:e.hash,date:e.date,temp:[0,-3,-5][i],obj:['cube3','cube1','cube2'][i],innerobject:e.object,interior:{enabled:true,title:'////// '+e.name,content:e.description,socialTitle:'/// 继续探索',social:[{name:'前往博客',link:e.link}],linkTitle:'/// 从这里出发',links:[{name:'wutuapp.com',link:e.link}],obj:e.object,objScale:i===2?1:1.1}}));
 Be.links=cfg.entries.map(e=>({title:e.name,url:e.link,vdb:e.object,scale:1.2}));
}
function personalMaterial(detail=false){
 return new fe({uniformsGroups:[he.UBO],uniforms:{uDetail:{value:detail?1:0}},vertexShader:\`
 varying vec3 vN;varying vec3 vP;
 void main(){vN=normalize(normalMatrix*normal);vP=(modelViewMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*vec4(vP,1.);}
 \`,fragmentShader:\`
 ${'${ae}'}
 varying vec3 vN;varying vec3 vP;uniform float uDetail;
 void main(){vec3 n=normalize(vN);vec3 viewDir=normalize(-vP);vec3 light=normalize(vec3(-.5,.8,1.));float diffuse=max(dot(n,light),0.);float fresnel=pow(1.-max(dot(n,viewDir),0.),2.5);float shine=pow(max(dot(n,normalize(light+viewDir)),0.),65.);vec3 color=mix(vec3(.17,.37,.52),vec3(.65,.85,.98),diffuse*.75+.15)+vec3(.26,.36,.4)*fresnel+vec3(.6)*shine;float grain=fract(sin(dot(vP.xy,vec2(127.1,311.7)))*43758.5453);color*=.975+.05*grain;color*=mix(1.,.16,uDetail);gl_FragColor=vec4(color,1.);}
 \`});
}
`;
patch('class u3 {',personalConfig+'\nclass u3 {');
// A separate SDF atlas supports Chinese in the original animated 3D text meshes.
source=source.replaceAll('"IBMPlexMono-Medium"','(window.__PERSONAL__ ? "PersonalChinese" : "IBMPlexMono-Medium")');
source=source.replaceAll('"../fonts/IBMPlexMono-Medium-datatexture.ktx2"','(window.__PERSONAL__ ? "../fonts/PersonalChinese-datatexture.ktx2" : "../fonts/IBMPlexMono-Medium-datatexture.ktx2")');
// The reference scrambles an eight-column Latin atlas. Chinese glyphs have
// different cell bounds, so preserve glyph UVs and retain the opacity reveal.
let glyphUvFixes=0;
source=source.replace(/vUv\.x = mod\(uv\.x \+ 0\.125 \* mod\(floor\([^\n]+\), 8\.0\), 1\.0\);/g,line=>{
 glyphUvFixes++;
 return '${window.__PERSONAL__ ? "vUv.x = uv.x;" : '+JSON.stringify(line)+'}';
});
if(glyphUvFixes!==15)throw Error('Unexpected glyph UV shader count: '+glyphUvFixes);
for(const [before,after] of [['text: "TEMP"','text: window.__PERSONAL__ ? "温度" : "TEMP"'],['text: "Sound:"','text: window.__PERSONAL__ ? "声音：" : "Sound:"'],['text: "On"','text: window.__PERSONAL__ ? "开启" : "On"'],['text: "Off"','text: window.__PERSONAL__ ? "关闭" : "Off"']])patch(before,after);
patch('if (!e.font) throw new Error("You must specify a MSDF font.");\n    (super(),','if (!e.font) throw new Error("You must specify a MSDF font.");\n    if(window.__PERSONAL__) e={...e,wordBreak:true};\n    (super(),');
patch('text: `D ${this.parent.options.date.replaceAll("/", ".")}','text: `${window.__PERSONAL__ ? "" : "D "}${this.parent.options.date.replaceAll("/", ".")}');
patch('base: "",\n    routes:', 'base: window.__SITE_BASE__ || "",\n    routes:');
patch('te(this, Ol, (r) => U(this, tr).format(r === "" ? "/" : r)),','te(this, Ol, (r) => U(this, tr).format(r === "" ? "/" : r) || (r === "" ? "/" : r)),');
patch('new or({\n          map: le.load(`cubes/${this.options.innerobject}_color.ktx2`),\n        })','window.__PERSONAL__ ? personalMaterial(false) : new or({\n          map: le.load(`cubes/${this.options.innerobject}_color.ktx2`),\n        })');
patch('tMap: { value: le.load(`${this.options.obj}_dark_color.ktx2`) }','tMap: { value: le.load(window.__PERSONAL__ ? "perlin-datatexture.ktx2" : `${this.options.obj}_dark_color.ktx2`) }');
patch('(this.mesh.name = "object"),','(window.__PERSONAL__ && (this.mesh.material.dispose(), this.mesh.material = personalMaterial(true))),\n      (this.mesh.name = "object"),');
patch('((this.logo = new LF(this)), await this.logo.ready);','((this.logo = new LF(this)), await this.logo.ready);\n    if(window.__PERSONAL__) this.logo.mesh.visible = false;');
// Reserve the actual WebGL sound row above the DOM collection links. Its
// bottom margin changes at the original scene's desktop/mobile breakpoints.
patch('      ));\n  }\n}\nclass HF {',`      ));
    if(window.__PERSONAL__){
      const sound=this.sound;
      const meshes=[sound.icon,sound.sound,sound.on,sound.off];
      const rowTop=Math.max(...meshes.map(mesh=>{
        mesh.geometry.computeBoundingBox();
        return q.screen.height+mesh.position.y+mesh.geometry.boundingBox.max.y*mesh.scale.y;
      }));
      document.documentElement.style.setProperty('--sound-row-top',Math.ceil(rowTop)+'px');
    }
  }
}
class HF {`);
// DOM status is observable; controls use the same camera and navigation controller.
const hook=`
function installLocalControls(controller){
 if(window.__PERSONAL__)controller.uiScene.sound.onMute();
 document.body.dataset.ready='true';
 window.dispatchEvent(new CustomEvent('ice-ready',{detail:controller}));
 const status=document.getElementById('scene-status');
let lastStatus=0;
 const update=()=>{if(status && performance.now()-lastStatus>100){lastStatus=performance.now();const s=controller.scroll, y=((s.y%s.total)+s.total)%s.total;const stage=y<2.349?'landscape':y<5.349?'collections':'particles';status.dataset.stage=stage;status.dataset.progress=y.toFixed(3);status.dataset.detail=controller.isDetailOpen?String(controller.detailIndex):'';status.dataset.sound=String(!controller.audioController._controller.muted);}};
 he.renderPass.scene.beforeRenderCbs.push(update);
 document.querySelectorAll('[data-jump]').forEach(button=>button.addEventListener('click',async()=>{
  if(controller.isDetailOpen){Q.emit('webgl_switch_scene','');await new Promise(resolve=>setTimeout(resolve,1300));}
  controller.stopAutoCenter();
  const location=Number(button.dataset.jump);controller.centerScroll(location,1.8);
 }));
 document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',async()=>{if(controller.scrollBlocked && !controller.isDetailOpen)return;if(controller.isDetailOpen){Q.emit('webgl_switch_scene','');await new Promise(resolve=>setTimeout(resolve,1400));}if(!controller.scrollComposers[1].passes[0].scene.isSceneVisible){controller.stopAutoCenter();controller.centerScroll(2.35+Number(button.dataset.index),1.3);await new Promise(resolve=>setTimeout(resolve,1450));}Q.emit('webgl_switch_scene','/portfolio/'+button.dataset.open);}));
 document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>Q.emit('webgl_switch_scene','')));
 document.querySelectorAll('[data-sound]').forEach(button=>button.addEventListener('click',()=>{Q.emit('webgl_audio_mute_toggle');button.setAttribute('aria-pressed',String(!controller.audioController._controller.muted));}));
}
`;
patch('class jF {',hook+'\nclass jF {');
patch('(await f.ready, f.start(), s(() => !0));','(await f.ready, installLocalControls(f), f.start(), s(() => !0));');
// Apply a restrained ice-blue grade only in the personalized version.
const start=source.indexOf('class f3 extends fe'),end=source.indexOf('class p3 extends fe');
let shader=source.slice(start,end);
shader=shader.replace('gl_FragColor = vec4(color, 1.0);','gl_FragColor = vec4('+'${window.__PERSONAL__ ? "clamp(color * vec3(.98,1.04,1.09) + vec3(.025,.038,.05),0.,1.)" : "color"}'+', 1.0);');
source=source.slice(0,start)+shader+source.slice(end);
source=source.replace('from "./index-2eb69c09.js"','from "./index-2eb69c09.js?v='+runtimeVersion+'"');
write('public/assets/App3D-f554a111.js',source);
write('public/assets/index-2eb69c09.js',read('research/index-2eb69c09.js').replaceAll('https://www.igloo.inc/','/').replace('import("./App3D-f554a111.js")','import("./App3D-f554a111.js?v='+runtimeVersion+'")'));
write('public/index.html',read('public/index.html').replace(/\/assets\/index-2eb69c09\.js(?:\?v=[^"\s]+)?/g,'/assets/index-2eb69c09.js?v='+runtimeVersion).replace(/\/personal\/site\.css(?:\?v=[^"\s]+)?/g,'/personal/site.css?v='+runtimeVersion));
const original=read('research/original.html').replaceAll('https://www.igloo.inc/','/').replace('<meta charset="utf-8"/>','<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>');
write('public/reference.html',original.replace('/assets/index-2eb69c09.js','/assets/index-2eb69c09.js?v='+runtimeVersion).replace('<body>','<body><script>window.__SITE_BASE__="/reference";</script>'));
write('public/personal/settings.js','window.__PERSONAL_CONFIG__='+JSON.stringify(cfg)+';');
write('research/local-changes.json',JSON.stringify({mode:'Public runtime mirrored locally, with separately gated personal integration',anchors:changes},null,2));
console.log('Built reference and personal runtime; '+changes.length+' explicit patch anchors.');
fs.mkdirSync('dist',{recursive:true});
fs.cpSync('public','dist',{recursive:true});
console.log('Static site exported to dist/.');

