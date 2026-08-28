import { defineRuleRegistry } from '../ruleDefinition.ts'

import { removeZeroesFromSums } from './removeZeroesFromSums.ts'
import { simplifyZeroProducts } from './simplifyZeroProducts.ts'
import { removeOnesFromProducts } from './removeOnesFromProducts.ts'
import { simplifyZeroNumeratorFractions } from './simplifyZeroNumeratorFractions.ts'
import { simplifyUnitDenominatorFractions } from './simplifyUnitDenominatorFractions.ts'
import { simplifyZeroExponentPowers } from './simplifyZeroExponentPowers.ts'
import { simplifyZeroBasePowers } from './simplifyZeroBasePowers.ts'
import { simplifyUnitExponentPowers } from './simplifyUnitExponentPowers.ts'
import { simplifyUnitBasePowers } from './simplifyUnitBasePowers.ts'
import { simplifyZeroRadicandRoots } from './simplifyZeroRadicandRoots.ts'
import { simplifyUnitRadicandRoots } from './simplifyUnitRadicandRoots.ts'
import { simplifyUnitDegreeRoots } from './simplifyUnitDegreeRoots.ts'
import { simplifyUnitArgumentLogarithms } from './simplifyUnitArgumentLogarithms.ts'
import { simplifyBaseArgumentLogarithms } from './simplifyBaseArgumentLogarithms.ts'
import { cancelSumTerms } from './cancelSumTerms.ts'
import { cancelFractionFactors } from './cancelFractionFactors.ts'
import { cancelMatchingRootsAndPowers } from './cancelMatchingRootsAndPowers.ts'
import { reduceRootPowerExponents } from './reduceRootPowerExponents.ts'

export const cancellationRules = defineRuleRegistry(removeZeroesFromSums, simplifyZeroProducts, removeOnesFromProducts, simplifyZeroNumeratorFractions, simplifyUnitDenominatorFractions, simplifyZeroExponentPowers, simplifyZeroBasePowers, simplifyUnitExponentPowers, simplifyUnitBasePowers, simplifyZeroRadicandRoots, simplifyUnitRadicandRoots, simplifyUnitDegreeRoots, simplifyUnitArgumentLogarithms, simplifyBaseArgumentLogarithms, cancelSumTerms, cancelFractionFactors, cancelMatchingRootsAndPowers, reduceRootPowerExponents)
export { removeZeroesFromSums, simplifyZeroProducts, removeOnesFromProducts, simplifyZeroNumeratorFractions, simplifyUnitDenominatorFractions, simplifyZeroExponentPowers, simplifyZeroBasePowers, simplifyUnitExponentPowers, simplifyUnitBasePowers, simplifyZeroRadicandRoots, simplifyUnitRadicandRoots, simplifyUnitDegreeRoots, simplifyUnitArgumentLogarithms, simplifyBaseArgumentLogarithms, cancelSumTerms, cancelFractionFactors, cancelMatchingRootsAndPowers, reduceRootPowerExponents }
