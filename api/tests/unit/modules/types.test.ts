import { defineApiModule, defineRegistryKeys, ensureCompleteRegistry } from '../../../src/modules/types.ts'

describe('API module helpers', () => {
	it('returns a module definition unchanged', () => {
		const module = { resolvers: { Query: {} } }
		expect(defineApiModule(module)).toBe(module)
	})

	it('returns registry keys in their declared order', () => {
		type Registry = { first: number; second: string }
		const keys = defineRegistryKeys<Registry>()('first', 'second')
		expect(keys).toEqual(['first', 'second'])
	})

	it('accepts a complete registry, including one with extra properties', () => {
		const registry: Partial<{ first: number; second: string }> & { extra: boolean } = { first: 0, second: '', extra: true }
		expect(() => ensureCompleteRegistry(registry, ['first', 'second'], 'test')).not.toThrow()
	})

	it.each([
		[{}, 'first'],
		[{ first: undefined }, 'first'],
		[{ first: 1 }, 'second'],
	])('rejects an incomplete registry', (registry, missingKey) => {
		expect(() => ensureCompleteRegistry(registry as Partial<{ first: number; second: string }>, ['first', 'second'] as const, 'test')).toThrow(`Missing test registration for "${missingKey}".`)
	})
})
