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
  },{
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
      var s = Symbol.for(label);
      wru.assert('labeled Symbols are the same', s === Symbol.for(label));
      wru.assert('labels can be retrieved back', Symbol.keyFor(s) === label);
    }
  }
]);
