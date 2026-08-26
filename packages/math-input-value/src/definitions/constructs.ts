export const constructDefinitions = {
	Fraction: {
		aliases: ['/'],
	},
	SquareRoot: {
		aliases: ['sqrt('],
	},
	Root: {
		aliases: ['root('],
		defaultDegree: '2',
	},
	Logarithm: {
		aliases: ['log('],
		defaultBase: '10',
		bracketBehavior: 'opensExternalGroup',
	},
	SubSup: {
		aliases: ['_', '^'],
	},
} as const

export type ConstructType = keyof typeof constructDefinitions
export type ConstructDefinition = typeof constructDefinitions[ConstructType]
export const constructs = Object.keys(constructDefinitions) as ConstructType[]

export function isConstructType(type: string): type is ConstructType {
	return Object.hasOwn(constructDefinitions, type)
}

export function getConstructTypeFromAlias(alias: string): ConstructType | undefined {
	return constructs.find(type => (constructDefinitions[type].aliases as readonly string[]).includes(alias))
}

export function opensExternalGroup(type: string): boolean {
	if (!isConstructType(type)) return false
	const definition = constructDefinitions[type]
	return 'bracketBehavior' in definition && definition.bracketBehavior === 'opensExternalGroup'
}
