const { withFilter } = require('graphql-subscriptions')

// getSubscription is used to set up a subscription with preprocessing the payload that is received from the event. It requires the name of the subscription, the events that should trigger it and a processing function of the form ({ eventPayload, args, context, source }) => resultObject. If this function returns undefined, then it is filtered out and the user does not get an update. Extra options to the subscription may also be given. The result is an object { [name]: { ... the subscription ... } } so it can be easily included in the Subscription export.
function getSubscription(name, events, process, extraOptions = {}) {
	return {
		[name]: {
			...extraOptions,
			subscribe: withFilter(
				(source, args, context) => getAsyncIteratorWithPreprocessing(context.pubsub, events, (payload) => ({ [name]: process(payload, args, context, source) })),
				(payload) => payload[name] !== undefined,
			),
		}
	}
}
module.exports.getSubscription = getSubscription

// getAsyncIteratorWithPreprocessing sets up a pubsub asyncIterator listening to the given events. It however overrides it, by applying a preprocessing function to the given payload before it is passed on. The resulting asyncIterator is returned.
function getAsyncIteratorWithPreprocessing(pubsub, events, preprocessor = (x => x)) {
	const iterator = pubsub.asyncIterator(events)
	iterator.next = async () => {
		if (!iterator.allSubscribed) { await (iterator.allSubscribed = iterator.subscribeAll()) }
		const res = await iterator.pullValue()
		return { ...res, value: preprocessor(res.value) }
	}
	return iterator
}
module.exports.getAsyncIteratorWithPreprocessing
