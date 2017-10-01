'use strict';

var createArrayFix;
if (typeof module === 'object' && module.exports) {
  require('es5-shim');
  require('es5-shim/es5-sham');
  if (typeof JSON === 'undefined') {
    JSON = {};
  }
  require('json3').runInContext(null, JSON);
  require('es6-shim');
  var es7 = require('es7-shim');
  Object.keys(es7).forEach(function (key) {
    var obj = es7[key];
    if (typeof obj.shim === 'function') {
      obj.shim();
    }
  });
  createArrayFix = require('../../index.js');
} else {
  createArrayFix = returnExports;
}

var hasSymbol = typeof Symbol === 'function' && typeof Symbol('') === 'symbol';
var ifSymbolIt = hasSymbol ? it : xit;

var ifHasOwnKeys = Reflect.ownKeys ? it : xit;

var supportsName;
var t = function test1() {};
if (t.name === 'test1') {
  supportsName = true;
}

describe('createArrayFix', function () {
  it('is a function', function () {
    expect(typeof createArrayFix).toBe('function');
  });

  ifHasOwnKeys('should have correct methods, name and arity', function () {
    Reflect.ownKeys(Array.prototype).filter(function (key) {
      return key !== 'constructor';
    }).forEach(function (name) {
      var origMethod = Array.prototype[name];
      var subClassMethod = createArrayFix()[name];
      if (typeof origMethod === 'function') {
        expect(typeof subClassMethod).toBe('function', name);
        if (supportsName) {
          expect(subClassMethod.name).toBe(origMethod.name, name);
        }

        expect(subClassMethod.length).toBe(origMethod.length, name);
      } else {
        expect(subClassMethod).toBe(origMethod, name);
      }
    });
  });

  it('equal on creation', function () {
    expect(createArrayFix()).toEqual([]);
  });

  it('is an array', function () {
    expect(Array.isArray(createArrayFix())).toBe(true);
  });

  it('equal on construction length supplied', function () {
    var length = 10;
    expect(createArrayFix(length)).toEqual(new Array(length));
  });

  it('equal on construction elements', function () {
    expect(createArrayFix(10, 11, 12)).toEqual([
      10,
      11,
      12
    ]);
  });

  it('setting length outside limits should throw', function () {
    var testArray = createArrayFix();
    expect(function () {
      testArray.length = -1;
    }).toThrow();

    expect(function () {
      testArray.length = Math.pow(2, 32) + 1;
    }).toThrow();
  });

  it('setting length should give correct sparse array', function () {
    var testArray = createArrayFix();
    var length;
    new Array(10).fill().forEach(function (unused, index) {
      length = index * 10;
      testArray.length = length;
      expect(testArray).toEqual(new Array(length));
    });

    length = 10;
    testArray.length = length;
    expect(testArray).toEqual(new Array(length));
  });

  it('equal on assignment', function () {
    var testArray = createArrayFix();
    expect(testArray[10] = 1).toBe(1);
    var expected = new Array(11);
    expected[10] = 1;
    expect(testArray).toEqual(expected);
    expect(testArray[0] = 1).toBe(1);
    expected[0] = 1;
    expect(testArray).toEqual(expected);
  });

  it('push', function () {
    var testArray = createArrayFix();
    expect(testArray.push(10)).toBe(1);
    expect(testArray.push(11)).toBe(2);
    expect(testArray.push(12)).toBe(3);
    expect(testArray.push(13, 14, 15)).toBe(6);
    expect(testArray.push()).toBe(6);
    expect(testArray).toEqual([
      10,
      11,
      12,
      13,
      14,
      15
    ]);
  });

  it('pop', function () {
    var testArray = createArrayFix(10, 11, 12);
    expect(testArray.pop()).toBe(12);
    expect(testArray).toEqual([10, 11]);
    expect(testArray.pop()).toBe(11);
    expect(testArray).toEqual([10]);
    expect(testArray.pop()).toBe(10);
    expect(testArray).toEqual([]);
    expect(testArray.pop()).toBe(void 0);
    expect(testArray).toEqual([]);
  });

  it('unshift', function () {
    var testArray = createArrayFix();
    expect(testArray.unshift(10)).toBe(1);
    expect(testArray.unshift(11)).toBe(2);
    expect(testArray.unshift(12)).toBe(3);
    expect(testArray.unshift(13, 14, 15)).toBe(6);
    expect(testArray.unshift()).toBe(6);
    expect(testArray).toEqual([
      13,
      14,
      15,
      12,
      11,
      10
    ]);
  });

  it('shift', function () {
    var testArray = createArrayFix(10, 11, 12);
    expect(testArray.shift()).toBe(10);
    expect(testArray).toEqual([11, 12]);
    expect(testArray.shift()).toBe(11);
    expect(testArray).toEqual([12]);
    expect(testArray.shift()).toBe(12);
    expect(testArray).toEqual([]);
    expect(testArray.shift()).toBe(void 0);
    expect(testArray).toEqual([]);
  });

  it('reverse', function () {
    var testArray = createArrayFix(10, 11, 12);
    expect(testArray.reverse()).toBe(testArray);
    expect(testArray).toEqual([
      12,
      11,
      10
    ]);

    expect(testArray.reverse()).toBe(testArray);
    expect(testArray).toEqual([
      10,
      11,
      12
    ]);
  });

  it('join', function () {
    var testArray = createArrayFix(10, 11, 12);
    expect(testArray.join('-')).toBe('10-11-12');
    expect(testArray).toEqual([
      10,
      11,
      12
    ]);
  });

  it('toString', function () {
    var testArray = createArrayFix(10, 11, 12);
    expect(testArray.toString()).toBe('10,11,12');
    expect(testArray).toEqual([
      10,
      11,
      12
    ]);
  });

  it('toLocaleString', function () {
    var testArray = createArrayFix(10, 11, 12);
    expect(testArray.toLocaleString()).toBe([
      10,
      11,
      12
    ].toLocaleString());

    expect(testArray).toEqual([
      10,
      11,
      12
    ]);
  });

  it('concat', function () {
    var testArray = createArrayFix(10, 11, 12, 13, 14, 15);
    var concated = testArray.concat([20, 30]);
    expect(concated).not.toBe(testArray);
    expect(concated instanceof testArray.constructor).toBe(true);
    expect(testArray).toEqual([
      10,
      11,
      12,
      13,
      14,
      15
    ]);

    expect(concated).toEqual([
      10,
      11,
      12,
      13,
      14,
      15,
      20,
      30
    ]);
  });

  it('slice', function () {
    var testArray = createArrayFix(10, 11, 12, 13, 14, 15);
    var sliced = testArray.slice(1, -1);
    expect(sliced).not.toBe(testArray);
    expect(sliced instanceof testArray.constructor).toBe(true);
    expect(testArray).toEqual([
      10,
      11,
      12,
      13,
      14,
      15
    ]);

    expect(sliced).toEqual([
      11,
      12,
      13,
      14
    ]);
  });

  it('splice', function () {
    var testArray = createArrayFix(10, 11, 12, 13, 14, 15);
    var spliced = testArray.splice(1, 1);
    expect(spliced).not.toBe(testArray);
    expect(spliced instanceof testArray.constructor).toBe(true);
    expect(testArray).toEqual([
      10,
      12,
      13,
      14,
      15
    ]);

    expect(spliced).toEqual([11]);
  });

  it('indexOf', function () {
    var testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    expect(testArray.indexOf(1)).toBe(-1);
    expect(testArray.indexOf(11)).toBe(1);
    expect(testArray).toEqual([
      10,
      11,
      12,
      10,
      11,
      12
    ]);
  });

  it('lastIndexOf', function () {
    var testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    expect(testArray.lastIndexOf(1)).toBe(-1);
    expect(testArray.lastIndexOf(11)).toBe(4);
    expect(testArray).toEqual([
      10,
      11,
      12,
      10,
      11,
      12
    ]);
  });

  it('findIndex', function () {
    var testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    expect(testArray.findIndex(function (value) {
      return value === 1;
    })).toBe(-1);

    expect(testArray.findIndex(function (value) {
      return value === 11;
    })).toBe(1);

    expect(testArray).toEqual([
      10,
      11,
      12,
      10,
      11,
      12
    ]);
  });

  it('find', function () {
    var testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    expect(testArray.find(function (value) {
      return value === 1;
    })).toBe(void 0);

    expect(testArray.find(function (value) {
      return value === 11;
    })).toBe(11);

    expect(testArray).toEqual([
      10,
      11,
      12,
      10,
      11,
      12
    ]);
  });

  it('fill', function () {
    expect(createArrayFix(10).fill(1)).toEqual([
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1
    ]);
  });

  it('includes', function () {
    var testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    expect(testArray.includes(1)).toBe(false);
    expect(testArray.includes(12)).toBe(true);
    expect(testArray).toEqual([
      10,
      11,
      12,
      10,
      11,
      12
    ]);
  });

  it('forEach', function () {
    var testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    var actual = [];
    testArray.forEach(function (value) {
      actual.push(value);
    });

    expect(actual).toEqual([
      10,
      11,
      12,
      10,
      11,
      12
    ]);

    expect(testArray).toEqual([
      10,
      11,
      12,
      10,
      11,
      12
    ]);
  });

  it('map', function () {
    var testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    var actual = testArray.map(function (value) {
      return value + 10;
    });

    expect(actual).toEqual([
      20,
      21,
      22,
      20,
      21,
      22
    ]);

    expect(testArray).toEqual([
      10,
      11,
      12,
      10,
      11,
      12
    ]);
  });

  it('filter', function () {
    var testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    var actual = testArray.filter(function (value) {
      return value !== 11;
    });

    expect(actual).toEqual([
      10,
      12,
      10,
      12
    ]);

    expect(testArray).toEqual([
      10,
      11,
      12,
      10,
      11,
      12
    ]);
  });

  it('every', function () {
    var testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    var actual = testArray.every(function (value) {
      return typeof value === 'number';
    });

    expect(testArray).toEqual([
      10,
      11,
      12,
      10,
      11,
      12
    ]);

    expect(actual).toBe(true);
    testArray = createArrayFix(10, 11, 12, 10, 11, 12, 'a');
    actual = testArray.every(function (value) {
      return typeof value === 'number';
    });

    expect(actual).toBe(false);

    expect(testArray).toEqual([
      10,
      11,
      12,
      10,
      11,
      12,
      'a'
    ]);
  });

  it('some', function () {
    var testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    var actual = testArray.some(function (value) {
      return typeof value !== 'number';
    });

    expect(testArray).toEqual([
      10,
      11,
      12,
      10,
      11,
      12
    ]);

    expect(actual).toBe(false);
    testArray = createArrayFix(10, 11, 12, 10, 11, 12, 'a');
    actual = testArray.some(function (value) {
      return typeof value === 'number';
    });

    expect(actual).toBe(true);
    expect(testArray).toEqual([
      10,
      11,
      12,
      10,
      11,
      12,
      'a'
    ]);
  });

  it('reduce', function () {
    var testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    var actual = testArray.reduce(function (acc, value) {
      return acc + value;
    }, 0);

    expect(actual).toBe(10 + 11 + 12 + 10 + 11 + 12);
    expect(testArray).toEqual([
      10,
      11,
      12,
      10,
      11,
      12
    ]);
  });

  it('reduceRight', function () {
    var testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    var actual = testArray.reduceRight(function (acc, value) {
      return acc + value;
    }, '');

    expect(actual).toBe('121110121110');
    expect(testArray).toEqual([
      10,
      11,
      12,
      10,
      11,
      12
    ]);
  });

  ifSymbolIt('Symbol.iterator', function () {
    var testArray = createArrayFix(10, 11, 12, 13, 14, 15);
    var iterator = testArray[Symbol.iterator]();
    var next = iterator.next();
    var value = 10;
    while (next.done === false) {
      expect(next.value).toBe(value);
      next = iterator.next();
      value += 1;
    }
  });

  ifSymbolIt('values iterator', function () {
    var testArray = createArrayFix(10, 11, 12, 13, 14, 15);
    var iterator = testArray.values();
    var next = iterator.next();
    var value = 10;
    while (next.done === false) {
      expect(next.value).toBe(value);
      next = iterator.next();
      value += 1;
    }
  });

  ifSymbolIt('keys iterator', function () {
    var testArray = createArrayFix(10, 11, 12, 13, 14, 15);
    var iterator = testArray.keys();
    var next = iterator.next();
    var index = 0;
    while (next.done === false) {
      expect(next.value).toBe(index);
      next = iterator.next();
      index += 1;
    }
  });

  ifSymbolIt('entries iterator', function () {
    var testArray = createArrayFix(10, 11, 12, 13, 14, 15);
    var iterator = testArray.entries();
    var next = iterator.next();
    var index = 0;
    while (next.done === false) {
      expect(next.value instanceof testArray.constructor).toBe(true);
      expect(next.value).toEqual([index, index + 10]);
      next = iterator.next();
      index += 1;
    }
  });

  it('JSON stringify', function () {
    var testArray = createArrayFix(10, 11, 12, 13, 14, 15);
    expect(JSON.stringify(testArray)).toBe(JSON.stringify([
      10,
      11,
      12,
      13,
      14,
      15
    ]));
  });

  it('Safari 10.1 array bug is fixed', function () {
    var testArray = createArrayFix(0, 2147483648); // Note: the second number is greater than a signed 32bit int
    testArray.shift(); // remove the first element so arr is [2147483648]
    testArray[1] = 1; // Safari fails to add the new element and the array is unchanged
    expect(testArray).toEqual([2147483648, 1]);
  });
});
