# Step-Wise input types

Step-Wise has various input fields, each having its own data type. In this file we consider their types and what we can do with them.


## Distinction between input objects and functional objects

Before we begin, we need to make an important distinction. When you deal with input values in Step-Wise, you encounter two types of objects, or sometimes even three.

- First there are *input objects* (IO). If a student enters a number like "314.159 * 10^(-2)" in a `FloatInput` field, then the input object will look like `{ number: "314.159", power: "-2" }`. A `Form` will even wrap it with a type to get `{ type: "float", value: { number: "314.159", power: "-2" } }`. It is an object without any functionalities, and all parameters are strings. It's exactly how the student entered it. It's also a good way to store the number: there is no problem with number rounding errors or so. However, considering it consists of strings, it's impossible to work with.
- Second, there are *functional objects* (FO). Whenever we want to do anything with input, like check its magnitude, find the number of significant digits, etcetera, we put it in functional form. For a floating point number this means we turn it into a `Float` object. This object may possibly store its data entirely differently: a `Float` stores a `number`, the `significantDigits` and only keeps the `power` for display purposes. In addition, the FO generally has a ton of functionalities. For instance, the `Float` object has methods to compare floats, multiply/divide/add floats, and much more.
- Finally, you may encounter *storage objects* (SO) internally inside objects. When a `Float` object needs to clone itself, it simplifies itself to an SO. This is an object which only contains essential data (like `number`, `significantDigits` and `power`) but not any functionalities. This is then used for cloning the object. You will not encounter SOs much, since they are generally only used internally by objects.

Behind the scenes, Step-Wise constantly switches values between IO-format and FO-format. The guidelines here are:

- Whenever exercise developers work with values, they should always be in functional format, to make things easier. Hence, the `generateState` function can export FOs, the `state` given to front-end exercise components contains FOs, the `checkInput` function for `SimpleExercise` and `StepExercise` components is given the `state` and `input` in FOs, and so on. 
- When sending or storing values, they should always be in input format, to keep storage effective and unambiguous. Hence, the database stores IOs, the API sends IOs, and the `input` parameter of forms contains IOs.

So, when working with `SimpleExercise` or `StepExercise` exercises, everything is taken care of for you. If you are going to manually program your own exercises, the above distinction is something to keep in mind. Luckily, in this folder (see the `index.js` file) there are functions `IOtoFO` and `FOtoIO` to easily switch any input type back and forth. Or you can use `setIOtoFO` and `setFOtoIO` to immediately transform a whole input set with multiple parameters. There is also an `equals` function which checks if two IO parameters are identical.

Added note: when working with input fields, the wrapped form of the *input object* (the one with `type` specified) may in addition also have cursors. For instance, the `input` object may have a parameter `x` which equals `{ type: "float", value: { number: "314.159", power: "-2" }, cursor: { part: 'power', cursor: 2 } }`. (In this example the cursor is placed at the end of the power.) This cursor property is removed as soon as the form sends its value anywhere. The database hence only stores `{ type: "float", value: { number: "314.159", power: "-2" } }`. Note that the database *does* store the type.

If you want to learn more about a specific type of input, it's recommended to study the source code of the respective type. This code generally contains a lot of useful information about all the possible functions.


## Adding new input types

If you want to add a new input type, then you should first decide for yourself what the IO and the FO look like. Next, there are a couple of obligatory functions which you should define.

- `isFOofType` should return `true` or `false`, depending on whether the FO is of this type. For an integer the FO is simply the integer itself, like `42`, so there this function returns `typeof param === 'number' && isInt(param)`. This is used after the `generateState` function gives data in FO format, to determine what kind of data it has actually given, so it can be properly stored in IO format.
- `FOtoIO` transforms an FO to an IO. So for an integer this goes from `42` to `"42"` through a `toString` method.
- `IOtoFO` transforms an IO to an FO. So for an integer this goes form `"42"` to `42` through a `parseInt` method.
- `getEmpty` returns an empty IO. So for an integer this returns "". This is useful for input fields that want to start empty.
- `isEmpty` checks if an IO is empty. So for an integer this returns `value === ""`. This is useful for input fields that want to know whether they should show a placeholder.
- `equals` checks if two IOs are equal. This is useful for input fields too: input fields can detect if the user changed the input value since the previous submissions, and whether the given feedback hence still applies or not.

By doing the above, Step-Wise can properly handle all the IO and FO transformations behind the scenes.