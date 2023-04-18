# Step-Wise front-end source code

This is where you find the source code of Step-Wise. There are four important directories.

- The [ui (user interface)](./ui) has all code related to the display of the website. Admittedly, this is 90% of the code.
- The [api (application programming interface)](./api) folder has all code, including useful hooks, to communicate with the server through its API. This includes queries, mutations and subscriptions.
- In the [util (utilities)](./util) directory you find tools useful for programming in general. Think of stuff that could form their own NPM package.
- The [tests](./tests) folder has all unit tests for the front-end. These tests are run upon uploading the code, and the website cannot be deployed unless they all pass.

Important is the inheritance order. In order, the folders are `util`, `api`, `ui` and `test`, where later folders may import things from earlier folders, but not the other way around, to prevent cyclic dependencies.
