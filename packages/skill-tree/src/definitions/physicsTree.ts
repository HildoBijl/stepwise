import { and, or, repeat, pick, part } from '@step-wise/skill-setup'
import type { SkillTreeDefinition } from '@step-wise/skill-definition'

export const physicsTree: SkillTreeDefinition = {
	inputs: {
		enterFloat: {
			type: 'skill',
			name: 'Enter a decimal number',
		},
		enterUnit: {
			type: 'skill',
			name: 'Enter a unit',
		},
		lookUpConstant: {
			type: 'skill',
			name: 'Look up a constant',
		},
	},

	physicsMathematics: {
		solveExponentEquation: {
			type: 'skill',
			name: 'Solve an exponent equation',
		},
		linearInterpolation: {
			type: 'skill',
			name: 'Apply linear interpolation',
			setup: repeat('solveLinearEquation', 2),
		},
	},

	fundamentals: {
		units: {
			calculateWithPressure: {
				type: 'skill',
				name: 'Calculate with pressure',
			},
			calculateWithVolume: {
				type: 'skill',
				name: 'Calculate with volume',
			},
			calculateWithMass: {
				type: 'skill',
				name: 'Calculate with mass',
			},
			calculateWithTemperature: {
				type: 'skill',
				name: 'Calculate with temperature',
			},
		},
		efficiency: {
			calculateWithEfficiency: {
				type: 'skill',
				name: 'Calculate with efficiency',
			},
			calculateWithCOP: {
				type: 'skill',
				name: 'Calculate with the COP',
				links: { skillId: 'calculateWithEfficiency', correlation: 0.5 },
			},
		},
	},

	thermodynamics: {
		constants: {
			specificGasConstant: {
				type: 'skill',
				name: 'Look up a specific gas constant',
			},
			specificHeatRatio: {
				type: 'skill',
				name: 'Look up a specific heat ratio',
			},
			specificHeats: {
				type: 'skill',
				name: 'Look up specific heats',
				links: { skillIds: ['specificGasConstant', 'specificHeatRatio'], correlation: 0.5 },
			},
		},

		basicLaws: {
			gasLaw: {
				type: 'skill',
				name: 'Apply the gas law',
				setup: and(pick(['calculateWithPressure', 'calculateWithVolume', 'calculateWithMass', 'calculateWithTemperature'], 2), 'specificGasConstant', 'solveLinearEquation'),
			},
			recognizeProcessTypes: {
				type: 'skill',
				name: 'Recognize process types',
			},
			poissonsLaw: {
				type: 'skill',
				name: `Apply Poisson's law`,
				setup: and(pick(['calculateWithPressure', 'calculateWithVolume', 'calculateWithTemperature']), part('specificHeatRatio', 2 / 3), pick(['solveLinearEquation', 'solveExponentEquation'], 1, [1, 2])),
			},
		},

		closedCycles: {
			calculateProcessStep: {
				type: 'skill',
				name: 'Calculate a process step',
				setup: and('gasLaw', 'recognizeProcessTypes', part('poissonsLaw', 1 / 2), part('gasLaw', 1 / 2)),
			},
			calculateClosedCycle: {
				type: 'skill',
				name: 'Calculate a closed cycle',
				setup: repeat('calculateProcessStep', 3),
				thresholds: { mastery: 0.5 },
			},
			calculateHeatAndWork: {
				type: 'skill',
				name: 'Calculate heat and work',
				setup: and('recognizeProcessTypes', pick(['calculateWithPressure', 'calculateWithVolume', 'calculateWithTemperature', 'calculateWithMass'], 2), pick(['specificGasConstant', 'specificHeatRatio', 'specificHeats'], 2)),
			},
			calculateWithInternalEnergy: {
				type: 'skill',
				name: 'Calculate with internal energy',
				setup: and(pick(['gasLaw', 'poissonsLaw']), pick(['specificHeats', 'calculateHeatAndWork']), 'solveLinearEquation'),
			},
			createClosedCycleEnergyOverview: {
				type: 'skill',
				name: 'Create a closed-cycle energy overview',
				setup: and(repeat('calculateHeatAndWork', 2), or('calculateHeatAndWork', 'calculateWithInternalEnergy')),
				thresholds: { mastery: 0.5 },
			},
			analyseClosedCycle: {
				type: 'skill',
				name: 'Analyse a closed cycle',
				setup: and('calculateClosedCycle', 'createClosedCycleEnergyOverview', pick(['calculateWithEfficiency', 'calculateWithCOP'])),
				thresholds: { mastery: 0.4 },
			},
		},

		openCycles: {
			calculateWithSpecificQuantities: {
				type: 'skill',
				name: 'Calculate with specific quantities',
			},
			massFlowTrick: {
				type: 'skill',
				name: 'Apply the mass flow trick',
			},
			calculateOpenProcessStep: {
				type: 'skill',
				name: 'Calculate an open process step',
				setup: and('gasLaw', 'calculateWithSpecificQuantities', 'recognizeProcessTypes', part('poissonsLaw', 1 / 2), part('gasLaw', 1 / 2)),
				links: { skillId: 'calculateProcessStep', correlation: 0.7 },
			},
			calculateOpenCycle: {
				type: 'skill',
				name: 'Calculate an open cycle',
				setup: repeat('calculateOpenProcessStep', 3),
				links: { skillId: 'calculateClosedCycle', correlation: 0.6 },
				thresholds: { mastery: 0.5 },
			},
			calculateSpecificHeatAndMechanicalWork: {
				type: 'skill',
				name: 'Calculate specific heat and mechanical work',
				setup: and('recognizeProcessTypes', pick(['calculateWithPressure', 'calculateWithVolume', 'calculateWithTemperature', 'calculateWithMass'], 2), pick(['specificGasConstant', 'specificHeatRatio', 'specificHeats'], 2), 'calculateWithSpecificQuantities'),
				links: { skillId: 'calculateHeatAndWork', correlation: 0.4 },
			},
			calculateWithEnthalpy: {
				type: 'skill',
				name: 'Calculate with enthalpy',
				setup: and(pick(['massFlowTrick', 'calculateWithSpecificQuantities']), 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation'),
				links: { skillId: 'calculateWithInternalEnergy', correlation: 0.3 },
			},
			createOpenCycleEnergyOverview: {
				type: 'skill',
				name: 'Create an open cycle energy overview',
				setup: and(repeat('calculateSpecificHeatAndMechanicalWork', 2), 'calculateWithEnthalpy'),
				links: { skillId: 'createClosedCycleEnergyOverview', correlation: 0.4 },
				thresholds: { mastery: 0.5 },
			},
			analyseOpenCycle: {
				type: 'skill',
				name: 'Analyse an open cycle',
				setup: and('calculateOpenCycle', 'createOpenCycleEnergyOverview', pick(['calculateWithEfficiency', 'calculateWithCOP']), 'massFlowTrick'),
				links: { skillId: 'analyseClosedCycle', correlation: 0.5 },
				thresholds: { mastery: 0.4 },
			},
		},

		entropy: {
			calculateEntropyChange: {
				type: 'skill',
				name: 'Calculate an entropy change',
				setup: and('calculateWithTemperature', pick(['specificGasConstant', 'specificHeats']), 'solveLinearEquation'),
			},
			calculateMissedWork: {
				type: 'skill',
				name: 'Calculate the missed work',
				setup: and('calculateEntropyChange', 'solveLinearEquation'),
				thresholds: { mastery: 0.5 },
			},
			useIsentropicEfficiency: {
				type: 'skill',
				name: 'Use the isentropic efficiency',
				setup: and(pick([repeat('calculateSpecificHeatAndMechanicalWork', 2), repeat('calculateWithEnthalpy', 2)]), 'solveLinearEquation'),
			},
		},

		gasTurbines: {
			analyseGasTurbine: {
				type: 'skill',
				name: 'Analyse gas turbines',
				setup: and('calculateOpenCycle', 'useIsentropicEfficiency', 'createOpenCycleEnergyOverview', 'calculateWithEfficiency', 'massFlowTrick'),
				thresholds: { mastery: 0.4 },
			},
		},

		steam: {
			properties: {
				lookUpSteamProperties: {
					type: 'skill',
					name: 'Look up steam properties',
				},
				useVaporFraction: {
					type: 'skill',
					name: 'Use the vapor fraction',
					setup: and('lookUpSteamProperties', 'linearInterpolation'),
				},
			},
			rankineCycle: {
				createRankineCycleOverview: {
					type: 'skill',
					name: 'Create a Rankine cycle overview',
					setup: and(repeat('lookUpSteamProperties', 2), 'recognizeProcessTypes', 'useVaporFraction'),
					thresholds: { mastery: 0.5 },
				},
				analyseRankineCycle: {
					type: 'skill',
					name: 'Analyse a Rankine cycle',
					setup: and('createRankineCycleOverview', 'useIsentropicEfficiency', part('useVaporFraction', 1 / 2), 'calculateWithEfficiency', 'massFlowTrick'),
					thresholds: { mastery: 0.4 },
				},
			},
		},

		cooling: {
			properties: {
				findFridgeTemperatures: {
					type: 'skill',
					name: 'Find refrigerator temperatures',
				},
				determineRefrigerantProcess: {
					type: 'skill',
					name: 'Determine a refrigerant process',
				},
			},
			coolingCycles: {
				createCoolingCycleOverview: {
					type: 'skill',
					name: 'Create a cooling cycle overview',
					setup: and('findFridgeTemperatures', repeat('determineRefrigerantProcess', 3)),
					thresholds: { mastery: 0.5 },
				},
				analyseCoolingCycle: {
					type: 'skill',
					name: 'Analyse a cooling cycle',
					setup: and('createCoolingCycleOverview', 'useIsentropicEfficiency', 'calculateWithCOP', 'massFlowTrick'),
					thresholds: { mastery: 0.4 },
				},
			},
		},

		humidity: {
			readMollierDiagram: {
				type: 'skill',
				name: 'Read a Mollier diagram',
			},
			analyseAirco: {
				type: 'skill',
				name: 'Analyse an air conditioner',
				setup: repeat('readMollierDiagram', 3),
			},
		},
	},
}
