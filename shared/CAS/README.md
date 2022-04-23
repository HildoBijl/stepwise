# CAS: Computer Algebra System

The Step-Wise CAS handles mathematical expressions, equations and such.


## Loading it in and basic usage

Important functions to load in are `asExpression` and `asEquation`. They can be loaded in in two ways.

### Loading in specific parts

The preferred method is to only load in what you need.

```
import { asExpression, asEquation } from 'step-wise/CAS'
const exp = asExpression('sin(2x)')
const equ = asEquation('a^2+b^2=c^2')
```

### Loading in the entire CAS

The alternative method is to load in the entire CAS. This is useful for testing: by inspecting the CAS object, you can see what other options exist. (Or read this documentation.)

```
import CAS from 'step-wise/CAS'
const exp = CAS.asExpression('sin(2x)')
const equ = CAS.asEquation('a^2+b^2=c^2')
```


## Functionality

The functions `asExpression` and `asEquation` turn a string into an `Expression` and `Equation` object, respectively. These objects have a large variety of functionalities. See the [Functionalities ReadMe](functionalities) for further information.

Are you not sure whether you already have an `Expression`/`Equation` object or just a string? In that case, load in the functions `ensureExpression` and/or `ensureEquation`. They will take an object, string or similar and will try to turn it into an Expression/Equation, or upon failure throw an error.


## Interpretation

The CAS can turn a variety of strings/objects into functional objects. All the details of this are explained in the [Interpretation ReadMe](interpretation).
