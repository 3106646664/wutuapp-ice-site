import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const base=path.join(path.dirname(fileURLToPath(import.meta.url)),'public');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.wasm':'application/wasm','.ktx2':'image/ktx2','.drc':'application/octet-stream','.ogg':'audio/ogg','.woff':'font/woff','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};
const port=Number(process.env.PORT||4173);
const server=http.createServer((req,res)=>{
 let url;
 try{url=new URL(req.url,'http://localhost');}catch{res.writeHead(400).end();return;}
 const name=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);
 let target=path.resolve(base,'.'+name);
 if(!target.startsWith(base+path.sep)){res.writeHead(403).end();return;}
 if(!fs.existsSync(target)||!fs.statSync(target).isFile()){
  if(name.startsWith('/reference/')||name==='/reference')target=path.join(base,'reference.html');
  else if(!path.extname(name))target=path.join(base,'index.html');
  else {console.log('404',name);res.writeHead(404,{'Content-Type':'text/plain'}).end('Not found');return;}
 }
 res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
 if(req.method==='HEAD'){res.end();return;}
 fs.createReadStream(target).pipe(res);
});
server.listen(port,'127.0.0.1',()=>console.log(`Local website: http://localhost:${port}/reference.html`));
