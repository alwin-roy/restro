import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const filename = path.resolve('src/features/home/lib/mascot-timeline.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS, esModuleInterop:true}}).outputText;
const compiledModule = {exports:{}};
new Function('require','module','exports',compiled)(createRequire(filename),compiledModule,compiledModule.exports);
const {getMascotPose, getMascotGeometry, timeline} = compiledModule.exports;
for (const width of [320,375,390,430,768,1024,1440]) {
  const stageWidth = Math.min(width-40,570);
  const left = width <768 ? 20 : width*.55;
  const g = getMascotGeometry(left,stageWidth,width);
  assert.equal(left+stageWidth+g.startX,0,'Fully outside left viewport at start');
  assert.equal(left+g.exitRightX,width,'Exits actual right viewport edge');
  assert.equal(left+g.peekX+stageWidth*timeline.peekEdgeFraction,width,'Source peek cut matches viewport edge');
  assert.equal(getMascotPose(0,g).x,g.startX);
  assert.equal(getMascotPose(timeline.runRightEnd,g).phase,'peeking');
  assert.equal(getMascotPose(timeline.runRightEnd,g).x,g.exitRightX);
  assert.equal(getMascotPose(timeline.runRightEnd+.5,g).x,g.peekX);
  assert.equal(getMascotPose(timeline.peekEnd,g).phase,'arriving');
  assert.equal(getMascotPose(timeline.peekEnd,g).x,g.peekX);
  assert.equal(getMascotPose(timeline.arrivalEnd,g).x,0,'Exact hero anchor after re-entry');
  assert.equal(getMascotPose(timeline.danceEnd,g).phase,'waving');
  assert.equal(getMascotPose(timeline.waveEnd,g).phase,'turning-left');
  assert.equal(getMascotPose(timeline.turnEnd,g).x,0);
  assert.equal(getMascotPose(timeline.duration,g).x,g.startX,'Same offscreen loop boundary');
  for (const boundary of [timeline.runRightEnd,timeline.peekEnd,timeline.arrivalEnd,timeline.danceEnd,timeline.waveEnd,timeline.turnEnd,timeline.duration]) {
    assert.ok(Math.abs(getMascotPose(boundary-1e-5,g).x-getMascotPose(boundary,g).x)<.001,`No position jump at ${boundary}s`);
  }
  let previous=g.startX;
  for (let t=0;t<=timeline.runRightEnd;t+=.01) { const p=getMascotPose(t,g); assert.ok(p.x>=previous-1e-5); assert.ok(p.playbackRate>=.5&&p.playbackRate<=1); previous=p.x; }
  assert.equal(getMascotPose(1,g).playbackRate,.5*timeline.runRightEnd/g.runRightDuration,'Outbound run is half its previous speed');
  assert.equal(getMascotPose(timeline.turnEnd+1,g).playbackRate,.5*(timeline.duration-timeline.turnEnd)/g.runLeftDuration,'Return run is half its previous speed');
  for (const t of [3.5,6,9,11]) assert.equal(getMascotPose(t,g).playbackRate,1,'Peek, dance, wave, and turn retain normal speed');
  assert.equal(getMascotPose(4.75,g).playbackRate,(timeline.arrivalEnd-timeline.peekEnd)/g.arrivalDuration,'Re-entry speed is unchanged');
  for (let t=timeline.arrivalEnd;t<timeline.turnEnd;t+=.01) assert.equal(getMascotPose(t,g).x,0,'No travel while dancing, waving, or turning');
  previous=0;
  for (let t=timeline.turnEnd;t<timeline.duration;t+=.01) { const p=getMascotPose(t,g); assert.ok(p.x<=previous+1e-5); previous=p.x; }
}
assert.equal(timeline.duration,14.25);
console.log('Mascot timeline: seven viewport geometries, right-edge peek, re-entry, and all phase/loop boundaries passed.');
