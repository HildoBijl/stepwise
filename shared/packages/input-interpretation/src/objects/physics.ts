import {
	type Float as FloatDomainValue, type FloatInputValue as FloatInnerInputValue, FloatType, interpretFloatInputValue, floatToInputValue,
	type Unit as UnitDomainValue, type UnitInputValue as UnitInnerInputValue, UnitType, interpretUnitInputValue, unitToInputValue,
	type FloatUnit as FloatUnitDomainValue, type FloatUnitInputValue as FloatUnitInnerInputValue, FloatUnitType, interpretFloatUnitInputValue, floatUnitToInputValue,
} from '@step-wise/physics-core'

import type { InputValue, InterpreterEntry } from '../types'
import { makeInputValue } from '../support'

export { FloatType, UnitType, FloatUnitType }

export type FloatInputValue = InputValue<FloatType, FloatInnerInputValue>
export const FloatInterpreter = {
	interpret: inputValue => interpretFloatInputValue(inputValue.value),
	toInputValue: float => makeInputValue(FloatType, floatToInputValue(float)),
} satisfies InterpreterEntry<FloatInputValue, FloatDomainValue>

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
	[FloatType]: FloatInterpreter,
	[UnitType]: UnitInterpreter,
	[FloatUnitType]: FloatUnitInterpreter,
}
