import { reduceRootsWithZeroRadicand } from './reduceRootsWithZeroRadicand'
import { reduceRootsWithOneRadicand } from './reduceRootsWithOneRadicand'
import { reduceRootsWithOneDegree } from './reduceRootsWithOneDegree'
import { reduceNumberRoots } from './reduceNumberRoots'
import { reduceCanceledRoots } from './reduceCanceledRoots'
import { turnRootsIntoFractionExponents } from './turnRootsIntoFractionExponents'
import { turnFractionExponentsIntoRoots } from './turnFractionExponentsIntoRoots'
import { turnDegreeTwoRootsIntoSqrts } from './turnDegreeTwoRootsIntoSqrts'
import { turnSqrtsIntoDegreeTwoRoots } from './turnSqrtsIntoDegreeTwoRoots'
import { expandRootsOfProducts } from './expandRootsOfProducts'
import { mergeProductsOfRoots } from './mergeProductsOfRoots'
import { mergeProductsWithRoots } from './mergeProductsWithRoots'
import { pullExponentsIntoRoots } from './pullExponentsIntoRoots'
import { reducePowersInRoots } from './reducePowersInRoots'
import { pullFactorsOutOfRoots } from './pullFactorsOutOfRoots'
import { preventRootDenominators } from './preventRootDenominators'

export const rootRules = {
	reduceRootsWithZeroRadicand,
	reduceRootsWithOneRadicand,
	reduceRootsWithOneDegree,
	reduceNumberRoots,
	reduceCanceledRoots,
	turnRootsIntoFractionExponents,
	turnFractionExponentsIntoRoots,
	turnDegreeTwoRootsIntoSqrts,
	turnSqrtsIntoDegreeTwoRoots,
	expandRootsOfProducts,
	mergeProductsOfRoots,
	mergeProductsWithRoots,
	pullExponentsIntoRoots,
	reducePowersInRoots,
	pullFactorsOutOfRoots,
	preventRootDenominators,
}
