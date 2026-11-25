import assert from 'node:assert/strict';
import fs from 'node:fs';
const css = fs.readFileSync('src/app/globals.css', 'utf8');

// Assert default (mobile) rules
assert.match(css, /\.offer-arrow\s*\{[^}]*display:\s*none;/);
assert.match(css, /\.review-arrow\s*\{[^}]*display:\s*none;/);
assert.match(css, /\.review-controls\s*\{[^}]*display:\s*flex;/);

// Assert desktop (>= 640px) rules
assert.match(css, /@media\s*\(min-width:\s*640px\)[\s\S]+?\.offer-arrow\s*\{[^}]*display:\s*inline-flex;/);
assert.match(css, /@media\s*\(min-width:\s*640px\)[\s\S]+?\.review-controls\s*\{[^}]*display:\s*grid;/);
assert.match(css, /@media\s*\(min-width:\s*640px\)[\s\S]+?\.review-arrow\s*\{[^}]*display:\s*flex;/);

console.log("All CSS responsive rules for offer and review arrows verified successfully!");
