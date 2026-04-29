import { RawSkillLevel } from './types'

export function getInitialSkillLevel(date = new Date()): RawSkillLevel {
	return {
		coefficients: [1],
		coefficientsOn: date,
		highest: [1],
		highestOn: date,
		numPracticed: 0,
	}
}
