const { isBasicObject, filterDuplicates, applyMapping, union } = require('../../../util')
const { and, or, repeat, pick, part, defaultLinkOrder } = require('../../../skillTracking')

const { getExerciseId, splitExerciseId } = require('./util')

// Below is the skillStructure defined for Step-Wise. The set-up of the object must match the folder structure for the files. Also remember that no folders can be named "name" or "tools".

const skillStructure = {
	test: {
		test: {
			name: 'Test exercise',
			examples: ['testExercise'],
			exercises: ['testExercise'],
		},
		demo: {
			name: 'Demo exercise',
			setup: repeat('test', 2),
			examples: ['demoExercise'],
			exercises: ['demoExercise'],
		},
	},

	tutorial: {
		numberInputs: {
			enterInteger: {
				name: 'Enter an integer',
				examples: ['enterInteger'],
				exercises: ['enterInteger'],
			},
			enterFloat: {
				name: 'Enter a decimal number',
				examples: ['enterFloat'],
				exercises: ['enterFloat'],
			},
			enterUnit: {
				name: 'Enter a unit',
				examples: ['enterUnit'],
				exercises: ['enterUnit'],
			},
			lookUpConstant: {
				name: 'Look up a constant',
				examples: ['lookUpConstant'],
				exercises: ['lookUpConstant'],
			},
		},
		mathInputs: {
			enterExpression: {
				name: 'Enter an expression',
				examples: ['enterExpression'],
				exercises: ['enterExpression'],
			},
			enterEquation: {
				name: 'Enter an equation',
				examples: ['enterEquation'],
				exercises: ['enterEquation'],
			},
		},
		steps: {
			summation: {
				name: 'Add numbers',
				examples: ['summation1'],
				exercises: ['summation1'],
			},
			multiplication: {
				name: 'Multiply numbers',
				examples: ['multiplication1'],
				exercises: ['multiplication1'],
			},
			summationAndMultiplication: {
				name: 'Add and multiply numbers',
				setup: and(repeat('multiplication', 2), 'summation'),
				examples: ['summationAndMultiplication1'],
				exercises: ['summationAndMultiplication1', 'summationAndMultiplication2'],
			},
		},
	},

	mathematics: {
		calculation: {
			fundamentals: {
				addition: {},
				subtraction: {},
				multiplication: {},
				combinations: {
					calculateSumOfProducts: {
						name: 'Calculate sum of products',
					},
				},
			},
			fractions: {
				calculating: {
					simplifyFraction: {
						name: 'Simplify fraction',
					},
				},
				basicOperations: {
					multiplyDivideFractions: {
						name: 'Multiply/divide fractions',
					},
				},
				simplification: {
					simplifyFractionOfFractions: {
						name: 'Simplify fraction of fractions',
					},
					simplifyFractionSum: {
						name: 'Simplify fraction sum',
					},
				},
			},
			powers: {
				rewritePower: {
					name: 'Rewrite power',
				},
				rewriteNegativePower: {
					name: 'Rewrite negative power',
				},
			},
			roots: {
				simplifyRoot: {
					name: 'Simplify root',
				},
			},
		},

		algebra: {
			expressions: {
				substitution: {
					substituteANumber: {
						name: 'Substitute a number',
					},
					substituteAnExpression: {
						name: 'Substitute an expression',
						links: { skill: 'substituteANumber', correlation: 0.4 },
					},
				},
				simplification: {
					simplifyNumberProduct: {
						name: 'Simplify number product',
					},
					cancelSumTerms: {
						name: 'Cancel sum terms',
					},
					mergeSimilarTerms: {
						name: 'Merge similar terms',
					},
				},
				brackets: {
					expandBrackets: {
						name: 'Expand brackets',
						setup: and('rewritePower', 'simplifyNumberProduct'),
						examples: ['basicForm'],
						exercises: ['factorBehind', 'negativeFactor', 'multipleTerms'],
					},
					expandDoubleBrackets: {
						name: 'Expand double brackets',
						setup: and('expandBrackets', 'expandBrackets', 'mergeSimilarTerms'),
						examples: ['basicForm'],
						exercises: ['higherPowers', 'squared', 'multipleTerms'],
					},
					pullFactorOutOfBrackets: {
						name: 'Pull factor out of brackets',
						setup: and('addLikeFractionsWithVariables', 'simplifyFractionWithVariables', 'expandBrackets'),
						examples: ['twoTerms'],
						exercises: ['twoTerms', 'threeTerms'],
					},
				},
				powers: {
					simplifyProductOfPowers: {
						name: 'Simplify product of powers',
						setup: and('rewritePower', 'simplifyNumberProduct', 'rewritePower'),
						examples: ['powerOfProductOfPower', 'productOfPowerOfPower', 'productOfPowerOfProduct'],
						exercises: ['powerOfProductOfPower', 'productOfPowerOfPower', 'productOfPowerOfProduct'],
					},
					expandPowerOfSum: {
						name: 'Expand power of sum',
						setup: and('simplifyProductOfPowers', 'simplifyNumberProduct'),
						prerequisites: ['expandDoubleBrackets', 'simplifyProductOfPowers', 'simplifyNumberProduct'],
					},
				},
				fractions: {
					multiplyingDividing: {
						cancelFractionFactors: {
							name: 'Cancel fraction factors',
						},
						simplifyFractionWithVariables: {
							name: 'Simplify fraction with variables',
							setup: and('simplifyFraction', 'cancelFractionFactors', 'rewritePower'),
							links: { skill: 'simplifyProductOfPowers', correlation: 0.4 },
							examples: ['basicForm'],
							exercises: ['higherPowers', 'multipleFactors'],
						},
						simplifyFractionOfFractionsWithVariables: {
							name: 'Simplify fraction of fractions with variables',
							setup: and('multiplyDivideFractions', 'simplifyFractionWithVariables'),
							examples: ['basicForm'],
							exercises: ['higherPowers', 'multipleFactors'],
						},
					},
					addingSubtracting: {
						addLikeFractionsWithVariables: {
							name: 'Add like fractions with variables',
							setup: and('expandBrackets', 'mergeSimilarTerms'),
							examples: ['basicForm'],
							exercises: ['basicForm', 'squaresInNumerator'],
						},
						addFractionsWithVariables: {
							name: 'Add fractions with variables',
							setup: and('cancelFractionFactors', 'expandDoubleBrackets', 'addLikeFractionsWithVariables'),
							examples: ['twoFractions'],
							exercises: ['twoFractions'],
						},
						simplifyFractionOfFractionSumsWithVariables: {
							name: 'Simplify fraction of fraction sums with variables',
							setup: and('addFractionsWithVariables', 'simplifyFractionOfFractionsWithVariables'),
						},
						addFractionsWithMultipleVariables: {
							name: 'Add fractions with multiple variables',
							setup: and('simplifyFractionWithVariables', 'addLikeFractionsWithVariables'),
							links: { skill: 'addFractionsWithVariables', correlation: 0.5 },
							examples: ['mergeFractionsNumberInDenominator', 'splitFractionsNumberInDenominator'],
							exercises: ['mergeFractionsNumberInDenominator', 'splitFractionsNumberInDenominator', 'mergeFractionsSquareAppearing', 'splitFractionsSquareAppearing', 'mergeFractionsVariableDenominator', 'splitFractionsVariableDenominator'],
						},
						simplifyFractionOfFractionSumsWithMultipleVariables: {
							name: 'Simplify fraction of fraction sums with multiple variables',
							setup: and('addFractionsWithMultipleVariables', 'simplifyFractionOfFractionsWithVariables'),
							links: { skill: 'simplifyFractionOfFractionSumsWithVariables', correlation: 0.6 },
							examples: ['sumInDenominator', 'sumInNumerator'],
							exercises: ['sumInDenominator', 'sumInNumerator', 'sumsWithIntegers', 'sumsWithFractions'],
						},
					},
				},
			},
			equations: {
				verifying: {
					checkEquationSolution: {
						name: 'Check equation solution',
						setup: and('substituteANumber', 'calculateSumOfProducts'),
					},
					checkMultiVariableEquationSolution: {
						name: 'Check multi-variable equation solution',
						setup: and('substituteAnExpression', 'simplifyNumberProduct', 'mergeSimilarTerms'),
					},
				},
				manipulating: {
					numbers: {
						// Add number to both sides, move number to other side.
					},
					terms: {
						addToBothEquationSides: {
							name: 'Add to both equation sides',
						},
						moveEquationTerm: {
							name: 'Move equation term',
							setup: and('addToBothEquationSides', 'cancelSumTerms'),
							examples: ['moveSingleTerm'],
							exercises: ['moveSingleTerm', 'moveAllTerms'],
						},
					},
					factors: {
						multiplyBothEquationSides: {
							name: 'Multiply both equation sides',
							links: { skill: 'addToBothEquationSides', correlation: 0.4 },
						},
						moveEquationFactor: {
							name: 'Move equation factor',
							setup: and('multiplyBothEquationSides', 'cancelFractionFactors', part('multiplyDivideFractions', 1 / 2)),
							links: { skill: 'moveEquationTerm', correlation: 0.4 },
							examples: ['basicDivision', 'basicMultiplication'],
							exercises: ['division', 'multiplication'],
						},
					},
					rational: {
						multiplyAllEquationTerms: {
							name: 'Multiply all equation terms',
							setup: and('multiplyBothEquationSides', pick(['expandBrackets', 'addLikeFractionsWithVariables']), 'simplifyFractionWithVariables'),
							examples: ['multiplyTerms', 'divideTerms'],
							exercises: ['multiplyTerms', 'divideTerms'],
						},
						bringEquationToStandardForm: {
							name: 'Bring equation to standard form',
							setup: and(part('multiplyAllEquationTerms', 0.5), pick(['expandBrackets', 'expandDoubleBrackets']), 'moveEquationTerm', 'mergeSimilarTerms', 'multiplyAllEquationTerms'),
							examples: ['quadraticTwoFractions'],
							exercises: ['quadraticTwoFractions', 'cubicOneFraction'],
						},
					},
				},
				solving: {
					elementaryEquations: {
						// Summation equation can still be added here.
						solveProductEquation: {
							name: 'Solve product equation',
							setup: and('moveEquationFactor', part('moveEquationFactor', 0.5), 'simplifyFraction', 'checkEquationSolution'),
							examples: ['inNumerator', 'inDenominator'],
							exercises: ['inNumerator', 'inDenominator'],
						},
						solveMultiVariableProductEquation: {
							name: 'Solve multi-variable product equation',
							setup: and('moveEquationFactor', part('moveEquationFactor', 0.5), 'simplifyFractionWithVariables', 'checkMultiVariableEquationSolution'),
							links: { skill: 'solveProductEquation', correlation: 0.7 },
							examples: ['inNumerator', 'inDenominator'],
							exercises: ['inNumerator', 'inDenominator'],
						},
					},
					linearEquations: {
						solveLinearEquation: {
							name: 'Solve linear equation',
							setup: and(part('expandBrackets', 2 / 3), 'moveEquationTerm', 'mergeSimilarTerms', 'solveProductEquation'),
							examples: ['withoutBrackets'],
							exercises: ['withoutBrackets', 'withBrackets'],
						},
						solveLinearEquationWithFractions: {
							name: 'Solve linear equation with fractions',
							setup: and('moveEquationFactor', part('moveEquationFactor', 0.5), 'solveLinearEquation'),
							examples: ['twoFractionsWithNumber'],
							exercises: ['oneFractionWithNumber', 'oneFractionWithVariable', 'twoFractionsWithNumber', 'twoFractionsWithVariable'],
						},
						solveMultiVariableLinearEquation: {
							name: 'Solve multi-variable linear equation',
							setup: and(part('expandBrackets', 0.5), 'moveEquationTerm', 'pullFactorOutOfBrackets', 'solveMultiVariableProductEquation'),
							examples: ['basic'],
							exercises: ['basic', 'withBrackets', 'withFraction'],
						},
						solveMultiVariableLinearEquationWithFractions: {
							name: 'Solve multi-variable linear equation with fractions',
							setup: and(part('simplifyFractionOfFractionSumsWithMultipleVariables', 0.5), 'multiplyAllEquationTerms', 'solveMultiVariableLinearEquation'),
							examples: ['multipleBasicFractions'],
							exercises: ['multipleBasicFractions', 'extraFractionInDenominator', 'extraFractionInNumerator'],
						},
					},
					quadraticEquations: {
						solveQuadraticEquation: {
							name: 'Solve quadratic equation',
							setup: and('substituteANumber', 'calculateSumOfProducts', 'simplifyFractionSum', part('simplifyRoot', 0.5), 'checkEquationSolution'),
							examples: ['oneSolution', 'twoIntegerSolutions'],
							exercises: ['noSolutions', 'oneSolution', 'twoIntegerSolutions', 'twoNonIntegerSolutions'],
						},
						solveRewrittenQuadraticEquation: {
							name: 'Solve rewritten quadratic equation',
							setup: and('bringEquationToStandardForm', 'solveQuadraticEquation'),
							examples: ['twoFractions'],
							exercises: ['twoFractions', 'oneFractionWithSquare'],
						},
					},
					systemsOfEquations: {
						solveSystemOfLinearEquations: {
							name: 'Solve system of linear equations',
							setup: and('solveMultiVariableLinearEquation', 'substituteAnExpression', 'solveLinearEquation', 'substituteANumber'),
							examples: ['basicSystem'],
							exercises: ['basicSystem'],
						},
						solveMultiVariableSystemOfLinearEquations: {
							name: 'Solve multi-variable system of linear equations',
							setup: and('solveMultiVariableLinearEquation', 'substituteAnExpression', 'solveMultiVariableLinearEquation', 'simplifyFractionOfFractionSumsWithMultipleVariables'),
							links: { skill: 'solveSystemOfLinearEquations', correlation: 0.4 },
							examples: ['threeTerms'],
							exercises: ['threeTerms', 'fourVariables'],
						},
					},
				},
			},
		},

		geometry: {
			triangles: {
				applyPythagoreanTheorem: {
					name: 'Apply the Pythagorean theorem',
					exercises: ['applyPythagoreanTheoremGeneral'],
				},
				applySineCosineTangent: {
					name: 'Apply the sine/cosine/tangent',
					exercises: ['applySineCosineTangentTwoSides', 'applySineCosineTangentSideAndAngle'],
				},
				applySimilarTriangles: {
					name: 'Apply similar triangles',
					exercises: ['applySimilarTrianglesGeneral'],
				},
				calculateTriangle: {
					name: 'Calculate a triangle',
					setup: and(pick(['determine2DAngles', 'applySineCosineTangent']), pick(['solveLinearEquation', 'solveQuadraticEquation'])),
					exercises: ['calculateTriangleASAS', 'calculateTriangleSSAA', 'calculateTriangleASSA', 'calculateTriangleSASS', 'calculateTriangleSSAS', 'calculateTriangleSASA', 'calculateTriangleSSSA'],
				},
			},
			anglesAndDistances: {
				determine2DAngles: {
					name: 'Determine 2D angles',
					exercises: ['determine2DAnglesTriangleX', 'determine2DAnglesTriangleZ', 'determine2DAnglesCircleSymmetry'],
				},
				determine2DDistances: {
					name: 'Determine 2D distances',
					setup: and('determine2DAngles', repeat(pick(['applyPythagoreanTheorem', 'applySineCosineTangent', 'applySimilarTriangles']), 2)),
					exercises: [], // ToDo
					thresholds: { pass: 0.35 },
				},
			},
			areasAndVolumes: {
				calculate2DShape: {
					name: 'Calculate a 2D shape',
					exercises: [], // ToDo
				},
				calculate3DShape: {
					name: 'Calculate a 3D shape',
					setup: and('determine2DDistances', 'calculate2DShape'),
					exercises: [], // ToDo
				},
			},
		},

		derivatives: {
			basicRules: {
				lookUpElementaryDerivative: {
					name: 'Look up an elementary derivative',
					exercises: ['lookUpElementaryDerivative'],
				},
				findBasicDerivative: {
					name: 'Determine a basic derivative',
					setup: repeat('lookUpElementaryDerivative', 2),
					exercises: ['findBasicDerivativeTwoTerms', 'findBasicDerivativeThreeTerms'],
				},
			},
			combinedRules: {
				applyProductRule: {
					name: 'Apply the product rule',
					setup: and('lookUpElementaryDerivative', 'findBasicDerivative'),
					exercises: ['applyProductRuleTwoElementary', 'applyProductRuleElementaryAndBasic'],
				},
				applyQuotientRule: {
					name: 'Apply the quotient rule',
					setup: and('lookUpElementaryDerivative', 'findBasicDerivative'),
					exercises: ['applyQuotientRuleTwoElementary', 'applyQuotientRuleElementaryAndBasic'],
				},
				applyChainRule: {
					name: 'Apply the chain rule',
					setup: and('lookUpElementaryDerivative', 'findBasicDerivative'),
					exercises: ['applyChainRuleTwoElementary', 'applyChainRuleElementaryAndBasic'],
				},
			},
			generalDerivatives: {
				findGeneralDerivative: {
					name: 'Determine a general derivative',
					setup: pick(['applyProductRule', 'applyQuotientRule', 'applyChainRule']),
					exercises: ['findGeneralDerivativeProductRule', 'findGeneralDerivativeQuotientRule', 'findGeneralDerivativeChainRule'],
				},
				findAdvancedDerivative: {
					name: 'Determine an advanced derivative',
					setup: and('findBasicDerivative', 'findGeneralDerivative', pick(['applyProductRule', 'applyQuotientRule', 'applyChainRule'])),
					exercises: ['findAdvancedDerivativeChainOfProduct', 'findAdvancedDerivativeChainOfFraction', 'findAdvancedDerivativeProductOfChain', 'findAdvancedDerivativeFractionOfProduct', 'findAdvancedDerivativeFractionOfChain'],
				},
			},
		},
	},

	mechanics: {
		equilibrium: {
			calculateForceOrMoment: {
				name: 'Calculate a force or moment',
				exercises: ['calculateForceOrMomentUseVerticalForces', 'calculateForceOrMomentUseHorizontalForces', 'calculateForceOrMomentUseDiagonalForces', 'calculateForceOrMomentUseMomentsWithOnlyForces', 'calculateForceOrMomentUseMomentsWithMomentAsked', 'calculateForceOrMomentUseMomentsWithMomentGiven'],
			},
		},
		supportReactions: {
			schematizeSupport: {
				name: 'Schematize a support',
				exercises: ['schematizeFixedSupport', 'schematizeRollerSupport', 'schematizeHingeSupport', 'schematizeRollerHingeSupport'],
			},
			drawFreeBodyDiagram: {
				name: 'Draw a free body diagram',
				setup: repeat('schematizeSupport', 2),
				exercises: ['drawFreeBodyDiagram1'],
			},
			calculateBasicSupportReactions: {
				name: 'Calculate basic support reactions',
				setup: and('drawFreeBodyDiagram', repeat('calculateForceOrMoment', 2)),
				exercises: ['calculateBasicSupportReactionsDiagonalSupport', 'calculateBasicSupportReactionsDiagonalBeam', 'calculateBasicSupportReactionsFixedWithDiagonalLoad', 'calculateBasicSupportReactionsFixedWithElevatedLoad'],
			},
		},
	},

	physics: {
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
	},
}

// Turn the skill structure (with grouping) into a flat skillTree look-up object, where all skills are aware of their ID and path.
const skillTree = {}
const skillsPerGroup = {}
function processSkillGroup(skillGroup, path = []) {
	applyMapping(skillGroup, (obj, key) => {
		if (obj.name) { // Is it a skill? Only skills have a "name" parameter.
			obj.id = key
			obj.path = path
			const joinedPath = path.join('/')
			if (skillsPerGroup[joinedPath])
				skillsPerGroup[joinedPath].push(obj.id)
			else
				skillsPerGroup[joinedPath] = [obj.id]
			obj.skillsInGroup = skillsPerGroup[joinedPath]
			skillTree[key] = obj
		} else {
			processSkillGroup(obj, [...path, key])
		}
	})
}
processSkillGroup(skillStructure)

// Ensure that all skills have an examples and exercises array as parameter.
Object.values(skillTree).forEach(skill => {
	if (!skill.examples)
		skill.examples = []
	if (!Array.isArray(skill.examples))
		skill.examples = [skill.examples]

	if (!skill.exercises)
		skill.exercises = []
	if (!Array.isArray(skill.exercises))
		skill.exercises = [skill.exercises]
})

// For skills that have a set-up, also define the prerequisites list. If a list exists, make sure the prerequisites from the set-up are added.
Object.values(skillTree).forEach(skill => {
	skill.prerequisites = skill.prerequisites || []
	if (skill.setup)
		skill.prerequisites = filterDuplicates([...skill.prerequisites, ...skill.setup.getSkillList()])
})

// Set up continuations.
Object.values(skillTree).forEach(skill => { skill.continuations = [] }) // Prepare an empty continuations array.
Object.values(skillTree).forEach(skill => {
	skill.prerequisites.forEach(prerequisiteId => {
		const prerequisite = skillTree[prerequisiteId]
		if (!prerequisite)
			throw new Error(`Invalid prerequisite skill "${prerequisiteId}" given for skill "${skill.id}".`)
		prerequisite.continuations.push(skill.id)
	})
})

// Process links properties.
Object.values(skillTree).forEach(skill => {
	// Ensure that the links is an array.
	if (!skill.links)
		skill.links = []
	else if (!Array.isArray(skill.links) || skill.links.every(link => (typeof link === 'string')))
		skill.links = [skill.links]

	// Ensure that each element is a properly formatted object.
	skill.links = skill.links.map(link => {
		if (typeof link === 'string')
			return { skills: [link], order: defaultLinkOrder }
		if (Array.isArray(link))
			return { skills: link, order: defaultLinkOrder }
		if (!isBasicObject(link))
			throw new Error(`Invalid skill link: expected a basic object, string or array, but got something of type "${typeof link}".`)
		if (link.skill) {
			if (!link.skills) // Allow a "skill" property to be set instead of a "skills" property.
				link.skills = Array.isArray(link.skill) ? link.skill : [link.skill]
			delete link.skill
		}
		if (link.correlation) {
			if (!link.order) {
				if (link.correlation <= 0 || link.correlation >= 1)
					throw new Error(`Invalid skill correlation: expected a correlation between 0 and 1, but received one of "${link.correlation}".`)
				link.order = Math.round(2 * link.correlation / (1 - link.correlation))
			}
			delete link.correlation
		}
		return link
	})

	// Extract all linked skills.
	skill.linkedSkills = [...union(...skill.links.map(link => new Set(link.skills)))]
})

// Copy links to the skills that have been linked.
const skillLinks = applyMapping(skillTree, skill => [...skill.links]) // Copy links lists to prevent reference loops.
applyMapping(skillLinks, (links, skillId) => {
	const skill = skillTree[skillId]
	links.forEach(link => {
		link.skills.forEach(linkedSkill => {
			if (!skillTree[linkedSkill])
				throw new Error(`Invalid skill link: received a skill ID "${linkedSkill}" in the linked skills of skill "${skill.id}". This is not a known skill ID and cannot be processed further.`)
			skillTree[linkedSkill].links.push({
				...link,
				skills: [...link.skills.filter(skill => skill !== linkedSkill), skill.id], // Adjust list to change skill ID into linking skill ID.
			})
		})
	})
})
Object.values(skillTree).forEach(skill => {
	skill.linkedSkills = skill.links.map(link => link.skills).flat()
})

// Set up an overview of exercise paths. Do this for all exercises, except for exercises referring to another skill using a `[skillId].[exerciseId]` reference.
const exercises = {}
Object.values(skillTree).forEach(skill => {
	// First walk through examples and exercises and ensure they contain IDs and not just names.
	skill.examples = skill.examples.map(exerciseName => getExerciseId(exerciseName, skill.id))
	skill.exercises = skill.exercises.map(exerciseName => getExerciseId(exerciseName, skill.id))

	// Then walk through them all to fill the exercises parameter.
	const allExercises = [...skill.examples, ...skill.exercises]
	allExercises.forEach(exerciseId => {
		const exerciseData = splitExerciseId(exerciseId)
		exercises[exerciseId] = {
			name: exerciseData.exerciseName,
			skillId: exerciseData.skillId,
			id: exerciseId,
			path: [...skill.path, skill.id],
		}
	})
})

// Export all relevant parameters.
module.exports = {
	skillStructure,
	skillTree,
	exercises,
}
