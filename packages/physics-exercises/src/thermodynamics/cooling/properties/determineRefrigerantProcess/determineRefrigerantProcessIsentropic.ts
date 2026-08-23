import { sample, randomBoolean } from '@step-wise/js-utils'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloatUnit, getRandomExponentialFloatUnit } from '@step-wise/physics-core'
import { refrigerants, getRefrigerantPropertiesFromTemperature, getRefrigerantPropertiesFromEnthalpy, getRefrigerantPropertiesFromEntropy, getVaporPropertiesFromTemperature } from '@step-wise/physics-data'

export default buildMonoExercise({
	metadata: {
		skill: 'determineRefrigerantProcess',
		comparisons: { FloatUnit: { value: { absoluteTolerance: 4000, significantDigitTolerance: 2 } } },
	},

	generateParameters() {
		while (true) {
			const refrigerant = sample(Object.keys(refrigerants))
			const refrigerantData = refrigerants[refrigerant]
			const minPressure = refrigerantData.tablesByPressure[0].pressure.setUnit('bar').number
			const maxPressure = refrigerantData.criticalPoint.pressure.setUnit('bar').number * 0.8
			const pressure1 = getRandomExponentialFloatUnit({ min: minPressure, max: minPressure * 6, unit: 'bar' })
			const pressure2 = getRandomExponentialFloatUnit({ min: maxPressure / 6, max: maxPressure, unit: 'bar' })
			let point2 = getRefrigerantPropertiesFromEnthalpy(refrigerantData, pressure2, getRandomFloatUnit({ min: 350, max: 500, unit: 'kJ/kg' }))
			if (!point2) continue
			let point1 = getRefrigerantPropertiesFromEntropy(refrigerantData, pressure1, point2.entropy)
			if (!point1) continue
			if (randomBoolean()) [point1, point2] = [point2, point1]

			const parameters = {
				refrigerant,
				phase1: point1.phase,
				T1: point1.temperature.setDecimals(0).roundToPrecision(),
				x1: point1.phase === 'vapor' ? point1.vaporFraction!.setDecimals(2).roundToPrecision().setDisplayPower(0) : undefined,
				p1: point1.phase === 'vapor' ? undefined : point1.pressure.setSignificantDigits(2).roundToPrecision(),
				p2: point2.pressure.setSignificantDigits(2).roundToPrecision(),
			}
			try {
				const checkedPoint1 = parameters.phase1 === 'vapor' ? getVaporPropertiesFromTemperature(refrigerantData, parameters.T1, parameters.x1!) : getRefrigerantPropertiesFromTemperature(refrigerantData, parameters.p1!, parameters.T1)
				if (!checkedPoint1) continue
				const checkedPoint2 = getRefrigerantPropertiesFromEntropy(refrigerantData, parameters.p2, checkedPoint1.entropy)
				if (!checkedPoint2) continue
				return parameters
			} catch { }
		}
	},

	getSolution({ refrigerant, phase1, T1, x1, p1, p2 }) {
		const refrigerantData = refrigerants[refrigerant]
		const point1 = phase1 === 'vapor' ? getVaporPropertiesFromTemperature(refrigerantData, T1, x1!)! : getRefrigerantPropertiesFromTemperature(refrigerantData, p1!, T1)!
		const point2 = getRefrigerantPropertiesFromEntropy(refrigerantData, p2, point1.entropy)!
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
