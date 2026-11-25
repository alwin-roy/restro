import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

function load(filename) {
  const compiled = {exports:{}};
  const code = ts.transpileModule(fs.readFileSync(filename,'utf8'), {compilerOptions:{target:ts.ScriptTarget.ES2017,module:ts.ModuleKind.CommonJS}}).outputText;
  new Function('exports','module',code)(compiled.exports,compiled);
  return compiled.exports;
}
const {promotionalOffers:offers}=load('src/data/offers.ts');
const {carouselReducer:reduce,initialCarouselState:initial,OFFER_INTERVAL_MS,OFFER_TRANSITION_MS,remainingOfferTime}=load('src/lib/offers-carousel.ts');
assert.equal(offers.length,5);
assert.equal(new Set(offers.map(o=>o.id)).size,5);
assert.equal(OFFER_INTERVAL_MS,3000);
assert.equal(OFFER_TRANSITION_MS,600);
const categorySlugs=new Set(['burgers','shawarmas','mandi','desserts','drinks']);
for(const offer of offers){
  assert.equal(offer.status,'verified');
  assert.equal(offer.expiresAt,undefined);
  assert.equal(offer.pricePaise,undefined);
  assert.ok(categorySlugs.has(offer.ctaHref.replace('/menu/','')));
  assert.ok(fs.existsSync(path.join('public',offer.image)));
  assert.ok(offer.title && offer.highlightText && offer.imageAlt);
}
let state=initial;
for(let cycle=0;cycle<10;cycle++){
  for(let active=1;active<=5;active++){
    const before=state.position;
    state=reduce(state,{type:'move',step:1,count:5,reduced:false});
    assert.equal(state.position,before+1,'one full-width forward movement');
    assert.equal(state.active,active%5);
    assert.equal(reduce(state,{type:'move',step:1,count:5,reduced:false}),state,'rapid repeated input cannot skip a transition');
    const paintedOffer=(state.position-1+5)%5;
    state=reduce(state,{type:'settle',count:5});
    assert.equal((state.position-1+5)%5,paintedOffer,'boundary reset paints identical offer');
    assert.equal(state.moving,false);
  }
  assert.equal(state.position,1);
}
state=reduce(initial,{type:'move',step:-1,count:5,reduced:false});
assert.equal(state.position,0); assert.equal(state.active,4);
state=reduce(state,{type:'settle',count:5});
assert.equal(state.position,5); assert.equal(state.animate,false);
state=reduce(state,{type:'move',target:2,count:5,reduced:true});
assert.equal(state.position,3); assert.equal(state.moving,false); assert.equal(state.animate,false);
assert.equal(reduce(state,{type:'move',target:99,count:5,reduced:false}),state);
const deadline='2030-01-01T00:00:00Z';
assert.equal(remainingOfferTime(deadline,Date.parse(deadline)-90061000),'1d 1h 1m 1s remaining');
assert.equal(remainingOfferTime(deadline,Date.parse(deadline)),'Offer ended');
assert.equal(remainingOfferTime('invalid',0),null);
console.log('Offers checks passed: 5 demo slides, valid local assets/routes, 3s interval, forward/reverse seamless boundary resets, rapid-input guard, reduced-motion navigation, and fixed-deadline countdown.');
