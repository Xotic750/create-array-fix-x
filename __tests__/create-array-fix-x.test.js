let createArrayFix;

if (typeof module === 'object' && module.exports) {
  require('es5-shim');
  require('es5-shim/es5-sham');

  if (typeof JSON === 'undefined') {
    JSON = {};
  }

  require('json3').runInContext(null, JSON);
  require('es6-shim');
  const es7 = require('es7-shim');
  Object.keys(es7).forEach(function(key) {
    const obj = es7[key];

    if (typeof obj.shim === 'function') {
      obj.shim();
    }
  });
  createArrayFix = require('../../index.js');
} else {
  createArrayFix = returnExports;
}

const hasSymbol = typeof Symbol === 'function' && typeof Symbol('') === 'symbol';
const ifSymbolIt = hasSymbol ? it : xit;

const ifHasOwnKeys = Reflect.ownKeys ? it : xit;

let supportsName;
const t = function test1() {};

if (t.name === 'test1') {
  supportsName = true;
}

describe('createArrayFix', function() {
  it('is a function', function() {
    expect(typeof createArrayFix).toBe('function');
  });

  ifHasOwnKeys('should have correct methods, name and arity', function() {
    Reflect.ownKeys(Array.prototype)
      .filter(function(key) {
        return key !== 'constructor';
      })
      .forEach(function(name) {
        const origMethod = Array.prototype[name];
        const subClassMethod = createArrayFix()[name];

        if (typeof origMethod === 'function') {
          expect(typeof subClassMethod).toBe('function', name);

          if (supportsName) {
            expect(subClassMethod.name).toBe(origMethod.name, name);
          }

          expect(subClassMethod).toHaveLength(origMethod.length, name);
        } else {
          expect(subClassMethod).toBe(origMethod, name);
        }
      });
  });

  it('equal on creation', function() {
    expect(createArrayFix()).toStrictEqual([]);
  });

  it('is an array', function() {
    expect(Array.isArray(createArrayFix())).toBe(true);
  });

  it('equal on construction length supplied', function() {
    const length = 10;
    expect(createArrayFix(length)).toStrictEqual(new Array(length));
  });

  it('equal on construction elements', function() {
    expect(createArrayFix(10, 11, 12)).toStrictEqual([10, 11, 12]);
  });

  it('setting length outside limits should throw', function() {
    expect(function() {
      createArrayFix(-11);
    }).toThrow();

    expect(function() {
      createArrayFix(Math.pow(2, 32) + 1);
    }).toThrow();

    const testArray = createArrayFix();
    expect(function() {
      testArray.length = -1;
    }).toThrow();

    expect(function() {
      testArray.length = Math.pow(2, 32) + 1;
    }).toThrow();
  });

  it('setting length should give correct sparse array', function() {
    const testArray = createArrayFix();
    let length;
    new Array(10).fill().forEach(function(unused, index) {
      length = index * 10;
      testArray.length = length;
      expect(testArray).toStrictEqual(new Array(length));
    });

    length = 10;
    testArray.length = length;
    expect(testArray).toStrictEqual(new Array(length));
  });

  it('equal on assignment', function() {
    const testArray = createArrayFix();
    expect((testArray[10] = 1)).toBe(1);
    const expected = new Array(11);
    expected[10] = 1;
    expect(testArray).toStrictEqual(expected);
    expect((testArray[0] = 1)).toBe(1);
    expected[0] = 1;
    expect(testArray).toStrictEqual(expected);
  });

  it('push', function() {
    const testArray = createArrayFix();
    expect(testArray.push(10)).toBe(1);
    expect(testArray.push(11)).toBe(2);
    expect(testArray.push(12)).toBe(3);
    expect(testArray.push(13, 14, 15)).toBe(6);
    expect(testArray.push()).toBe(6);
    expect(testArray).toStrictEqual([10, 11, 12, 13, 14, 15]);
  });

  it('pop', function() {
    const testArray = createArrayFix(10, 11, 12);
    expect(testArray.pop()).toBe(12);
    expect(testArray).toStrictEqual([10, 11]);
    expect(testArray.pop()).toBe(11);
    expect(testArray).toStrictEqual([10]);
    expect(testArray.pop()).toBe(10);
    expect(testArray).toStrictEqual([]);
    expect(testArray.pop()).toBe(void 0);
    expect(testArray).toStrictEqual([]);
  });

  it('unshift', function() {
    const testArray = createArrayFix();
    expect(testArray.unshift(10)).toBe(1);
    expect(testArray.unshift(11)).toBe(2);
    expect(testArray.unshift(12)).toBe(3);
    expect(testArray.unshift(13, 14, 15)).toBe(6);
    expect(testArray.unshift()).toBe(6);
    expect(testArray).toStrictEqual([13, 14, 15, 12, 11, 10]);
  });

  it('shift', function() {
    const testArray = createArrayFix(10, 11, 12);
    expect(testArray.shift()).toBe(10);
    expect(testArray).toStrictEqual([11, 12]);
    expect(testArray.shift()).toBe(11);
    expect(testArray).toStrictEqual([12]);
    expect(testArray.shift()).toBe(12);
    expect(testArray).toStrictEqual([]);
    expect(testArray.shift()).toBe(void 0);
    expect(testArray).toStrictEqual([]);
  });

  it('reverse', function() {
    const testArray = createArrayFix(10, 11, 12);
    expect(testArray.reverse()).toBe(testArray);
    expect(testArray).toStrictEqual([12, 11, 10]);

    expect(testArray.reverse()).toBe(testArray);
    expect(testArray).toStrictEqual([10, 11, 12]);
  });

  it('join', function() {
    const testArray = createArrayFix(10, 11, 12);
    expect(testArray.join('-')).toBe('10-11-12');
    expect(testArray).toStrictEqual([10, 11, 12]);
  });

  it('toString', function() {
    const testArray = createArrayFix(10, 11, 12);
    expect(testArray.toString()).toBe('10,11,12');
    expect(testArray).toStrictEqual([10, 11, 12]);
  });

  it('toLocaleString', function() {
    const testArray = createArrayFix(10, 11, 12);
    expect(testArray.toLocaleString()).toBe([10, 11, 12].toLocaleString());

    expect(testArray).toStrictEqual([10, 11, 12]);
  });

  it('concat', function() {
    const testArray = createArrayFix(10, 11, 12, 13, 14, 15);
    const concated = testArray.concat([20, 30]);
    expect(concated).not.toBe(testArray);
    expect(concated instanceof testArray.constructor).toBe(true);
    expect(testArray).toStrictEqual([10, 11, 12, 13, 14, 15]);

    expect(concated).toStrictEqual([10, 11, 12, 13, 14, 15, 20, 30]);
  });

  it('slice', function() {
    const testArray = createArrayFix(10, 11, 12, 13, 14, 15);
    const sliced = testArray.slice(1, -1);
    expect(sliced).not.toBe(testArray);
    expect(sliced instanceof testArray.constructor).toBe(true);
    expect(testArray).toStrictEqual([10, 11, 12, 13, 14, 15]);

    expect(sliced).toStrictEqual([11, 12, 13, 14]);
  });

  it('splice', function() {
    const testArray = createArrayFix(10, 11, 12, 13, 14, 15);
    const spliced = testArray.splice(1, 1);
    expect(spliced).not.toBe(testArray);
    expect(spliced instanceof testArray.constructor).toBe(true);
    expect(testArray).toStrictEqual([10, 12, 13, 14, 15]);

    expect(spliced).toStrictEqual([11]);
  });

  it('indexOf', function() {
    const testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    expect(testArray.indexOf(1)).toBe(-1);
    expect(testArray.indexOf(11)).toBe(1);
    expect(testArray).toStrictEqual([10, 11, 12, 10, 11, 12]);
  });

  it('lastIndexOf', function() {
    const testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    expect(testArray.lastIndexOf(1)).toBe(-1);
    expect(testArray.lastIndexOf(11)).toBe(4);
    expect(testArray).toStrictEqual([10, 11, 12, 10, 11, 12]);
  });

  it('findIndex', function() {
    const testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    expect(
      testArray.findIndex(function(value) {
        return value === 1;
      }),
    ).toBe(-1);

    expect(
      testArray.findIndex(function(value) {
        return value === 11;
      }),
    ).toBe(1);

    expect(testArray).toStrictEqual([10, 11, 12, 10, 11, 12]);
  });

  it('find', function() {
    const testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    expect(
      testArray.find(function(value) {
        return value === 1;
      }),
    ).toBe(void 0);

    expect(
      testArray.find(function(value) {
        return value === 11;
      }),
    ).toBe(11);

    expect(testArray).toStrictEqual([10, 11, 12, 10, 11, 12]);
  });

  it('fill', function() {
    expect(createArrayFix(10).fill(1)).toStrictEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  });

  it('includes', function() {
    const testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    expect(testArray).not.toContain(1);
    expect(testArray).toContain(12);
    expect(testArray).toStrictEqual([10, 11, 12, 10, 11, 12]);
  });

  it('forEach', function() {
    const testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    const actual = [];
    testArray.forEach(function(value) {
      actual.push(value);
    });

    expect(actual).toStrictEqual([10, 11, 12, 10, 11, 12]);

    expect(testArray).toStrictEqual([10, 11, 12, 10, 11, 12]);
  });

  it('map', function() {
    const testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    const actual = testArray.map(function(value) {
      return value + 10;
    });

    expect(actual).toStrictEqual([20, 21, 22, 20, 21, 22]);

    expect(testArray).toStrictEqual([10, 11, 12, 10, 11, 12]);
  });

  it('filter', function() {
    const testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    const actual = testArray.filter(function(value) {
      return value !== 11;
    });

    expect(actual).toStrictEqual([10, 12, 10, 12]);

    expect(testArray).toStrictEqual([10, 11, 12, 10, 11, 12]);
  });

  it('every', function() {
    let testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    let actual = testArray.every(function(value) {
      return typeof value === 'number';
    });

    expect(testArray).toStrictEqual([10, 11, 12, 10, 11, 12]);

    expect(actual).toBe(true);
    testArray = createArrayFix(10, 11, 12, 10, 11, 12, 'a');
    actual = testArray.every(function(value) {
      return typeof value === 'number';
    });

    expect(actual).toBe(false);

    expect(testArray).toStrictEqual([10, 11, 12, 10, 11, 12, 'a']);
  });

  it('some', function() {
    let testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    let actual = testArray.some(function(value) {
      return typeof value !== 'number';
    });

    expect(testArray).toStrictEqual([10, 11, 12, 10, 11, 12]);

    expect(actual).toBe(false);
    testArray = createArrayFix(10, 11, 12, 10, 11, 12, 'a');
    actual = testArray.some(function(value) {
      return typeof value === 'number';
    });

    expect(actual).toBe(true);
    expect(testArray).toStrictEqual([10, 11, 12, 10, 11, 12, 'a']);
  });

  it('reduce', function() {
    const testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    const actual = testArray.reduce(function(acc, value) {
      return acc + value;
    }, 0);

    expect(actual).toBe(10 + 11 + 12 + 10 + 11 + 12);
    expect(testArray).toStrictEqual([10, 11, 12, 10, 11, 12]);
  });

  it('reduceRight', function() {
    const testArray = createArrayFix(10, 11, 12, 10, 11, 12);
    const actual = testArray.reduceRight(function(acc, value) {
      return acc + value;
    }, '');

    expect(actual).toBe('121110121110');
    expect(testArray).toStrictEqual([10, 11, 12, 10, 11, 12]);
  });

  ifSymbolIt('Symbol.iterator', function() {
    const testArray = createArrayFix(10, 11, 12, 13, 14, 15);
    const iterator = testArray[Symbol.iterator]();
    let next = iterator.next();
    let value = 10;
    while (next.done === false) {
      expect(next.value).toBe(value);
      next = iterator.next();
      value += 1;
    }
  });

  ifSymbolIt('values iterator', function() {
    const testArray = createArrayFix(10, 11, 12, 13, 14, 15);
    const iterator = testArray.values();
    let next = iterator.next();
    let value = 10;
    while (next.done === false) {
      expect(next.value).toBe(value);
      next = iterator.next();
      value += 1;
    }
  });

  ifSymbolIt('keys iterator', function() {
    const testArray = createArrayFix(10, 11, 12, 13, 14, 15);
    const iterator = testArray.keys();
    let next = iterator.next();
    let index = 0;
    while (next.done === false) {
      expect(next.value).toBe(index);
      next = iterator.next();
      index += 1;
    }
  });

  ifSymbolIt('entries iterator', function() {
    const testArray = createArrayFix(10, 11, 12, 13, 14, 15);
    const iterator = testArray.entries();
    let next = iterator.next();
    let index = 0;
    while (next.done === false) {
      expect(next.value instanceof testArray.constructor).toBe(true);
      expect(next.value).toStrictEqual([index, index + 10]);
      next = iterator.next();
      index += 1;
    }
  });

  it('jSON stringify', function() {
    const testArray = createArrayFix(10, 11, 12, 13, 14, 15);
    expect(JSON.stringify(testArray)).toBe(JSON.stringify([10, 11, 12, 13, 14, 15]));
  });

  it('safari 10.1 array bug is fixed', function() {
    const testArray = createArrayFix(0, 2147483648); // Note: the second number is greater than a signed 32bit int
    testArray.shift(); // remove the first element so arr is [2147483648]
    testArray[1] = 1; // Safari fails to add the new element and the array is unchanged
    expect(testArray).toStrictEqual([2147483648, 1]);
  });
});
