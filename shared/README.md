# Shared folder

The shared folder contains all code that is needed by both the front-end and the back-end (API). This includes:

- **data**: think of physics constants and similar.
- **[edu](edu/)**: educational resources. All data concerning skills and exercises can be found in here.
- **[inputTypes](inputTypes/)**: functions to properly process input. For example, if a user enters a unit, you will find functions to process that unit here.
- **[skillTracking](skillTracking/)**: probability theory methods to track how well a user has mastered a skill.
- **util**: utility javascript functions, like custom array functions, object processing and much more.

In both the front-end and API folders this package is known as `step-wise` so you can use imports like `import { something } from 'step-wise/edu` for the front-end or `const { something } = require('step-wise/edu')` for the API.