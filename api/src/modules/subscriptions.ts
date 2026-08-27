import { withFilter } from 'graphql-subscriptions'

import type { ApiContext } from './types.ts'

type SubscriptionContext = Pick<ApiContext, 'pubsub'>
type SubscriptionResultSelector<Payload, Args, Context, Result> = (payload: Payload, args: Args, context: Context) => Result | Promise<Result>
type SubscriptionAuthorizer<Args, Context> = (args: Args, context: Context) => void | Promise<void>

export function createSubscriptionResolver<Payload, Args, Context extends SubscriptionContext, Result>(fieldName: string, eventNames: string[], selectResult: SubscriptionResultSelector<Payload, Args, Context, Result>, authorizeSubscription?: SubscriptionAuthorizer<Args, Context>, resolverOptions: Record<string, unknown> = {}) {
	return {
		[fieldName]: {
			...resolverOptions,
			subscribe: withFilter<Payload, Args, Context>(
				async (_source, args, context) => {
					if (args === undefined) throw new Error('Cannot create a subscription without arguments.')
					if (context === undefined) throw new Error('Cannot create a subscription without an API context.')
					await authorizeSubscription?.(args, context)
					return context.pubsub.asyncIterableIterator(eventNames)
				},
				async (payload, args, context) => {
					if (payload === undefined || args === undefined || context === undefined) return false
					return !!await selectResult(payload, args, context)
				},
			),
			resolve: selectResult,
		},
	}
}
