(function (Object, GOPS) {
  'use strict';

  // (C) Andrea Giammarchi - Mit Style

  if (GOPS in Object) { return; }

  /** @type {(this: ThisParameterType<typeof Object.defineProperty>, ...args: Parameters<typeof Object.defineProperty>) => void} */
  var setDescriptor;
  /** @type {global | window} */
  var G = typeof global === 'undefined' ? window : global;
  var id = 0;
  var random = String(Math.random());
  var prefix = '__\x01symbol:';
  var prefixLength = prefix.length;
  var internalSymbol = '__\x01symbol@@' + random;
  var gOPN = Object.getOwnPropertyNames;
  var gOPD = Object.getOwnPropertyDescriptor;
  var create = Object.create;
  var keys = Object.keys;
  var freeze = Object.freeze || Object;
  var defineProperty = Object.defineProperty;
  var $defineProperties = Object.defineProperties;
  // eslint-disable-next-line no-extra-parens
  var descriptor = /** @type {PropertyDescriptor} */ (gOPD(Object, 'getOwnPropertyDescriptor'));
  var ObjectProto = Object.prototype;
  var hOP = ObjectProto.hasOwnProperty;
  var pIE = ObjectProto.propertyIsEnumerable;
  var toString = ObjectProto.toString;
  /** @type {(o: { [k: string]: Record<`@@${string}`, boolean> }, uid: `@@${string}`, enumerable: boolean) => void} */
  var addInternalIfNeeded = function (o, uid, enumerable) {
    if (!hOP.call(o, internalSymbol)) {
      defineProperty(o, internalSymbol, {
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
      });
    }
    o[internalSymbol][/** @type {`@@${string}`} */ ('@@' + uid)] = enumerable; // eslint-disable-line no-param-reassign, no-extra-parens
  };
  /** @type {(proto: null | object, descriptors: { [k: string]: Record<`@@${string}`, boolean> }) => object} */
  var createWithSymbols = function (proto, descriptors) {
    var self = create(proto);
    gOPN(descriptors).forEach(function (key) {
      if (propertyIsEnumerable.call(descriptors, key)) {
        $defineProperty(self, key, descriptors[key]);
      }
    });
    return self;
  };
  /** @type {(descriptor: PropertyDescriptor) => PropertyDescriptor} */
  var copyAsNonEnumerable = function (descriptor) {
    var newDescriptor = create(descriptor);
    newDescriptor.enumerable = false;
    return newDescriptor;
  };
  var get = function get() {};
  var onlyNonSymbols = /** @type {(name: string | symbolish) => name is string} */ function (name) {
    // eslint-disable-next-line eqeqeq
    return name != internalSymbol && !hOP.call(source, name);
  };
  var onlySymbols = /** @type {(name: string | symbolish) => name is symbolish} */ function (name) {
    // eslint-disable-next-line eqeqeq
    return name != internalSymbol && hOP.call(source, name);
  };
  /** @type {(this: { [k: string | symbolish]: Record<`@@${string}`, boolean> }, key: string | symbolish) => boolean} */
  var propertyIsEnumerable = function propertyIsEnumerable(key) {
    var uid = String(key);
    // eslint-disable-next-line no-extra-parens
    return onlySymbols(uid) ? hOP.call(this, uid) && !!this[internalSymbol] && this[internalSymbol][/** @type {`@@${string}`} */ ('@@' + uid)] : pIE.call(this, key);
  };
  /** @type {(uid: `@@${string}`) => Readonly<symbolish>} */
  var setAndGetSymbol = function (uid) {
    /** @type {PropertyDescriptor} */
    var descriptor = {
      enumerable: false,
      configurable: true,
      get: get,
      set: /** @type {(this: { [k: string]: Record<`@@${string}`, boolean> }, value: unknown) => void} */ function (value) {
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
    source[uid] = defineProperty(
      Object(uid),
      'constructor',
      sourceConstructor
    );
    return freeze(source[uid]);
  };
    /**
     * @this {Symbol}
     * @param {string} description
     * @returns {Readonly<symbolish>}
     */
  var Symbol = function Symbol(description) {
    if (this instanceof Symbol) {
      throw new TypeError('Symbol is not a constructor');
    }
    // eslint-disable-next-line no-extra-parens
    return setAndGetSymbol(/** @type {Parameters<typeof setAndGetSymbol>[0]} */ (prefix + (description || '') + random + ++id));
  };
  /** @type {Record<`@@${string}`, symbolish>} */
  var source = create(null);
  var sourceConstructor = { value: Symbol };
  /** @type {(uid: `@@${string}`) => symbolish} */
  var sourceMap = function (uid) {
    return source[uid];
  };
    /** @type {typeof Object.defineProperty} */
  var $defineProperty = function defineProp(o, key, descriptor) {
    var uid = String(key);
    if (onlySymbols(uid)) {
      setDescriptor(o, uid, descriptor.enumerable ? copyAsNonEnumerable(descriptor) : descriptor);
      // eslint-disable-next-line no-extra-parens
      addInternalIfNeeded(/** @type {Parameters<addInternalIfNeeded>[0]} */ (o), uid, !!descriptor.enumerable);
    } else {
      defineProperty(o, key, descriptor);
    }
    return o;
  };

  /** @type {typeof Object.getOwnPropertySymbols} */
  var $getOwnPropertySymbols = function getOwnPropertySymbols(o) {
    // eslint-disable-next-line no-extra-parens
    return gOPN(o).filter(onlySymbols).map(/** @type {(uid: string) => symbolish} */ (sourceMap));
  };
  descriptor.value = $defineProperty;
  defineProperty(Object, 'defineProperty', descriptor);

  descriptor.value = $getOwnPropertySymbols;
  defineProperty(Object, GOPS, descriptor);

  /** @type {typeof Object.getOwnPropertyNames} */
  descriptor.value = function getOwnPropertyNames(o) {
    return gOPN(o).filter(onlyNonSymbols);
  };
  defineProperty(Object, 'getOwnPropertyDescriptor', descriptor);

  /** @type {typeof Object.defineProperties} */
  descriptor.value = function defineProperties(o, descriptors) {
    // eslint-disable-next-line no-extra-parens
    var symbols = /** @type {symbolish[]} */ ($getOwnPropertySymbols(descriptors));
    if (symbols.length) {
      /** @type {(string | symbolish)[]} */
      var items = [].concat(
        // @ts-expect-error TS sucks with concat
        keys(descriptors),
        symbols
      );
      items.forEach(function (uid) {
        if (propertyIsEnumerable.call(
          // eslint-disable-next-line no-extra-parens
          /** @type {ThisParameterType<typeof propertyIsEnumerable>} */ (descriptors),
          uid
        )) {
          $defineProperty(o, uid, descriptors[uid]);
        }
      });
    } else {
      $defineProperties(o, descriptors);
    }
    return o;
  };
  defineProperty(Object, 'defineProperties', descriptor);

  descriptor.value = propertyIsEnumerable;
  defineProperty(ObjectProto, 'propertyIsEnumerable', descriptor);

  descriptor.value = Symbol;
  defineProperty(G, 'Symbol', descriptor);

  /** @type {(key: string) => Readonly<symbolish>} */
  // defining `Symbol.for(key)`
  descriptor.value = function (key) {
    // eslint-disable-next-line no-extra-parens
    var uid = /** @type {Parameters<typeof setAndGetSymbol>[0]} */ (prefix + prefix + key + random);
    return uid in ObjectProto ? source[uid] : setAndGetSymbol(uid);
  };
  defineProperty(Symbol, 'for', descriptor);

  /** @type {(symbol: symbolish) => string | undefined} */
  // defining `Symbol.keyFor(symbol)`
  descriptor.value = function (symbol) {
    if (onlyNonSymbols(symbol)) { throw new TypeError(symbol + ' is not a symbol'); }
    if (!hOP.call(source, symbol)) {
      return void 0;
    }
    var label = symbol.slice(prefixLength);
    if (label.slice(0, prefixLength) !== prefix) {
      return void 0;
    }
    label = label.slice(prefixLength);
    if (label === random) {
      return void 0;
    }
    label = label.slice(0, label.length - random.length);
    return label.length > 0 ? label : void 0;
  };
  defineProperty(Symbol, 'keyFor', descriptor);

  /** @type {(o: { [k: string | symbolish]: Record<`@@${string}`, boolean> }, key: string | symbolish) => PropertyDescriptor | undefined} */
  descriptor.value = function getOwnPropertyDescriptor(o, key) {
    var descriptor = gOPD(o, key);
    if (descriptor && onlySymbols(key)) {
      descriptor.enumerable = propertyIsEnumerable.call(o, key);
    }
    return descriptor;
  };
  defineProperty(Object, 'getOwnPropertyDescriptor', descriptor);

  // eslint-disable-next-line no-extra-parens
  descriptor.value = /** @type {typeof Object.create} */ (function (proto, descriptors) {
    return arguments.length === 1 || typeof descriptors === 'undefined'
      ? create(proto)
      // eslint-disable-next-line no-extra-parens
      : createWithSymbols(proto, /** @type {Parameters<typeof createWithSymbols>[1]} */ (descriptors));
  });
  defineProperty(Object, 'create', descriptor);

  /** @type {(this: string | symbolish) => string} */
  descriptor.value = function () {
    var str = toString.call(this);
    return str === '[object String]' && onlySymbols(this) ? '[object Symbol]' : str;
  };
  defineProperty(ObjectProto, 'toString', descriptor);

  try { // fails in few pre ES 5.1 engines
    if (
      create(defineProperty({}, prefix, {
        get: function () {
          return defineProperty(this, prefix, { value: true })[prefix];
        }
      }))[prefix] === true
    ) {
      setDescriptor = defineProperty;
    } else {
      throw 'IE11'; // eslint-disable-line no-throw-literal
    }
  } catch (o_O) { // eslint-disable-line camelcase
    setDescriptor = function (o, key, descriptor) {
      var protoDescriptor = gOPD(ObjectProto, key);
      // eslint-disable-next-line no-extra-parens
      delete ObjectProto[/** @type {keyof typeof Object.prototype} */ (key)];
      defineProperty(o, key, descriptor);
      // eslint-disable-next-line no-extra-parens
      defineProperty(ObjectProto, key, /** @type {NonNullable<typeof protoDescriptor>} */ (protoDescriptor));
    };
  }

}(Object, 'getOwnPropertySymbols'));

(function (O, Symbol) {
  'use strict';

  var dP = O.defineProperty;
  var ObjectProto = O.prototype;
  var toString = ObjectProto.toString;
  [
    'iterator', // A method returning the default iterator for an object. Used by for...of.
    'match', // A method that matches against a string, also used to determine if an object may be used as a regular expression. Used by String.prototype.match().
    'replace', // A method that replaces matched substrings of a string. Used by String.prototype.replace().
    'search', // A method that returns the index within a string that matches the regular expression. Used by String.prototype.search().
    'split', // A method that splits a string at the indices that match a regular expression. Used by String.prototype.split().
    'hasInstance', // A method determining if a constructor object recognizes an object as its instance. Used by instanceof.
    'isConcatSpreadable', // A Boolean value indicating if an object should be flattened to its array elements. Used by Array.prototype.concat().
    'unscopables', // An Array of string values that are property values. These are excluded from the with environment bindings of the associated objects.
    'species', // A constructor function that is used to create derived objects.
    'toPrimitive', // A method converting an object to a primitive value.
    'toStringTag' // A string value used for the default description of an object. Used by Object.prototype.toString().
  ].forEach(function (name) {
    if (!(name in Symbol)) {
      dP(Symbol, name, { value: Symbol(name) });
      if (name === 'toStringTag') {
        // eslint-disable-next-line no-extra-parens
        var descriptor = /** @type {PropertyDescriptor} */ (O.getOwnPropertyDescriptor(ObjectProto, 'toString'));
        descriptor.value = /** @type {(this: null | { [Symbol.toStringTag]?: unknown }) => string} */ function () {
          var str = toString.call(this);
          var tst = this == null ? this : this[Symbol.toStringTag];
          return tst == null ? str : '[object ' + tst + ']';
        };
        dP(ObjectProto, 'toString', descriptor);
      }
    }
  });
}(Object, Symbol));

(/** @type {(Si: symbolish, AP: unknown[] & Record<symbolish, unknown>, SP: String & Record<symbolish, unknown>) => void} */ function (Si, AP, SP) {

  /** @type {<T>(this: T) => T} */
  function returnThis() { return this; }

  /*
   * make Arrays usable as iterators
   * so that other iterables can copy same logic
   */
  if (!AP[Si]) {
    // eslint-disable-next-line no-param-reassign
    AP[Si] = function () {
      var i = 0;

      var self = this;
      /** @type {{ next(): { done: boolean, value?: unknown } } & { [k in symbol]?: unknown }} */
      var iterator = {
        next: function next() {
          var done = self.length <= i;
          return done ? { done: done } : { done: done, value: self[i++] };
        }
      };
      iterator[Si] = returnThis;
      return iterator;
    };
  }

  /*
   * make Strings usable as iterators
   * to simplify Array.from and for/of like loops
   */
  if (!SP[Si]) {
    // eslint-disable-next-line no-param-reassign
    SP[Si] = function () {
      var fromCodePoint = String.fromCodePoint;
      var self = this;
      var i = 0;
      var length = self.length;
      /** @type {{ next(): { done: boolean, value?: string } } & { [k in symbol]?: unknown }} */
      var iterator = {
        next: function next() {
          var done = length <= i;
          // eslint-disable-next-line no-extra-parens
          var c = done ? '' : fromCodePoint(/** @type {number} */ (self.codePointAt(i)));
          i += c.length;
          return done ? { done: done } : { done: done, value: c };
        }
      };
      iterator[Si] = returnThis;
      return iterator;
    };
  }

}(
  // eslint-disable-next-line no-extra-parens
  /** @type {symbolish} */ (Symbol.iterator),
  // eslint-disable-next-line no-extra-parens
  /** @type {unknown[] & Record<symbolish, unknown>} */ (Array.prototype),
  // eslint-disable-next-line no-extra-parens
  /** @type {String & Record<symbolish, unknown>} */ (String.prototype)
));

/** @typedef {import('../').symbolish} symbolish */
