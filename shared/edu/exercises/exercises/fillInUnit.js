import { selectRandomly } from '../../../util/random'
import Unit from '../../../inputTypes/Unit'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'

export const data = {
	skill: 'fillInUnit',
	equalityOptions: {
		type: Unit.equalityTypes.exact,
	}
}

export function generateState() {
	return { unit: selectRandomly([
		new Unit('dC'),
		new Unit('mum'),
		new Unit('Ohm'),
		new Unit('kg * m / s^2'),
		new Unit('N / mm^2'),
		new Unit('kJ / kg * K'),
		new Unit('m^3 / kg * s^2'),
	 ]) }
}

export function checkInput({ unit }, { ans }) {
	return unit.equals(ans, data.equalityOptions)
}

export default {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}
