//remove:
require('../build/get-own-property-symbols.node.js');
//:remove

/*! https://mths.be/fromcodepoint v0.2.1 by @mathias */
if (!String.fromCodePoint) {
  (function() {
    var defineProperty = (function() {
      // IE 8 only supports `Object.defineProperty` on DOM elements
      try {
        var object = {};
        var $defineProperty = Object.defineProperty;
        var result = $defineProperty(object, object, object) && $defineProperty;
      } catch(error) {}
      return result;
    }());
    var stringFromCharCode = String.fromCharCode;
    var floor = Math.floor;
    var fromCodePoint = function(_) {
      var MAX_SIZE = 0x4000;
      var codeUnits = [];
      var highSurrogate;
      var lowSurrogate;
      var index = -1;
      var length = arguments.length;
      if (!length) {
        return '';
      }
      var result = '';
      while (++index < length) {
        var codePoint = Number(arguments[index]);
        if (
          !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
          codePoint < 0 || // not a valid Unicode code point
          codePoint > 0x10FFFF || // not a valid Unicode code point
          floor(codePoint) != codePoint // not an integer
        ) {
          throw RangeError('Invalid code point: ' + codePoint);
        }
        if (codePoint <= 0xFFFF) { // BMP code point
          codeUnits.push(codePoint);
        } else { // Astral code point; split in surrogate halves
          // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
          codePoint -= 0x10000;
          highSurrogate = (codePoint >> 10) + 0xD800;
          lowSurrogate = (codePoint % 0x400) + 0xDC00;
          codeUnits.push(highSurrogate, lowSurrogate);
        }
        if (index + 1 == length || codeUnits.length > MAX_SIZE) {
          result += stringFromCharCode.apply(null, codeUnits);
          codeUnits.length = 0;
        }
      }
      return result;
    };
    if (defineProperty) {
      defineProperty(String, 'fromCodePoint', {
        'value': fromCodePoint,
        'configurable': true,
        'writable': true
      });
    } else {
      String.fromCodePoint = fromCodePoint;
    }
  }());
}

/*! https://mths.be/codepointat v0.2.0 by @mathias */
if (!String.prototype.codePointAt) {
  (function() {
    'use strict'; // needed to support `apply`/`call` with `undefined`/`null`
    var defineProperty = (function() {
      // IE 8 only supports `Object.defineProperty` on DOM elements
      try {
        var object = {};
        var $defineProperty = Object.defineProperty;
        var result = $defineProperty(object, object, object) && $defineProperty;
      } catch(error) {}
      return result;
    }());
    var codePointAt = function(position) {
      if (this == null) {
        throw TypeError();
      }
      var string = String(this);
      var size = string.length;
      // `ToInteger`
      var index = position ? Number(position) : 0;
      if (index != index) { // better `isNaN`
        index = 0;
      }
      // Account for out-of-bounds indices:
      if (index < 0 || index >= size) {
        return undefined;
      }
      // Get the first code unit
      var first = string.charCodeAt(index);
      var second;
      if ( // check if it’s the start of a surrogate pair
        first >= 0xD800 && first <= 0xDBFF && // high surrogate
        size > index + 1 // there is a next code unit
      ) {
        second = string.charCodeAt(index + 1);
        if (second >= 0xDC00 && second <= 0xDFFF) { // low surrogate
          // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
          return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
        }
      }
      return first;
    };
    if (defineProperty) {
      defineProperty(String.prototype, 'codePointAt', {
        'value': codePointAt,
        enumerable: false,
        'configurable': true,
        'writable': true
      });
    } else {
      String.prototype.codePointAt = codePointAt;
    }
  }());
}


wru.test([
  {
    name: 'main',
    test: function () {
      wru.assert(typeof Object.getOwnPropertySymbols == 'function');
      wru.assert(typeof Symbol == 'function');
    }
  }, {
    name: 'basics work',
    test: function () {
      var o = {};
      var s = Symbol();
      o[s] = 123;
      wru.assert('no visible keys', Object.keys(o).join('') === '');
      wru.assert('still reachable value', o[s] === 123);
      for (var key in o) {
        throw new Error('this should not happen');
      }
      wru.assert('can be retrieved', Object.getOwnPropertySymbols(o)[0] === s);
      delete o[s];
      wru.assert('can be removed', Object.getOwnPropertySymbols(o).length === 0);
      o[s] = 456;
      wru.assert('can be added back', o[s] === 456);
    }
  }, {
    name: 'cannot use Symbol as constructor',
    test: function () {
      try {
        new Symbol;
        wru.assert(false);
      } catch(e) {
        wru.assert('OK, it threw an error');
      }
    }
  }, {
    name: 'Symbol name',
    test: function () {
      var s1 = Symbol();
      var s2 = Symbol('test2');
      wru.assert('it is possible to name one', -1 < s2.valueOf().toString().indexOf('test2'));

    }
  }, {
    name: 'Symbol methods',
    test: function () {
      var label = 'random' + Math.random();
      var s = Symbol['for'](label);
      wru.assert('labeled Symbols are the same', s === Symbol['for'](label));
      wru.assert('labels can be retrieved back', Symbol.keyFor(s) === label);
    }
  }, {
    name: 'propertyIsEnumerable',
    test: function () {
      var o = {};
      var s = Symbol();
      o[s] = 123;
      for (var k in o) throw new Error('should not show up in a for/in');
      if (Object.keys(o).length) throw new Error('should not show up in Object.keys');
      wru.assert('property is enumerable', o.propertyIsEnumerable(s));
    }
  }, {
    name: 'define Symbol property as enumerable',
    test: function () {
      var o = {};
      var s = Symbol();
      Object.defineProperty(o, s, {enumerable: true, value: 456});
      for (var k in o) throw new Error('should not show up in a for/in');
      if (Object.keys(o).length) throw new Error('should not show up in Object.keys');
      wru.assert('property is enumerable', o.propertyIsEnumerable(s));
    }
  }, {
    name: 'define Symbol property as non enumerable',
    test: function () {
      var o = {};
      var s = Symbol();
      Object.defineProperty(o, s, {enumerable: false, value: 456});
      for (var k in o) throw new Error('should not show up in a for/in');
      if (Object.keys(o).length) throw new Error('should not show up in Object.keys');
      wru.assert('property is NOT enumerable', !o.propertyIsEnumerable(s));
    }
  }, {
    name: 'defineProperties',
    test: function () {
      var o = {};
      var descriptors = {};
      var sEnumerable = Symbol();
      var sNotEnumerable = Symbol();
      descriptors[sEnumerable] = {
        enumerable: true,
        value: 'enumerable'
      };
      descriptors[sNotEnumerable] = {
        value: 'non-enumerable'
      };
      Object.defineProperties(o, descriptors);
      for (var k in o) throw new Error('should not show up in a for/in');
      if (Object.keys(o).length) throw new Error('should not show up in Object.keys');
      wru.assert('property is enumerable', o.propertyIsEnumerable(sEnumerable));
      wru.assert('property is NOT enumerable', !o.propertyIsEnumerable(sNotEnumerable));
      wru.assert('enumerable property is the right one', o[sEnumerable] === 'enumerable');
      wru.assert('non enumerable property is the right one', o[sNotEnumerable] === 'non-enumerable');
    }
  }, {
    name: 'defineProperties with non enumerable properties',
    test: function () {
      var o = {};
      var s = Symbol();
      var descriptors = Object.defineProperty({}, s, {enumerable: false, value: 'would throw'});
      Object.defineProperties(o, descriptors);
      wru.assert('should not have been assigned', o[s] === undefined);
    }
  }, {
    name: 'Array.prototype[Symbol.iterator]',
    test: function () {
      var iterator = [1,2,3][Symbol.iterator]();
      var list = [];
      var result;
      while (!(result = iterator.next()).done) {
        list.push(result.value);
      }
      wru.assert('Array is iterable', list.join(',') === '1,2,3');
      for (var k in []) throw new Error('there should be no iterator here');
    }
  }, {
    name: 'String.prototype[Symbol.iterator]',
    test: function () {
      var iterator = '😺😲'[Symbol.iterator]();
      var list = [];
      var result;
      while (!(result = iterator.next()).done) {
        list.push(result.value);
      }
      wru.assert('String is iterable', list.join(',') === '😺,😲');
      for (var k in '') throw new Error(k + ' <= there should be no iterator here');
    }
  }, {
    name: 'getOwnPropertyDescriptor',
    test: function () {
      var s = Symbol('gOPD');
      var a = {};
      var b = {};
      a[s] = true;
      Object.defineProperty(b, s, {value: false});
      wru.assert('a has it enumerable', a.propertyIsEnumerable(s));
      wru.assert('b has NOT it enumerable', !b.propertyIsEnumerable(s));
      wru.assert('a has descriptor enumerable', Object.getOwnPropertyDescriptor(a, s).enumerable);
      wru.assert('b has NOT descriptor enumerable', !Object.getOwnPropertyDescriptor(b, s).enumerable);
    }
  }, {
    name: 'Object.create(proto, symbols)',
    test: function () {
      var s = Symbol('Object.create');
      var a = {};
      var descriptors = {test: {value: 'value'}};
      descriptors[s] = {value: 'symbol'};
      var b = Object.create(a, descriptors);
      wru.assert('create works', a.isPrototypeOf(b));
      wru.assert('descriptors work', b.hasOwnProperty('test'));
      wru.assert('descriptors symbols work', b.hasOwnProperty(s));
      wru.assert('for real', b[s] === 'symbol');
    }
  }, {
    name: 'typeof is not string',
    test: function () {
      wru.assert(typeof Symbol('typeof') !== 'string');
    }
  }, {
    name: 'instanceof is not Symbol',
    test: function () {
      wru.assert(!(Symbol('instanceof') instanceof Symbol));
    }
  }, {
    name: 'Symbol().constructor',
    test: function () {
      wru.assert(Symbol('constructor').constructor === Symbol);
    }
  }, {
    name: 'Object.create is not compromised',
    test: function () {
      var o = {};
      wru.assert(o.isPrototypeOf(Object.create(o)));
    }
  }, {
    name: 'Object#toString.call(Symbol)',
    test: function () {
      wru.assert(Object.prototype.toString.call(Symbol()) === '[object Symbol]');
    }
  }, {
    name: 'toStringTag',
    test: function () {
      function Point() {}
      Point.prototype[Symbol.toStringTag] = 'Point';
      wru.assert(Object.prototype.toString.call(new Point) === '[object Point]');
    }
  }
]);
