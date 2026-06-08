export const numberPattern = '(-?((\\d+[.,]?\\d*)|(\\d*[.,]?\\d+)))'
export const timesPattern = '(\\s*\\*\\s*)'
export const tenPowerPattern = '(10\\^((\\((-?\\d+)\\))|(-?\\d+)))'
export const floatPattern = `(${numberPattern}${timesPattern}${tenPowerPattern}|${tenPowerPattern}|${numberPattern})`

export const numberRegex = new RegExp(`^${numberPattern}$`)
export const floatRegex = new RegExp(`^${floatPattern}$`)

export function isNumberString(str: string): boolean {
	return numberRegex.test(str)
}
