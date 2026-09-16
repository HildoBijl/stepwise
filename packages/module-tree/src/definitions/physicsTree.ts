import { and, or, repeat, pick, part } from '@step-wise/skill-setup'
import type { ModuleTreeDefinition } from '@step-wise/module-tree-definition'

export const physicsTree: ModuleTreeDefinition = {
	inputs: {
		enterFloat: {
			type: 'skill',
		},
		enterUnit: {
			type: 'skill',
		},
		lookUpConstant: {
			type: 'skill',
		},
	},

	physicsMathematics: {
		solveExponentEquation: {
			type: 'skill',
		},
		linearInterpolation: {
			type: 'skill',
			setup: repeat('solveLinearEquation', 2),
		},
	},

	fundamentals: {
		units: {
			calculateWithPressure: {
				type: 'skill',
			},
			calculateWithVolume: {
				type: 'skill',
			},
			calculateWithMass: {
				type: 'skill',
			},
			calculateWithTemperature: {
				type: 'skill',
			},
		},
		efficiency: {
			calculateWithEfficiency: {
				type: 'skill',
			},
			calculateWithCOP: {
				type: 'skill',
				links: { skillId: 'calculateWithEfficiency', correlation: 0.5 },
			},
		},
	},

	thermodynamics: {
		constants: {
			specificGasConstant: {
				type: 'skill',
			},
			specificHeatRatio: {
				type: 'skill',
			},
			specificHeats: {
				type: 'skill',
				links: { skillIds: ['specificGasConstant', 'specificHeatRatio'], correlation: 0.5 },
			},
		},

		basicLaws: {
			gasLaw: {
				type: 'skill',
				setup: and(pick(['calculateWithPressure', 'calculateWithVolume', 'calculateWithMass', 'calculateWithTemperature'], 2), 'specificGasConstant', 'solveLinearEquation'),
			},
			recognizeProcessTypes: {
				type: 'skill',
			},
			poissonsLaw: {
				type: 'skill',
				setup: and(pick(['calculateWithPressure', 'calculateWithVolume', 'calculateWithTemperature']), part('specificHeatRatio', 2 / 3), pick(['solveLinearEquation', 'solveExponentEquation'], 1, [1, 2])),
			},
		},

		closedCycles: {
			calculateProcessStep: {
				type: 'skill',
				setup: and('gasLaw', 'recognizeProcessTypes', part('poissonsLaw', 1 / 2), part('gasLaw', 1 / 2)),
			},
			calculateClosedCycle: {
				type: 'skill',
				setup: repeat('calculateProcessStep', 3),
				thresholds: { mastery: 0.5 },
			},
			calculateHeatAndWork: {
				type: 'skill',
				setup: and('recognizeProcessTypes', pick(['calculateWithPressure', 'calculateWithVolume', 'calculateWithTemperature', 'calculateWithMass'], 2), pick(['specificGasConstant', 'specificHeatRatio', 'specificHeats'], 2)),
			},
			calculateWithInternalEnergy: {
				type: 'skill',
				setup: and(pick(['gasLaw', 'poissonsLaw']), pick(['specificHeats', 'calculateHeatAndWork']), 'solveLinearEquation'),
			},
			createClosedCycleEnergyOverview: {
				type: 'skill',
				setup: and(repeat('calculateHeatAndWork', 2), or('calculateHeatAndWork', 'calculateWithInternalEnergy')),
				thresholds: { mastery: 0.5 },
			},
			analyseClosedCycle: {
				type: 'skill',
				setup: and('calculateClosedCycle', 'createClosedCycleEnergyOverview', pick(['calculateWithEfficiency', 'calculateWithCOP'])),
				thresholds: { mastery: 0.4 },
			},
		},

		openCycles: {
			calculateWithSpecificQuantities: {
				type: 'skill',
			},
			massFlowTrick: {
				type: 'skill',
			},
			calculateOpenProcessStep: {
				type: 'skill',
				setup: and('gasLaw', 'calculateWithSpecificQuantities', 'recognizeProcessTypes', part('poissonsLaw', 1 / 2), part('gasLaw', 1 / 2)),
				links: { skillId: 'calculateProcessStep', correlation: 0.7 },
			},
			calculateOpenCycle: {
				type: 'skill',
				setup: repeat('calculateOpenProcessStep', 3),
				links: { skillId: 'calculateClosedCycle', correlation: 0.6 },
				thresholds: { mastery: 0.5 },
			},
			calculateSpecificHeatAndMechanicalWork: {
				type: 'skill',
				setup: and('recognizeProcessTypes', pick(['calculateWithPressure', 'calculateWithVolume', 'calculateWithTemperature', 'calculateWithMass'], 2), pick(['specificGasConstant', 'specificHeatRatio', 'specificHeats'], 2), 'calculateWithSpecificQuantities'),
				links: { skillId: 'calculateHeatAndWork', correlation: 0.4 },
			},
			calculateWithEnthalpy: {
				type: 'skill',
				setup: and(pick(['massFlowTrick', 'calculateWithSpecificQuantities']), 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation'),
				links: { skillId: 'calculateWithInternalEnergy', correlation: 0.3 },
			},
			createOpenCycleEnergyOverview: {
				type: 'skill',
				setup: and(repeat('calculateSpecificHeatAndMechanicalWork', 2), 'calculateWithEnthalpy'),
				links: { skillId: 'createClosedCycleEnergyOverview', correlation: 0.4 },
				thresholds: { mastery: 0.5 },
			},
			analyseOpenCycle: {
				type: 'skill',
				setup: and('calculateOpenCycle', 'createOpenCycleEnergyOverview', pick(['calculateWithEfficiency', 'calculateWithCOP']), 'massFlowTrick'),
				links: { skillId: 'analyseClosedCycle', correlation: 0.5 },
				thresholds: { mastery: 0.4 },
			},
		},

		entropy: {
			calculateEntropyChange: {
				type: 'skill',
				setup: and('calculateWithTemperature', pick(['specificGasConstant', 'specificHeats']), 'solveLinearEquation'),
			},
			calculateMissedWork: {
				type: 'skill',
				setup: and('calculateEntropyChange', 'solveLinearEquation'),
				thresholds: { mastery: 0.5 },
			},
			useIsentropicEfficiency: {
				type: 'skill',
				setup: and(pick([repeat('calculateSpecificHeatAndMechanicalWork', 2), repeat('calculateWithEnthalpy', 2)]), 'solveLinearEquation'),
			},
		},

		gasTurbines: {
			analyseGasTurbine: {
				type: 'skill',
				setup: and('calculateOpenCycle', 'useIsentropicEfficiency', 'createOpenCycleEnergyOverview', 'calculateWithEfficiency', 'massFlowTrick'),
				thresholds: { mastery: 0.4 },
			},
		},

		steam: {
			properties: {
				lookUpSteamProperties: {
					type: 'skill',
				},
				useVaporFraction: {
					type: 'skill',
					setup: and('lookUpSteamProperties', 'linearInterpolation'),
				},
			},
			rankineCycle: {
				createRankineCycleOverview: {
					type: 'skill',
					setup: and(repeat('lookUpSteamProperties', 2), 'recognizeProcessTypes', 'useVaporFraction'),
					thresholds: { mastery: 0.5 },
				},
				analyseRankineCycle: {
					type: 'skill',
					setup: and('createRankineCycleOverview', 'useIsentropicEfficiency', part('useVaporFraction', 1 / 2), 'calculateWithEfficiency', 'massFlowTrick'),
					thresholds: { mastery: 0.4 },
				},
			},
		},

		cooling: {
			properties: {
				findFridgeTemperatures: {
					type: 'skill',
				},
				determineRefrigerantProcess: {
					type: 'skill',
				},
			},
			coolingCycles: {
				createCoolingCycleOverview: {
					type: 'skill',
					setup: and('findFridgeTemperatures', repeat('determineRefrigerantProcess', 3)),
					thresholds: { mastery: 0.5 },
				},
				analyseCoolingCycle: {
					type: 'skill',
					setup: and('createCoolingCycleOverview', 'useIsentropicEfficiency', 'calculateWithCOP', 'massFlowTrick'),
					thresholds: { mastery: 0.4 },
				},
			},
		},

		humidity: {
			readMollierDiagram: {
				type: 'skill',
			},
			analyseAirco: {
				type: 'skill',
				setup: repeat('readMollierDiagram', 3),
			},
		},
	},
}
