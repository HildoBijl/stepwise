# Function utility functions

All utility functions related to functions are in this folder. These are grouped as follows.

- [fundamentals](./fundamentals.js) has the main functionalities, like checking if something is a function, as well as some standard often-used functions (`noop`, `passOn`).
- [repeating](./repeating.js) is useful if you want a function to be called multiple times. Use for instance `repeat(20, (index) => 3*index)` to get an array `[0, 3, 6, ...]` or just to execute something twenty times.
- [applications](./applications.js) has more advanced applications, like joining functions or resolving functions in an array/object.
