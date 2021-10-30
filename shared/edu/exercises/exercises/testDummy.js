import { getRandomInteger } from '../../../inputTypes/Integer'
// import { getSimpleExerciseProcessor } from '../util/simpleExercise'
import { checkParameter } from '../util/check'

import { Expression } from './testDummyDir'

// import { applyToEachParameter, isObject, deepEquals } from '../../../util/objects'

// import * as String from '../../../inputTypes/String'
// import * as Boolean from '../../../inputTypes/Boolean'
// import * as Integer from '../../../inputTypes/Integer'
// import * as Float from '../../../inputTypes/Float'
// import * as Unit from '../../../inputTypes/Unit'
// import * as FloatUnit from '../../../inputTypes/FloatUnit'
// import * as MultipleChoice from '../../../inputTypes/MultipleChoice'
// import { Expression } from '../../../inputTypes/Expression/loader'
// import * as Equation from '../../../inputTypes/Equation'

// import { setIOtoFO } from '../../../inputTypes'

export const data = {
	skill: 'testDummy',
	equalityOptions: {},
}

export function generateState() {
	return { x: getRandomInteger(-100, 100) }
}

export function checkInput(state, input) {
	return state.x === input.x
}

export const processAction = () => ({})
