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

}(Object, 'getOwnPropertySymbols'));