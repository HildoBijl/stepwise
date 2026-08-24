import { describe, expect, it } from 'vitest'

import { asEquation, asExpression } from '@step-wise/cas'
import { createForce } from '@step-wise/engineering-mechanics'
import { Line, LineSegment, Rectangle, Vector } from '@step-wise/geometry'
import { PrecisionNumber, Quantity, Unit } from '@step-wise/physics-core'

import type { InputValueAdapter } from '../types'

import { equationInputValueAdapter, expressionInputValueAdapter } from './cas'
import { lineInputValueAdapter, lineSegmentInputValueAdapter, rectangleInputValueAdapter, vectorInputValueAdapter } from './geometry'
import { integerInputValueAdapter } from './integer'
import { freeBodyDiagramInputValueAdapter } from './mechanics'
import { multipleChoiceInputValueAdapter } from './multipleChoice'
import { precisionNumberInputValueAdapter, quantityInputValueAdapter, unitInputValueAdapter } from './physics'

describe('integer adapter', () => {
	it.each([
		['0', 0],
		['42', 42],
		['-7', -7],
		[' 3 ', 3],
	])('interprets "%s"', (value, expected) => {
		expect(integerInputValueAdapter.interpret({ type: 'Integer', value })).toBe(expected)
	})

	it.each(['', '-', '2.5', 'text', String(Number.MAX_SAFE_INTEGER + 1)])('rejects "%s"', value => {
		expect(() => integerInputValueAdapter.interpret({ type: 'Integer', value })).toThrow()
	})

	it('rejects non-string input and unsafe domain values', () => {
		expect(() => integerInputValueAdapter.interpret({ type: 'Integer', value: 3 } as never)).toThrow()
		expect(() => integerInputValueAdapter.toInputValue(Number.MAX_SAFE_INTEGER + 1)).toThrow()
	})

	it('converts integers to input values', () => {
		expect(integerInputValueAdapter.toInputValue(-7)).toEqual({ type: 'Integer', value: '-7' })
	})
})

describe('multiple-choice adapter', () => {
	it.each([
		[2, 2],
		[[2, 4, 1], [2, 4, 1]],
		[[], []],
	])('interprets a selection', (value, expected) => {
		expect(multipleChoiceInputValueAdapter.interpret({ type: 'MultipleChoice', value })).toEqual(expected)
	})

	it.each([-1, 1.5, Number.MAX_SAFE_INTEGER + 1, '1', [1, 1]])('rejects an invalid selection', value => {
		expect(() => multipleChoiceInputValueAdapter.interpret({ type: 'MultipleChoice', value } as never)).toThrow()
		expect(() => multipleChoiceInputValueAdapter.toInputValue(value as never)).toThrow()
	})

	it('converts selections to input values', () => {
		expect(multipleChoiceInputValueAdapter.toInputValue([2, 4])).toEqual({ type: 'MultipleChoice', value: [2, 4] })
	})
})

describe('domain adapters', () => {
	const cases = [
		['Expression', () => expectAdapterRoundTrip(expressionInputValueAdapter, asExpression('x+2'))],
		['Equation', () => expectAdapterRoundTrip(equationInputValueAdapter, asEquation('x+2=5'))],
		['Vector', () => expectAdapterRoundTrip(vectorInputValueAdapter, new Vector(1, 2))],
		['Line', () => expectAdapterRoundTrip(lineInputValueAdapter, new Line([1, 2], [3, 4]))],
		['LineSegment', () => expectAdapterRoundTrip(lineSegmentInputValueAdapter, new LineSegment([1, 2], [3, 4]))],
		['Rectangle', () => expectAdapterRoundTrip(rectangleInputValueAdapter, new Rectangle([1, 2], [3, 4]))],
		['PrecisionNumber', () => expectAdapterRoundTrip(precisionNumberInputValueAdapter, new PrecisionNumber('3.140'))],
		['Unit', () => expectAdapterRoundTrip(unitInputValueAdapter, new Unit('m/s^2'))],
		['Quantity', () => expectAdapterRoundTrip(quantityInputValueAdapter, new Quantity('9.81 m/s^2'))],
		['FreeBodyDiagram', () => expectAdapterRoundTrip(freeBodyDiagramInputValueAdapter, [createForce({ position: [1, 2], angle: 0 })])],
	] as const

	it.each(cases)('converts with the %s adapter in both directions', (_type, checkRoundTrip) => {
		checkRoundTrip()
	})
})

function expectAdapterRoundTrip<TInputValue, TDomainValue>(adapter: InputValueAdapter<TInputValue, TDomainValue>, domainValue: TDomainValue): void {
	const inputValue = adapter.toInputValue(domainValue)
	expect(adapter.interpret(inputValue)).toEqual(domainValue)
}
