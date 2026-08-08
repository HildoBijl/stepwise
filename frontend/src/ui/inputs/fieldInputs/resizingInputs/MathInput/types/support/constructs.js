export const constructParts = {
	Fraction: ['numerator', 'denominator'],
	SquareRoot: ['radicand'],
	Root: ['degree', 'radicand'],
	Logarithm: ['base'],
	SubSup: ['subscript', 'superscript'],
}

export function getConstructPartNames(element) {
	const parts = constructParts[element.type]
	if (!parts) throw new Error(`Invalid construct type: cannot find editable parts for "${element.type}".`)
	return parts.filter(part => element[part] !== undefined)
}

export function getConstructPart(element, part) {
	const value = element[part]
	if (element.type === 'SubSup' && part === 'subscript') return { type: 'SubscriptText', value }
	return { type: 'Expression', value }
}

export function getFirstConstructPart(element, backwards = false) {
	const parts = getConstructPartNames(element)
	return backwards ? parts[parts.length - 1] : parts[0]
}

export function createConstruct(type, alias, parameters = []) {
	const values = parameters.map(parameter => parameter.value)
	if (type === 'Fraction') return { type, alias, numerator: values[0], denominator: values[1] }
	if (type === 'SquareRoot') return { type, alias, radicand: values[0] }
	if (type === 'Root') return { type, alias, degree: values[0], radicand: values[1] }
	if (type === 'Logarithm') return { type, alias, base: values[0] }
	throw new Error(`Invalid construct creation: no creation mapping exists for "${type}".`)
}
