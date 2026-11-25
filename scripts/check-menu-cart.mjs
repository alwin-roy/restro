import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const cache = new Map();
function loadTs(filename) {
  const absolute = path.resolve(filename);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  const compiledModule = {exports:{}};
  cache.set(absolute,compiledModule);
  const fallback = createRequire(absolute);
  const requireTs = (specifier) => {
    if (specifier.startsWith('@/')) return loadTs(path.resolve('src',specifier.slice(2))+'.ts');
    if (specifier.startsWith('.')) return loadTs(path.resolve(path.dirname(absolute),specifier)+'.ts');
    return fallback(specifier);
  };
  const code = ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2017,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
  new Function('require','module','exports',code)(requireTs,compiledModule,compiledModule.exports);
  return compiledModule.exports;
}
const {menuItems,getCategory,getCategoryItems,getMenuItem}=loadTs('src/data/menu.ts');
const {foodCategories}=loadTs('src/data/foodCategories.ts');

const {formatPaise}=loadTs('src/lib/currency.ts');
assert.equal(menuItems.length,48);
assert.equal(new Set(menuItems.map(p=>p.id)).size,48);
const counts=[6,6,5,5,6,5,5,5,5];
foodCategories.forEach((category,i)=>{
  assert.equal(category.href,'/menu/'+category.id);
  assert.equal(getCategoryItems(category.id).length,counts[i]);
  assert.ok(getCategory(category.id));
});
for (const product of menuItems) {
  assert.ok(getMenuItem(product.id));
  assert.ok(Number.isSafeInteger(product.pricePaise)&&product.pricePaise>0);
  assert.ok(product.name&&product.description&&product.imageAlt);
  assert.ok(fs.existsSync(path.join('public',product.image)));
}
assert.equal(getCategory('unknown'),undefined);
assert.equal(getCategory('__proto__'),undefined);
assert.equal(getCategoryItems('unknown').length,0);
if (fs.existsSync('src/lib/cart.ts')) {
  const {initialCartState,cartReducer,getCartItems,getCartTotals,readCart,writeCart,MAX_CART_QUANTITY}=loadTs('src/lib/cart.ts');
let state=cartReducer(initialCartState,{type:'add',productId:menuItems[0].id});
assert.equal(state.lines.length,0,'Do not add before local cart is restored');
state=cartReducer(state,{type:'restore',lines:[]});
state=cartReducer(state,{type:'add',productId:menuItems[0].id});
state=cartReducer(state,{type:'add',productId:menuItems[0].id});
assert.equal(state.lines.length,1);
assert.equal(state.lines[0].quantity,2,'Duplicate adds increase quantity');
assert.deepEqual(getCartTotals(getCartItems(state.lines)),{quantity:2,subtotalPaise:29800});
state=cartReducer(state,{type:'add',productId:menuItems[6].id});
assert.deepEqual(getCartTotals(getCartItems(state.lines)),{quantity:3,subtotalPaise:45700});
state=cartReducer(state,{type:'quantity',productId:menuItems[0].id,quantity:3});
assert.deepEqual(getCartTotals(getCartItems(state.lines)),{quantity:4,subtotalPaise:60600});
state=cartReducer(state,{type:'remove',productId:menuItems[6].id});
assert.deepEqual(getCartTotals(getCartItems(state.lines)),{quantity:3,subtotalPaise:44700});
assert.deepEqual(readCart(writeCart(state.lines)),state.lines,'Persistence round trip');
for (const raw of [null,'bad json','null','{}','{"version":2,"items":[]}','[]']) assert.deepEqual(readCart(raw),[]);
const restored=readCart(JSON.stringify({version:1,items:[{productId:menuItems[0].id,quantity:2,pricePaise:1,name:'Tampered'},{productId:'missing',quantity:2},{productId:menuItems[0].id,quantity:1},{productId:menuItems[1].id,quantity:-1},{productId:menuItems[2].id,quantity:1.5}]}));
assert.deepEqual(restored,[{productId:menuItems[0].id,quantity:3}]);
assert.equal(getCartItems(restored)[0].pricePaise,getMenuItem(menuItems[0].id).pricePaise,'Use canonical catalog prices');
assert.equal(getCartItems(restored)[0].name,menuItems[0].name);
assert.equal(readCart(JSON.stringify({version:1,items:[{productId:menuItems[0].id,quantity:100000}]}))[0].quantity,MAX_CART_QUANTITY);
assert.equal(cartReducer(state,{type:'quantity',productId:menuItems[0].id,quantity:1.5}),state);
assert.equal(cartReducer(state,{type:'add',productId:'missing'}),state);
assert.equal(cartReducer(state,{type:'storage-error'}).storageAvailable,false);
} else {
  assert.ok(!fs.readFileSync('src/features/home/components/navbar.tsx','utf8').includes('CartControl'));
  console.log('Cart tests skipped: cart was intentionally removed before this task.');
}
assert.ok(formatPaise(14900).includes('149'));
assert.ok(formatPaise(14950).includes('149.5'));
console.log('Menu checks passed: 9 category routes, 48 products, stable IDs, local images, valid integer paise prices and currency formatting.');
