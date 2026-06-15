# Unit

The `Unit` class represents a physics unit like `kg * m / s^2`.


## Internal structure

A `Unit` effectively consists of two `UnitArray` entries (`numerator` and `denominator`). Each is a list of `UnitElement` objects. Every `UnitElement` consists of a `Prefix` (can be undefined), a `BaseUnit` and a `Power` (default `1`).


## Creation

Setting up a new `Unit` object can be done in various ways.

```
import { asUnit, Unit } from '@step-wise/physics-core'
const u1 = new Unit('m / s') // String, constructor
const u2 = asUnit('kg * m / s^2') // String, function
const u3 = new Unit({ numerator: [{ unit: 'm', power: 3 }] }) // Object, constructor, for "m^3"
const u4 = asUnit({ numerator: [{ prefix: 'k', unit: 'g' }, { unit: 'm' }], denominator: [{ unit: 's', power: 2 }] }) // Object, function, for "kg * m / s^2"
```

Generally, using strings is easier. Note that brackets are never necessary (nor allowed) in the string representation.

Once set up, the `Unit` object has a variety of properties and methods.


## Basic properties

There are a few basic checks you can run.

- `isEmpty()` checks if the unit equals the `1` unit (dimensionless).
- `hasStandardPrefixes()` checks if the prefixes in all elements are the standard ones. (So that's mostly "none" but for the unit "g" the prefix has to be "k" since the standard unit for mass is "kg".)
- `isInStandardUnits()` checks if all units are standard. So we may not use `bar` but we may use `Pa`. Prefixes are allowed: `mPa` is OK here.
- `isInStandardForm()` combines the previous two: checks if all units are standard with their standard prefixes. `Pa` is allowed but `mPa` is not.
- `isInBaseUnits()` checks if only the seven base units are used. Prefixes are allowed.
- `isInBaseForm()` checks if only the seven base units are used, with their standard prefixes.


## Display

Units can be displayed through:

- `str` or `toString()`: gives a string representation of the unit, like `kg * m / s^2`.
- `tex` or `toTex()`: gives a LaTeX code to display the unit.
- `texWithBrackets` or `toTexWithBrackets()` adds square brackets to the unit, for instance to display in table headers or similar.


## Arithmetic

Units can be manipulated through the following methods.

- `invert()` flips a unit, turning `m / s^2` into `s^2 / m`.
- `multiply(unit)` multiplies this unit by a unit.
- `divide(unit)` divides this unit by a unit.
- `toPower(power)` takes this unit to the given power. So `asUnit('m').toPower(3)` gives `m^3`.


## Simplification

There are various ways in which units can be reduced. First, there are two basic clean-up methods.

- `combine()` combines identical unit elements. So `dm^5 * dm^3 / dm^2` becomes `dm^6`. It does not match unit elements with different prefixes.
- `sort()` sorts the unit elements, first according to their unit and then according to their prefix.

Then there are three methods that reduce a unit in some way. Each method goes a step further than the previous one (so includes the previous one).

- `removePrefixes()` applies standard prefixes to all unit elements. So `km` becomes `m`, `ms` becomes `s` and (perhaps surprisingly) `g` becomes `kg`, since `kg` is the standard unit. So the name is misleading: we apply standard prefixes. (But that function name would be too long.)
- `toStandardUnits()` removes prefixes and turns everything into standard units. So `bar` becomes `Pa` and `°C` becomes `K`.
- `toBaseUnits()` first turns units to standard units, and then subsequently reduces them further to the seven base units.

You can also combine the above functions into one function: the `simplify` function.

- `simplify(simplificationOptions)` applies the above simplification functions, as specified in the options. Here, the simplificationOptions is an object of the form:

```
const simplificationOptions = {
	target: 'standard', // Is the target to which we reduce unit. Can be 'unchanged', 'noPrefixes', 'standard' and 'base'. Default is 'standard'.
	combine: true,
	sort: true,
}
```

When simplifying the unit, the actual value of the quantity may change. To account for this, the above four functions all have an extra variant: `removePrefixesWithData`, `toStandardUnitsWithData`, `toBaseUnitsWithData` and `simplifyWithData`. These functions return an object of the form `{ unit, exponent, factor, difference }`.

- `unit` is the new unit.
- `factor` is what the original number should be multiplied with. For instance, when turning hours to seconds, this will be `3600`.
- `exponent` is what the exponent of the original number should be incremented by. Going from `km` to `m` this will be `3`: the exponent of the `Float` number should be `3` higher.
- `difference` is what should be added to the original number. Going from `°C` to `K` this will be `273.15`.

This allows a calling function to potentially adjust the given number, based on changes in the unit's simplified form.


## Comparison

To compare units, we first have to specify the type of check that we want to do: the `equalityOptions`. An example is:

```
const equalityOptions = {
	target: 'standard', // The target to which we simplify the units before comparing them.
	checkSize: true, // Should the size of the units (as expressed by the above factor/exponent/difference adjustments) be the same?
}
```

Two units can then be compared through the following functions.

- `equals(unit, equalityOptions)` returns whether or not the units are considered equal, given the options. This is `true` or `false`.
- `checkEquality(unit, equalityOptions)` returns an object containing a full comparison report. It has info (including the simplified units that were compared) that can be used for feedback to the student on the grading.
