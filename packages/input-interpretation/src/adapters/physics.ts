import {
	PrecisionNumber as PrecisionNumberDomainValue, type PrecisionNumberInputValue as PrecisionNumberInnerInputValue, PrecisionNumberType, isPrecisionNumberInputValue, interpretPrecisionNumberInputValue, precisionNumberToInputValue,
	Unit as UnitDomainValue, type UnitInputValue as UnitInnerInputValue, UnitType, isUnitInputValue, interpretUnitInputValue, unitToInputValue,
	Quantity as QuantityDomainValue, type QuantityInputValue as QuantityInnerInputValue, QuantityType, isQuantityInputValue, interpretQuantityInputValue, quantityToInputValue,
} from '@step-wise/physics-core'

import type { InputValue, InputValueAdapter } from '../types.ts'
import { createInputValue, isInputValueOfType } from '../support.ts'

type PrecisionNumberInputValue = InputValue<PrecisionNumberType, PrecisionNumberInnerInputValue>
export const precisionNumberInputValueAdapter = {
	isInputValue: (value: unknown): value is PrecisionNumberInputValue => isInputValueOfType(value, PrecisionNumberType, isPrecisionNumberInputValue),
	isDomainValue: (value: unknown): value is PrecisionNumberDomainValue => value instanceof PrecisionNumberDomainValue,
	interpret: inputValue => interpretPrecisionNumberInputValue(inputValue.value),
	toInputValue: precisionNumber => createInputValue(PrecisionNumberType, precisionNumberToInputValue(precisionNumber)),
} satisfies InputValueAdapter<PrecisionNumberInputValue, PrecisionNumberDomainValue>

type UnitInputValue = InputValue<UnitType, UnitInnerInputValue>
export const unitInputValueAdapter = {
	isInputValue: (value: unknown): value is UnitInputValue => isInputValueOfType(value, UnitType, isUnitInputValue),
	isDomainValue: (value: unknown): value is UnitDomainValue => value instanceof UnitDomainValue,
	interpret: inputValue => interpretUnitInputValue(inputValue.value),
	toInputValue: unit => createInputValue(UnitType, unitToInputValue(unit)),
} satisfies InputValueAdapter<UnitInputValue, UnitDomainValue>

type QuantityInputValue = InputValue<QuantityType, QuantityInnerInputValue>
export const quantityInputValueAdapter = {
	isInputValue: (value: unknown): value is QuantityInputValue => isInputValueOfType(value, QuantityType, isQuantityInputValue),
	isDomainValue: (value: unknown): value is QuantityDomainValue => value instanceof QuantityDomainValue,
	interpret: inputValue => interpretQuantityInputValue(inputValue.value),
	toInputValue: quantity => createInputValue(QuantityType, quantityToInputValue(quantity)),
} satisfies InputValueAdapter<QuantityInputValue, QuantityDomainValue>

export const physicsInputValueAdapters = {
	[PrecisionNumberType]: precisionNumberInputValueAdapter,
	[UnitType]: unitInputValueAdapter,
	[QuantityType]: quantityInputValueAdapter,
}
