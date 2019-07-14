/**
 * @file Address Safari 10.1 array bug: https://bugs.webkit.org/show_bug.cgi?id=170264.
 * @version 0.1.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module create-array-fix-x
 */

/* global Proxy */

const test = [0, 2147483648]; // Note: the second number is greater than a signed 32bit int
test.shift(); // remove the first element so arr is [2147483648]
test[1] = 1; // Safari fails to add the new element and the array is unchanged

const toInteger = function _toInteger(value) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return 0;
  }

  if (number === 0 || Number.isFinite(number) === false) {
    return number;
  }

  return Math.sign(number) * Math.floor(Math.abs(number));
};

let ArraySubClass;

if (test.length === 1) {
  const toLength = function _toLength(value) {
    const len = toInteger(value);

    // includes converting -0 to +0
    if (len <= 0) {
      return 0;
    }

    if (len > Number.MAX_SAFE_INTEGER) {
      return Number.MAX_SAFE_INTEGER;
    }

    return len;
  };

  const reIsUint = /^(?:0|[1-9]\d*)$/;
  const minLength = 0;
  const maxLength = Math.pow(2, 32) - 1;

  const toObject = function _toObject(value) {
    if (typeof value === 'undefined' || value === null) {
      throw new TypeError(`Cannot call method on ${value}`);
    }

    return Object(value);
  };

  const handler = {
    get: function _get(obj, prop) {
      const backing = obj['[[backing]]'];

      return prop in backing ? backing[prop] : obj[prop];
    },
    has: function _has(obj, prop) {
      const backing = obj['[[backing]]'];

      return prop in backing || prop in obj;
    },
    set: function _set(obj, prop, value) {
      if (prop === 'length') {
        if (value < minLength || value > maxLength) {
          throw new RangeError('Invalid array length');
        }
      }

      const backing = obj['[[backing]]'];

      if (reIsUint.test(prop) && prop >= backing.length) {
        backing.length = Number(prop) + 1;
      }

      backing[prop] = value;

      return true;
    },
  };

  const init = function _init(context, args) {
    const backing = Object.defineProperty(Object.create(null), 'length', {
      value: 0,
      writable: true,
    });

    Object.defineProperty(context, '[[backing]]', {
      value: backing,
      writable: true,
    });

    const thisArg = new Proxy(context, handler);

    if (args.length > 0) {
      if (args.length === 1) {
        backing.length = toInteger(args[0]);
      } else {
        Array.prototype.push.apply(thisArg, args);
      }
    }

    return thisArg;
  };

  const classStr = 'return class ArraySubClass extends Array {constructor(){super();return init(this,arguments);}}';
  // eslint-disable-next-line no-new-func
  ArraySubClass = Function('init', classStr)(init);

  const setRelative = function _setRelative(value, length) {
    return value < 0 ? Math.max(length + value, 0) : Math.min(value, length);
  };

  Object.defineProperties(ArraySubClass.prototype, {
    concat: {
      configurable: true,
      // eslint-disable-next-line no-unused-vars
      value: function concat(value1) {
        const object = toObject(this);
        const args = Array.prototype.slice.call(arguments);
        args.unshift(object);
        const concated = Array.prototype.concat.apply([], args);

        return concated.reduce(function(arr, item, index) {
          arr[index] = item;

          return arr;
        }, new ArraySubClass(concated.length));
      },
    },
    entries: {
      configurable: true,
      value: function entries() {
        const iterable = Array.prototype.entries.apply(toObject(this), arguments);
        const nextFn = iterable.next;

        return Object.defineProperty(iterable, 'next', {
          configurable: true,
          value: function next() {
            const iteratorObject = nextFn.apply(toObject(this), arguments);

            if (iteratorObject.done) {
              return iteratorObject;
            }

            return {
              done: false,
              value: new ArraySubClass(iteratorObject.value[0], iteratorObject.value[1]),
            };
          },
        });
      },
    },
    filter: {
      configurable: true,
      value: function filter(callBack) {
        const object = toObject(this);

        if (typeof callBack !== 'function') {
          throw new TypeError(`${callBack} is not a function`);
        }

        const length = toLength(object.length);
        let thisArg;

        if (arguments.length > 1) {
          thisArg = arguments[1];
        }

        const noThis = typeof thisArg === 'undefined';
        const result = new ArraySubClass();
        for (let i = 0; i < length; i += 1) {
          if (i in object) {
            const item = object[i];

            if (noThis ? callBack(item, i, object) : callBack.call(thisArg, item, i, object)) {
              result.push(item);
            }
          }
        }

        return result;
      },
    },
    map: {
      configurable: true,
      value: function map(callBack) {
        const object = toObject(this);

        if (typeof callBack !== 'function') {
          throw new TypeError(`${callBack} is not a function`);
        }

        const length = toLength(object.length);
        let thisArg;

        if (arguments.length > 1) {
          thisArg = arguments[1];
        }

        const noThis = typeof thisArg === 'undefined';
        const result = new ArraySubClass();
        result.length = length;
        for (let i = 0; i < length; i += 1) {
          if (i in object) {
            const item = object[i];
            result[i] = noThis ? callBack(item, i, object) : callBack.call(thisArg, item, i, object);
          }
        }

        return result;
      },
    },
    slice: {
      configurable: true,
      value: function slice(start, end) {
        const object = toObject(this);
        const length = toLength(object.length);
        let k = setRelative(toInteger(start), length);
        const relativeEnd = typeof end === 'undefined' ? length : toInteger(end);
        const finalEnd = setRelative(relativeEnd, length);
        const val = new ArraySubClass();
        val.length = Math.max(finalEnd - k, 0);
        let next = 0;
        while (k < finalEnd) {
          if (k in object) {
            val[next] = object[k];
          }

          next += 1;
          k += 1;
        }

        return val;
      },
    },
    splice: {
      configurable: true,
      // eslint-disable-next-line no-unused-vars
      value: function splice(start, deleteCount) {
        const removed = Array.prototype.splice.apply(toObject(this), arguments);

        return removed.reduce(function(arr, item, index) {
          arr[index] = item;

          return arr;
        }, new ArraySubClass(removed.length));
      },
    },
  });
}

/**
 * Address Safari 10.1 array bug: https://bugs.webkit.org/show_bug.cgi?id=170264.
 *
 * @param {number|...*} [parameters] - The construction parameters.
 * @returns {object} An array or array subclass if array is broken.
 * @example
 * var createArray = require('create-array-fix-x');
 *
 * createArray(); // []
 * createArray(5); // [, , , , , ]
 * createArray(1, 2, 3, 4, 5); // [1, 2, 3, 4, 5]
 *
 * // adressed bug
 * var testArray = createArrayFix(0, 2147483648); // Note: the second number is greater than a signed 32bit int
 * testArray.shift(); // remove the first element so arr is [2147483648]
 * testArray[1] = 1; // Safari fails to add the new element and the array is unchanged
 * testArray; // [2147483648, 1]
 */
module.exports = function createArray() {
  const array = ArraySubClass ? new ArraySubClass() : [];

  if (arguments.length === 0) {
    return array;
  }

  if (arguments.length === 1) {
    array.length = toInteger(arguments[0]);

    return array;
  }

  return array.slice.call(arguments);
};
