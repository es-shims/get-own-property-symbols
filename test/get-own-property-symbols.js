//remove:
require('../build/get-own-property-symbols.node.js');
//:remove

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
  }
]);
