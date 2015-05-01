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
    setDescriptor,
    G = typeof global === typeof G ? window : global,
    id = 0,
    random = '' + Math.random(),
    prefix = '__\x01symbol:',
    prefixLength = prefix.length,
    internalSymbol = '__\x01symbol@@' + random,
    DP = 'defineProperty',
    DPies = 'defineProperties',
    GOPN = 'getOwnPropertyNames',
    GOPD = 'getOwnPropertyDescriptor',
    PIE = 'propertyIsEnumerable',
    gOPN = Object[GOPN],
    gOPD = Object[GOPD],
    create = Object.create,
    keys = Object.keys,
    defineProperty = Object[DP],
    defineProperties = Object[DPies],
    descriptor = gOPD(Object, GOPN),
    ObjectProto = Object.prototype,
    hOP = ObjectProto.hasOwnProperty,
    pIE = ObjectProto[PIE],
    indexOf = Array.prototype.indexOf || function (v) {
      for (var i = this.length; i-- && this[i] !== v;) {}
      return i;
    },
    addInternalIfNeeded = function (o, uid, enumerable) {
      if (!hOP.call(o, internalSymbol)) {
        defineProperty(o, internalSymbol, {
          enumerable: false,
          configurable: false,
          writable: false,
          value: {}
        });
      }
      o[internalSymbol]['@@' + uid] = enumerable;
    },
    copyAsNonEnumerable = function (descriptor) {
      var newDescriptor = create(descriptor);
      newDescriptor.enumerable = false;
      return newDescriptor;
    },
    get = function get(){},
    onlyNonSymbols = function (name) {
      return  name !== internalSymbol &&
              name.slice(0, prefixLength) !== prefix;
    },
    onlySymbols = function (name) {
      return  name !== internalSymbol &&
              name.slice(0, prefixLength) === prefix;
    },
    setAndGetSymbol = function (uid) {
      var descriptor = {
        enumerable: false,
        configurable: true,
        get: get,
        set: function (value) {
          setDescriptor(this, uid, {
            enumerable: false,
            configurable: true,
            writable: true,
            value: value
          });
          addInternalIfNeeded(this, uid, true);
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
    },
    $defineProperty = function defineProp(o, key, descriptor) {
      var uid = '' + key;
      if (onlySymbols(uid)) {
        setDescriptor(o, uid, descriptor.enumerable ?
            copyAsNonEnumerable(descriptor) : descriptor);
        addInternalIfNeeded(o, uid, !!descriptor.enumerable);
      } else {
        defineProperty(o, key, descriptor);
      }
      return o;
    },
    $getOwnPropertySymbols = function getOwnPropertySymbols(o) {
      return gOPN(o).filter(onlySymbols);
    }
  ;

  descriptor.value = $defineProperty;
  defineProperty(Object, DP, descriptor);

  descriptor.value = $getOwnPropertySymbols;
  defineProperty(Object, GOPS, descriptor);

  descriptor.value = function getOwnPropertyNames(o) {
    return gOPN(o).filter(onlyNonSymbols);
  };
  defineProperty(Object, GOPN, descriptor);

  descriptor.value = function defineProperties(o, descriptors) {
    var symbols = $getOwnPropertySymbols(descriptors);
    if (symbols.length) {
      keys(descriptors).concat(symbols).forEach(function (uid) {
        if (descriptors.propertyIsEnumerable(uid)) {
          $defineProperty(o, uid, descriptors[uid]);
        }
      });
    } else {
      defineProperties(o, descriptors);
    }
    return o;
  };
  defineProperty(Object, DPies, descriptor);

  descriptor.value = function propertyIsEnumerable(key) {
    var uid = '' + key;
    return onlySymbols(uid) ? (
      hOP.call(this, uid) &&
      this[internalSymbol]['@@' + uid]
    ) : pIE.call(this, key);
  };
  defineProperty(ObjectProto, PIE, descriptor);

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
      -1 < indexOf.call(gOPN(ObjectProto), symbol)
    ) ?
      symbol.slice(prefixLength * 2, -random.length) :
      void 0
    ;
  };
  defineProperty(Symbol, 'keyFor', descriptor);

  try { // fails in few pre ES 5.1 engines
    setDescriptor = create(
      defineProperty(
        {},
        prefix,
        {
          get: function () {
            return defineProperty(this, prefix, {value: false})[prefix];
          }
        }
      )
    )[prefix] || defineProperty;
  } catch(o_O) {
    setDescriptor = function (o, key, descriptor) {
      var protoDescriptor = gOPD(ObjectProto, key);
      delete ObjectProto[key];
      defineProperty(o, key, descriptor);
      defineProperty(ObjectProto, key, protoDescriptor);
    };
  }

  [
    'iterator',           // A method returning the default iterator for an object. Used by for...of.
    'match',              // A method that matches against a string, also used to determine if an object may be used as a regular expression. Used by String.prototype.match().
    'replace',            // A method that replaces matched substrings of a string. Used by String.prototype.replace().
    'search',             // A method that returns the index within a string that matches the regular expression. Used by String.prototype.search().
    'split',              // A method that splits a string at the indices that match a regular expression. Used by String.prototype.split().
    'hasInstance',        // A method determining if a constructor object recognizes an object as its instance. Used by instanceof.
    'isConcatSpreadable', // A Boolean value indicating if an object should be flattened to its array elements. Used by Array.prototype.concat().
    'unscopables',        // An Array of string values that are property values. These are excluded from the with environment bindings of the associated objects.
    'species',            // A constructor function that is used to create derived objects.
    'toPrimitive',        // A method converting an object to a primitive value.
    'toStringTag'         // A string value used for the default description of an object. Used by Object.prototype.toString().
  ].forEach(function (name) {
    defineProperty(Symbol, name, {value: Symbol(name)});
  });

}(Object, 'getOwnPropertySymbols'));


(function (Array) {

  // make Arrays usable as iterators
  // so that other iterable can copy same logic
  if (!Array[Symbol.iterator]) Array[Symbol.iterator] = function () {
    var i = 0, self = this;
    return {
      next: function next() {
        var done = self.length <= i;
        return {done: done, value: done || self[i++]};
      }
    };
  };

}(Array.prototype));

module.exports = Object.getOwnPropertySymbols;