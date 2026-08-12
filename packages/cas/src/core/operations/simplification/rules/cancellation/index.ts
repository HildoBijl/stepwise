import { defineRuleRegistry } from '../ruleDefinition'

import { removeZeroesFromSums } from './removeZeroesFromSums'
import { reduceProductsWithZero } from './reduceProductsWithZero'
import { removeOnesFromProducts } from './removeOnesFromProducts'
import { reduceFractionsWithZeroNumerator } from './reduceFractionsWithZeroNumerator'
import { reduceFractionsWithOneDenominator } from './reduceFractionsWithOneDenominator'
import { reducePowersWithZeroExponent } from './reducePowersWithZeroExponent'
import { reducePowersWithZeroBase } from './reducePowersWithZeroBase'
import { removeOneExponentsFromPowers } from './removeOneExponentsFromPowers'
import { reducePowersWithOneBase } from './reducePowersWithOneBase'
import { reduceRootsWithZeroRadicand } from './reduceRootsWithZeroRadicand'
import { reduceRootsWithOneRadicand } from './reduceRootsWithOneRadicand'
import { reduceRootsWithOneDegree } from './reduceRootsWithOneDegree'
import { reduceLogarithmsWithOneArgument } from './reduceLogarithmsWithOneArgument'
import { reduceLogarithmsWithBaseArgument } from './reduceLogarithmsWithBaseArgument'
import { cancelSumTerms } from './cancelSumTerms'
import { cancelFractionFactors } from './cancelFractionFactors'
import { reduceCanceledRoots } from './reduceCanceledRoots'
import { reducePowersInRoots } from './reducePowersInRoots'

export const cancellationRules = defineRuleRegistry(removeZeroesFromSums, reduceProductsWithZero, removeOnesFromProducts, reduceFractionsWithZeroNumerator, reduceFractionsWithOneDenominator, reducePowersWithZeroExponent, reducePowersWithZeroBase, removeOneExponentsFromPowers, reducePowersWithOneBase, reduceRootsWithZeroRadicand, reduceRootsWithOneRadicand, reduceRootsWithOneDegree, reduceLogarithmsWithOneArgument, reduceLogarithmsWithBaseArgument, cancelSumTerms, cancelFractionFactors, reduceCanceledRoots, reducePowersInRoots)
export { removeZeroesFromSums, reduceProductsWithZero, removeOnesFromProducts, reduceFractionsWithZeroNumerator, reduceFractionsWithOneDenominator, reducePowersWithZeroExponent, reducePowersWithZeroBase, removeOneExponentsFromPowers, reducePowersWithOneBase, reduceRootsWithZeroRadicand, reduceRootsWithOneRadicand, reduceRootsWithOneDegree, reduceLogarithmsWithOneArgument, reduceLogarithmsWithBaseArgument, cancelSumTerms, cancelFractionFactors, reduceCanceledRoots, reducePowersInRoots }
