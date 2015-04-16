get-own-property-symbols
========================

[![build status](https://secure.travis-ci.org/WebReflection/get-own-property-symbols.png)](http://travis-ci.org/WebReflection/get-own-property-symbols)

This is a widely compatible, Mobile friendly, and zero dependencies partial polyfill for `Object.getOwnPropertySymbols`.
```js
var getOwnPropertySymbols = require('get-own-property-symbols');

var o = {};
var s = Symbol();

o[s] = 123;

Object.getOwnPropertyNames(o);  // []
getOwnPropertySymbols(o);       // [s]

// same as
Object.getOwnPropertySymbols(o);// [s]
```


This module brings in a global `Symbol` initializer too, together with `Symbol.for` and `Symbol.keyFor` methods.
```js
var s = Symbol.for('me');
Symbol.for('me') === s; // true

Symbol.keyFor(s); // 'me'
```

#### Caveat
This partial polyfill _will not work with `null` objects_, and even if [it's possible to make it work](https://gist.github.com/WebReflection/56d04ccb1e5b0e50c121#comment-1426442) it's not worth the hassle.
```js
var o = Object.create(null);
var s = Symbol();

o[s] = 123;

// not set as Symbol, just as generic key
Object.keys(o); // [s]
```

#### How to use
Either `npm install get-own-property-symbols` or include [this file](build/get-own-property-symbols.js) on your page.


#### More details
There are alternatives to partially polyfill [Symbol only](https://github.com/medikoo/es6-symbol#es6-symbol) and the main difference is that whit `get-own-property-symbols` you actually have `Object.getOwnPropertySymbols` functionality and `Object.getOwnPropertyNames` will never show Symbols too.

Accordingly, if you are looking for a more consistent approach with ES6 specifications, use this module, otherwise feel free to go for the `Symbol` only.

I will try to check with @medikoo if we could simply merge these two approaches and have a better sham "to rule them all".

#### Compatibility
You can check if your browser or device is compatible [through this page](http://webreflection.github.io/get-own-property-symbols/test/)