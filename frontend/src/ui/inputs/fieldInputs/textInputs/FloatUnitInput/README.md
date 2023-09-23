# FloatUnitInput

## Return type

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

## Options

The options are identical to the Float field.

- `positive`: When set to true (default false) only positive numbers are allowed.
- `allowPower`: When set to false (default true) no power ` * 10^x` is allowed.

## Validation functions

- `any`: Checks whether a proper number and (possibly empty but valid) unit have been entered.
- `nonEmptyUnit`: Checks whether a proper number and non-empty valid unit have been entered.
