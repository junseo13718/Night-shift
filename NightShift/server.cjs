const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const lan=process.argv.includes('--lan');
const root=path.join(__dirname,'game');
const server=http.createServer((req,res)=>{let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(err?'Not found':data);});});
server.on('error',e=>{console.error('Unable to start:',e.message);process.exitCode=1;});
server.listen(lan?4174:0,lan?'0.0.0.0':'127.0.0.1',()=>{const url='http://127.0.0.1:'+server.address().port;console.log('NIGHT SHIFT: '+url+'\nKeep this window open. Ctrl+C to stop.');if(lan){console.log('\nPHONE: Connect to the same Wi-Fi and open one of these URLs:');for(const entries of Object.values(os.networkInterfaces()))for(const entry of entries||[]){if(entry.family==='IPv4'&&!entry.internal&&/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(entry.address))console.log('http://'+entry.address+':4174');}console.log('\nWi-Fi HTTP mode supports TOUCH controls. Camera requires HTTPS hosting.');}if(process.platform==='win32'&&!process.argv.includes('--no-open'))require('node:child_process').spawn('powershell.exe',['-NoProfile','-Command',`Start-Process '${url}'`],{windowsHide:true,stdio:'ignore'});});

