# Interpolation utility functions

All utility functions related to interpolation are in this folder. These are grouped as follows.

- [support](./support.js) has important fundamental functions, like checking if objects are suitable for interpolation, getting the interpolation part, and more.
- [rangeInterpolation](./rangeInterpolation.js) concerns itself with interpolation between two numbers. This can also be multi-dimensional: in 2D (a square of numbers), in 3D (a cube of numbers) and so on.
- [gridInterpolation](./gridInterpolation.js) extends the above by allowing interpolations in grids. Given an input (like `5`), an input list (like `[4,6,8,10]`) and an output list (like `[16,36,64,100]`) it finds the right range and linearly interpolates there (here giving `26`).
- [tableInterpolation](./tableInterpolation.js) extends the above by allowing for tables. A table is an object of the form `{ labels: ['x', 'y'], headers: [[1,2,3],[1,2,3]], grid: [[2,5,10],[5,8,13],[10,13,18]] }` for an example of a 2D table having the values of `x^2 + y^2`. Note that this table can have any desired dimension (1D, 2D, 3D, ...).
