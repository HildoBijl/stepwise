import React from 'react'
import { describe, expect, it } from 'vitest'

import { reactToMessage } from '@step-wise/i18n'

import { EquationInput, ExpressionInput, IntegerInput, PrecisionNumberInput, QuantityInput, UnitInput } from './index'

describe('input translation metadata', () => {
	it.each([
		['equation-input', EquationInput],
		['expression-input', ExpressionInput],
		['integer-input', IntegerInput],
		['precision-number-input', PrecisionNumberInput],
		['quantity-input', QuantityInput],
		['unit-input', UnitInput],
	])('exposes the label of %s as a translation slot', (tag, Component) => {
		expect(reactToMessage(<Component label="Answer" />)).toEqual([{
			type: 'component',
			id: 'c1',
			component: tag,
			slots: { label: [{ type: 'text', value: 'Answer' }] },
		}])
	})
})
