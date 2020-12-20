# Step-Wise forms

Many exercise types automatically wrap everything in a `Form` component. This component offers a lot of useful benefits. Most importantly, any `Input` field inside the `Form` uses the `Form` functionalities (like the React Context) to store its values. See the [input fields](inputs/) for more information on those. However, you can also use those functionalities manually!


## Accessing a single field

Most often, you will only want to access the value of a single input field. Suppose that you want to both read and write some value, as if you have created your own input field. In this case, first import `useFormParameter` into your exercise using `import { useFormParameter } from '../../form/Form'`. Then use this function in your React object using `const [value, setValue] = useFormParameter('fieldName')`. This allows you to set the value in the input object.

If you only want to read (and not write) the value of an already existing input field, then it's better to import `useInput` instead. You use it through `const someParameter = useInput('someFieldId')`. An added benefit is that this will turn the parameter from a plain-text parameter (like "314.159 * 10^(-2)") to one with improved functionality. (It is transformed from an input object to a functional object.)

Using these tricks, you should be able to make any exercise you like. If you want to create your own input fields, then things get more complicated. Then you may need to import the full `Form` Context.


## Accessing the Form Context

If you are writing an exercise and want to access the `Form` Context, do the following.

- Add `import { useFormData } from '../../form/Form'` on top of your file.
- Add `const { input, validation, ... } = useFormData()` within your React component, where you replace the accessed data by whatever you need to access.

That's all! The `Form` Context does contain a large amount of data. First of all, there are the following parameters related to *input*.

- `input`: all the input data of all fields put together into one object. It could look like `{x: { type: 'Integer', value: '-42' }, y: { ... } }`.
- `setParameter(name, value)`: will store the value in the given input parameter. So you can use `setParameter('x', { type: 'Integer', value: '-42' })`.
- `deleteParameter(name)`: will delete an input parameter. So you may use `deleteParameter('x')`.
- `setParameters(newInput, override = false)`: will set the `newInput` object as the new input. It will merge with the old object, unless override is set to true, in which case the old input will be thrown out entirely.
- `clearForm()`: deletes all input and sets the `input` object back to `{}`.

In addition, the `Form` is also responsible for validation. Validation is the quick check which a form does before submitting, to find obvious errors which the student may have made. Think of a student who left a field blank or forgot a unit. The following parameters can be accessed related to *validation*.

- `validation`: an object with validation data. It could be an object like `{ x: "This number must be positive!", y: undefined }`. In this example `y` has a falsy validation and is hence valid, while `x` has a message as validation and is hence invalid.
- `validationInput`: the input for which the validation was last executed.
- `isValid`: the function that validates the input. Returns `true` or `false`. It also updates the `validation` object and sets the `validationInput` to the current input.
- `saveValidationFunction(name, validate)`: remembers a validation function to call whenever a validation is executed. If `validate` is not given, the validation function with said name is actually removed. Note that this validation function will be given the full `input` object upon being called.

However, if you are going to create your own input fields, it's best to examine currently existing input fields to see how they have been made. That will get you started faster. Be prepared: creating your own input fields can be a hassle. You might want to start with either the `MultipleChoice` or the `IntegerInput` field.