import { withFilter } from 'graphql-subscriptions'

import type { ApiContext } from './types.ts'

type SubscriptionContext = Pick<ApiContext, 'pubsub'>
type SubscriptionProcessor<Payload, Args, Context, Result> = (payload: Payload, args: Args, context: Context) => Result | Promise<Result>
type SubscriptionAuthorizer<Args, Context> = (args: Args, context: Context) => void | Promise<void>

export function getSubscription<Payload, Args, Context extends SubscriptionContext, Result>(name: string, events: string[], process: SubscriptionProcessor<Payload, Args, Context, Result>, authorize?: SubscriptionAuthorizer<Args, Context>, extraOptions: Record<string, unknown> = {}) {
	return {
		[name]: {
			...extraOptions,
			subscribe: withFilter<Payload, Args, Context>(
				async (_source, args, context) => {
					if (args === undefined) throw new Error('Cannot create a subscription without arguments.')
					if (context === undefined) throw new Error('Cannot create a subscription without an API context.')
					await authorize?.(args, context)
					return context.pubsub.asyncIterableIterator(events)
				},
				async (payload, args, context) => {
					if (payload === undefined || args === undefined || context === undefined) return false
					return !!await process(payload, args, context)
				},
			),
			resolve: process,
		},
	}
}
