// Make the first character of a string lowercase.
export function lowerFirst(str: string): string {
	if (str === '') return str
	return `${str[0].toLowerCase()}${str.slice(1)}`
}

// Make the first character of a string uppercase.
export function upperFirst(str: string): string {
	if (str === '') return str
	return `${str[0].toUpperCase()}${str.slice(1)}`
}

// Remove all whitespace from a string.
export function removeWhitespace(str: string): string {
	return str.replace(/\s+/g, '')
}

// Remove characters at a given index.
export function removeAt(str: string, index: number, length = 1): string {
	return str.slice(0, index) + str.slice(index + length)
}

// Insert a string at a given index.
export function insertAt(str: string, index = 0, insertion = ''): string {
	return str.slice(0, index) + insertion + str.slice(index)
}

// Convert camelCase to kebab-case.
export function camelToKebab(str: string): string {
	if (str === '') return str
	return lowerFirst(str).replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
}
