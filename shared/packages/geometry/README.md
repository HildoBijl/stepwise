# Geometry package

The Geometry package has functionalities for the positioning of objects in space. At its basis is the `Vector` class, and on top of this is a variety of classes that use the `Vector` class.

## Classes

The package has the following classes. Each of the classes may use the classes above it, but not vice versa.

- [Vector](./src/Vector/) deals with the position of a point in space. It supports Vectors in any dimension.
- [Matrix](./src/Matrix/) represents matrices. It includes functionalities like multiplication, transposing, etcetera.
- [Transformation](./src/Transformation/) is for affine transformations. It applies a linear transformation relative to a given point.
- [Line](./src/Line/) represents an infinite-length line. It is defined by a starting point and a direction, but any starting point on the same line is considered an equivalent line.
- [LineSegment](./src/LineSegment/) represents a segment of a line: from one point to another. It is defined by the start and the end. This can also be used for vectors positioned in space.
- [Rectangle](./src/Rectangle/) is for axis-aligned rectangles. It is defined by two points, and the rectangle whose surfaces align with the axis is extrapolated from these points.
