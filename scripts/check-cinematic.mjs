import assert from 'node:assert/strict';
import ts from 'typescript';
import fs from 'node:fs';
const source = fs.readFileSync('src/lib/cinematic/scroll-mapping.ts','utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const {mapScrollToTime,seekTarget,shouldSeek} = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
for (const menuHeight of [1200,5000]) {
 const anchors=[{y:0,time:0},{y:600,time:3.2},{y:1000,time:7},{y:1600,time:19.5},{y:1600+menuHeight,time:34.5},{y:2300+menuHeight,time:41.5},{y:3000+menuHeight,time:49.5},{y:4000+menuHeight,time:55.83}];
 for (const anchor of anchors) assert.equal(mapScrollToTime(anchor.y,anchors),anchor.time);
 assert.equal(mapScrollToTime(1600+menuHeight/2,anchors),27);
 let last=-1; for(let y=0;y<5000+menuHeight;y+=13) {const t=mapScrollToTime(y,anchors); assert.ok(t>=last); last=t;}
 assert.equal(mapScrollToTime(-100,anchors),0);
 assert.equal(mapScrollToTime(100000,anchors),55.83);
}
assert.equal(mapScrollToTime(0,[]),0);
assert.equal(seekTarget(-5,56),0); assert.ok(seekTarget(90,56)<56);
assert.equal(shouldSeek(0,5,true),false); assert.equal(shouldSeek(5,5.01,false),false); assert.equal(shouldSeek(5,0,false),true);
assert.equal(seekTarget(NaN,56),0);
assert.equal(seekTarget(30,NaN),0);
assert.equal(seekTarget(30,Infinity),0);
assert.equal(mapScrollToTime(50,[{y:0,time:0},{y:0,time:2},{y:100,time:10}]),6);
let decoded=0, pending=4, seeking=true;
assert.equal(shouldSeek(decoded,pending,seeking),false);
pending=12; pending=2; seeking=false;
assert.equal(shouldSeek(decoded,pending,seeking),true);
decoded=pending; assert.equal(shouldSeek(decoded,pending,false),false);
console.log('Cinematic mapping: section anchors, responsive heights, monotonic forward/reverse mapping, endpoints and seek coordination passed.');
