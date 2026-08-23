import { mapValues } from '@step-wise/js-utils'
import { type InputValue, interpretInputValue, IntegerType } from '@step-wise/input-interpretation'

import { Float, Unit, FloatUnit } from '@step-wise/physics-core'
import { asExpression, asEquation } from '@step-wise/cas'
import { Vector, Line, LineSegment, Rectangle } from '@step-wise/geometry'

import { compare } from './compare'
import { compareList, compareListEntry } from './compareList'
import { compareInteger } from './objects/Integer'
import { compareMultipleChoice } from './objects/MultipleChoice'

function makeData(rawInput: Record<string, InputValue>, solution: Record<string, unknown>, compareOptions = {}) {
	return {
		metadata: { compare: compareOptions },
		parameters: {},
		rawInput,
		input: mapValues(rawInput, value => interpretInputValue(value)),
		solution,
	}
}

describe('compare', () => {
	describe('compares integers', () => {
		it('using exact comparison', () => {
			expect(compare('x', makeData({ x: { type: IntegerType, value: '12' } }, { x: 12 }))).toBe(true)
			expect(compare('x', makeData({ x: { type: IntegerType, value: '13' } }, { x: 12 }))).toBe(false)
		})
		it('using tolerances', () => {
			expect(compare('x', makeData({ x: { type: IntegerType, value: '151' } }, { x: 150 }, { x: { absoluteTolerance: 1 } }))).toBe(true)
			expect(compare('x', makeData({ x: { type: IntegerType, value: '152' } }, { x: 150 }, { x: { absoluteTolerance: 1 } }))).toBe(false)
			expect(compare('x', makeData({ x: { type: IntegerType, value: '151' } }, { x: 150 }, { y: { absoluteTolerance: 1 } }))).toBe(false)
		})
	})

	describe('compares multiple choice', () => {
		it('with single values', () => {
			expect(compare('answer', makeData({ answer: { type: 'MultipleChoice', value: 2 } }, { answer: 2 }))).toBe(true)
			expect(compare('answer', makeData({ answer: { type: 'MultipleChoice', value: 2 } }, { answer: 3 }))).toBe(false)
		})
		it('with multiple values', () => {
			expect(compare('answer', makeData({ answer: { type: 'MultipleChoice', value: [2, 4] } }, { answer: [2, 4] }))).toBe(true)
			expect(compare('answer', makeData({ answer: { type: 'MultipleChoice', value: [2, 4] } }, { answer: [4, 2] }))).toBe(true)
			expect(compare('answer', makeData({ answer: { type: 'MultipleChoice', value: [2, 4] } }, { answer: [2, 3] }))).toBe(false)
		})
	})

	it('supports multiple keys', () => {
		expect(compare(['x', 'y'], makeData({ x: { type: IntegerType, value: '151' }, y: { type: IntegerType, value: '199' } }, { x: 150, y: 200 }, { x: { absoluteTolerance: 1 }, y: { absoluteTolerance: 1 } }))).toBe(true)
		expect(compare(['x', 'y'], makeData({ x: { type: IntegerType, value: '151' }, y: { type: IntegerType, value: '199' } }, { x: 150, y: 200 }, { [IntegerType]: { absoluteTolerance: 1 } }))).toBe(true)
		expect(compare(['x', 'y'], makeData({ x: { type: IntegerType, value: '151' }, y: { type: IntegerType, value: '199' } }, { x: 150, y: 200 }, { x: { absoluteTolerance: 1 } }))).toBe(false)
	})

	it('validates every key before comparing', () => {
		const data = makeData({ x: { type: IntegerType, value: '1' } }, { x: 2 })
		expect(() => compare(['x', 'missing'], data)).toThrow(/missing/)
	})

	it('rejects empty comparisons', () => {
		const data = makeData({}, {})
		expect(() => compare([], data)).toThrow(RangeError)
		expect(() => compareList([], data)).toThrow(RangeError)
	})

	it('validates comparison settings and custom comparison results', () => {
		const input = { x: { type: IntegerType, value: '1' } }
		expect(() => compare('x', makeData(input, { x: 1 }, { x: [] } as never))).toThrow(TypeError)
		expect(() => compare('x', makeData(input, { x: 1 }, { x: (() => 'yes') as never }))).toThrow(TypeError)
	})

	it('validates keys when comparing individual list entries', () => {
		const data = makeData({ x: { type: IntegerType, value: '1' } }, { x: 1 })
		expect(() => compareListEntry('missing', 'x', data)).toThrow(/missing/)
		expect(() => compareListEntry('x', 'missing', data)).toThrow(/missing/)
	})

	it('supports custom compare functions', () => {
		expect(compare('x', makeData({ x: { type: IntegerType, value: '10' } }, { x: 20 }, { x: (input: number, correct: number) => input * 2 === correct }))).toBe(true)
		expect(compare('x', makeData({ x: { type: IntegerType, value: '10' } }, { x: 20 }, { x: (input: number, correct: number) => input * 3 === correct }))).toBe(false)
	})

	describe('compares physics', () => {
		describe('Float objects', () => {
			it('with default options', () => {
				expect(compare('x', makeData({ x: { type: 'Float', value: { number: '3.05' } } }, { x: new Float('3.0') }))).toBe(true)
				expect(compare('x', makeData({ x: { type: 'Float', value: { number: '3.06' } } }, { x: new Float('3.0') }))).toBe(false)
			})
			it('with custom options', () => {
				expect(compare('x', makeData({ x: { type: 'Float', value: { number: '3.1' } } }, { x: new Float('3.0') }, { x: { absoluteTolerance: 0.1 } }))).toBe(true)
				expect(compare('x', makeData({ x: { type: 'Float', value: { number: '3.11' } } }, { x: new Float('3.0') }, { x: { absoluteTolerance: 0.1 } }))).toBe(false)
			})
		})

		describe('Unit objects', () => {
			it('with default options', () => {
				expect(compare('x', makeData({ x: { type: 'Unit', value: { numerator: [{ text: 'm' }, { text: 's' }] } } }, { x: new Unit('m * s') }))).toBe(true)
				expect(compare('x', makeData({ x: { type: 'Unit', value: { numerator: [{ text: 'm' }, { text: 's' }] } } }, { x: new Unit('s * m') }))).toBe(true)
				expect(compare('x', makeData({ x: { type: 'Unit', value: { numerator: [{ text: 'm', power: 2 }], denominator: [{ text: 'm' }] } } }, { x: new Unit('m') }))).toBe(true)
				expect(compare('x', makeData({ x: { type: 'Unit', value: { numerator: [{ text: 'm', power: 2 }], denominator: [{ text: 'm' }] } } }, { x: new Unit('km') }))).toBe(false)
			})
			it('with custom options', () => {
				expect(compare('x', makeData({ x: { type: 'Unit', value: { numerator: [{ text: 'km' }] } } }, { x: new Unit('m') }, { x: { checkSize: true } }))).toBe(false)
				expect(compare('x', makeData({ x: { type: 'Unit', value: { numerator: [{ text: 'km' }] } } }, { x: new Unit('m') }, { x: { checkSize: false } }))).toBe(true)
				expect(compare('x', makeData({ x: { type: 'Unit', value: { numerator: [{ text: 'm', power: 2 }], denominator: [{ text: 'm' }] } } }, { x: new Unit('m') }, { x: { combine: false } }))).toBe(false)
				expect(compare('x', makeData({ x: { type: 'Unit', value: { numerator: [{ text: 'm', power: 2 }], denominator: [{ text: 'm' }] } } }, { x: new Unit('m') }, { x: { combine: true } }))).toBe(true)
				expect(compare('x', makeData({ x: { type: 'Unit', value: { numerator: [{ text: 'bar' }] } } }, { x: new Unit('kg / m * s^2') }, { x: { target: 'base', checkSize: false } }))).toBe(true)
				expect(compare('x', makeData({ x: { type: 'Unit', value: { numerator: [{ text: 'bar' }] } } }, { x: new Unit('kg / m * s^2') }, { x: { target: 'base', checkSize: true } }))).toBe(false)
			})
		})

		describe('FloatUnit objects', () => {
			it('with default options', () => {
				expect(compare('x', makeData({ x: { type: 'FloatUnit', value: { float: { number: '3.0' }, unit: { numerator: [{ text: 'm' }], denominator: [{ text: 's' }] } } } }, { x: new FloatUnit('3.0 m/s') }))).toBe(true)
				expect(compare('x', makeData({ x: { type: 'FloatUnit', value: { float: { number: '3.1' }, unit: { numerator: [{ text: 'm' }], denominator: [{ text: 's' }] } } } }, { x: new FloatUnit('3.0 m/s') }))).toBe(false)
			})
			it('with custom options', () => {
				expect(compare('x', makeData({ x: { type: 'FloatUnit', value: { float: { number: '3.1' }, unit: { numerator: [{ text: 'm' }], denominator: [{ text: 's' }] } } } }, { x: new FloatUnit('3.0 m/s') }, { x: { float: { absoluteTolerance: 0.1 } } }))).toBe(true)
				expect(compare('x', makeData({ x: { type: 'FloatUnit', value: { float: { number: '3.2' }, unit: { numerator: [{ text: 'm' }], denominator: [{ text: 's' }] } } } }, { x: new FloatUnit('3.0 m/s') }, { x: { float: { absoluteTolerance: 0.1 } } }))).toBe(false)
			})
		})
	})

	describe('compares CAS', () => {
		describe('Expression objects', () => {
			it('with default options', () => {
				expect(compare('x', makeData({ x: { type: 'Expression', value: ['2*x'] } }, { x: asExpression('2x') }))).toBe(true)
				expect(compare('x', makeData({ x: { type: 'Expression', value: ['2*x'] } }, { x: asExpression('x*2') }))).toBe(true)
				expect(compare('x', makeData({ x: { type: 'Expression', value: ['2*x'] } }, { x: asExpression('3x') }))).toBe(false)
			})
			it('with custom options', () => {
				expect(compare('x', makeData({ x: { type: 'Expression', value: ['2*x'] } }, { x: asExpression('x*2') }, { x: { allowOrderChanges: false } }))).toBe(false)
				expect(compare('x', makeData({ x: { type: 'Expression', value: ['2*x'] } }, { x: asExpression('x*2') }, { x: { allowOrderChanges: true } }))).toBe(true)
			})
		})
		describe('Equation objects', () => {
			it('with default options', () => {
				expect(compare('eq', makeData({ eq: { type: 'Equation', value: ['2=x'] } }, { eq: asEquation('2=x') }))).toBe(true)
				expect(compare('eq', makeData({ eq: { type: 'Equation', value: ['2=x'] } }, { eq: asEquation('3=x') }))).toBe(false)
			})
			it('with custom options', () => {
				expect(compare('eq', makeData({ eq: { type: 'Equation', value: ['2=x'] } }, { eq: asEquation('x=2') }, { eq: { allowSwitch: true } }))).toBe(true)
				expect(compare('eq', makeData({ eq: { type: 'Equation', value: ['2=x'] } }, { eq: asEquation('x=2') }, { eq: { allowSwitch: false } }))).toBe(false)
			})
		})
	})

	describe('compares geometry', () => {
		it('Vector objects', () => {
			expect(compare('x', makeData({ x: { type: 'Vector', value: [2, 3] } }, { x: new Vector([2, 3]) }))).toBe(true)
			expect(compare('x', makeData({ x: { type: 'Vector', value: [2, 3] } }, { x: new Vector([2, 4]) }))).toBe(false)
		})
		it('Line objects', () => {
			expect(compare('x', makeData({ x: { type: 'Line', value: { start: [2, 3], direction: [0, 1] } } }, { x: new Line([2, 3], [0, 1]) }))).toBe(true)
			expect(compare('x', makeData({ x: { type: 'Line', value: { start: [2, 3], direction: [0, 1] } } }, { x: new Line([2, 4], [0, 1]) }))).toBe(true)
			expect(compare('x', makeData({ x: { type: 'Line', value: { start: [2, 3], direction: [0, 1] } } }, { x: new Line([3, 3], [0, 1]) }))).toBe(false)
		})
		it('LineSegment objects', () => {
			expect(compare('x', makeData({ x: { type: 'LineSegment', value: { start: [2, 3], end: [3, 4] } } }, { x: new LineSegment([2, 3], [3, 4]) }))).toBe(true)
			expect(compare('x', makeData({ x: { type: 'LineSegment', value: { start: [2, 3], end: [3, 4] } } }, { x: new LineSegment([2, 4], [4, 5]) }))).toBe(false)
		})
		it('Rectangle objects', () => {
			expect(compare('x', makeData({ x: { type: 'Rectangle', value: { min: [2, 3], max: [3, 4] } } }, { x: new Rectangle([2, 3], [3, 4]) }))).toBe(true)
			expect(compare('x', makeData({ x: { type: 'Rectangle', value: { min: [2, 3], max: [3, 4] } } }, { x: new Rectangle([2, 3], [3, 5]) }))).toBe(false)
		})
	})
})

describe('standalone comparison functions', () => {
	it('requires finite integers', () => {
		expect(compareInteger(2, 2)).toBe(true)
		expect(() => compareInteger(2.5, 2)).toThrow()
		expect(() => compareInteger(2, Number.POSITIVE_INFINITY)).toThrow()
		expect(() => compareInteger(Number.NaN, 2)).toThrow()
	})

	it('compares unique non-negative multiple-choice options', () => {
		expect(compareMultipleChoice([1, 2], [2, 1])).toBe(true)
		expect(compareMultipleChoice([1, 2], [1, 3])).toBe(false)
		expect(() => compareMultipleChoice([1, 1], [1, 2])).toThrow(/duplicate/)
		expect(() => compareMultipleChoice([-1], [1])).toThrow()
		expect(() => compareMultipleChoice([1.5], [1])).toThrow()
	})
})
