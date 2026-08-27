import { createSubscriptionResolver } from '../../../src/modules/subscriptions.ts'

const subscriptionMocks = vi.hoisted(() => ({ withFilter: vi.fn() }))
vi.mock('graphql-subscriptions', () => ({ withFilter: subscriptionMocks.withFilter }))

describe('subscription resolver builder', () => {
	let source: (root: unknown, args: unknown, context: unknown) => Promise<unknown>
	let filter: (payload: unknown, args: unknown, context: unknown) => Promise<boolean>
	let subscribe: ReturnType<typeof vi.fn>

	beforeEach(() => {
		subscribe = vi.fn()
		subscriptionMocks.withFilter.mockReset().mockImplementation((givenSource, givenFilter) => {
			source = givenSource
			filter = givenFilter
			return subscribe
		})
	})

	function setup() {
		const iterator = { [Symbol.asyncIterator]: vi.fn() }
		const asyncIterableIterator = vi.fn().mockReturnValue(iterator)
		const context = { pubsub: { asyncIterableIterator } }
		const selectResult = vi.fn(({ value }: { value: string }, { prefix }: { prefix: string }) => value ? `${prefix}${value}` : undefined)
		const authorizeSubscription = vi.fn()
		const resolverMap = createSubscriptionResolver('fieldUpdated', ['FIRST', 'SECOND'], selectResult, authorizeSubscription, { description: 'resolver option' })
		const resolver = resolverMap.fieldUpdated
		return { asyncIterableIterator, authorizeSubscription, context, iterator, resolver, selectResult }
	}

	it('builds a resolver under the requested field name and preserves options', () => {
		const { resolver, selectResult } = setup()
		expect(resolver).toMatchObject({ description: 'resolver option', subscribe, resolve: selectResult })
		expect(subscriptionMocks.withFilter).toHaveBeenCalledOnce()
	})

	it('authorizes before subscribing to every event name', async () => {
		const { asyncIterableIterator, authorizeSubscription, context, iterator } = setup()
		const args = { prefix: 'prefix-' }
		await expect(source(undefined, args, context)).resolves.toBe(iterator)
		expect(authorizeSubscription).toHaveBeenCalledWith(args, context)
		expect(asyncIterableIterator).toHaveBeenCalledWith(['FIRST', 'SECOND'])
		expect(authorizeSubscription.mock.invocationCallOrder[0]).toBeLessThan(asyncIterableIterator.mock.invocationCallOrder[0]!)
	})

	it('propagates authorization failures without opening an iterator', async () => {
		const { asyncIterableIterator, authorizeSubscription, context } = setup()
		authorizeSubscription.mockRejectedValue(new Error('forbidden'))
		await expect(source(undefined, {}, context)).rejects.toThrow('forbidden')
		expect(asyncIterableIterator).not.toHaveBeenCalled()
	})

	it('filters with the selected result and exposes the same result through resolve', async () => {
		const { context, resolver, selectResult } = setup()
		const args = { prefix: 'prefix-' }
		expect(await filter({ value: 'value' }, args, context)).toBe(true)
		expect(await filter({ value: '' }, args, context)).toBe(false)
		expect(resolver!.resolve({ value: 'value' }, args, context)).toBe('prefix-value')
		expect(selectResult).toHaveBeenCalled()
	})

	it('rejects missing subscription arguments or context and filters incomplete events', async () => {
		const { context } = setup()
		await expect(source(undefined, undefined, context)).rejects.toThrow('without arguments')
		await expect(source(undefined, {}, undefined)).rejects.toThrow('without an API context')
		expect(await filter(undefined, {}, context)).toBe(false)
		expect(await filter({}, undefined, context)).toBe(false)
		expect(await filter({}, {}, undefined)).toBe(false)
	})
})
