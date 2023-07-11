# Step-Wise forms

Many exercise types automatically wrap everything in a `Form` component. This component offers a lot of useful benefits. Most importantly, any `Input` field inside the `Form` uses the `Form` functionalities (like the React Context) to store its values. See the [input fields](inputs/) for more information on those. However, you can also use those functionalities manually!


## Accessing existing input field values live

Suppose you have a `Form` with various input fields inside. How can you use existing input field values live in React components? To do so, use one of the following hooks. (All hooks are imported from `ui/form/Form`.)

- `useInput`: use as `const someValue = useInput('someId')`, or as `const [value1, value2] = useInput(['id1', 'id2'])`. So either provide a single ID or an array of IDs. The resulting values are fully functional (FO type).
- `useInputObject`: use as `const { id1, id2 } = useInputObject(['id1','id2'])`. So this is the same as the above, except that an object is returned containing the requested input values.


## Form data formats

When accessing further form data you must know about the various data format used in Step-Wise.
- When values are entered into the form, the field parameters are in `Functional Input (FI)` form. The FI parameters have data like cursors, selections and such in it. An example is `{ type: 'Float', value: { number: '3', power: 2' }, cursor: { ... } }`.
- When the values are submitted to the server and stored in the database, then the FI-parameters are cleaned. What results is a `Stored Input (SI)` parameter. This is a basic object containing all relevant data on the input, but nothing about cursors, selections, etcetera. It is also not functional in any way: it is a basic Javascript object. An example is `{ type: 'Float', value: { number: '3', power: 2' }, cursor: { ... } }`.
- When the values are interpreted, we get `Functional Object (FO)` parameters. These are objects that have lots of methods that are useful to interact with them. For instance, a `Float` field may return something like `new Float(3, 2)`. 


## Accessing further Form possibilities

The `Form` has a ton of other possibilities. To use them, you have to access the form context through `const formData, = useFormData()` as hook. The `formData` parameter has access to a ton of data and functionalities. It has the following parameters that are useful (and a few more).

- `getInputFO(id)`: returns the FO value for the given field ID.
- `getAllInputFO()`: returns an object with all input field values in FO format.
- `getInputSI(id)`: returns the SI value for the given field ID.
- `getAllInputSI()`: returns an object with all input field values in SI format.
- `getInputFI(id)`: returns the FI value for the given field ID.
- `getAllInputFI()`: returns an object with all input field values in FI format.

- `isInputValid(check = true)`: when called, it checks whether all fields have a valid input. This also calls any validation functions that may have been specified. The result is cached: if `check` is set to false the last cached result is used and no check is run.
- `validation`: an object of the form `{ result: { [id1]: 'Field is empty!' }, input: { [id1]: { someSIValue }, [id2]: { someSIValue }}}`. This can be used to get the validation error messages. This value is also cached and is refreshed on an `isValid` call.

- `getFieldIds(includeUnsubscribed = false)`: returns a list of all the field IDs that are known in the form and are currently active on the page. If `includeUnsubscribed` is set to `true`, then any older input fields that have been made persistent will also be included.


## Components

Are you a developer and want to understand how it's all set up, and how all components connect to one another? Then read on.

Below you find the various components, and how they all relate to each other. All of them (except for the `Keyboard` component) also have a corresponding React `Context` to pass data to its children.

- `FieldController`: At the top level, surrounding every page, is a `FieldController` component. This component tracks which input fields are on the page, and on tabs or clicks activates the right one. Input fields can register themselves to the `FieldController` if they ought to be considered for tabs/clicks.
- `Keyboard`: Right inside the `FieldController` is a `Keyboard`. When an input field registers at the `FieldController`, it also tells the `FieldController` the corresponding `keyboardSettings`: which keyboard should be shown when the input field is active? These settings are then passed to the `Keyboard` which is displayed accordingly.
- `Form`: On a page, there may be a `Form` with various input fields. For instance, a practice exercise is generally encompassed by a `Form`. This `Form` tracks all the values of all the input fields inside of it. (Input fields do not keep their own value, since then the form cannot access the full contents.) Input values are stored in FI form, but the `Form` is also able to transform the values to SI and FO form for further processing.
- `FeedbackProvider`: A `Form` often has a `FeedbackProvider` inside of it. (This `FeedbackProvider` may even be inside a container like a `SolutionProvider` to have access to extra data.) When feedback is requested, the `FeedbackProvider` takes the input from the form and comes up with feedback in one form or another to display inside the form.
- `FormPart`: A `Form` generally consists of various parts. Think of a main question, a subquestion A and a subquestion B. If the user is done with subquestion A, then this part should be read-only and, depending on whether a user has attempted an input, show or hide input fields. The `FormPart` is the component that tracks these settings, subsequently informing input fields inside of it of their status.
- `Input`: Inside the `Form` there are various `Input` fields. There is a large variety of [input fields](inputs/), so check the corresponding documentation to see what's possible there.

And that's how a `Form` is built up in Step-Wise!
