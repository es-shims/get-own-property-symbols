get-own-property-symbols
========================

[![build status](https://secure.travis-ci.org/WebReflection/get-own-property-symbols.svg)](http://travis-ci.org/WebReflection/get-own-property-symbols)

This is a widely compatible, Mobile friendly, and zero dependencies polyfill for `Object.getOwnPropertySymbols`.
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

Common symbols like `iterator` are also defined including the `Array.prototype[Symbol.iterator]`
and the `String.prototype[Symbol.iterator]` method.
```js
// this is the equivalent of a for/of in ES6
var iterator = [1,2,3][Symbol.iterator]();
var result;
while (!(result = iterator.next()).done) {
  console.log(result.value); // 1 then 2 and then 3
}


// this is the equivalent of a for/of in ES6
var iterator = '😺😲'[Symbol.iterator]();
var result;
while (!(result = iterator.next()).done) {
  console.log(result.value); // '😺' first and '😲' after
}

```

It is also possible to simply copy same iterator for any other iterable collection.


#### Caveat
This polyfill _will not work with `null` objects_, and even if [it's possible to make it work](https://gist.github.com/WebReflection/56d04ccb1e5b0e50c121#comment-1426442) it's not worth the hassle.
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
There are alternatives to this polyfill [Symbol only](https://github.com/medikoo/es6-symbol#es6-symbol) and the main difference is that whit `get-own-property-symbols` you actually have `Object.getOwnPropertySymbols` functionality and `Object.getOwnPropertyNames` will never show Symbols too.

Also today [core-js](https://github.com/zloirock/core-js) brings Symbols in but be aware those will break with Android 2 and will fail with null objects.

Accordingly, if you are looking for a more consistent approach with ES6 specifications, use this module, otherwise feel free to go for the `Symbol` only.


#### Compatibility

##### Mobile

  * Android 2.x and higher ( Android 2 requires code minification if `Symbol.for` is used, or `Symbol['for']` instead )
  * iOS5 and higher
  * Windows Phone 7 (IE9 Mobile) and higher
  * Blackberry OS7 and higher
  * FirefoxOS 1.0 and higher
  * Opera Mini and Opera Mobile
  * Ubuntu Phone, Kindle Fire, and all others based on Webkit or Chrome
  * yes, even Palm WebOS 2 works


##### Desktop

  * IE9 and higher
  * Chrome and Opera
  * Firefox
  * Safari


##### Server

  * node js 0.6 and higher (as tested via travis)
  * io.js has native support, so it works there too
  * Duktape and Nashorn should be fine too (please let me know if not)


You can also check if your browser or device is compatible [through this page](http://webreflection.github.io/get-own-property-symbols/test/).