# Step-Wise forms

Many exercise types automatically wrap everything in a `Form` component. This component offers a lot of useful benefits. Most importantly, any `Input` field inside the `Form` uses the `Form` functionalities (like the React Context) to store its values. See the [input fields](inputs/) for more information on those. However, you can also use those functionalities manually!


## Accessing existing input field values live

Suppose you have a `Form` with various input fields inside. How can you use existing input field values live in React components? To do so, use one of the following hooks. (All hooks are imported from `ui/form/Form`.)

- `useInput`: use as `const someValue = useInput('someId')`, or `const [value1, value2] = useInput(['id1', 'id2'])`. So either provide a single ID or an array of IDs. The resulting values are fully functional (FO type).
- `useInputObject`: use as `const { id1, id2 } = useInputObject(['id1','id2'])`. So this is the same as the above, except that an object is returned containing the requested input values.


## Form data formats

When accessing further form data you must know about the various data format used in Step-Wise.
- When values are entered into the form, the field parameters are in `Functional Input (FI)` form. The FI parameters have data like cursors, selections and such in it. An example is `{ type: 'Float', value: { number: '3', power: 2' }, cursor: { ... } }`.
- When the values are submitted to the server and stored in the database, then the FI-parameters are cleaned. What results is a `Stored Input (SI)` parameter. This is a basic object containing all relevant data on the input, but nothing about cursors, selections, etcetera. It is also not functional in any way. An example is `{ type: 'Float', value: { number: '3', power: 2' }, cursor: { ... } }`.
- When the values are interpreted, we get `Functional Object (FO)` parameters. These are objects that have lots of methods that are useful to interact with them. For instance, a `Float` field may return something like `new Float(3, 2)`. 


## Accessing further Form possibilities

The `Form` has a ton of other possibilities. To use them, you have to access the form context through `const formData, = useFormData()` as hook. The `formData` parameter has access to a ton of data and functionalities. It has the following parameters that are useful (and a few more).

- `getInputFO()`: returns an object with all input field values in FO format.
- `getInputParameterFO(id)`: returns the FO value for the given field ID.
- `getInputSI()`: returns an object with all input field values in SI format.
- `getInputParameterSI(id)`: returns the SI value for the given field ID.
- `getInputFI()`: returns an object with all input field values in FI format.
- `getInputParameterFI(id)`: returns the FI value for the given field ID.

- `isValid(check = true)`: when called, it checks whether all fields have a valid input. This also calls any validation functions that may have been specified. The result is cached: if `check` is set to false the last cached result is used and no check is run.
- `validation`: an object of the form `{ result: { [id1]: 'Field is empty!' }, input: { [id1]: { someSIValue }, [id2]: { someSIValue }}}`. This can be used to get the validation error messages. This value is also cached and is refreshed on an `isValid` call.

- `getFields()`: returns a list of all the field IDs that are known in the form.
- `getSubscribedFields()`: returns a list of all the subscribed field IDs that are in the form. So if an input field is not rendered anymore, but its value was persistent, it will still appear in the `getFields` list but not in the `getSubscribedFields` list.
