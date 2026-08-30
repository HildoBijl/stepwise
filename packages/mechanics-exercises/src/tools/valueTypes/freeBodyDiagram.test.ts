import { describe, expect, it } from 'vitest'

import { createForce, createMoment, reverseLoad } from '@step-wise/engineering-mechanics'

import { FreeBodyDiagramType, freeBodyDiagramEqualityAdapter, freeBodyDiagramInputValueAdapter } from './freeBodyDiagram.ts'

describe('FreeBodyDiagram value type', () => {
	const diagram = [createForce({ position: [1, 2], angle: 0 }), createMoment({ position: [3, 4], clockwise: true })]

	it('converts diagrams to and from input values', () => {
		const inputValue = freeBodyDiagramInputValueAdapter.toInputValue(diagram)
		const restored = freeBodyDiagramInputValueAdapter.interpret(inputValue)

		expect(inputValue.type).toBe(FreeBodyDiagramType)
		expect(freeBodyDiagramInputValueAdapter.isInputValue(inputValue)).toBe(true)
		expect(freeBodyDiagramInputValueAdapter.isDomainValue(restored)).toBe(true)
		expect(freeBodyDiagramEqualityAdapter.areEqual(restored, diagram, undefined)).toBe(true)
	})

	it('rejects malformed input values and domain values', () => {
		expect(freeBodyDiagramInputValueAdapter.isInputValue({ type: FreeBodyDiagramType, value: [{}] })).toBe(false)
		expect(freeBodyDiagramInputValueAdapter.isDomainValue([{}])).toBe(false)
	})

	it('uses validated load-comparison options', () => {
		expect(freeBodyDiagramEqualityAdapter.isOptions({ force: { direction: 'parallel' } })).toBe(true)
		expect(freeBodyDiagramEqualityAdapter.areEqual(diagram.map(reverseLoad), diagram, undefined)).toBe(true)
	})
})
