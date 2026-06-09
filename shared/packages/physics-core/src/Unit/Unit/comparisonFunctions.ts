import { type UnitLike, asUnit } from './Unit'

// Same written units, allowing only reordering/combining like 'm * s' = 's * m'.
export function unitsEqual(a: UnitLike, b: UnitLike): boolean {
	return asUnit(a).equals(b, { target: 'none', checkSize: true })
}

// Same physical unit including scale, like 'N' = 'kg * m / s^2', but 'km' ≠ 'm'.
export function unitsEquivalent(a: UnitLike, b: UnitLike): boolean {
	return asUnit(a).equals(b, { target: 'base', checkSize: true })
}

// Same physical dimension, but ignoring scale like 'km' ≈ 'm' and 'bar' ≈ 'Pa'.
export function unitsSimilar(a: UnitLike, b: UnitLike): boolean {
	return asUnit(a).equals(b, { target: 'base', checkSize: false })
}
