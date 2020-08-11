import { isNumber } from 'step-wise/util/numbers'


export function checkColor(color) {
	// Check input.
	if (!Array.isArray(color))
		throw new Error(`Invalid color: received a color that was not an array but had type "${typeof color}".`)
	if (color.length < 3 || color.length > 4)
		throw new Error(`Invalid color: received a color that was an array of length ${color.length}. It must be 3 (RGB) or 4 (RGBA).`)
	if (color.some(x => x < 0 || x > 1))
		throw new Error(`Invalid color: received a color that had a value not within the interval [0, 1]. Its value was [${color.join(', ')}].`)

	// Add an alpha of 1 if needed.
	if (color.length === 4)
		return color
	return [...color, 1]
}

export function toCSS(color) {
	color = checkColor(color)
	const p = x => Math.round(x*255)
	return `rgba(${p(color[0])}, ${p(color[1])}, ${p(color[2])}, ${color[3]})`
}

// This function mixes two colors, taking "1 - part" of c1 and "part" of c2.
export function mix(c1, c2, part = 0.5) {
	// Check input.
	c1 = checkColor(c1)
	c2 = checkColor(c2)
	if (!isNumber(part))
		throw new Error(`Invalid input: expected the part of the color mixing to be a number but received an object of type "${typeof part}".`)
	part = parseFloat(part)
	if (part < 0 || part > 1)
		throw new Error(`Invalid input: expected the part of the color mixing to be a number between 0 and 1 but received ${part}.`)

	// Calculate.
	return c1.map((_, i) => (1 - part) * c1[i] + part * c2[i])
}

export function lighten(color, part = 0.5) {
	return mix(color, [1, 1, 1, 1], part)
}

export function darken(color, part = 0.5) {
	return mix(color, [0, 0, 0, 1], part)
}