# FloatInput

## Return type

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

## Options

- `positive`: When set to true (default false) only positive numbers are allowed.
- `allowPower`: When set to false (default true) no power ` * 10^x` is allowed.

## Validation functions

- `any`: (Default) Checks whether something has been entered.
- `positive`: Checks whether a positive number or 0 has been entered. In this case it may be better to not even allow negative numbers.
