# Field Input

The `FieldInput` component is the abstract component that is used whenever an input field with a cursor is needed. It adds a nice border, shows the contents, and so forth.

## Parameters

All field inputs have certain parameters that can be used. They include the following.

- `label`: The text that is visible in the field before it is activated. This label then shifts up on activating.
- `placeholder`: The text that is visible when the cursor is in the field but nothing has been typed yet.
- `prelabel`: The text that is shown to the left of the input field.
- `feedbackText`: If present, this is shown underneath the input field. Usually this is not set directly but follows from a feedback function of the exercise.
- `size`: Can be `s`, `m` or `l`. The result depends on the size of the screen: smartphones work differenly than desktop screens.

## Usage

To use this component, it needs a large variety of information. Think of what the start and end position of the cursor is, what needs to happen on each key press, on each mouse click, and so forth. To see how this works, it's best to look at an example application, like the `IntegerInput`.
