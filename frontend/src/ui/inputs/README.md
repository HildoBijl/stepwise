# Input field notes

There is a variety of input fields that you can use. Each of them gives a different input type.

## Field types

In general the input fields come in the following branches.

- [Field inputs](./fieldInputs). These are input fields you can type in.
- [Drawing inputs](./drawingInputs). These fields contain a drawing which you can in some way interact with, like dragging things are drawing additional components.
- [Miscellaneous](./miscellaneous/). Everything else. Think of a Multiple Choice list or similar.

Follow the respective links to learn more.

## General usage

In general, if you want to use an input field named `SomeInput`, then you first have to import it. Do this using `import SomeInput from 'ui/inputs'`. Then you can apply it using `<SomeInput id="x" />`. The `id` parameter is obligatory and it needs to be unique within your Form. The corresponding value is automatically passed along to the input object.

Fields have several options that you can add (next to `id`). We will list the general options applicable to all fields here. Many field types have more options.

- `validate`: This function is called prior to submitting the form to see if the input actually makes sense. If the input isn't sensible, then nothing will be submitted/checked in the first place. Think of as if someone entered the number "-." which is obviously invalid. A validation function is a function `(FO, allFieldsFO) => <>Some validation error message.</>`. If the validation function returns anything falsy, then that means the input is acceptable. Available validation functions are generally used through `validate={SomeInput.validation.validationFunctionName}`.
- `readOnly`: The field cannot be changed. Input fields generally also get data from the form which can set this value automatically.
- `allowFocus`: Can the input field be focused? This is usually true, but for multiple choice fields its default is false.
- `autoFocus`: When set to true, the field is automatically activated on loading. This is not often used, since most exercises already automatically focus on the first field upon loading, so input fields do not need to activate itself.
