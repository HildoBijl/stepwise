# Input field notes

There is a variety of input fields that you can use at problems. Each of them gives a different input type.


## General usage

In general, if you want to use an input field named `SomeInput`, then you first have to import it. Do this using `import SomeInput from 'ui/form/inputs/SomeInput'`. Then you can apply it using `<SomeInput id="x" />`. The `id` parameter is obligatory and it needs to be unique within your problem. The corresponding value is automatically passed along to the input object.

Fields have several options that you can add (next to `id`). We will list the general options applicable to all fields here. Some fields have more options.

- `label`: The text that is visible in the field before it is activated. This label then shifts up on activating.
- `placeholder`: The text that is visible when the cursor is in the field but nothing has been typed yet.
- `prelabel`: The text that is shown to the left of the input field.
- `feedbackText`: If present, this is shown underneath the input field. Usually this is not set directly but follows from a feedback function of the exercise.
- `size`: Can be `s`, `m` or `l`. The result depends on the size of the screen: smartphones work differenly than desktop screens.
- `validate`: A validation function, which needs to be imported from the same file as the input field. Check the input fields to see their validation functions. Each field has its own default, which is often the noop function `() => {}` that returns undefined, meaning no validation is done apart from checking if the input can be interpreted at all.
- `readOnly`: The field cannot be changed.
- `autoFocus`: When set to true, the field is automatically activated on loading. This is not often used, since most exercises already automatically focus on the first field upon loading, so input fields do not need to activate itself.


## Field types

There is a variety of field types, each with its own options and validation functions.


### MultipleChoice

#### Return type

The multiple choice input type gives the following value.

- If multiple choices are allowed: an array of integers. This array could be empty, when no options have been chosen.
- If multiple choices are *not* allowed: an integer, or undefined if no option has been chosen.

The given integers correspond to the chosen option, where counting starts from `0`. The first option is hence option `0`, and if the student selects the first and third option, the result is `[0, 2]`.

#### Options

- `choices` (default `[]`): the options to display, in an array.
- `multiple` (default `false`): are multiple choices allowed? If set to `true`, checkboxes are used instead of radio buttons.
- `readOnly` (default `undefined`): can the value still be changed? If left undefined, the exercise status is checked and only when the exercise is not done can the value be changed. If this option is defined, it overwrites this.
- `pick` (default `undefined`): choose a subset of the choices given. If there are six choices and pick is set to four, then only four of the six choices are shown. If left undefined, all choices are included.
- `include` (default `[]`): only used when pick is defined. The given options are then definitely included in the pick. If you set `include` to `[0,3]`, then choices `0` and `3` are definitely picked, along with a few other random ones. This is useful to make sure you include the correct answer in the random selection of answers. If only a single option has to be included, no array is needed: entering a number would suffice too.
- `randomOrder` (default `false`): should we show the choices in a random order? Behind the scenes the original order is still used: this only relates to how it is shown to the user.

#### Validation functions

- `any`: Any submission (also with zero answers) is fine.
- `nonEmpty`: (Default) Checks whether at least one value has been chosen.


### IntegerInput

#### Return type

Gives an integer, in javascript's regular form. Like `8`.

#### Options

- `positive`: When set to true (default false) only positive numbers are allowed.

#### Validation functions

- `any`: (Default) Checks whether something has been entered.
- `positive`: Checks whether a positive number or 0 has been entered. In this case it may be better to not even allow negative numbers.


### FloatInput

#### Return type

The return type is a `Float` object. It has various properties.

- `number`: The number it represents.
- `significantDigits`: How many significant digits it has.
- `power`: The power used for displaying.
- `str`: A string representation.
- `tex`: A Latex representation.

It has various useful methods.

- `clone`
- `add`
- `multiply`
- `equals`
- `checkEquality`

See the `Float` source code in the `shared` directory for details on this.

#### Options

- `positive`: When set to true (default false) only positive numbers are allowed.
- `allowPower`: When set to false (default true) no power ` * 10^x` is allowed.

#### Validation functions

- `any`: (Default) Checks whether something has been entered.
- `positive`: Checks whether a positive number or 0 has been entered. In this case it may be better to not even allow negative numbers.


### UnitInput

#### Return type

The return type is a `Unit` object. It has various properties.

- `str`
- `tex`

It has various useful methods.

- `clone`
- `isValid`
- `isInStandardUnits`
- `multiply`
- `divide`
- `toPower`
- `invert`
- `simplify`
- `simplifyWithData`
- `equals`

See the `Unit` source code in the `shared` directory for details on this.

#### Options

There are no options.

#### Validation functions

- `any`: Checks whether a valid unit has been entered. (But no unit is also valid.) So an empty string or `kg * m` passes, but `abcdef` does not.
- `nonEmpty`: (Default) Checks whether a non-empty valid unit has been entered. An empty string and `abcdef` both fail but `kg * m` passes.


### FloatUnitInput

#### Return type

The return type is a `FloatUnit` object which is basically a combination of a `Float` and a `Unit` object. It has various properties.

- `str`
- `tex`
- `float`
- `unit`

It has various useful methods.

- `clone`
- `isValid` for the unit
- `makeExact` for the float
- `simplify`
- `checkEquality`
- `equals`
- `add`
- `multiply`

See the `FloatUnit` source code in the `shared` directory for details on this.

#### Options

The options are identical to the Float field.

- `positive`: When set to true (default false) only positive numbers are allowed.
- `allowPower`: When set to false (default true) no power ` * 10^x` is allowed.

#### Validation functions

- `any`: Checks whether a proper number and (possibly empty but valid) unit have been entered.
- `nonEmptyUnit`: Checks whether a proper number and non-empty valid unit have been entered.


### ExpressionInput

#### Return type

The return type is an `Expression` object from the Step-Wise CAS. See the [CAS documentation](../../../../../shared/CAS/) in the `shared` directory for further details.

#### Options

The options are the following.

- `settings`: What is allowed to be inserted into the field? See the [settings](./ExpressionInput/settings.js) file for details.

#### Validation functions

- `any`: Only checks if the Expression makes sense (can be interpreted).
- `numeric`: Checks whether the Expression can reduce to a number, and hence has no variables.
- `validWithVariables`: This is a validation-function-generating function. Give it a list of variables, like `validWithVariables(['x', 'y'])`, and it checks whether the given Expression only depends on the given variables (and on nothing else).


### EquationInput

The `EquationInput` field works mostly identically to the `ExpressionInput` field, but it gives an `Equation` object from the Step-Wise CAS. For the rest, it works identically.


## New fields

When you want to create your own input fields, there are various options.

### General input fields

All the input fields use the `useAsInput` hook, defined in [Input.js](./support/Input.js). This hook receives a ton of information about the input field, and subsequently makes sure the input field is correctly registered in the `Form`, in the `FieldController` and for the `feedback` system. See the respective file to see what kind of options can be included.

Want an example of how the `useAsInput` hook works? Check out the [MultipleChoice](./MultipleChoice/rendering.js) input field.

### FieldInput

The `FieldInput` component is used by all inputs that have a text field. It sets up the text field, adds cursor control, arranges a keyboard, and so forth. To allow the `FieldInput` component to do this, it needs a large amount of data.

- `placeholder`: What is the default placeholder?
- `validate`: What is the default validation function?
- `initialSI`: What is the initial SI object? It is generally of the form `{ type: 'Float', value: { number: '314.159', power: '-2' }, cursor: { part: 'number', cursor: 4 } }`, where value and cursor can be very deep objects, if needed.
- `isEmpty`: Gets an FI object and checks whether it's empty. Is used to check if the placeholder should be shown.
- `JSXObject`: Gets an `FI` object expanded as its properties and renders JSX to be shown in the field contents.
- `keyboardSettings`: The settings that need to be applied for the site-based keyboard. It can be a function, receiving an `FI` object and returning said keyboard settings.
- `keyPressToFI`: Gets `(keyInfo, FI, contentsElement, fieldElement)` and needs to return, based on this information, the adjusted `FI` object. Note: this includes both the `value` and the `cursor`.
- `mouseClickToCursor`: Gets `(evt, FI, contentsElement)` and needs to return, based on this information, an adjusted `cursor` object.
- `getStartCursor`: Gets `(value, cursor)` and needs to determine what the leftmost (home) position of the `cursor` would be.
- `getEndCursor`: Gets `(value, cursor)` and needs to determine what the rightmost (end) position of the `cursor` would be.
- `isCursorAtStart`: Gets `(value, cursor)` and checks whether the cursor is at the start. Returns a boolean.
- `isCursorAtEnd`: Gets `(value, cursor)` and checks whether the cursor is at the end. Returns a boolean.

If all these things are defined, then you basically have your input element ready. Although some CSS styling might also be wise. Just copy another input field to see how things are done there and adjust accordingly. The [IntegerInput](./IntegerInput/rendering.js) is a good place to start, as it is one of the more basic types.
