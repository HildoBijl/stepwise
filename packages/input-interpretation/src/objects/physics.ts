import {
	type PrecisionNumber as PrecisionNumberDomainValue, type PrecisionNumberInputValue as PrecisionNumberInnerInputValue, PrecisionNumberType, interpretPrecisionNumberInputValue, precisionNumberToInputValue,
	type Unit as UnitDomainValue, type UnitInputValue as UnitInnerInputValue, UnitType, interpretUnitInputValue, unitToInputValue,
	type Quantity as QuantityDomainValue, type QuantityInputValue as QuantityInnerInputValue, QuantityType, interpretQuantityInputValue, quantityToInputValue,
} from '@step-wise/physics-core'

import type { InputValue, InterpreterEntry } from '../types'
import { makeInputValue } from '../support'

export { PrecisionNumberType, UnitType, QuantityType }

export type PrecisionNumberInputValue = InputValue<PrecisionNumberType, PrecisionNumberInnerInputValue>
export const PrecisionNumberInterpreter = {
	interpret: inputValue => interpretPrecisionNumberInputValue(inputValue.value),
	toInputValue: precisionNumber => makeInputValue(PrecisionNumberType, precisionNumberToInputValue(precisionNumber)),
} satisfies InterpreterEntry<PrecisionNumberInputValue, PrecisionNumberDomainValue>

export type UnitInputValue = InputValue<UnitType, UnitInnerInputValue>
export const UnitInterpreter = {
	interpret: inputValue => interpretUnitInputValue(inputValue.value),
	toInputValue: unit => makeInputValue(UnitType, unitToInputValue(unit)),
} satisfies InterpreterEntry<UnitInputValue, UnitDomainValue>

export type QuantityInputValue = InputValue<QuantityType, QuantityInnerInputValue>
export const QuantityInterpreter = {
	interpret: inputValue => interpretQuantityInputValue(inputValue.value),
	toInputValue: quantity => makeInputValue(QuantityType, quantityToInputValue(quantity)),
} satisfies InterpreterEntry<QuantityInputValue, QuantityDomainValue>

export const physicsInterpreters = {
	[PrecisionNumberType]: PrecisionNumberInterpreter,
	[UnitType]: UnitInterpreter,
	[QuantityType]: QuantityInterpreter,
}
