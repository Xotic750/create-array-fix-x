/**
 * @file Address Safari 10.1 array bug: https://bugs.webkit.org/show_bug.cgi?id=170264
 * @version 1.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module create-array-fix-x
 */

'use strict';

var test = [0, 2147483648]; // Note: the second number is greater than a signed 32bit int
test.shift(); // remove the first element so arr is [2147483648]
test[1] = 1; // Safari fails to add the new element and the array is unchanged

var $createArray;
var handler;
var ArraySubClass;
if (test.length === 1) {
  var reIsUint = /^(?:0|[1-9]\d*)$/;
  var minLength = 0;
  var maxLength = Math.pow(2, 32) - 1;

  handler = {
    get: function _get(obj, prop) {
      var backing = obj['[[backing]]'];
      return prop in backing ? backing[prop] : obj[prop];
    },
    has: function _has(obj, prop) {
      var backing = obj['[[backing]]'];
      return prop in backing || prop in obj;
    },
    set: function _set(obj, prop, value) {
      if (prop === 'length') {
        if (value < minLength || value > maxLength) {
          throw new RangeError('Invalid array length');
        }
      }

      var backing = obj['[[backing]]'];
      if (reIsUint.test(prop) && prop >= backing.length) {
        backing.length = Number(prop) + 1;
      }

      backing[prop] = value;

      return true;
    }
  };

  var init = function _init(context, args) {
    var backing = Object.defineProperty(Object.create(null), 'length', {
      value: 0,
      writable: true
    });

    Object.defineProperty(context, '[[backing]]', {
      value: backing,
      writable: true
    });

    if (args.length > 0) {
      if (args.length === 1) {
        backing.length = args[0] >>> 0;
      } else {
        context.push.apply(backing, args);
      }
    }
  };

  var cStr = 'return class ArraySubClass extends Array {constructor(){super();init(this,arguments);}}';
  // eslint-disable-next-line no-new-func
  ArraySubClass = Function('init', cStr)(init);

  Object.defineProperty(ArraySubClass.prototype, 'entries', {
    configurable: true,
    value: function entries() {
      var iterable = Array.prototype.entries.call(this);
      var nextFn = iterable.next;

      return Object.defineProperty(iterable, 'next', {
        configurable: true,
        value: function next() {
          var iteratorObject = nextFn.call(this);

          if (iteratorObject.done) {
            return iteratorObject;
          }

          return {
            done: false,
            value: $createArray(iteratorObject.value[0], iteratorObject.value[1])
          };
        }.bind(iterable)
      });
    }
  });
}

$createArray = function createArray() {
  /* global Proxy */
  var array = ArraySubClass ? new Proxy(new ArraySubClass(), handler) : [];
  if (arguments.length > 0) {
    if (arguments.length === 1) {
      array.length = arguments[0] >>> 0;
    } else {
      array.push.apply(array, arguments);
    }
  }

  return array;
};

/**
 * Address Safari 10.1 array bug: https://bugs.webkit.org/show_bug.cgi?id=170264
 *
 * @param {number|...*} [parameters] - The construction parameters.
 * @returns {Object} An array or array subclass if array is broken.
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
module.exports = $createArray;
