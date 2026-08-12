import { type Load, type SerializedLoad, serializeLoad, deserializeLoad } from '@step-wise/engineering-mechanics'

import type { InterpreterEntry } from '../types'

export const FBDType = 'FreeBodyDiagram'
export type FBDType = typeof FBDType

export type SerializedFBD = {
	type: FBDType,
	value: SerializedLoad[]
}

export const FBDInterpreter = {
	interpret: (serializedFBD: SerializedFBD) => serializedFBD.value.map(serializedLoad => deserializeLoad(serializedLoad)),
	toInputValue: FBD => ({ type: FBDType, value: FBD.map(load => serializeLoad(load)) }),
} satisfies InterpreterEntry<SerializedFBD, Load[]>

export const mechanicsInterpreters = {
	[FBDType]: FBDInterpreter,
}
