import { reducePowersWithZeroExponent } from './reducePowersWithZeroExponent'
import { reducePowersWithZeroBase } from './reducePowersWithZeroBase'
import { removeOneExponentsFromPowers } from './removeOneExponentsFromPowers'
import { reducePowersWithOneBase } from './reducePowersWithOneBase'
import { mergePowerMinuses } from './mergePowerMinuses'
import { reduceNumberPowers } from './reduceNumberPowers'
import { removePowersWithinPowers } from './removePowersWithinPowers'
import { convertNegativePowers } from './convertNegativePowers'
import { expandPowers } from './expandPowers'
import { expandPowersOfProducts } from './expandPowersOfProducts'
import { expandPowersOfFractions } from './expandPowersOfFractions'
import { expandPowersOfSums } from './expandPowersOfSums'

export const powerRules = {
	reducePowersWithZeroExponent,
	reducePowersWithZeroBase,
	removeOneExponentsFromPowers,
	reducePowersWithOneBase,
	mergePowerMinuses,
	reduceNumberPowers,
	removePowersWithinPowers,
	convertNegativePowers,
	expandPowers,
	expandPowersOfProducts,
	expandPowersOfFractions,
	expandPowersOfSums,
}
