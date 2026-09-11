import http from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
const root = process.cwd();
const port = Number(process.env.PORT) || 5819;
const types = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.mp4':'video/mp4','.otf':'font/otf','.ttf':'font/ttf'};
http.createServer((req,res)=>{
 try {
  const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname === '/' ? '/index.html' : new URL(req.url,'http://localhost').pathname));
  if(!path.startsWith(root+sep)) {res.writeHead(403).end();return;}
  const stat=statSync(path); if(!stat.isFile()) throw new Error();
  const range=req.headers.range;
  res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');
  res.setHeader('Accept-Ranges','bytes');
  if(range){const match=/bytes=(\d+)-(\d*)/.exec(range);if(!match){res.writeHead(416).end();return;}const start=Number(match[1]);const end=match[2]?Math.min(Number(match[2]),stat.size-1):stat.size-1;if(start>end){res.writeHead(416).end();return;}res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Content-Length':end-start+1});createReadStream(path,{start,end}).pipe(res);}
  else{res.setHeader('Content-Length',stat.size);createReadStream(path).pipe(res);}
 } catch {res.writeHead(404).end('Not found');}
}).listen(port,'0.0.0.0',()=>console.log(`Zuiver preview: http://localhost:${port}`));
