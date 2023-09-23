# UnitInput

## Return type

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

## Options

There are no options.

## Validation functions

- `any`: Checks whether a valid unit has been entered. (But no unit is also valid.) So an empty string or `kg * m` passes, but `abcdef` does not.
- `nonEmpty`: (Default) Checks whether a non-empty valid unit has been entered. An empty string and `abcdef` both fail but `kg * m` passes.
