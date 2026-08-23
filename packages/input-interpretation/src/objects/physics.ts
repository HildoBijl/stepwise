import {
	type PrecisionNumber as PrecisionNumberDomainValue, type PrecisionNumberInputValue as PrecisionNumberInnerInputValue, PrecisionNumberType, interpretPrecisionNumberInputValue, precisionNumberToInputValue,
	type Unit as UnitDomainValue, type UnitInputValue as UnitInnerInputValue, UnitType, interpretUnitInputValue, unitToInputValue,
	type FloatUnit as FloatUnitDomainValue, type FloatUnitInputValue as FloatUnitInnerInputValue, FloatUnitType, interpretFloatUnitInputValue, floatUnitToInputValue,
} from '@step-wise/physics-core'

import type { InputValue, InterpreterEntry } from '../types'
import { makeInputValue } from '../support'

export { PrecisionNumberType, UnitType, FloatUnitType }

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

export type FloatUnitInputValue = InputValue<FloatUnitType, FloatUnitInnerInputValue>
export const FloatUnitInterpreter = {
	interpret: inputValue => interpretFloatUnitInputValue(inputValue.value),
	toInputValue: floatUnit => makeInputValue(FloatUnitType, floatUnitToInputValue(floatUnit)),
} satisfies InterpreterEntry<FloatUnitInputValue, FloatUnitDomainValue>

export const physicsInterpreters = {
	[PrecisionNumberType]: PrecisionNumberInterpreter,
	[UnitType]: UnitInterpreter,
	[FloatUnitType]: FloatUnitInterpreter,
}
