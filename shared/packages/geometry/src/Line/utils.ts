import { isLineInput } from './support'
import { type LineLike, Line } from './Line'

export function isLineLike(value: unknown): value is LineLike {
	return value instanceof Line || isLineInput(value)
}

export function ensureLine(line: LineLike, dimension?: number): Line {
	const ensuredLine = new Line(line)
	if (dimension !== undefined && ensuredLine.dimension !== dimension) throw new Error(`Invalid Line dimension: expected a Line of dimension ${dimension} but received one of dimension ${ensuredLine.dimension}.`)
	return ensuredLine
}
