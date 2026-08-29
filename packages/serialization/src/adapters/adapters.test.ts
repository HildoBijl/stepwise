import { describe, expect, it } from 'vitest'

import { asEquation, asExpression } from '@step-wise/cas'
import { Line, LineSegment, Rectangle, Vector } from '@step-wise/geometry'
import { PrecisionNumber, Quantity, Unit } from '@step-wise/physics-core'

import type { SerializableDomainObject, SerializationAdapter, SerializedDomainObject } from '../types.ts'

import { equationAdapter, expressionAdapter } from './cas.ts'
import { lineAdapter, lineSegmentAdapter, rectangleAdapter, vectorAdapter } from './geometry.ts'
import { precisionNumberAdapter, quantityAdapter, unitAdapter } from './physics.ts'

describe('serialization adapters', () => {
	const cases = [
		['Expression', () => expectAdapterRoundTrip(expressionAdapter, asExpression('x+2'))],
		['Equation', () => expectAdapterRoundTrip(equationAdapter, asEquation('x+2=5'))],
		['Vector', () => expectAdapterRoundTrip(vectorAdapter, new Vector(1, 2))],
		['Line', () => expectAdapterRoundTrip(lineAdapter, new Line([1, 2], [3, 4]))],
		['LineSegment', () => expectAdapterRoundTrip(lineSegmentAdapter, new LineSegment([1, 2], [3, 4]))],
		['Rectangle', () => expectAdapterRoundTrip(rectangleAdapter, new Rectangle([1, 2], [3, 4]))],
		['PrecisionNumber', () => expectAdapterRoundTrip(precisionNumberAdapter, new PrecisionNumber('3.140'))],
		['Unit', () => expectAdapterRoundTrip(unitAdapter, new Unit('m/s^2'))],
		['Quantity', () => expectAdapterRoundTrip(quantityAdapter, new Quantity('9.81 m/s^2'))],
	] as const

	it.each(cases)('validates and converts with the %s adapter in both directions', (_type, checkRoundTrip) => {
		checkRoundTrip()
	})
})

function expectAdapterRoundTrip<TDomainValue extends SerializableDomainObject, TSerialized extends SerializedDomainObject>(adapter: SerializationAdapter<TDomainValue, TSerialized>, domainValue: TDomainValue): void {
	expect(adapter.isDomainValue(domainValue)).toBe(true)
	expect(adapter.isDomainValue({})).toBe(false)
	const serializedValue = adapter.serialize(domainValue)
	expect(adapter.isSerializedValue(serializedValue)).toBe(true)
	expect(adapter.isSerializedValue({})).toBe(false)
	expect(adapter.deserialize(serializedValue)).toEqual(domainValue)
}