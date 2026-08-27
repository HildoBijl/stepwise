import { defineRuleRegistry } from '../ruleDefinition'

import { removeZeroesFromSums } from './removeZeroesFromSums'
import { simplifyZeroProducts } from './simplifyZeroProducts'
import { removeOnesFromProducts } from './removeOnesFromProducts'
import { simplifyZeroNumeratorFractions } from './simplifyZeroNumeratorFractions'
import { simplifyUnitDenominatorFractions } from './simplifyUnitDenominatorFractions'
import { simplifyZeroExponentPowers } from './simplifyZeroExponentPowers'
import { simplifyZeroBasePowers } from './simplifyZeroBasePowers'
import { simplifyUnitExponentPowers } from './simplifyUnitExponentPowers'
import { simplifyUnitBasePowers } from './simplifyUnitBasePowers'
import { simplifyZeroRadicandRoots } from './simplifyZeroRadicandRoots'
import { simplifyUnitRadicandRoots } from './simplifyUnitRadicandRoots'
import { simplifyUnitDegreeRoots } from './simplifyUnitDegreeRoots'
import { simplifyUnitArgumentLogarithms } from './simplifyUnitArgumentLogarithms'
import { simplifyBaseArgumentLogarithms } from './simplifyBaseArgumentLogarithms'
import { cancelSumTerms } from './cancelSumTerms'
import { cancelFractionFactors } from './cancelFractionFactors'
import { cancelMatchingRootsAndPowers } from './cancelMatchingRootsAndPowers'
import { reduceRootPowerExponents } from './reduceRootPowerExponents'

export const cancellationRules = defineRuleRegistry(removeZeroesFromSums, simplifyZeroProducts, removeOnesFromProducts, simplifyZeroNumeratorFractions, simplifyUnitDenominatorFractions, simplifyZeroExponentPowers, simplifyZeroBasePowers, simplifyUnitExponentPowers, simplifyUnitBasePowers, simplifyZeroRadicandRoots, simplifyUnitRadicandRoots, simplifyUnitDegreeRoots, simplifyUnitArgumentLogarithms, simplifyBaseArgumentLogarithms, cancelSumTerms, cancelFractionFactors, cancelMatchingRootsAndPowers, reduceRootPowerExponents)
export { removeZeroesFromSums, simplifyZeroProducts, removeOnesFromProducts, simplifyZeroNumeratorFractions, simplifyUnitDenominatorFractions, simplifyZeroExponentPowers, simplifyZeroBasePowers, simplifyUnitExponentPowers, simplifyUnitBasePowers, simplifyZeroRadicandRoots, simplifyUnitRadicandRoots, simplifyUnitDegreeRoots, simplifyUnitArgumentLogarithms, simplifyBaseArgumentLogarithms, cancelSumTerms, cancelFractionFactors, cancelMatchingRootsAndPowers, reduceRootPowerExponents }
