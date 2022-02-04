# Step-Wise input types

Step-Wise has various input fields, each having its own data type. In this file we consider their types and what we can do with them.


## Distinction between object types

Before we begin, we need to make an important distinction. When you deal with input values in Step-Wise, you encounter various types of objects.

- When you enter data into an input field or draw stuff in an input drawing, behind the scenes we track your input as a *Functional Input* (FI) object. This object can have data like cursors. It can have functional objects like Vector objects that contain functions. And so forth. An example, if a student enters a number like "314.159 * 10^(-2)" in a `FloatInput` field, then the FI will look like `{ number: "314.159", power: "-2" }`. A `Form` will even wrap it with a type and extra data like a cursor to get `{ type: "float", value: { number: "314.159", power: "-2" }, cursor: { part: "power", cursor: 2 } }`.

- Once you submit an exercise, it is *cleaned* and sent to the server, where it is stored in the database. The resulting object is known as the *Stored Input* (SI) object. It has no data like cursors, nor any functions of any form. It's only basic data types (numbers, strings, etcetera) combined by arrays/objects. An example is `{ type: "float", value: { number: "314.159", power: "-2" } }`. Once such an object is pulled out of the database again, it may also be fed back to an input field, in which case it must be *functionalized* again to an FI object.

- When we do anything with the given input, we first always transform it to a *Functional Object* (FO). For a floating point number we turn it into a `Float` object. This object may possibly store its data entirely differently: a `Float` stores a `number`, the `significantDigits` and only keeps the `power` for display purposes. In addition, the FO generally has a ton of functionalities. For instance, the `Float` object has methods to compare floats, multiply/divide/add floats, and much more. This is useful to for instance check the given input.

- Exercises can also have various FOs that need to be stored. When we store exercise states, we turn the FOs into *Storage Objects* (SOs). These are once more objects without any functionalities: only basic types wrapped in objects/arrays. However, they are set up in such a way that it is easy to reinterpret them to FOs. 

Behind the scenes, Step-Wise constantly switches values between all these object formats. The guidelines here are:

- Whenever exercise developers work with values, they should always be in functional format, to make things easier. Hence, the `generateState` function can export FOs, the `state` given to front-end exercise components contains FOs, the `checkInput` function for `SimpleExercise` and `StepExercise` components is given the `state` and `input` in FOs, and so on. 
- When sending or storing input values, we always use the SI format. This makes sure it's efficient to store (no cursors are stored) but we can always reconstruct the original input, even when the input is not even valid. (Like when the user entered an integer like `---5`.)
- When sending or storing state values, we always use the SO format. This makes sure it's efficient to store, and it's also easy to reinterpret the objects into functional form.

When working with `SimpleExercise` or `StepExercise` exercises, everything is taken care of for you. If you are going to manually program your own exercises, the above distinction is something to keep in mind. Luckily, in this folder (see the `index.js` file) there are functions `toFO` and `toSO` to easily switch any input type back and forth. Each function has an optional second boolean parameters `useSI` that (when set to true) uses `SI` instead of `SO`.

If you want to learn more about a specific type of input, it's recommended to study the source code of the respective type. This code generally contains a lot of useful information about all the possible functions.


## Adding new input types

If you want to add a new input type, then you should first decide for yourself what the FI, SI, FO and SO look like. Additionally, if your FO needs to have functionalities, there are three rules that must be satisfied.

- Your type must be in the types list in the `index` file in this directory.
- Your FO must have a `type` property, being a string.
- Your FO must have a `SO` property, which contains all data needed to be stored about the object.

Next, there are a couple of functions that you may want to define in the file corresponding to this type.

- `SOtoFO` (obligatory) should specify how to turn a SO back into a FO. Often this comes down to `SO => new ObjectClass(SO)`.
- `FOtoSO` (optional) specifies how to turn an FO into an SO. Default is `obj => obj.SO`.
- `SItoFO` (optional) specifies how to turn a SI into a FO. If not given, `SOtoFO` is used instead.
- `FOtoSI` (optional) specifies how to turn an FO into an SI. If not given, `FOtoSI` is used instead.

By defining these functions, Step-Wise can properly handle all the FI/SI/FO/SO transformations behind the scenes.