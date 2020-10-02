/* eslint-disable no-restricted-syntax, strict */

var test = require('tape');

require('es5-shim');
require('es6-shim');
require('../build/get-own-property-symbols.node.js');

test('shimmed', function (t) {
  t.equal(typeof Object.getOwnPropertySymbols, 'function');
  t.equal(typeof Symbol, 'function');

  t.test('basics work', function (st) {
    var o = {};
    var s = Symbol();
    o[s] = 123;
    st.equal(Object.keys(o).join(''), '', 'no visible keys');
    st.equal(o[s], 123, 'still reachable value');
    // eslint-disable-next-line no-unreachable-loop, no-unused-vars
    for (var key in o) {
      throw new Error('this should not happen');
    }
    st.equal(Object.getOwnPropertySymbols(o)[0], s, 'can be retrieved');
    delete o[s];
    st.equal(Object.getOwnPropertySymbols(o).length, 0, 'can be removed');
    o[s] = 456;
    st.equal(o[s], 456, 'can be added back');
    st.end();
  });

  t.test('cannot use Symbol as constructor', function (st) {
    st['throws'](function () {
      // eslint-disable-next-line no-new, no-new-symbol
      new Symbol();
    });
    st.end();
  });

  t.test('can use Symbol via Function.prototype.bind', function (st) {
    st.doesNotThrow(function () {
      Symbol.bind(Array)();
      Symbol.call(Symbol());
    });
    st.end();
  });

  t.test('Symbol name', function (st) {
    var s2 = Symbol('test2');
    st.equal(s2.valueOf().toString().indexOf('test2') > -1, true, 'it is possible to name one');
    st.end();
  });

  t.test('Symbol methods', function (st) {
    var label = 'random' + Math.random();
    // eslint-disable-next-line no-restricted-properties
    var s = Symbol['for'](label);
    // eslint-disable-next-line no-restricted-properties
    st.equal(s, Symbol['for'](label), 'labeled Symbols are the same');
    st.equal(Symbol.keyFor(s), label, 'labels can be retrieved back');
    st.equal(Symbol.keyFor(Symbol('5')), undefined, 'returns undefined if can not find symbol in global registry');
    st.equal(Symbol.keyFor(Symbol(label + label + label)), undefined, '(long label): returns undefined if can not find symbol in global registry');
    st.end();
  });

  t.test('propertyIsEnumerable', function (st) {
    var o = {};
    var s = Symbol();
    o[s] = 123;
    // eslint-disable-next-line no-unreachable-loop, no-unused-vars
    for (var k in o) { throw new Error('should not show up in a for/in'); }
    st.equal(Object.keys(o).length, 0, 'should not show up in Object.keys');
    st.equal(Object.prototype.propertyIsEnumerable.call(Object.prototype, s), false, 'property is enumerable');
    st.end();
  });

  t.test('define Symbol property as enumerable', function (st) {
    var o = {};
    var s = Symbol();
    Object.defineProperty(o, s, { enumerable: true, value: 456 });
    // eslint-disable-next-line no-unreachable-loop, no-unused-vars
    for (var k in o) { throw new Error('should not show up in a for/in'); }
    st.equal(Object.keys(o).length, 0, 'should not show up in Object.keys');
    st.equal(Object.prototype.propertyIsEnumerable.call(o, s), true, 'property is not enumerable');
    st.end();
  });

  t.test('define Symbol property as non enumerable', function (st) {
    var o = {};
    var s = Symbol();
    Object.defineProperty(o, s, { enumerable: false, value: 456 });
    // eslint-disable-next-line no-unreachable-loop, no-unused-vars
    for (var k in o) { throw new Error('should not show up in a for/in'); }
    st.equal(Object.keys(o).length, 0, 'should not show up in Object.keys');
    st.equal(Object.prototype.propertyIsEnumerable.call(o, s), false, 'property is enumerable');
    st.end();
  });

  t.test('defineProperties', function (st) {
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
    // eslint-disable-next-line no-unreachable-loop, no-unused-vars
    for (var k in o) { throw new Error('should not show up in a for/in'); }
    st.equal(Object.keys(o).length, 0, 'should not show up in Object.keys');
    st.equal(Object.prototype.propertyIsEnumerable.call(o, sEnumerable), true, 'property is enumerable');
    st.equal(Object.prototype.propertyIsEnumerable.call(o, sNotEnumerable), false, 'property is not enumerable');
    st.equal(o[sEnumerable], 'enumerable', 'enumerable property is the right one');
    st.equal(o[sNotEnumerable], 'non-enumerable', 'non enumerable property is the right one');
    st.end();
  });

  t.test('defineProperties with non enumerable properties', function (st) {
    var o = {};
    var s = Symbol();
    var descriptors = Object.defineProperty({}, s, { enumerable: false, value: 'would throw' });
    Object.defineProperties(o, descriptors);
    st.equal(o[s], undefined, 'should not have been assigned');
    st.end();
  });

  t.test('Array.prototype[Symbol.iterator]', function (st) {
    var iterator = [1, 2, 3][Symbol.iterator]();
    var list = [];
    var result;
    while (!(result = iterator.next()).done) {
      list.push(result.value);
    }
    st.equal(list.join(','), '1,2,3', 'Array is iterable');
    st.equal(iterator[Symbol.iterator](), iterator, 'Array iterator is iterable too');
    // eslint-disable-next-line no-unreachable-loop, no-unused-vars
    for (var k in []) { throw new Error('there should be no iterator here'); }
    st.end();
  });

  t.test('String.prototype[Symbol.iterator]', function (st) {
    var iterator = '😺😲'[Symbol.iterator]();
    var list = [];
    var result;
    while (!(result = iterator.next()).done) {
      list.push(result.value);
    }
    st.equal(list.join(','), '😺,😲', 'String is iterable');
    st.equal(iterator[Symbol.iterator](), iterator, 'String iterator is iterable too');
    // eslint-disable-next-line no-unreachable-loop
    for (var k in '') { throw new Error(k + ' <= there should be no iterator here'); }
    st.end();
  });

  t.test('getOwnPropertyDescriptor', function (st) {
    var s = Symbol('gOPD');
    var a = {};
    var b = {};
    a[s] = true;
    Object.defineProperty(b, s, { value: false });
    st.equal(Object.prototype.propertyIsEnumerable.call(a, s), true, 'a has it enumerable');
    st.equal(Object.prototype.propertyIsEnumerable.call(b, s), false, 'b has it not enumerable');
    st.equal(Object.getOwnPropertyDescriptor(a, s).enumerable, true, 'a has descriptor enumerable');
    st.equal(Object.getOwnPropertyDescriptor(b, s).enumerable, false, 'b has NOT descriptor enumerable');
    st.end();
  });

  t.test('Object.create(proto, symbols)', function (st) {
    var s = Symbol('Object.create');
    var a = {};
    var descriptors = { test: { value: 'value' } };
    descriptors[s] = { value: 'symbol' };
    var b = Object.create(a, descriptors);
    st.equal(a.isPrototypeOf(b), true, 'create works');
    st.equal(b.hasOwnProperty('test'), true, 'descriptors work');
    st.equal(b.hasOwnProperty(s), true, 'descriptors symbols work');
    st.equal(b[s], 'symbol', 'for real');
    st.end();
  });

  t.test('Object.create(null) works', function (st) {
    var b = Object.create(null);
    st.equal(typeof b, 'object', 'create works');
    var c = Object.create(null, undefined);
    st.equal(typeof c, 'object', 'create with null,undefined works');
    st.end();
  });

  t.test('typeof is not string', function (st) {
    st.notEqual(typeof Symbol('typeof'), 'string');
    st.end();
  });

  t.test('instanceof is not Symbol', function (st) {
    st.equal(Symbol('instanceof') instanceof Symbol, false);
    st.end();
  });

  t.test('Symbol().constructor', function (st) {
    st.equal(Symbol('constructor').constructor, Symbol);
    st.end();
  });

  t.test('Object.create is not compromised', function (st) {
    var o = {};
    st.equal(o.isPrototypeOf(Object.create(o)), true);
    st.end();
  });

  t.test('Object#toString.call(Symbol)', function (st) {
    st.equal(Object.prototype.toString.call(Symbol()), '[object Symbol]');
    st.end();
  });

  t.test('Object#toString.call(undefined | null)', function (st) {
    st.equal(Object.prototype.toString.call(undefined), '[object Undefined]');
    st.equal(Object.prototype.toString.call(null), '[object Null]');
    st.end();
  });

  t.test('toStringTag', function (st) {
    function Point() {}
    Point.prototype[Symbol.toStringTag] = 'Point';
    st.equal(Object.prototype.toString.call(new Point()), '[object Point]');
    st.end();
  });

  t.test('keyFor throws on non symbol', function (st) {
    st['throws'](function () {
      Symbol.keyFor('not a Symbol');
    }, 'non symbols cannot be passed to keyFor');
    st.end();
  });

  t.test('should not allow implicit string coercion', { todo: true }, function (st) {
    st['throws'](function () {
      String(Symbol('10'));
    }, 'should not allow implicit string coercion');
    st.end();
  });

  t.test('silently fail when overwriting properties', function (st) {
    var sym = Symbol('2');
    sym.toString = 0;
    st.equal(typeof sym.toString, 'function');
    sym.valueOf = 0;
    st.equal(typeof sym.valueOf, 'function');
    st.end();
  });

  t.test('defineProperties is not affected', function (st) {
    st.doesNotThrow(function () {
      Object.defineProperties({}, {});
    });
    st.end();
  });
  t.end();
});
