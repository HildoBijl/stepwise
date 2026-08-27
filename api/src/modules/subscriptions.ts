import { withFilter } from 'graphql-subscriptions'

import type { ApiContext } from './types.ts'

type SubscriptionContext = Pick<ApiContext, 'pubsub'>
type SubscriptionProcessor<Payload, Args, Context, Result> = (payload: Payload, args: Args, context: Context) => Result | Promise<Result>

export function getSubscription<Payload, Args, Context extends SubscriptionContext, Result>(name: string, events: string[], process: SubscriptionProcessor<Payload, Args, Context, Result>, extraOptions: Record<string, unknown> = {}) {
	return {
		[name]: {
			...extraOptions,
			subscribe: withFilter<Payload, Args, Context>(
				(_source, _args, context) => {
					if (!context) throw new Error('Cannot create a subscription without an API context.')
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
