// filterToInteger takes a string and filters out all non-numeric characters, resulting in an integer. A leading minus sign is allowed, except if positive is set to true, in which case that is filtered out too.
export function filterToInteger(str, positive = false) {
	const result = str.replace(/[^0-9]/g, '')
	if (str[0] === '-' && !positive)
		return `-${result}`
	return result
}