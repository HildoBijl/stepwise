# Object utility functions

All utility functions related to objects are in this folder. These are grouped as follows.

## Evaluation functions

- [checks](./checks.js) has all functionalities inspecting a single object.
- [comparisons](./comparisons.js) has the functionalities where objects are compared. Think of a `deepEquals`.

## Usage functions

- [reading](./reading.js) has functions that read objects. Think of extracting a parameter while using a fallback.
- [creation](./creation.js) revolves around making objects out of various parameters. Think of turning two arrays (keys and values) into an object.
- [manipulation](./manipulation.js) will do something with objects. Fundamentally, there is the mapping, but there are also various other functions. Note that these functions never change the original object: they always return a copy.
