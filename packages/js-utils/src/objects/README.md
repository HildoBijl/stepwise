# Object utility functions

All utility functions related to objects are in this folder. These are grouped as follows.

## Evaluation functions

- [checks](./checks.ts) has all functionalities inspecting a single object.
- [comparisons](./comparisons.ts) has the functionalities where objects are compared. Think of a `deepEqual`.

## Usage functions

- [nesting](./nesting.ts) has functions for reading and immutably setting values at nested object paths.
- [creation](./creation.ts) revolves around making objects out of various parameters. Think of turning two arrays (keys and values) into an object.
- [manipulation](./manipulation.ts) will do something with objects. Fundamentally, there is the mapping, but there are also various other functions. These functions never change the original object: they always return a copy.
