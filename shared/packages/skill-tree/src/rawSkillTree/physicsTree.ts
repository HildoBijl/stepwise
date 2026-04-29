import { and, or, repeat, pick, part } from '@step-wise/skill-setup'
import type { RawSkillGroup } from '@step-wise/skill-definition'

export const physicsTree: RawSkillGroup = {
	physicsMathematics: {
		solveExponentEquation: {
			name: 'Solve an exponent equation',
			exercises: ['solveExponentEquation1', 'solveExponentEquation2', 'solveExponentEquation3', 'solveExponentEquation4'],
		},
		linearInterpolation: {
			name: 'Apply linear interpolation',
			setup: repeat('solveLinearEquation', 2),
			exercises: ['linearInterpolationPopulation', 'linearInterpolationKettle', 'linearInterpolationChild'],
		},
	},

	fundamentals: {
		units: {
			calculateWithPressure: {
				name: 'Calculate with pressure',
				exercises: ['calculateWithPressure'],
			},
			calculateWithVolume: {
				name: 'Calculate with volume',
				exercises: ['calculateWithVolume'],
			},
			calculateWithMass: {
				name: 'Calculate with mass',
				exercises: ['calculateWithMass'],
			},
			calculateWithTemperature: {
				name: 'Calculate with temperature',
				exercises: ['calculateWithTemperature'],
			},
		},
		efficiency: {
			calculateWithEfficiency: {
				name: 'Calculate with efficiency',
				exercises: ['calculateWithEfficiencyGenerator', 'calculateWithEfficiencyBattery'],
			},
			calculateWithCOP: {
				name: 'Calculate with the COP',
				links: { skill: 'calculateWithEfficiency', correlation: 0.5 },
				exercises: ['calculateWithCOPRefrigerator', 'calculateWithCOPHeatPump'],
			},
		},
	},

	thermodynamics: {
		constants: {
			specificGasConstant: {
				name: 'Look up a specific gas constant',
				exercises: ['specificGasConstant'],
			},
			specificHeatRatio: {
				name: 'Look up a specific heat ratio',
				exercises: ['specificHeatRatio'],
			},
			specificHeats: {
				name: 'Look up specific heats',
				exercises: ['specificHeats'],
				links: { skills: ['specificGasConstant', 'specificHeatRatio'], correlation: 0.5 },
			},
		},
		basicLaws: {
			gasLaw: {
				name: 'Apply the gas law',
				setup: and(pick(['calculateWithPressure', 'calculateWithVolume', 'calculateWithMass', 'calculateWithTemperature'], 2), 'specificGasConstant', 'solveLinearEquation'),
				exercises: ['gasLawLightBulb', 'gasLawHeliumBalloon', 'gasLawDivingCylinder', 'gasLawBicyclePump', 'gasLawWeatherBalloon'],
			},
			recognizeProcessTypes: {
				name: 'Recognize process types',
				exercises: ['processNameToProperty', 'propertyToProcessName', 'findProcessCoefficient'],
			},
			poissonsLaw: {
				name: `Apply Poisson's law`,
				setup: and(pick(['calculateWithPressure', 'calculateWithVolume', 'calculateWithTemperature']), part('specificHeatRatio', 2 / 3), pick(['solveLinearEquation', 'solveExponentEquation'], 1, [1, 2])),
				exercises: ['poissonsLawBicyclePump', 'poissonsLawCompressor', 'poissonsLawTurbine'],
			},
		},
		closedCycles: {
			calculateProcessStep: {
				name: 'Calculate a process step',
				setup: and('gasLaw', 'recognizeProcessTypes', part('poissonsLaw', 1 / 2), part('gasLaw', 1 / 2)),
				exercises: ['calculateProcessStepCompressor', 'calculateProcessStepDivingCylinder', 'calculateProcessStepBalloon', 'calculateProcessStepGasTurbine'],
			},
			calculateClosedCycle: {
				name: 'Calculate a closed cycle',
				setup: repeat('calculateProcessStep', 3),
				exercises: ['calculateClosedCycleVTp', 'calculateClosedCycleTsV', 'calculateClosedCycleSTST', 'calculateClosedCycleSVSV'],
				thresholds: { pass: 0.5 },
			},
			calculateHeatAndWork: {
				name: 'Calculate heat and work',
				setup: and('recognizeProcessTypes', pick(['calculateWithPressure', 'calculateWithVolume', 'calculateWithTemperature', 'calculateWithMass'], 2), pick(['specificGasConstant', 'specificHeatRatio', 'specificHeats'], 2)),
				exercises: ['calculateHeatAndWorkIsobaric', 'calculateHeatAndWorkIsochoric', 'calculateHeatAndWorkIsothermal', 'calculateHeatAndWorkIsentropic', 'calculateHeatAndWorkPolytropic'],
			},
			calculateWithInternalEnergy: {
				name: 'Calculate with internal energy',
				setup: and(pick(['gasLaw', 'poissonsLaw']), pick(['specificHeats', 'calculateHeatAndWork']), 'solveLinearEquation'),
				exercises: ['calculateWithInternalEnergyEngine', 'calculateWithInternalEnergyBalloon', 'calculateWithInternalEnergyTire'],
			},
			createClosedCycleEnergyOverview: {
				name: 'Create a closed-cycle energy overview',
				setup: and(repeat('calculateHeatAndWork', 2), or('calculateHeatAndWork', 'calculateWithInternalEnergy')),
				exercises: ['createClosedCycleEnergyOverviewVTp', 'createClosedCycleEnergyOverviewTsV', 'createClosedCycleEnergyOverviewSTST', 'createClosedCycleEnergyOverviewSVSV'],
				thresholds: { pass: 0.5 },
			},
			analyseClosedCycle: {
				name: 'Analyse a closed cycle',
				setup: and('calculateClosedCycle', 'createClosedCycleEnergyOverview', pick(['calculateWithEfficiency', 'calculateWithCOP'])),
				exercises: ['analyseClosedCycleVTp', 'analyseClosedCycleTsV', 'analyseClosedCycleSTST', 'analyseClosedCycleSVSV'],
				thresholds: { pass: 0.4 },
			},
		},
		openCycles: {
			calculateWithSpecificQuantities: {
				name: 'Calculate with specific quantities',
				exercises: ['calculateWithSpecificQuantitiesDensity', 'calculateWithSpecificQuantitiesBoiler', 'calculateWithSpecificQuantitiesTurbine']
			},
			massFlowTrick: {
				name: 'Apply the mass flow trick',
				exercises: ['massFlowTrickCompressor', 'massFlowTrickWater', 'massFlowTrickEngine'],
			},
			calculateOpenProcessStep: {
				name: 'Calculate an open process step',
				setup: and('gasLaw', 'calculateWithSpecificQuantities', 'recognizeProcessTypes', part('poissonsLaw', 1 / 2), part('gasLaw', 1 / 2)),
				links: { skill: 'calculateProcessStep', correlation: 0.7 },
				exercises: ['calculateOpenProcessStepWing', 'calculateOpenProcessStepCompressor', 'calculateOpenProcessStepGasTurbine'],
			},
			calculateOpenCycle: {
				name: 'Calculate an open cycle',
				setup: repeat('calculateOpenProcessStep', 3),
				links: { skill: 'calculateClosedCycle', correlation: 0.6 },
				exercises: ['calculateOpenCyclespsp', 'calculateOpenCycleNspsp', 'calculateOpenCycleTsp'],
				thresholds: { pass: 0.5 },
			},
			calculateSpecificHeatAndMechanicalWork: {
				name: 'Calculate specific heat and mechanical work',
				setup: and('recognizeProcessTypes', pick(['calculateWithPressure', 'calculateWithVolume', 'calculateWithTemperature', 'calculateWithMass'], 2), pick(['specificGasConstant', 'specificHeatRatio', 'specificHeats'], 2), 'calculateWithSpecificQuantities'),
				links: { skill: 'calculateHeatAndWork', correlation: 0.4 },
				exercises: ['calculateSpecificHeatAndMechanicalWorkIsobaric', 'calculateSpecificHeatAndMechanicalWorkIsothermal', 'calculateSpecificHeatAndMechanicalWorkIsentropic'],
			},
			calculateWithEnthalpy: {
				name: 'Calculate with enthalpy',
				setup: and(pick(['massFlowTrick', 'calculateWithSpecificQuantities']), 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation'),
				links: { skill: 'calculateWithInternalEnergy', correlation: 0.3 },
				exercises: ['calculateWithEnthalpyCompressor', 'calculateWithEnthalpyBoiler', 'calculateWithEnthalpyTurbine'],
			},
			createOpenCycleEnergyOverview: {
				name: 'Create an open cycle energy overview',
				setup: and(repeat('calculateSpecificHeatAndMechanicalWork', 2), 'calculateWithEnthalpy'),
				links: { skill: 'createClosedCycleEnergyOverview', correlation: 0.4 },
				exercises: ['createOpenCycleEnergyOverviewspsp', 'createOpenCycleEnergyOverviewNspsp', 'createOpenCycleEnergyOverviewTsp'],
				thresholds: { pass: 0.5 },
			},
			analyseOpenCycle: {
				name: 'Analyse an open cycle',
				setup: and('calculateOpenCycle', 'createOpenCycleEnergyOverview', pick(['calculateWithEfficiency', 'calculateWithCOP']), 'massFlowTrick'),
				links: { skill: 'analyseClosedCycle', correlation: 0.5 },
				exercises: ['analyseOpenCyclespsp', 'analyseOpenCycleNspsp', 'analyseOpenCycleTsp'],
				thresholds: { pass: 0.4 },
			},
		},
		entropy: {
			calculateEntropyChange: {
				name: 'Calculate an entropy change',
				setup: and('calculateWithTemperature', pick(['specificGasConstant', 'specificHeats']), 'solveLinearEquation'),
				exercises: ['calculateEntropyChangeIsotherm', 'calculateEntropyChangeWithTemperature', 'calculateEntropyChangeWithProperties'],
			},
			calculateMissedWork: {
				name: 'Calculate the missed work',
				setup: and('calculateEntropyChange', 'solveLinearEquation'),
				exercises: ['calculateMissedWorkIsotherm', 'calculateMissedWorkPiston', 'calculateMissedWorkCompressor'],
				thresholds: { pass: 0.5 },
			},
			useIsentropicEfficiency: {
				name: 'Use the isentropic efficiency',
				setup: and(pick([repeat('calculateSpecificHeatAndMechanicalWork', 2), repeat('calculateWithEnthalpy', 2)]), 'solveLinearEquation'),
				exercises: ['useIsentropicEfficiencyCompressor1', 'useIsentropicEfficiencyCompressor2', 'useIsentropicEfficiencyTurbine1', 'useIsentropicEfficiencyTurbine2'],
			},
		},
		gasTurbines: {
			analyseGasTurbine: {
				name: 'Analyse gas turbines',
				setup: and('calculateOpenCycle', 'useIsentropicEfficiency', 'createOpenCycleEnergyOverview', 'calculateWithEfficiency', 'massFlowTrick'),
				exercises: ['analyseGasTurbine1', 'analyseGasTurbine2', 'analyseGasTurbine3'],
				thresholds: { pass: 0.4 },
			},
		},
		steam: {
			properties: {
				lookUpSteamProperties: {
					name: 'Look up steam properties',
					exercises: ['steamPropertiesAtTemperature', 'steamPropertiesAtPressure', 'steamPropertiesSuperheated'],
				},
				useVaporFraction: {
					name: 'Use the vapor fraction',
					setup: and('lookUpSteamProperties', 'linearInterpolation'),
					exercises: ['useVaporFractionWithEnthalpy', 'useVaporFractionWithEntropy'],
				},
			},
			rankineCycle: {
				createRankineCycleOverview: {
					name: 'Create a Rankine cycle overview',
					setup: and(repeat('lookUpSteamProperties', 2), 'recognizeProcessTypes', 'useVaporFraction'),
					exercises: ['createRankineCycleOverview'],
					thresholds: { pass: 0.5 },
				},
				analyseRankineCycle: {
					name: 'Analyse a Rankine cycle',
					setup: and('createRankineCycleOverview', 'useIsentropicEfficiency', part('useVaporFraction', 1 / 2), 'calculateWithEfficiency', 'massFlowTrick'),
					exercises: ['analyseRankineCycleWithEtai', 'analyseRankineCycleWithX3'],
					thresholds: { pass: 0.4 },
				},
			},
		},
		cooling: {
			properties: {
				findFridgeTemperatures: {
					name: 'Find refrigerator temperatures',
					exercises: ['findFridgeTemperaturesInternal', 'findFridgeTemperaturesExternal'],
				},
				determineRefrigerantProcess: {
					name: 'Determine a refrigerant process',
					exercises: ['determineRefrigerantProcessIsobaric', 'determineRefrigerantProcessIsentropic'],
				},
			},
			coolingCycles: {
				createCoolingCycleOverview: {
					name: 'Create a cooling cycle overview',
					setup: and('findFridgeTemperatures', repeat('determineRefrigerantProcess', 3)),
					exercises: ['createCoolingCycleOverviewFromPressures', 'createCoolingCycleOverviewFromTemperatures'],
					thresholds: { pass: 0.5 },
				},
				analyseCoolingCycle: {
					name: 'Analyse a cooling cycle',
					setup: and('createCoolingCycleOverview', 'useIsentropicEfficiency', 'calculateWithCOP', 'massFlowTrick'),
					exercises: ['analyseCoolingCycleWithEtai', 'analyseCoolingCycleWithT2'],
					thresholds: { pass: 0.4 },
				},
			},
		},
		humidity: {
			readMollierDiagram: {
				name: 'Read a Mollier diagram',
				exercises: ['readMollierDiagramRH', 'readMollierDiagramAH'],
			},
			analyseAirco: {
				name: 'Analyse an air conditioner',
				setup: repeat('readMollierDiagram', 3),
				exercises: ['analyseAircoBasic', 'analyseAircoWaterDischarge', 'analyseAircoPower'],
			},
		},
	},
}
