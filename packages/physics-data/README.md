# @step-wise/physics-data

`@step-wise/physics-data` provides precision-aware physical constants, unit-conversion values and thermodynamic property data. Its values use [`@step-wise/physics-core`](https://www.npmjs.com/package/@step-wise/physics-core) quantities, while its reusable property tables use [`@step-wise/interpolation`](https://www.npmjs.com/package/@step-wise/interpolation).


## Installation

```bash
npm install @step-wise/physics-data @step-wise/physics-core
```


## Quick start

```ts
import { Quantity } from '@step-wise/physics-core'
import { c, gasProperties, getSaturationPressure, refrigerantDatasets } from '@step-wise/physics-data'

c.setUnit('km / s').number // 299792.458
gasProperties.air.cp.toString() // specific heat capacity of air

const saturationPressure = getSaturationPressure(refrigerantDatasets.R134A, new Quantity('20 dC'))
saturationPressure?.setUnit('bar').number // 5.7171
```

All exported measurements are `Quantity` objects, so consumers can convert units, perform arithmetic and retain the precision recorded in the underlying data.


## Physical constants

The package exports `g`, `G`, `c`, `h`, `k`, `R`, `NA`, `e`, `electronMass`, `protonMass` and `neutronMass`.

```ts
import { G, c, electronMass } from '@step-wise/physics-data'

c.setUnit('m / s').number // 299792458
G.setUnit('m^3 / kg * s^2').number
electronMass.setUnit('kg').number
```

Constants whose SI values are definitions, including `c`, `h`, `k`, `NA` and `e`, are represented as exact quantities. Measured or conventionally rounded values retain finite precision.


## Unit conversions

The package exports the exact values `barToPascalFactor`, `celsiusToKelvinOffset`, `kilogramsToGramsFactor`, `cubicMetersToLitersFactor` and `cubicMetersToCubicCentimetersFactor`.

```ts
import { Quantity } from '@step-wise/physics-core'
import { barToPascalFactor, kilogramsToGramsFactor } from '@step-wise/physics-data'

new Quantity('2 bar').multiply(barToPascalFactor).setUnit('Pa').number // 200000
new Quantity('2 kg').multiply(kilogramsToGramsFactor).setUnit('g').number // 2000
```

For ordinary unit conversion, prefer `Quantity.setUnit()`. These values are useful when the conversion itself is part of a formula or must be exposed as data.


## Gas properties

`gasProperties` contains the specific gas constant `Rs`, heat-capacity ratio `k`, specific heat at constant volume `cv` and specific heat at constant pressure `cp` for air, argon, carbon dioxide, carbon monoxide, helium, hydrogen, methane, nitrogen and oxygen.

```ts
import { gasProperties } from '@step-wise/physics-data'

const { Rs, k, cv, cp } = gasProperties.air
Rs.setUnit('J / kg * K').number
cp.subtract(cv).setUnit('J / kg * K').number
```

The exported `GasName` and `GasProperties` types describe the available keys and values.


## Humidity properties

`maximumHumidityByTemperature` is a one-dimensional interpolation table for the maximum absolute humidity of air from -10 °C through 35 °C. Its input label is `temperature` and its output label is `maximumHumidity`.

```ts
import { interpolateTable } from '@step-wise/interpolation'
import { Quantity } from '@step-wise/physics-core'
import { maximumHumidityByTemperature } from '@step-wise/physics-data'

const humidity = interpolateTable(new Quantity('20 dC'), maximumHumidityByTemperature)
humidity?.setUnit('g / kg').number // 14.68912
```

Interpolation outside the tabulated range returns `undefined`.


## Steam properties

The package provides three steam interpolation tables: `saturatedSteamPropertiesByTemperature`, `saturatedSteamPropertiesByPressure` and `superheatedSteamProperties`. The saturation tables return boiling conditions and liquid/vapor enthalpy and entropy; the superheated table returns enthalpy and entropy from pressure and temperature.

```ts
import { interpolateTable, interpolateTableOutputs } from '@step-wise/interpolation'
import { Quantity } from '@step-wise/physics-core'
import { saturatedSteamPropertiesByTemperature, superheatedSteamProperties } from '@step-wise/physics-data'

const boilingPressure = interpolateTable(new Quantity('100 dC'), saturatedSteamPropertiesByTemperature, 'boilingPressure')
const { enthalpy, entropy } = interpolateTableOutputs({ pressure: new Quantity('14 bar'), temperature: new Quantity('220 dC') }, superheatedSteamProperties)
```

The superheated table deliberately contains `undefined` regions where no source value is available. Interpolation outside a table or across an unavailable cell returns `undefined`.


## Refrigerant properties

`refrigerantDatasets` contains the available refrigerant datasets, currently `R134A`. A dataset combines its critical point, saturation table and pressure-specific property tables.

### Saturation curve

Use `getSaturationPressure` and `getSaturationTemperature` to move between corresponding saturation coordinates. The saturated-liquid and saturated-vapor helpers return complete `RefrigerantProperties` from either coordinate.

```ts
import { Quantity } from '@step-wise/physics-core'
import { getSaturatedLiquidPropertiesFromTemperature, getSaturatedVaporPropertiesFromPressure, refrigerantDatasets } from '@step-wise/physics-data'

const data = refrigerantDatasets.R134A
const liquid = getSaturatedLiquidPropertiesFromTemperature(data, new Quantity('0 dC'))
const vapor = getSaturatedVaporPropertiesFromPressure(data, new Quantity('2.928 bar'))
```

The corresponding pressure-based and temperature-based helpers are available for both saturation lines.

### Saturated mixtures

`getSaturatedMixturePropertiesFromTemperature` and `getSaturatedMixturePropertiesFromPressure` accept a dimensionless vapor fraction from zero through one.

```ts
import { Quantity } from '@step-wise/physics-core'
import { getSaturatedMixturePropertiesFromPressure, refrigerantDatasets } from '@step-wise/physics-data'

const mixture = getSaturatedMixturePropertiesFromPressure(refrigerantDatasets.R134A, new Quantity('2.928 bar'), new Quantity(0.4))
mixture?.phase // 'mixture'
mixture?.vaporFraction?.number // 0.4
```

A fraction of zero produces the saturated-liquid endpoint and a fraction of one produces the saturated-vapor endpoint. Values outside the physical range throw an error.

### Single-phase states and inverse lookup

`getRefrigerantPropertiesFromPressureAndTemperature` obtains a liquid or vapor state from pressure and temperature. A point exactly on the saturation curve is intentionally ambiguous and returns `undefined`; use a saturation-line or mixture function there instead.

`getRefrigerantPropertiesFromPressureAndEnthalpy` and `getRefrigerantPropertiesFromPressureAndEntropy` perform inverse lookup. They return a saturated mixture when the supplied property lies between the two saturation endpoints and otherwise search the supported liquid or vapor region.

```ts
import { Quantity } from '@step-wise/physics-core'
import { getRefrigerantPropertiesFromPressureAndEnthalpy, getRefrigerantPropertiesFromPressureAndTemperature, refrigerantDatasets } from '@step-wise/physics-data'

const data = refrigerantDatasets.R134A
const state = getRefrigerantPropertiesFromPressureAndTemperature(data, new Quantity('4 bar'), new Quantity('80 dC'))
const reconstructed = state && getRefrigerantPropertiesFromPressureAndEnthalpy(data, state.pressure, state.enthalpy)
```

Every refrigerant lookup returns `undefined` when its input lies outside the available dataset. The package does not extrapolate beyond tabulated ranges or above the supported critical region.


## Refrigerant types and table construction

The public `RefrigerantProperties` type contains `pressure`, `temperature`, `enthalpy`, `entropy` and a `phase` of `liquid`, `mixture` or `vapor`. Mixture results additionally provide `vaporFraction`.

The package also exports `CriticalPoint`, `RefrigerantPressureTable`, `RefrigerantPressureTables`, `RefrigerantDataset` and `createRefrigerantPressureTable`. These support defining further datasets with the same representation. Property grids and axes must use compatible `Quantity` values and obey the interpolation package's ordering and shape requirements.


## TypeScript

The package includes TypeScript declarations. Dataset structures are readonly, and table factories freeze their structural wrappers. Function results remain immutable `Quantity` values supplied by `@step-wise/physics-core`.
