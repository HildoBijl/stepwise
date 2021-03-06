# Input field notes

There is a variety of input fields that you can use at problems. Each of them gives a different input type.


## General usage

In general, if you want to use an input field named `SomeInput`, then you first have to import it. Do this using `import SomeInput from '../../form/inputs/SomeInput'`. Then you can apply it using `<SomeInput id="x" />`. The `id` parameter is obligatory and it needs to be unique within your problem. The corresponding value is automatically passed along to the input object.

Fields have several options that you can add (next to `id`). We will list the general options applicable to all fields here. Some fields have more options.

- `label`: The text that is visible in the field before it is activated. This label then shifts up on activating.
- `placeholder`: The text that is visible when the cursor is in the field but nothing has been typed yet.
- `prelabel`: The text that is shown to the left of the input field.
- `feedbackText`: If present, this is shown underneath the input field. Usually this is not set directly but follows from a feedback function of the exercise.
- `size`: Can be `s`, `m` or `l`. The result depends on the size of the screen: smartphones work differenly than desktop screens.
- `validate`: A validation function, which needs to be imported from the same file as the input field. Check the input fields to see their validation functions. Each field has its own default, but an empty (noop) function `() => {}` can be passed to cancel this.
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

- `nonEmpty`: (Default) Checks whether at least one value has been chosen.


### IntegerInput

#### Return type

Gives an integer, in javascript's regular form. Like `8`.

#### Options

- `positive`: When set to true (default false) only positive numbers are allowed.

#### Validation functions

- `nonEmpty`: (Default) Checks whether something has been entered.
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

- `nonEmpty`: (Default) Checks whether something has been entered.
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

- `nonEmpty`: Checks whether something has been entered. (But it may be a senseless unit.) So `abcdef` passes but an empty string does not.
- `valid`: Checks whether a valid unit has been entered. (But no unit is also valid.) So an empty string or `kg * m` passes, but `abcdef` does not.
- `nonEmptyAndValid`: (Default) Checks whether a non-empty valid unit has been entered. An empty string and `abcdef` both fail but `kg * m` passes.


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

- `nonEmpty`: Checks whether something (anything) has been entered.
- `validNumberAndUnit`: Checks whether a proper number and (possibly empty but valid) unit have been entered.
- `validNumberAndNonEmptyUnit`: Checks whether a proper number and non-empty valid unit have been entered.


## New fields

When you want to create extra input fields, there are a LOT of things you need to define. This includes:

- `placeholder`: What is the default placeholder?
- `validate`: What is the default validation function?
- `initialData`: What is the initial data object? It is generally of the form `{ type: 'Float', value: { number: '314.159', power: '-2' }, cursor: { part: 'number', cursor: 4 } }`, where value and cursor can be very deep objects, if needed.
- `isEmpty`: Gets a data object and checks whether it's empty. Is used to check if the placeholder should be shown.
- `JSXObject`: Gets a `data` object expanded as its properties and renders JSX to be shown in the field contents.
- `keyboardSettings`: The settings that need to be applied for the site-based keyboard. It can be a function, receiving a `data` object and returning said keyboard settings.
- `keyPressToData`: Gets `(keyInfo, data, contentsElement, fieldElement)` and needs to return, based on this information, the adjusted `data` object. Note: this includes both the `value` and the `cursor`.
- `mouseClickToCursor`: Gets `(evt, data, contentsElement)` and needs to return, based on this information, an adjusted `cursor` object.
- `getStartCursor`: Gets `(value, cursor)` and needs to determine what the leftmost (home) position of the `cursor` would be.
- `getEndCursor`: Gets `(value, cursor)` and needs to determine what the rightmost (end) position of the `cursor` would be.
- `isCursorAtStart`: Gets `(value, cursor)` and checks whether the cursor is at the start. Returns a boolean.
- `isCursorAtEnd`: Gets `(value, cursor)` and checks whether the cursor is at the end. Returns a boolean.

If all these things are defined, then you basically have your input element ready. Although some CSS styling might also be wise. Just copy another input field to see how things are done there and adjust accordingly.