import { withFilter } from 'graphql-subscriptions'

type SubscriptionProcessor = (payload: any, args: any, context: any, source?: any) => unknown

export function getSubscription(name: string, events: string[], process: SubscriptionProcessor, extraOptions: Record<string, unknown> = {}) {
	return {
		[name]: {
			...extraOptions,
			subscribe: withFilter(
				(_source: unknown, _args: unknown, { pubsub }: any) => pubsub.asyncIterator(events),
				(payload: unknown, args: unknown, context: unknown) => !!process(payload, args, context),
			),
			resolve: process,
		},
	}
}
