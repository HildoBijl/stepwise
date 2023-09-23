# ExpressionInput

## Return type

The return type is an `Expression` object from the Step-Wise CAS. See the [CAS documentation](../../../../../../../shared/CAS/) in the `shared` directory for further details.

## Options

The options are the following.

- `settings`: What is allowed to be inserted into the field? See the [settings](./ExpressionInput/settings.js) file for details.

## Validation functions

- `any`: Only checks if the Expression makes sense (can be interpreted).
- `numeric`: Checks whether the Expression can reduce to a number, and hence has no variables.
- `validWithVariables`: This is a validation-function-generating function. Give it a list of variables, like `validWithVariables(['x', 'y'])`, and it checks whether the given Expression only depends on the given variables (and on nothing else).
