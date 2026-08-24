# @step-wise/geometry

`@step-wise/geometry` provides immutable geometry primitives for vectors, infinite lines, line segments, axis-aligned rectangles, matrices and affine transformations. It supports arbitrary dimensions where the relevant operation is dimension-independent, with specialized two- and three-dimensional functionality where needed.


## Installation

```bash
npm install @step-wise/geometry
```


## Quick start

```ts
import { Line, Rectangle, Transformation, Vector } from '@step-wise/geometry'

const direction = new Vector(3, 4)
direction.magnitude // 5

const line = Line.fromPoints([0, 0], [4, 2])
line.containsPoint([2, 1]) // true

const bounds = new Rectangle([0, 0], [10, 5])
bounds.clampPoint([12, 3]).coordinates // [10, 3]

const rotation = Transformation.fromRotation(Math.PI / 2)
rotation.transform([1, 0]).coordinates // approximately [0, 1]
```

All geometry objects are immutable. Operations return new objects, and arrays returned by properties such as `coordinates` and `rows` are defensive copies.


## Vectors

`Vector` represents coordinates or a displacement in any positive dimension. Construct one from positional coordinates, a coordinate array, a coordinate object or another vector.

```ts
import { Vector } from '@step-wise/geometry'

const a = new Vector(3, 4)
const b = new Vector([1, 2])
const c = new Vector({ x: 1, y: 2, z: 3 })

a.add(b).coordinates // [4, 6]
a.normalize().magnitude // 1
a.dotProduct(b) // 11
```

Vectors expose `dimension`, `magnitude`, `squaredMagnitude` and coordinate access through `x`, `y`, `z` or `getCoordinate(index)`. The `angle` property gives the counterclockwise angle of a two-dimensional vector in radians.

Arithmetic includes `negate`, `add`, `subtract`, `multiply`, `divide`, `interpolate`, `normalize`, `setMagnitude`, `shorten` and `round`. Products and decomposition are available through `dotProduct`, `crossProduct`, `projectOnto` and `orthogonalComponent`. In two dimensions, `crossProduct` returns the scalar z-component; in three dimensions, it returns a vector.

Use `equals`, `hasEqualMagnitude`, `hasSameDirection` and `isOrthogonalTo` for tolerant geometric comparisons. Direction operations reject the zero vector when no meaningful direction exists.

`Vector.getZero(dimension)`, `Vector.getUnitVector(axis, dimension)` and `Vector.fromPolar(magnitude, angle)` create common vectors. The constants `Vector.zero`, `Vector.i`, `Vector.j` and their three-dimensional equivalents are also available.


## Lines

`Line` represents an infinite line through a start point and a non-zero direction. Lines with different start points or direction magnitudes can still be geometrically equal.

```ts
import { Line } from '@step-wise/geometry'

const line = new Line([1, 1], [2, 1])

line.getPointAtFactor(2).coordinates // [5, 3]
line.containsPoint([5, 3]) // true
line.getClosestPoint([1, 3]).coordinates // [1.8, 1.4]
```

Use `getPointAtCoordinate` and `getFactorAtCoordinate` to move between a coordinate value and the line factor, or `getClosestPointFactor` to obtain the factor of a projection. `getClosestPoint`, `getDistanceFrom` and `getSquaredDistanceFrom` measure a point relative to the line.

`equals` compares the geometric line and optionally requires the same direction. `isOrthogonalTo`, `intersects` and `getIntersection` compare lines. Unique line intersections are currently calculated only in two dimensions; parallel and coincident lines return `null` from `getIntersection` because they have no unique intersection.

Factories include `fromPoints`, `fromAngleAndDistance`, `fromPointAndAngle`, `getAxisLineThrough`, `getHorizontalThrough` and `getVerticalThrough`. `normalize` produces the canonical line with a unit direction and the closest start point to the origin, while `reverse` reverses its direction.


## Line segments

`LineSegment` represents the finite interval between two points. It can be constructed from `start` and `end`, `start` and `vector`, or `end` and `vector`.

```ts
import { LineSegment } from '@step-wise/geometry'

const segment = new LineSegment({ start: [1, 2], vector: [3, 4] })

segment.end.coordinates // [4, 6]
segment.midpoint.coordinates // [2.5, 4]
segment.hasEndpoint([1, 2]) // true
```

Use `sharesEndpointWith`, `liesOnLine`, `isCollinearWith` and `isOrthogonalTo` for geometric relationships. `equals` distinguishes endpoint order unless `allowReverse` is enabled. A zero-length segment is valid as a point, although requesting its infinite `line` throws because it has no direction.

`reverse`, `round`, `add` and `subtract` return transformed segments without changing the original.


## Rectangles

`Rectangle` represents an axis-aligned box in any dimension. The constructor accepts two corners in either order or an object containing any consistent two of `min`, `max` and `size`.

```ts
import { Rectangle } from '@step-wise/geometry'

const rectangle = new Rectangle([4, 3], [0, 0])

rectangle.min.coordinates // [0, 0]
rectangle.size.coordinates // [4, 3]
rectangle.midpoint.coordinates // [2, 1.5]
rectangle.containsPoint([1, 2]) // true
```

Use `getBounds(axis)`, `bounds`, `getSize(axis)` and `size` for dimension-independent inspection. Two-dimensional rectangles additionally expose `width`, `height`, side coordinates and named points such as `topLeft`, `middleRight` and `bottomMiddle`.

`containsPoint` includes the boundary, while `isPointOnBoundary` checks the boundary specifically. `clampPoint` returns the nearest point inside the rectangle; `{ forceBoundary: true }` moves an internal point to its nearest boundary. `getDistanceToPoint` normally returns zero for an internal point, while `{ toBoundary: true }` measures to the nearest boundary instead.

`containsCircle` requires the complete circle to lie inside the rectangle. `intersectsCircle` checks whether the two shapes share any point, including full containment in either direction. The corresponding segment operations are `containsLineSegment` and `intersectsLineSegment`.

`getLineIntersection` clips an infinite line to the rectangle and returns the enclosed line segment, or `undefined` when there is no intersection. A tangent line produces a zero-length segment at the touching point.


## Matrices

`Matrix` represents a non-empty rectangular matrix with equally sized rows. Matrix data is copied on construction and whenever `rows` is requested.

```ts
import { Matrix, Vector } from '@step-wise/geometry'

const matrix = new Matrix([[1, 2], [3, 4]])

matrix.rowCount // 2
matrix.columnCount // 2
matrix.multiply(new Vector(2, 1)).coordinates // [4, 10]
matrix.determinant // -2
```

Matrices support `add`, `subtract`, scalar division and multiplication by scalars, vectors or compatible matrices. Use `transpose`, `trace`, `determinant`, `getMinor`, `adjugate` and `inverse` for common matrix operations.

The predicates `isSquare`, `isZero`, `isIdentity`, `isDiagonal`, `isMonomial` and `isInvertible` describe matrix structure. Following the conventional definition, a diagonal matrix requires zero off-diagonal entries but may contain zero diagonal entries.

Factories include `getZero`, `getIdentity`, `fromDiagonal`, `fromColumnVector`, `fromColumns` and `fromRows`. Invalid dimensions, incompatible multiplication and inversion of singular matrices throw.


## Transformations

`Transformation` represents an affine transformation of the form `A * x + b`, where `A` is a square matrix and `b` is a translation vector. Omitting the translation uses the zero vector.

```ts
import { Transformation } from '@step-wise/geometry'

const transformation = new Transformation([[2, 0], [0, 3]], [1, 2])

transformation.transform([2, 4]).coordinates // [5, 14]
transformation.transform([2, 4], { applyTranslation: false }).coordinates // [4, 12]
```

`transform` accepts vectors, lines, line segments and axis-aligned rectangles. A rectangle can only be transformed by a monomial matrix, because rotations and shears generally do not preserve its axis-aligned representation.

Use `then(next)` to compose transformations in application order, `inverse` to reverse an invertible transformation and `around(point)` to apply it relative to a point. For instance, applying a scale around a point keeps that point fixed.

Factories include `getIdentity`, `fromTranslation`, `fromScale`, `fromUniformScale`, `fromRotation` and `fromHyperplaneReflection`. Rotation angles are measured in radians. `fromHyperplaneReflection(normal)` reflects across the hyperplane perpendicular to the supplied non-zero normal vector; in two dimensions, the default normal `[1, 0]` therefore reflects across the y-axis.


## Validation and convenient inputs

Constructors accept their class instances as well as the corresponding array or object input forms. The package exports `isVectorLike`, `isLineLike`, `isLineSegmentLike`, `isRectangleLike`, `isMatrixLike`, `isTransformationLike` and `isTransformable` for checking unknown values.

The matching `ensureVector`, `ensureLine`, `ensureLineSegment`, `ensureRectangle`, `ensureMatrix` and `ensureTransformation` functions construct the relevant class and optionally enforce constraints such as dimension, shape, non-zero vectors or invertibility.

```ts
import { ensureMatrix, ensureTransformation, ensureVector } from '@step-wise/geometry'

ensureVector([1, 2], { dimension: 2, nonZero: true })
ensureMatrix([[1, 0], [0, 1]], { rowCount: 2, columnCount: 2 })
ensureTransformation([[1, 0], [0, 1]], { dimension: 2, invertible: true })
```

`ensureVectorArray` validates a complete vector array with optional dimension and length requirements. `ensureCorner` validates three equally dimensioned points. `ensureSquareMatrix` provides the common square-matrix constraint directly.


## Serialization

Every class provides `toStorageValue()` and a matching static `fromStorageValue()` for its compact nested storage representation. The package also exports `serializeVector`, `serializeLine`, `serializeLineSegment`, `serializeRectangle`, `serializeMatrix` and `serializeTransformation`, together with their matching `deserialize...` functions.

```ts
import { Vector, deserializeVector, serializeVector } from '@step-wise/geometry'

const serialized = serializeVector(new Vector(1, 2))
// { type: 'Vector', value: [1, 2] }

deserializeVector(serialized)
```

Serialized objects contain an explicit `type` discriminator. Deserialization validates the complete structure and rejects missing, additional or malformed data.


## Errors and constraints

Operations require compatible dimensions and throw when a result is undefined or unsupported, such as normalizing a zero vector, dividing by zero, requesting a unique point along an unchanging line coordinate, inverting a singular matrix or applying a non-axis-preserving transformation to a rectangle.

Geometric equality and boundary checks account for ordinary floating-point noise. This tolerance is intended for calculation artifacts and does not make meaningfully different points or shapes equal.


## TypeScript

The package includes TypeScript declarations for its public classes, accepted input shapes, storage values and serialized objects. Public class state is exposed through readonly accessors, and all operations preserve immutability.
