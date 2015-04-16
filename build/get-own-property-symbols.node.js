/*!
Copyright (C) 2015 by WebReflection

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
(function (Object, GOPS) {'use strict';

  // (C) Andrea Giammarchi - Mit Style

  if (GOPS in Object) return;

  var
    hasConfigurableBug,
    G = typeof global === typeof G ? window : global,
    id = 0,
    random = '' + Math.random(),
    prefix = '__\x01symbol:',
    prefixLength = prefix.length,
    GOPN = 'getOwnPropertyNames',
    gOPN = Object[GOPN],
    ObjectProto = Object.prototype,
    defineProperty = Object.defineProperty,
    descriptor = Object.getOwnPropertyDescriptor(Object, GOPN),
    get = function get(){},
    onlyNonSymbols = function (name) {
      return name.slice(0, prefixLength) !== prefix;
    },
    onlySymbols = function (name) {
      return name.slice(0, prefixLength) === prefix;
    },
    setAndGetSymbol = function (uid) {
      var descriptor = {
        enumerable: false,
        configurable: true,
        get: get,
        set: function (value) {
          if (hasConfigurableBug) {
            delete ObjectProto[uid];
          }
          defineProperty(this, uid, {
            enumerable: false,
            configurable: true,
            writable: true,
            value: value
          });
          if (hasConfigurableBug) {
            defineProperty(ObjectProto, uid, descriptor);
          }
        }
      };
      defineProperty(ObjectProto, uid, descriptor);
      return uid;
    },
    Symbol = function Symbol(description) {
      if (this && this !== G) {
        throw new TypeError('Symbol is not a constructor');
      }
      return setAndGetSymbol(
        prefix.concat(description || '', random, ++id)
      );
    }
  ;

  descriptor.value = function getOwnPropertyNames(o) {
    return gOPN(o).filter(onlyNonSymbols);
  };
  defineProperty(Object, GOPN, descriptor);

  descriptor.value = function getOwnPropertySymbols(o) {
    return gOPN(o).filter(onlySymbols);
  };
  defineProperty(Object, GOPS, descriptor);

  descriptor.value = Symbol;
  defineProperty(G, 'Symbol', descriptor);

  // defining `Symbol.for(key)`
  descriptor.value = function (key) {
    var uid = prefix.concat(prefix, key, random);
    return uid in ObjectProto ? uid : setAndGetSymbol(uid);
  };
  defineProperty(Symbol, 'for', descriptor);

  // defining `Symbol.keyFor(symbol)`
  descriptor.value = function (symbol) {
    return (
      (prefix + prefix) === symbol.slice(0, prefixLength * 2) &&
      -1 < gOPN(ObjectProto).indexOf(symbol)
    ) ?
      symbol.slice(prefixLength * 2, -random.length) :
      void 0
    ;
  };
  defineProperty(Symbol, 'keyFor', descriptor);

  try { // fails in few pre ES 5.1 engines
    hasConfigurableBug = Object.create(
      defineProperty(
        {},
        prefix,
        {
          get: function () {
            return defineProperty(this, prefix, {value: false})[prefix];
          }
        }
      )
    )[prefix];
  } catch(o_O) {
    hasConfigurableBug = true;
  }

}(Object, 'getOwnPropertySymbols'));
module.exports = Object.getOwnPropertySymbols;