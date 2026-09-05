export type ApiOperationState = {
	loading: boolean
	error: Error | undefined
}

export type ApiQueryResult<Key extends string, Value> = {
	[Property in Key]: Value | undefined
} & ApiOperationState

export type ApiMutationResult<Mutation, AdditionalState extends object = object> = readonly [
	Mutation,
	ApiOperationState & AdditionalState,
]
