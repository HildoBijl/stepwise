import { sample, randomBoolean } from '@step-wise/js-utils'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloatUnit, getRandomExponentialFloatUnit } from '@step-wise/physics-core'
import { refrigerants, getRefrigerantPropertiesFromTemperature, getRefrigerantPropertiesFromEnthalpy, getVaporPropertiesFromTemperature, getVaporPropertiesFromPressure } from '@step-wise/physics-data'

export default buildMonoExercise({
	metadata: {
		skill: 'determineRefrigerantProcess',
		compare: { FloatUnit: { float: { absoluteTolerance: 4000, significantDigitTolerance: 2 } } },
	},

	generateParameters() {
		while (true) {
			const refrigerant = sample(Object.keys(refrigerants))
			const refrigerantData = refrigerants[refrigerant]
			const pressure = getRandomExponentialFloatUnit({
				min: refrigerantData.tablesByPressure[0].pressure.setUnit('bar').number,
				max: refrigerantData.criticalPoint.pressure.setUnit('bar').number * 0.8,
				unit: 'bar',
			})
			let point1 = getRefrigerantPropertiesFromEnthalpy(refrigerantData, pressure, getRandomFloatUnit({ min: 150, max: 300, unit: 'kJ/kg' }))
			let point2 = getRefrigerantPropertiesFromEnthalpy(refrigerantData, pressure, getRandomFloatUnit({ min: 350, max: 500, unit: 'kJ/kg' }))
			if (!point1 || !point2) continue
			if (randomBoolean()) [point1, point2] = [point2, point1]

			const parameters = {
				refrigerant,
				phase1: point1.phase,
				T1: point1.temperature.setDecimals(0).roundToPrecision(),
				x1: point1.phase === 'vapor' ? point1.vaporFraction!.setDecimals(2).roundToPrecision().setDisplayPower(0) : undefined,
				p1: point1.phase === 'vapor' ? undefined : point1.pressure.setSignificantDigits(2).roundToPrecision(),
				phase2: point2.phase,
				x2: point2.phase === 'vapor' ? point2.vaporFraction!.setDecimals(2).roundToPrecision().setDisplayPower(0) : undefined,
				T2: point2.phase === 'vapor' ? undefined : point2.temperature.setDecimals(0).roundToPrecision(),
			}
			try {
				const checkedPoint1 = parameters.phase1 === 'vapor' ? getVaporPropertiesFromTemperature(refrigerantData, parameters.T1, parameters.x1!) : getRefrigerantPropertiesFromTemperature(refrigerantData, parameters.p1!, parameters.T1)
				if (!checkedPoint1) continue
				const checkedPoint2 = parameters.phase2 === 'vapor' ? getVaporPropertiesFromPressure(refrigerantData, checkedPoint1.pressure, parameters.x2!) : getRefrigerantPropertiesFromTemperature(refrigerantData, checkedPoint1.pressure, parameters.T2!)
				if (!checkedPoint2) continue
				return parameters
			} catch { }
		}
	},

	getSolution({ refrigerant, phase1, T1, x1, p1, phase2, x2, T2 }) {
		const refrigerantData = refrigerants[refrigerant]
		const point1 = phase1 === 'vapor' ? getVaporPropertiesFromTemperature(refrigerantData, T1, x1!)! : getRefrigerantPropertiesFromTemperature(refrigerantData, p1!, T1)!
		const point2 = phase2 === 'vapor' ? getVaporPropertiesFromPressure(refrigerantData, point1.pressure, x2!)! : getRefrigerantPropertiesFromTemperature(refrigerantData, point1.pressure, T2!)!
		return {
			refrigerant,
			p: point1.pressure.setSignificantDigits(2),
			phase1,
			T1: point1.temperature.setDecimals(0),
			x1: point1.vaporFraction?.setDecimals(2),
			h1: point1.enthalpy.setDecimals(0),
			phase2,
			T2: point2.temperature.setDecimals(0),
			x2: point2.vaporFraction?.setDecimals(2),
			h2: point2.enthalpy.setDecimals(0),
		}
	},

	checkInput(data) {
		return compareInputs(['h1', 'h2'], data)
	},
})
