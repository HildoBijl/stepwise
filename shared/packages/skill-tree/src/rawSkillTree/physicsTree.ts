import { and, or, repeat, pick, part } from '@step-wise/skill-setup'
import type { RawSkillGroup } from '@step-wise/skill-definition'

export const physicsTree: RawSkillGroup = {
	physicsMathematics: {
		solveExponentEquation: {
			name: 'Solve an exponent equation',
		},
		linearInterpolation: {
			name: 'Apply linear interpolation',
			setup: repeat('solveLinearEquation', 2),
		},
	},

	fundamentals: {
		units: {
			calculateWithPressure: {
				name: 'Calculate with pressure',
			},
			calculateWithVolume: {
				name: 'Calculate with volume',
			},
			calculateWithMass: {
				name: 'Calculate with mass',
			},
			calculateWithTemperature: {
				name: 'Calculate with temperature',
			},
		},
		efficiency: {
			calculateWithEfficiency: {
				name: 'Calculate with efficiency',
			},
			calculateWithCOP: {
				name: 'Calculate with the COP',
				links: { skill: 'calculateWithEfficiency', correlation: 0.5 },
			},
		},
	},

	thermodynamics: {
		constants: {
			specificGasConstant: {
				name: 'Look up a specific gas constant',
			},
			specificHeatRatio: {
				name: 'Look up a specific heat ratio',
			},
			specificHeats: {
				name: 'Look up specific heats',
				links: { skills: ['specificGasConstant', 'specificHeatRatio'], correlation: 0.5 },
			},
		},
		
		basicLaws: {
			gasLaw: {
				name: 'Apply the gas law',
				setup: and(pick(['calculateWithPressure', 'calculateWithVolume', 'calculateWithMass', 'calculateWithTemperature'], 2), 'specificGasConstant', 'solveLinearEquation'),
			},
			recognizeProcessTypes: {
				name: 'Recognize process types',
			},
			poissonsLaw: {
				name: `Apply Poisson's law`,
				setup: and(pick(['calculateWithPressure', 'calculateWithVolume', 'calculateWithTemperature']), part('specificHeatRatio', 2 / 3), pick(['solveLinearEquation', 'solveExponentEquation'], 1, [1, 2])),
			},
		},

		closedCycles: {
			calculateProcessStep: {
				name: 'Calculate a process step',
				setup: and('gasLaw', 'recognizeProcessTypes', part('poissonsLaw', 1 / 2), part('gasLaw', 1 / 2)),
			},
			calculateClosedCycle: {
				name: 'Calculate a closed cycle',
				setup: repeat('calculateProcessStep', 3),
				thresholds: { pass: 0.5 },
			},
			calculateHeatAndWork: {
				name: 'Calculate heat and work',
				setup: and('recognizeProcessTypes', pick(['calculateWithPressure', 'calculateWithVolume', 'calculateWithTemperature', 'calculateWithMass'], 2), pick(['specificGasConstant', 'specificHeatRatio', 'specificHeats'], 2)),
			},
			calculateWithInternalEnergy: {
				name: 'Calculate with internal energy',
				setup: and(pick(['gasLaw', 'poissonsLaw']), pick(['specificHeats', 'calculateHeatAndWork']), 'solveLinearEquation'),
			},
			createClosedCycleEnergyOverview: {
				name: 'Create a closed-cycle energy overview',
				setup: and(repeat('calculateHeatAndWork', 2), or('calculateHeatAndWork', 'calculateWithInternalEnergy')),
				thresholds: { pass: 0.5 },
			},
			analyseClosedCycle: {
				name: 'Analyse a closed cycle',
				setup: and('calculateClosedCycle', 'createClosedCycleEnergyOverview', pick(['calculateWithEfficiency', 'calculateWithCOP'])),
				thresholds: { pass: 0.4 },
			},
		},

		openCycles: {
			calculateWithSpecificQuantities: {
				name: 'Calculate with specific quantities',
			},
			massFlowTrick: {
				name: 'Apply the mass flow trick',
			},
			calculateOpenProcessStep: {
				name: 'Calculate an open process step',
				setup: and('gasLaw', 'calculateWithSpecificQuantities', 'recognizeProcessTypes', part('poissonsLaw', 1 / 2), part('gasLaw', 1 / 2)),
				links: { skill: 'calculateProcessStep', correlation: 0.7 },
			},
			calculateOpenCycle: {
				name: 'Calculate an open cycle',
				setup: repeat('calculateOpenProcessStep', 3),
				links: { skill: 'calculateClosedCycle', correlation: 0.6 },
				thresholds: { pass: 0.5 },
			},
			calculateSpecificHeatAndMechanicalWork: {
				name: 'Calculate specific heat and mechanical work',
				setup: and('recognizeProcessTypes', pick(['calculateWithPressure', 'calculateWithVolume', 'calculateWithTemperature', 'calculateWithMass'], 2), pick(['specificGasConstant', 'specificHeatRatio', 'specificHeats'], 2), 'calculateWithSpecificQuantities'),
				links: { skill: 'calculateHeatAndWork', correlation: 0.4 },
			},
			calculateWithEnthalpy: {
				name: 'Calculate with enthalpy',
				setup: and(pick(['massFlowTrick', 'calculateWithSpecificQuantities']), 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation'),
				links: { skill: 'calculateWithInternalEnergy', correlation: 0.3 },
			},
			createOpenCycleEnergyOverview: {
				name: 'Create an open cycle energy overview',
				setup: and(repeat('calculateSpecificHeatAndMechanicalWork', 2), 'calculateWithEnthalpy'),
				links: { skill: 'createClosedCycleEnergyOverview', correlation: 0.4 },
				thresholds: { pass: 0.5 },
			},
			analyseOpenCycle: {
				name: 'Analyse an open cycle',
				setup: and('calculateOpenCycle', 'createOpenCycleEnergyOverview', pick(['calculateWithEfficiency', 'calculateWithCOP']), 'massFlowTrick'),
				links: { skill: 'analyseClosedCycle', correlation: 0.5 },
				thresholds: { pass: 0.4 },
			},
		},

		entropy: {
			calculateEntropyChange: {
				name: 'Calculate an entropy change',
				setup: and('calculateWithTemperature', pick(['specificGasConstant', 'specificHeats']), 'solveLinearEquation'),
			},
			calculateMissedWork: {
				name: 'Calculate the missed work',
				setup: and('calculateEntropyChange', 'solveLinearEquation'),
				thresholds: { pass: 0.5 },
			},
			useIsentropicEfficiency: {
				name: 'Use the isentropic efficiency',
				setup: and(pick([repeat('calculateSpecificHeatAndMechanicalWork', 2), repeat('calculateWithEnthalpy', 2)]), 'solveLinearEquation'),
			},
		},

		gasTurbines: {
			analyseGasTurbine: {
				name: 'Analyse gas turbines',
				setup: and('calculateOpenCycle', 'useIsentropicEfficiency', 'createOpenCycleEnergyOverview', 'calculateWithEfficiency', 'massFlowTrick'),
				thresholds: { pass: 0.4 },
			},
		},

		steam: {
			properties: {
				lookUpSteamProperties: {
					name: 'Look up steam properties',
				},
				useVaporFraction: {
					name: 'Use the vapor fraction',
					setup: and('lookUpSteamProperties', 'linearInterpolation'),
				},
			},
			rankineCycle: {
				createRankineCycleOverview: {
					name: 'Create a Rankine cycle overview',
					setup: and(repeat('lookUpSteamProperties', 2), 'recognizeProcessTypes', 'useVaporFraction'),
					thresholds: { pass: 0.5 },
				},
				analyseRankineCycle: {
					name: 'Analyse a Rankine cycle',
					setup: and('createRankineCycleOverview', 'useIsentropicEfficiency', part('useVaporFraction', 1 / 2), 'calculateWithEfficiency', 'massFlowTrick'),
					thresholds: { pass: 0.4 },
				},
			},
		},

		cooling: {
			properties: {
				findFridgeTemperatures: {
					name: 'Find refrigerator temperatures',
				},
				determineRefrigerantProcess: {
					name: 'Determine a refrigerant process',
				},
			},
			coolingCycles: {
				createCoolingCycleOverview: {
					name: 'Create a cooling cycle overview',
					setup: and('findFridgeTemperatures', repeat('determineRefrigerantProcess', 3)),
					thresholds: { pass: 0.5 },
				},
				analyseCoolingCycle: {
					name: 'Analyse a cooling cycle',
					setup: and('createCoolingCycleOverview', 'useIsentropicEfficiency', 'calculateWithCOP', 'massFlowTrick'),
					thresholds: { pass: 0.4 },
				},
			},
		},

		humidity: {
			readMollierDiagram: {
				name: 'Read a Mollier diagram',
			},
			analyseAirco: {
				name: 'Analyse an air conditioner',
				setup: repeat('readMollierDiagram', 3),
			},
		},
	},
}
