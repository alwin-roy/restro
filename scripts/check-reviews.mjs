import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const cache=new Map();
function load(file) {
  const filename=path.resolve(file);
  if(cache.has(filename)) return cache.get(filename).exports;
  const compiled={exports:{}}; cache.set(filename,compiled);
  const requireTs=(specifier)=>load(path.resolve('src',specifier.slice(2))+'.ts');
  const code=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
  new Function('require','exports','module',code)(requireTs,compiled.exports,compiled);
  return compiled.exports;
}
const {validateReview}=load('src/lib/validations/review.ts');
const {demoReviews}=load('src/data/reviews.ts');
const {readLocalReviews,writeLocalReviews,reviewCarouselReducer:reduce,initialReviewCarousel:initial,REVIEW_INTERVAL_MS,REVIEW_TRANSITION_MS,REVIEW_CLONES}=load('src/lib/reviews.ts');
const good={name:'Preview Guest',rating:4,content:'A browser-only test review with normal punctuation.'};
assert.ok(validateReview(good).valid);
for(const name of ['', ' ', 'Guest123', 'Guest@', 'A', 'A'.repeat(101)]) assert.ok(validateReview({...good,name}).errors.name);
for(const name of ['Élodie Durand','अंजली शर्मा','李 明']) assert.ok(validateReview({...good,name}).valid);
for(const rating of [0,-1,6,3.5,NaN]) assert.ok(validateReview({...good,rating}).errors.rating);
for(const content of ['', ' '.repeat(20),'Too short','x'.repeat(1001)]) assert.ok(validateReview({...good,content}).errors.content);
assert.ok(validateReview({...good,content:'x'.repeat(1000)}).valid);
assert.equal(validateReview({...good,name:'  Preview   Guest  '}).values.name,'Preview Guest');
const local={id:'local-test-one',...good,source:'local'};
assert.deepEqual(readLocalReviews(writeLocalReviews([local])),[local]);
for(const raw of [null,'broken','{}','null','[]','{"version":2,"reviews":[]}']) assert.deepEqual(readLocalReviews(raw),[]);
assert.equal(readLocalReviews(JSON.stringify({version:1,reviews:[{...local,source:'demo'},{...local},{...local,id:'bad-id'}, {...local,id:'local-invalid',rating:6}]})).length,1);
assert.equal(readLocalReviews(JSON.stringify({version:1,reviews:[{...local,source:'verified'}]}))[0].source,'local');
const scriptContent='<script>alert("plain text")</script>';
assert.equal(readLocalReviews(writeLocalReviews([{...local,content:scriptContent}]))[0].content,scriptContent);
assert.equal(demoReviews.length,8);
demoReviews.forEach((review)=>{assert.equal(review.source,'demo');assert.ok(validateReview(review).valid);});
assert.equal(REVIEW_INTERVAL_MS,4000); assert.equal(REVIEW_TRANSITION_MS,600); assert.equal(REVIEW_CLONES,3);
const count=8;
const originals=Array.from({length:count},(_,i)=>i);
const track=[...originals.slice(-3),...originals,...originals.slice(0,3)];
for(const visible of [1,2,3]) {
  let state=initial;
  for(let i=0;i<80;i++) {
    state=reduce(state,{type:'move',step:1,count,reduced:false});
    const painted=track.slice(state.position,state.position+visible);
    assert.equal(painted.length,visible);
    assert.deepEqual(painted,Array.from({length:visible},(_,offset)=>(state.active+offset)%count));
    assert.equal(reduce(state,{type:'move',step:1,count,reduced:false}),state);
    state=reduce(state,{type:'settle',count});
    assert.deepEqual(track.slice(state.position,state.position+visible),painted);
  }
  state=reduce(initial,{type:'move',step:-1,count,reduced:false});
  const before=track.slice(state.position,state.position+visible);
  state=reduce(state,{type:'settle',count});
  assert.deepEqual(track.slice(state.position,state.position+visible),before);
}
let state=reduce(initial,{type:'move',target:4,count,reduced:true});
assert.equal(state.position,7); assert.equal(state.animate,false); assert.equal(state.moving,false);
assert.equal(reduce(state,{type:'move',target:99,count,reduced:false}),state);
state=reduce(state,{type:'reset',target:8,count:9});
assert.equal(state.position,11); assert.equal(state.active,8);
console.log('Reviews checks passed: Unicode/name/rating/content validation, safe versioned local storage and source labels, 8 demo records, 4s timing, 1/2/3-card forward/reverse loop windows, rapid input guard, resize/add reset, and reduced-motion navigation.');
