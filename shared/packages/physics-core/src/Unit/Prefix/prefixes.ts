import { Prefix } from './Prefix'

export const prefixList = [
	new Prefix({ letter: 'y', name: 'yocto', exponent: -24 }),
	new Prefix({ letter: 'z', name: 'zepto', exponent: -21 }),
	new Prefix({ letter: 'a', name: 'atto', exponent: -18 }),
	new Prefix({ letter: 'f', name: 'femto', exponent: -15 }),
	new Prefix({ letter: 'p', name: 'pico', exponent: -12 }),
	new Prefix({ letter: 'n', name: 'nano', exponent: -9 }),
	new Prefix({ letter: 'μ', alternatives: 'mu', name: 'micro', exponent: -6 }),
	new Prefix({ letter: 'm', name: 'milli', exponent: -3 }),
	new Prefix({ letter: 'c', name: 'centi', exponent: -2 }),
	new Prefix({ letter: 'd', name: 'deci', exponent: -1 }),
	new Prefix({ letter: 'da', name: 'deca', exponent: 1 }),
	new Prefix({ letter: 'h', name: 'hecto', exponent: 2 }),
	new Prefix({ letter: 'k', name: 'kilo', exponent: 3 }),
	new Prefix({ letter: 'M', name: 'mega', exponent: 6 }),
	new Prefix({ letter: 'G', name: 'giga', exponent: 9 }),
	new Prefix({ letter: 'T', name: 'tera', exponent: 12 }),
	new Prefix({ letter: 'P', name: 'peta', exponent: 15 }),
	new Prefix({ letter: 'E', name: 'exa', exponent: 18 }),
	new Prefix({ letter: 'Z', name: 'zetta', exponent: 21 }),
	new Prefix({ letter: 'Y', name: 'yotta', exponent: 24 }),
] as const

export const prefixes = Object.fromEntries(prefixList.map(prefix => [prefix.letter, prefix])) as Record<string, Prefix>
