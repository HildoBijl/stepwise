export type RgbColor = [number, number, number]
export type RgbaColor = [number, number, number, number]
export type ColorInput = RgbColor | RgbaColor

function ensureColor(color: ColorInput): RgbaColor {
	if (!Array.isArray(color)) throw new Error(`Invalid color: received a color that was not an array but had type "${typeof color}".`)
	if (color.length < 3 || color.length > 4) throw new Error(`Invalid color: received a color that was an array of length ${color.length}. It must be 3 (RGB) or 4 (RGBA).`)
	if (color.some(value => typeof value !== 'number' || !Number.isFinite(value))) throw new Error(`Invalid color: received a color containing a value that was not a finite number. Its value was [${color.join(', ')}].`)
	if (color.some(value => value < 0 || value > 1)) throw new Error(`Invalid color: received a color that had a value not within the interval [0, 1]. Its value was [${color.join(', ')}].`)
	if (color.length === 4) return color
	return [...color, 1]
}

export function colorToCss(color: ColorInput): string {
	const [red, green, blue, alpha] = ensureColor(color)
	const toByte = (value: number) => Math.round(value * 255)
	return `rgba(${toByte(red)}, ${toByte(green)}, ${toByte(blue)}, ${alpha})`
}

export function colorToHex(color: ColorInput): string {
	const [red, green, blue] = ensureColor(color)
	const toHexByte = (value: number) => Math.round(value * 255).toString(16).padStart(2, '0')
	return `${toHexByte(red)}${toHexByte(green)}${toHexByte(blue)}`
}

export function mixColors(color1: ColorInput, color2: ColorInput, part = 0.5): RgbaColor {
	const first = ensureColor(color1)
	const second = ensureColor(color2)
	ensureColorPart(part)
	return first.map((value, index) => (1 - part) * value + part * second[index]!) as RgbaColor
}

export function shiftColorBrightness(color: ColorInput, part = 0): RgbaColor {
	if (typeof part !== 'number' || !Number.isFinite(part) || part < -1 || part > 1) throw new RangeError(`Invalid color shift: expected a finite number between -1 and 1 but received ${String(part)}.`)
	return part < 0 ? darken(color, -part) : lighten(color, part)
}

function lighten(color: ColorInput, part: number): RgbaColor {
	const checkedColor = ensureColor(color)
	const mean = (checkedColor[0] + checkedColor[1] + checkedColor[2]) / 3
	if (mean <= 1e-15) return [part, part, part, checkedColor[3]]
	const scaledColor = checkedColor.map((value, index) => index === 3 ? value : value * (1 + (1 / mean - 1) * part)) as RgbaColor
	return redistributeColor(scaledColor)
}

function darken(color: ColorInput, part: number): RgbaColor {
	return invert(lighten(invert(color), part))
}

function invert(color: ColorInput): RgbaColor {
	return ensureColor(color).map((value, index) => index === 3 ? value : 1 - value) as RgbaColor
}

function ensureColorPart(part: number): void {
	if (typeof part !== 'number' || !Number.isFinite(part) || part < 0 || part > 1)
		throw new RangeError(`Invalid color mixture: expected a finite number between 0 and 1 but received ${String(part)}.`)
}

function redistributeColor(color: RgbaColor): RgbaColor {
	const max = Math.max(color[0], color[1], color[2])
	if (max <= 1) return color
	const mean = (color[0] + color[1] + color[2]) / 3
	if (mean >= 1) return [1, 1, 1, color[3]]
	const factor = (1 - mean) / (max - mean)
	const constant = 1 - factor * max
	return [constant + factor * color[0], constant + factor * color[1], constant + factor * color[2], color[3]]
}
