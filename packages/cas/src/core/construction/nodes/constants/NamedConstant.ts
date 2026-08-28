import { fromKeysAndValues, mapValues } from '@step-wise/js-utils'

import { ConstantNode } from './ConstantNode.ts'

// Define the named constants.
const namedConstantDefinitions = [
	{ symbol: 'π', name: 'pi', value: Math.PI },
	{ symbol: 'e', name: 'e', value: Math.E },
	{ symbol: '∞', name: 'infinity', value: Infinity },
] as const
type NamedConstantDefinition = typeof namedConstantDefinitions[number]

// Set up types for identifiers.
export type NamedConstantSymbol = typeof namedConstantDefinitions[number]['symbol']
export type NamedConstantName = typeof namedConstantDefinitions[number]['name']
export type NamedConstantReferral = NamedConstantSymbol | NamedConstantName

// Extract objects.
const namedConstantDefinitionsBySymbol: Record<NamedConstantSymbol, NamedConstantDefinition> = fromKeysAndValues(namedConstantDefinitions.map(namedConstant => namedConstant.symbol), namedConstantDefinitions)
const namedConstantDefinitionsByName: Record<NamedConstantName, NamedConstantDefinition> = fromKeysAndValues(namedConstantDefinitions.map(namedConstant => namedConstant.name), namedConstantDefinitions)

// Define the NamedConstant class.
export class NamedConstant extends ConstantNode {
	readonly subtype = 'NamedConstant'
	readonly symbol: NamedConstantSymbol

	constructor(referral: NamedConstantReferral) {
		const definition = getNamedConstantDefinition(referral)
		if (!definition) throw new Error(`Unknown named constant "${referral}".`)
		super(definition.value)
		this.symbol = definition.symbol
	}

	get constantName() {
		return getNamedConstantDefinition(this.symbol)!.name
	}
}

// Find the constant definition from a name or nickname.
function getNamedConstantDefinition(referral: NamedConstantReferral): NamedConstantDefinition | undefined {
	if (Object.hasOwn(namedConstantDefinitionsBySymbol, referral)) return namedConstantDefinitionsBySymbol[referral as NamedConstantSymbol]
	if (Object.hasOwn(namedConstantDefinitionsByName, referral)) return namedConstantDefinitionsByName[referral as NamedConstantName]
}

// Export easy-access object of premade named constants.
export const namedConstantsBySymbol: Record<NamedConstantSymbol, NamedConstant> = mapValues(namedConstantDefinitionsBySymbol, definition => new NamedConstant(definition.symbol))
export const namedConstantsByName: Record<NamedConstantName, NamedConstant> = mapValues(namedConstantDefinitionsByName, definition => namedConstantsBySymbol[definition.symbol])
export const namedConstants: Record<NamedConstantReferral, NamedConstant> = { ...namedConstantsByName, ...namedConstantsBySymbol }

// Access function to get a premade named constant.
export function getNamedConstant(referral: string): NamedConstant {
	if (isNamedConstantReferral(referral)) return namedConstants[referral as NamedConstantSymbol]
	throw new Error(`Unknown named constant "${referral}".`)
}

// Checker to see if a string is a valid named constant.
export function isNamedConstantReferral(referral: string): referral is NamedConstantReferral {
	return Object.hasOwn(namedConstants, referral)
}
