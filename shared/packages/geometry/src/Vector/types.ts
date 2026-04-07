export const coordinateKeys = ['x', 'y', 'z'] as const
export type CoordinateKey = typeof coordinateKeys[number]

export type CoordinateObject1D = {
	x: number
}
export type CoordinateObject2D = {
	x: number
	y: number
}
export type CoordinateObject3D = {
	x: number
	y: number
	z: number
}
export type CoordinateObject = CoordinateObject1D | CoordinateObject2D | CoordinateObject3D
export type CoordinateList = number[]
export type VectorInput = CoordinateObject | CoordinateList
