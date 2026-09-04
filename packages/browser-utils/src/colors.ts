import { ensureNumeric } from '@step-wise/js-utils'

export type Color = [number, number, number, number]
export type ColorInput = [number, number, number] | Color

export function checkColor(color: ColorInput): Color {
	if (!Array.isArray(color)) throw new Error(`Invalid color: received a color that was not an array but had type "${typeof color}".`)
	if (color.length < 3 || color.length > 4) throw new Error(`Invalid color: received a color that was an array of length ${color.length}. It must be 3 (RGB) or 4 (RGBA).`)
	if (color.some(value => value < 0 || value > 1)) throw new Error(`Invalid color: received a color that had a value not within the interval [0, 1]. Its value was [${color.join(', ')}].`)
	if (color.length === 4) return color
	return [...color, 1]
}

export function toCSS(color: ColorInput): string {
	const [red, green, blue, alpha] = checkColor(color)
	const toByte = (value: number) => Math.round(value * 255)
	return `rgba(${toByte(red)}, ${toByte(green)}, ${toByte(blue)}, ${alpha})`
}

export function toHex(color: ColorInput): string {
	const [red, green, blue] = checkColor(color)
	const toHexByte = (value: number) => Math.round(value * 255).toString(16).padStart(2, '0')
	return `${toHexByte(red)}${toHexByte(green)}${toHexByte(blue)}`
}

export function mix(color1: ColorInput, color2: ColorInput, part = 0.5): Color {
	const first = checkColor(color1)
	const second = checkColor(color2)
	part = ensureNumeric(part)
	if (part < 0 || part > 1) throw new Error(`Invalid input: expected the part of the color mixing to be a number between 0 and 1 but received ${part}.`)
	return first.map((value, index) => (1 - part) * value + part * second[index]!) as Color
}

export function shift(color: ColorInput, part = 0): Color {
	return part < 0 ? darken(color, -part) : lighten(color, part)
}

export function lightenBasic(color: ColorInput, part = 0.5): Color {
	return mix(color, [1, 1, 1, 1], part)
}

export function darkenBasic(color: ColorInput, part = 0.5): Color {
	return mix(color, [0, 0, 0, 1], part)
}

export function lighten(color: ColorInput, part = 0.5): Color {
	const checkedColor = checkColor(color)
	const mean = (checkedColor[0] + checkedColor[1] + checkedColor[2]) / 3
	if (mean <= 1e-15) return [part, part, part, checkedColor[3]]
	const scaledColor = checkedColor.map((value, index) => index === 3 ? value : value * (1 + (1 / mean - 1) * part)) as Color
	return redistributeColor(scaledColor)
}

export function darken(color: ColorInput, part = 0.5): Color {
	return invert(lighten(invert(color), part))
}

export function invert(color: ColorInput): Color {
	return checkColor(color).map((value, index) => index === 3 ? value : 1 - value) as Color
}

function redistributeColor(color: Color): Color {
	const max = Math.max(color[0], color[1], color[2])
	if (max <= 1) return color
	const mean = (color[0] + color[1] + color[2]) / 3
	if (mean >= 1) return [1, 1, 1, color[3]]
	const factor = (1 - mean) / (max - mean)
	const constant = 1 - factor * max
	return [constant + factor * color[0], constant + factor * color[1], constant + factor * color[2], color[3]]
}
