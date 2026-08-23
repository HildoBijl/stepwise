import type { CheckInputData } from './types'

type PrimitiveInputType = 'number' | 'string' | 'boolean'
type PrimitiveInputTypeMap = { number: number, string: string, boolean: boolean }

type InputConstructor = abstract new (...args: never[]) => unknown
type InputType = InputConstructor | PrimitiveInputType

type InputTypesForKeys<Keys extends readonly string[]> = { readonly [Index in keyof Keys]: InputType }
type InputInstance<Type extends InputType> = Type extends PrimitiveInputType ? PrimitiveInputTypeMap[Type] : Type extends InputConstructor ? InstanceType<Type> : never
type InputInstances<Types extends readonly InputType[]> = { [Index in keyof Types]: InputInstance<Types[Index]> }

// Helper to check if a given type is a constructor (like PrecisionNumber) or otherwise a string of a basic type (like 'number').
function isInputConstructor(inputType: InputType): inputType is InputConstructor {
	return typeof inputType === 'function'
}

// Retrieve an interpreted input value and verify its domain type. Use constructors for object types "getInput('p', data, Quantity)" and use strings for basic types "getInput('n', data, 'number')".
export function getInput<Type extends InputType>(key: string, data: CheckInputData, inputType: Type): InputInstance<Type> {
	const input = data.input[key]
	const matches = isInputConstructor(inputType) ? input instanceof inputType : typeof input === inputType
	if (!matches) throw new TypeError(`Invalid getInput call: input "${key}" has an unexpected type.`)
	return input as InputInstance<Type>
}

// Retrieve multiple interpreted input values, for either one shared type or an array of possibly different types.
export function getInputs<const Keys extends readonly string[], Type extends InputType>(keys: Keys, data: CheckInputData, inputType: Type): { [Index in keyof Keys]: InputInstance<Type> }
export function getInputs<const Keys extends readonly string[], const Types extends InputTypesForKeys<Keys>>(keys: Keys, data: CheckInputData, inputTypes: Types): InputInstances<Types>
export function getInputs(keys: readonly string[], data: CheckInputData, inputTypes: InputType | readonly InputType[]): unknown[] {
	if (!Array.isArray(inputTypes)) return keys.map(key => getInput(key, data, inputTypes as InputType))
	if (keys.length !== inputTypes.length) throw new RangeError(`Invalid getInputs call: received ${keys.length} keys and ${inputTypes.length} input types.`)
	return keys.map((key, index) => getInput(key, data, inputTypes[index]))
}
