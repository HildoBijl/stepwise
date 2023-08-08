import { isNumber } from 'step-wise/util'

// checkColor ensures that the given color is a color. If it's nothing sensible an error is thrown. If it's only an array of 3 it turns it into an array of 4 (adding default opacity). It returns the result, or the color itself if it's already fine. 
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
	const p = x => Math.round(x * 255)
	return `rgba(${p(color[0])}, ${p(color[1])}, ${p(color[2])}, ${color[3]})`
}

export function toHex(color) {
	color = checkColor(color)
	const p = x => Math.round(x * 255).toString(16).padStart(2, '0')
	return `${p(color[0])}${p(color[1])}${p(color[2])}`
}

// mix mixes two colors, taking "1 - part" of c1 and "part" of c2.
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

// shift is a combination of lighten (part from 0 to 1) and darken (part from -1 to 0). So shift(color, -0.4) is the same as darken(color, 0.4).
export function shift(color, part = 0) {
	if (part < 0)
		return darken(color, -part)
	return lighten(color, part)
}

export function lightenBasic(color, part = 0.5) {
	return mix(color, [1, 1, 1, 1], part)
}

export function darkenBasic(color, part = 0.5) {
	return mix(color, [0, 0, 0, 1], part)
}

export function lighten(color, part = 0.5) {
	color = checkColor(color)
	const mean = (color[0] + color[1] + color[2]) / 3
	if (mean <= 1e-15)
		return [part, part, part, color[3]]
	const scaledColor = color.map((v, i) => i === 3 ? v : v * (1 + (1 / mean - 1) * part))
	return redistributeColor(scaledColor)
}

export function darken(color, part = 0.5) {
	return invert(lighten(invert(color), part))
}

export function invert(color) {
	color = checkColor(color)
	return color.map((v, i) => i === 3 ? v : 1 - v)
}

function redistributeColor(color) {
	const max = Math.max(color[0], color[1], color[2])
	if (max <= 1)
		return color
	const mean = (color[0] + color[1] + color[2]) / 3
	if (mean >= 1)
		return [1, 1, 1, color[3]]
	const factor = (1 - mean) / (max - mean)
	const constant = 1 - factor * max
	return [constant + factor * color[0], constant + factor * color[1], constant + factor * color[2], color[3]]
}
