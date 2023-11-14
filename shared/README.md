# Shared folder

The shared folder contains all code that is needed by both the front-end and the back-end (API). This includes:

- **[util](util/)**: utility javascript functions, like custom array functions, object processing and much more.
- **[settings](settings/)**: site-wide settings, important to both the front-end and the back-end.
- **[CAS](CAS/)**: the Computer Algebra System used by Step-Wise, designed and developed internally.
- **[geometry](geometry/)**: objects to process geometry-like functions, like `Vector`, `Line` and such.
- **[skillTracking](skillTracking/)**: probability theory methods to track how well a user has mastered a skill.
- **[inputTypes](inputTypes/)**: functions to properly process input. For example, if a user enters a unit, you will find functions to process that unit here.
- **[data](data/)**: data sets to load in, like physics constants and similar.
- **[eduTools](eduTools/)**: all tools related to education. Think of functions related to skills and exercises.
- **[eduContent](eduContent/)**: all educational content. Think of skills and their exercises. That is, functions needed by both the front-end end the back-end, like grading functions.

In both the front-end and API folders this package is known as `step-wise` so you can use imports like `import { something } from 'step-wise/util` for the front-end or `const { something } = require('step-wise/util')` for the API.