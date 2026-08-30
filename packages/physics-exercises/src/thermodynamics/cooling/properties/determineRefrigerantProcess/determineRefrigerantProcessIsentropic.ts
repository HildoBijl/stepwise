import { sample, randomBoolean } from '@step-wise/js-utils'
import { compareInputs } from '@step-wise/exercise-grading'
import { type Quantity, getRandomQuantity, getRandomExponentialQuantity } from '@step-wise/physics-core'
import { type RefrigerantPhase, refrigerantDatasets, getRefrigerantPropertiesFromPressureAndTemperature, getRefrigerantPropertiesFromPressureAndEnthalpy, getRefrigerantPropertiesFromPressureAndEntropy, getSaturatedMixturePropertiesFromTemperature } from '@step-wise/physics-data'

import { buildMonoExercise } from '#physicsExerciseBuilding'

type DetermineRefrigerantProcessIsentropicParameters = {
	refrigerant: string
	phase1: RefrigerantPhase
	T1: Quantity
	x1?: Quantity
	p1?: Quantity
	p2: Quantity
}

export default buildMonoExercise({
	metadata: {
		skill: 'determineRefrigerantProcess',
		comparisons: { Quantity: { value: { absoluteTolerance: 4000, significantDigitTolerance: 2 } } },
	},

	generateParameters(): DetermineRefrigerantProcessIsentropicParameters {
		for (let attempt = 0; attempt < 100; attempt++) {
			const refrigerant = sample(Object.keys(refrigerantDatasets))
			const refrigerantData = refrigerantDatasets[refrigerant]
			const minPressure = refrigerantData.tablesByPressure[0].pressure.setUnit('bar').number
			const maxPressure = refrigerantData.criticalPoint.pressure.setUnit('bar').number * 0.8
			const pressure1 = getRandomExponentialQuantity({ min: minPressure, max: minPressure * 6, unit: 'bar' })
			const pressure2 = getRandomExponentialQuantity({ min: maxPressure / 6, max: maxPressure, unit: 'bar' })
			let point2 = getRefrigerantPropertiesFromPressureAndEnthalpy(refrigerantData, pressure2, getRandomQuantity({ min: 350, max: 500, unit: 'kJ/kg' }))
			if (!point2) continue
			let point1 = getRefrigerantPropertiesFromPressureAndEntropy(refrigerantData, pressure1, point2.entropy)
			if (!point1) continue
			if (randomBoolean()) [point1, point2] = [point2, point1]

			const parameters: DetermineRefrigerantProcessIsentropicParameters = {
				refrigerant,
				phase1: point1.phase,
				T1: point1.temperature.setDecimals(0).roundToPrecision(),
				...(point1.phase === 'mixture'
					? { x1: point1.vaporFraction!.setDecimals(2).roundToPrecision().setDisplayPower(0) }
					: { p1: point1.pressure.setSignificantDigits(2).roundToPrecision() }),
				p2: point2.pressure.setSignificantDigits(2).roundToPrecision(),
			}
			const checkedPoint1 = parameters.phase1 === 'mixture' ? getSaturatedMixturePropertiesFromTemperature(refrigerantData, parameters.T1, parameters.x1!) : getRefrigerantPropertiesFromPressureAndTemperature(refrigerantData, parameters.p1!, parameters.T1)
			if (!checkedPoint1) continue
			const checkedPoint2 = getRefrigerantPropertiesFromPressureAndEntropy(refrigerantData, parameters.p2, checkedPoint1.entropy)
			if (!checkedPoint2) continue
			return parameters
		}
		throw new Error('Failed to generate a valid isentropic refrigerant process after 100 attempts.')
	},

	getSolution({ refrigerant, phase1, T1, x1, p1, p2 }) {
		const refrigerantData = refrigerantDatasets[refrigerant]
		const point1 = phase1 === 'mixture' ? getSaturatedMixturePropertiesFromTemperature(refrigerantData, T1, x1!)! : getRefrigerantPropertiesFromPressureAndTemperature(refrigerantData, p1!, T1)!
		const point2 = getRefrigerantPropertiesFromPressureAndEntropy(refrigerantData, p2, point1.entropy)!
		return {
			refrigerant,
			phase1,
			p1: point1.pressure.setSignificantDigits(2),
			T1: point1.temperature.setDecimals(0),
			x1: point1.vaporFraction?.setDecimals(2).setDisplayPower(0),
			h1: point1.enthalpy.setDecimals(0),
			s1: point1.entropy.setDecimals(2),
			phase2: point2.phase,
			p2: point2.pressure.setSignificantDigits(2),
			T2: point2.temperature.setDecimals(0),
			x2: point2.vaporFraction?.setDecimals(2).setDisplayPower(0),
			h2: point2.enthalpy.setDecimals(0),
			s2: point2.entropy.setDecimals(2),
		}
	},

	checkInput(data) {
		return compareInputs(['h1', 'h2'], data)
	},
})
