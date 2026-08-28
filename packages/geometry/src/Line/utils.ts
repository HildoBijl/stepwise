import { isLineInput } from './support.ts'
import { type LineLike, Line } from './Line.ts'

export function isLineLike(value: unknown): value is LineLike {
	return value instanceof Line || isLineInput(value)
}

export function ensureLine(line: LineLike, options: { dimension?: number } = {}): Line {
	const ensuredLine = new Line(line)
	if (options.dimension !== undefined && ensuredLine.dimension !== options.dimension) throw new Error(`Invalid Line dimension: expected a Line of dimension ${options.dimension} but received one of dimension ${ensuredLine.dimension}.`)
	return ensuredLine
}
