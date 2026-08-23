import { Prefix } from './Prefix'

export const prefixList = [
	new Prefix({ symbol: 'y', name: 'yocto', exponent: -24 }),
	new Prefix({ symbol: 'z', name: 'zepto', exponent: -21 }),
	new Prefix({ symbol: 'a', name: 'atto', exponent: -18 }),
	new Prefix({ symbol: 'f', name: 'femto', exponent: -15 }),
	new Prefix({ symbol: 'p', name: 'pico', exponent: -12 }),
	new Prefix({ symbol: 'n', name: 'nano', exponent: -9 }),
	new Prefix({ symbol: 'μ', aliases: 'mu', name: 'micro', exponent: -6 }),
	new Prefix({ symbol: 'm', name: 'milli', exponent: -3 }),
	new Prefix({ symbol: 'c', name: 'centi', exponent: -2 }),
	new Prefix({ symbol: 'd', name: 'deci', exponent: -1 }),
	new Prefix({ symbol: 'da', name: 'deca', exponent: 1 }),
	new Prefix({ symbol: 'h', name: 'hecto', exponent: 2 }),
	new Prefix({ symbol: 'k', name: 'kilo', exponent: 3 }),
	new Prefix({ symbol: 'M', name: 'mega', exponent: 6 }),
	new Prefix({ symbol: 'G', name: 'giga', exponent: 9 }),
	new Prefix({ symbol: 'T', name: 'tera', exponent: 12 }),
	new Prefix({ symbol: 'P', name: 'peta', exponent: 15 }),
	new Prefix({ symbol: 'E', name: 'exa', exponent: 18 }),
	new Prefix({ symbol: 'Z', name: 'zetta', exponent: 21 }),
	new Prefix({ symbol: 'Y', name: 'yotta', exponent: 24 }),
] as const

export const prefixes = Object.fromEntries(prefixList.map(prefix => [prefix.symbol, prefix])) as Record<string, Prefix>
