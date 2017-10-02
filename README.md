<a href="https://travis-ci.org/Xotic750/create-array-fix-x"
   title="Travis status">
<img
   src="https://travis-ci.org/Xotic750/create-array-fix-x.svg?branch=master"
   alt="Travis status" height="18"/>
</a>
<a href="https://david-dm.org/Xotic750/create-array-fix-x"
   title="Dependency status">
<img src="https://david-dm.org/Xotic750/create-array-fix-x.svg"
   alt="Dependency status" height="18"/>
</a>
<a href="https://david-dm.org/Xotic750/create-array-fix-x#info=devDependencies"
   title="devDependency status">
<img src="https://david-dm.org/Xotic750/create-array-fix-x/dev-status.svg"
   alt="devDependency status" height="18"/>
</a>
<a href="https://badge.fury.io/js/create-array-fix-x" title="npm version">
<img src="https://badge.fury.io/js/create-array-fix-x.svg"
   alt="npm version" height="18"/>
</a>
<a name="module_create-array-fix-x"></a>

## create-array-fix-x
Address Safari 10.1 array bug: https://bugs.webkit.org/show_bug.cgi?id=170264

**Version**: 0.0.1  
**Author**: Xotic750 <Xotic750@gmail.com>  
**License**: [MIT](&lt;https://opensource.org/licenses/MIT&gt;)  
**Copyright**: Xotic750  
<a name="exp_module_create-array-fix-x--module.exports"></a>

### `module.exports([parameters])` ⇒ <code>Object</code> ⏏
Address Safari 10.1 array bug: https://bugs.webkit.org/show_bug.cgi?id=170264

**Kind**: Exported function  
**Returns**: <code>Object</code> - An array or array subclass if array is broken.  

| Param | Type | Description |
| --- | --- | --- |
| [parameters] | <code>number</code> \| <code>\*</code> | The construction parameters. |

**Example**  
```js
var createArray = require('create-array-fix-x');

createArray(); // []
createArray(5); // [, , , , , ]
createArray(1, 2, 3, 4, 5); // [1, 2, 3, 4, 5]

// adressed bug
var testArray = createArrayFix(0, 2147483648); // Note: the second number is greater than a signed 32bit int
testArray.shift(); // remove the first element so arr is [2147483648]
testArray[1] = 1; // Safari fails to add the new element and the array is unchanged
testArray; // [2147483648, 1]
```
