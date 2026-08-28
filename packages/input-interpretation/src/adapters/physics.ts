import {
	type PrecisionNumber as PrecisionNumberDomainValue, type PrecisionNumberInputValue as PrecisionNumberInnerInputValue, PrecisionNumberType, interpretPrecisionNumberInputValue, precisionNumberToInputValue,
	type Unit as UnitDomainValue, type UnitInputValue as UnitInnerInputValue, UnitType, interpretUnitInputValue, unitToInputValue,
	type Quantity as QuantityDomainValue, type QuantityInputValue as QuantityInnerInputValue, QuantityType, interpretQuantityInputValue, quantityToInputValue,
} from '@step-wise/physics-core'

import type { InputValue, InputValueAdapter } from '../types.ts'
import { createInputValue } from '../support.ts'

type PrecisionNumberInputValue = InputValue<PrecisionNumberType, PrecisionNumberInnerInputValue>
export const precisionNumberInputValueAdapter = {
	interpret: inputValue => interpretPrecisionNumberInputValue(inputValue.value),
	toInputValue: precisionNumber => createInputValue(PrecisionNumberType, precisionNumberToInputValue(precisionNumber)),
} satisfies InputValueAdapter<PrecisionNumberInputValue, PrecisionNumberDomainValue>

type UnitInputValue = InputValue<UnitType, UnitInnerInputValue>
export const unitInputValueAdapter = {
	interpret: inputValue => interpretUnitInputValue(inputValue.value),
	toInputValue: unit => createInputValue(UnitType, unitToInputValue(unit)),
} satisfies InputValueAdapter<UnitInputValue, UnitDomainValue>

type QuantityInputValue = InputValue<QuantityType, QuantityInnerInputValue>
export const quantityInputValueAdapter = {
	interpret: inputValue => interpretQuantityInputValue(inputValue.value),
	toInputValue: quantity => createInputValue(QuantityType, quantityToInputValue(quantity)),
} satisfies InputValueAdapter<QuantityInputValue, QuantityDomainValue>

export const physicsInputValueAdapters = {
	[PrecisionNumberType]: precisionNumberInputValueAdapter,
	[UnitType]: unitInputValueAdapter,
	[QuantityType]: quantityInputValueAdapter,
}
