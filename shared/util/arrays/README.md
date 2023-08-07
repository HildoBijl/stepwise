# Array utility functions

All utility functions related to arrays are in this folder. These are grouped as follows.

## Evaluation functions

- [checks](./checks.js) has all functionalities inspecting a single array.
- [comparisons](./comparisons.js) has the functionalities where arrays are compared. Think of checking for matchings.

## Array analysis

- [reading](./reading.js) is about getting particular elements out of an array. Think of `lastOf`.
- [iteration](./iteration.js) is about walking through an array to calculate something. Like the `sum`, `product`, `count` or `cumulative` value.
- [finding](./finding.js) is about finding something in an array or optimizing a certain value.

## Array creation/manipulation

- [creation](./creation.js) is about setting up new arrays, like for instance the array `[1,2,3,4,5]`.
- [manipulation](./manipulation.js) is about adjusting arrays, like adding/removing elements, filtering duplicates and such.
- [shaping](./shaping.js) is about adjusting the shape, like flattening `[[1,[2,3]],4]` into `[1,2,3,4]` or doing the exact opposite.

## Specialized array functions

- [sorting](./sorting.js) is about sorting arrays in certain ways or doing the opposite: applying a shuffling.
- [multidimensional](./multidimensional.js) focus on higher-dimensional arrays, checking their dimensions and extracting terms based on indices.
