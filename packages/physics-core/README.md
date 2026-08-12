# Physics Core

The `physics-core` package represents physics quantities. It has various classes, each with its own manipulation, simplification and comparison methods. See the respective documentation for details.


## Float

The [Float](./src/Float/) represents a number with a certain precision. For instance, `2.0 * 10^3` is different from `2000`: they have a different number of significant digits.


## Unit

The [Unit](./src/Unit/) represents a unit in physics. We may have `m`, `kg`, `m / s`, `mm^3` or `kg * m / s^2`.


## FloatUnit

The [FloatUnit](./src/FloatUnit/) combines the `Float` and `Unit` classes to model physics quantities. Think of for instance `2.9979 * 10^8 m / s`.
