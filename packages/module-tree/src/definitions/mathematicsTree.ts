import { and, repeat, pick, part } from '@step-wise/skill-setup'
import type { ModuleTreeDefinition } from '@step-wise/module-tree-definition'

export const mathematicsTree: ModuleTreeDefinition = {
	inputs: {
		enterExpression: {
			type: 'skill',
		},
		enterEquation: {
			type: 'skill',
		},
	},

	calculation: {
		fundamentals: {
			addition: {},
			subtraction: {},
			multiplication: {},
			combinations: {
				calculateSumOfProducts: {
					type: 'skill',
				},
			},
		},
		fractions: {
			calculating: {
				simplifyFraction: {
					type: 'skill',
				},
			},
			basicOperations: {
				multiplyDivideFractions: {
					type: 'skill',
				},
			},
			simplification: {
				simplifyFractionOfFractions: {
					type: 'skill',
				},
				simplifyFractionSum: {
					type: 'skill',
				},
			},
		},
		powers: {
			rewritePower: {
				type: 'skill',
			},
			rewriteNegativePower: {
				type: 'skill',
				prerequisites: ['rewritePower', 'multiplyDivideFractions'],
			},
		},
		roots: {
			simplifyRoot: {
				type: 'skill',
			},
		},
	},

	algebra: {
		expressions: {
			substitution: {
				substituteANumber: {
					type: 'skill',
				},
				substituteAnExpression: {
					type: 'skill',
					links: { skillId: 'substituteANumber', correlation: 0.4 },
				},
			},
			simplification: {
				simplifyNumberProduct: {
					type: 'skill',
				},
				cancelSumTerms: {
					type: 'skill',
				},
				mergeSimilarTerms: {
					type: 'skill',
				},
			},
			brackets: {
				expandBrackets: {
					type: 'skill',
					setup: and('rewritePower', 'simplifyNumberProduct'),
				},
				expandDoubleBrackets: {
					type: 'skill',
					setup: and('expandBrackets', 'expandBrackets', 'mergeSimilarTerms'),
				},
				pullFactorOutOfBrackets: {
					type: 'skill',
					setup: and('addLikeFractionsWithVariables', 'simplifyFractionWithVariables', 'expandBrackets'),
				},
			},
			powers: {
				simplifyProductOfPowers: {
					type: 'skill',
					setup: and('rewritePower', 'simplifyNumberProduct', 'rewritePower'),
				},
				expandPowerOfSum: {
					type: 'skill',
					setup: and('simplifyProductOfPowers', 'simplifyNumberProduct'),
					prerequisites: ['expandDoubleBrackets'],
				},
			},
			fractions: {
				multiplyingDividing: {
					cancelFractionFactors: {
						type: 'skill',
					},
					simplifyFractionWithVariables: {
						type: 'skill',
						setup: and('simplifyFraction', 'cancelFractionFactors', 'rewritePower'),
						links: { skillId: 'simplifyProductOfPowers', correlation: 0.4 },
					},
					simplifyFractionOfFractionsWithVariables: {
						type: 'skill',
						setup: and(part('rewriteNegativePower', 0.5), 'multiplyDivideFractions', 'simplifyFractionWithVariables'),
					},
				},
				addingSubtracting: {
					addLikeFractionsWithVariables: {
						type: 'skill',
						setup: and('expandBrackets', 'mergeSimilarTerms'),
					},
					addFractionsWithVariables: {
						type: 'skill',
						setup: and('cancelFractionFactors', 'expandDoubleBrackets', 'addLikeFractionsWithVariables'),
					},
					simplifyFractionOfFractionSumsWithVariables: {
						type: 'skill',
						setup: and('addFractionsWithVariables', 'simplifyFractionOfFractionsWithVariables'),
					},
					addFractionsWithMultipleVariables: {
						type: 'skill',
						setup: and('simplifyFractionWithVariables', 'addLikeFractionsWithVariables'),
						links: { skillId: 'addFractionsWithVariables', correlation: 0.5 },
					},
					simplifyFractionOfFractionSumsWithMultipleVariables: {
						type: 'skill',
						setup: and('addFractionsWithMultipleVariables', 'simplifyFractionOfFractionsWithVariables'),
						links: { skillId: 'simplifyFractionOfFractionSumsWithVariables', correlation: 0.6 },
					},
				},
			},
		},
		equations: {
			verifying: {
				checkEquationSolution: {
					type: 'skill',
					setup: and('substituteANumber', 'calculateSumOfProducts'),
				},
				checkMultiVariableEquationSolution: {
					type: 'skill',
					setup: and('substituteAnExpression', 'simplifyNumberProduct', 'mergeSimilarTerms'),
				},
			},
			manipulating: {
				numbers: {
					// Add number to both sides, move number to other side.
				},
				terms: {
					addToBothEquationSides: {
						type: 'skill',
					},
					moveEquationTerm: {
						type: 'skill',
						setup: and('addToBothEquationSides', 'cancelSumTerms'),
					},
				},
				factors: {
					multiplyBothEquationSides: {
						type: 'skill',
						links: { skillId: 'addToBothEquationSides', correlation: 0.4 },
					},
					moveEquationFactor: {
						type: 'skill',
						setup: and('multiplyBothEquationSides', 'cancelFractionFactors', part('multiplyDivideFractions', 1 / 2)),
						links: { skillId: 'moveEquationTerm', correlation: 0.4 },
					},
				},
				rational: {
					multiplyAllEquationTerms: {
						type: 'skill',
						setup: and('multiplyBothEquationSides', pick(['expandBrackets', 'addLikeFractionsWithVariables']), 'simplifyFractionWithVariables'),
					},
					bringEquationToStandardForm: {
						type: 'skill',
						setup: and(part('multiplyAllEquationTerms', 0.5), pick(['expandBrackets', 'expandDoubleBrackets']), 'moveEquationTerm', 'mergeSimilarTerms', 'multiplyAllEquationTerms'),
					},
				},
			},
			solving: {
				elementaryEquations: {
					// Summation equation can still be added here.
					solveProductEquation: {
						type: 'skill',
						setup: and('moveEquationFactor', part('moveEquationFactor', 0.5), 'simplifyFraction', 'checkEquationSolution'),
					},
					solveMultiVariableProductEquation: {
						type: 'skill',
						setup: and('moveEquationFactor', part('moveEquationFactor', 0.5), 'simplifyFractionWithVariables', 'checkMultiVariableEquationSolution'),
						links: { skillId: 'solveProductEquation', correlation: 0.7 },
					},
				},
				linearEquations: {
					solveLinearEquation: {
						type: 'skill',
						setup: and(part('expandBrackets', 2 / 3), 'moveEquationTerm', 'mergeSimilarTerms', 'solveProductEquation'),
					},
					solveLinearEquationWithFractions: {
						type: 'skill',
						setup: and('moveEquationFactor', part('moveEquationFactor', 0.5), 'solveLinearEquation'),
					},
					solveMultiVariableLinearEquation: {
						type: 'skill',
						setup: and(part('expandBrackets', 0.5), 'moveEquationTerm', 'pullFactorOutOfBrackets', 'solveMultiVariableProductEquation'),
					},
					solveMultiVariableLinearEquationWithFractions: {
						type: 'skill',
						setup: and(part('simplifyFractionOfFractionSumsWithMultipleVariables', 0.5), 'multiplyAllEquationTerms', 'solveMultiVariableLinearEquation'),
					},
				},
				quadraticEquations: {
					solveQuadraticEquation: {
						type: 'skill',
						setup: and('substituteANumber', 'calculateSumOfProducts', 'simplifyFractionSum', part('simplifyRoot', 0.5), 'checkEquationSolution'),
					},
					solveRewrittenQuadraticEquation: {
						type: 'skill',
						setup: and('bringEquationToStandardForm', 'solveQuadraticEquation'),
					},
				},
				systemsOfEquations: {
					solveSystemOfLinearEquations: {
						type: 'skill',
						setup: and('solveMultiVariableLinearEquation', 'substituteAnExpression', 'solveLinearEquation', 'substituteANumber'),
					},
					solveMultiVariableSystemOfLinearEquations: {
						type: 'skill',
						setup: and('solveMultiVariableLinearEquation', 'substituteAnExpression', 'solveMultiVariableLinearEquation', 'simplifyFractionOfFractionSumsWithMultipleVariables'),
						links: { skillId: 'solveSystemOfLinearEquations', correlation: 0.4 },
					},
				},
			},
		},
	},

	geometry: {
		triangles: {
			applyPythagoreanTheorem: {
				type: 'skill',
			},
			applySineCosineTangent: {
				type: 'skill',
			},
			applySimilarTriangles: {
				type: 'skill',
			},
			calculateTriangle: {
				type: 'skill',
				setup: and(pick(['determine2DAngles', 'applySineCosineTangent']), pick(['solveLinearEquation', 'solveQuadraticEquation'])),
			},
		},
		anglesAndDistances: {
			determine2DAngles: {
				type: 'skill',
			},
			determine2DDistances: {
				type: 'skill',
				setup: and('determine2DAngles', repeat(pick(['applyPythagoreanTheorem', 'applySineCosineTangent', 'applySimilarTriangles']), 2)),
				thresholds: { mastery: 0.35 },
			},
		},
		areasAndVolumes: {
			calculate2DShape: {
				type: 'skill',
			},
			calculate3DShape: {
				type: 'skill',
				setup: and('determine2DDistances', 'calculate2DShape'),
			},
		},
	},

	derivatives: {
		basicRules: {
			lookUpElementaryDerivative: {
				type: 'skill',
			},
			findBasicDerivative: {
				type: 'skill',
				setup: repeat('lookUpElementaryDerivative', 2),
			},
		},
		combinedRules: {
			applyProductRule: {
				type: 'skill',
				setup: and('lookUpElementaryDerivative', 'findBasicDerivative'),
			},
			applyQuotientRule: {
				type: 'skill',
				setup: and('lookUpElementaryDerivative', 'findBasicDerivative'),
			},
			applyChainRule: {
				type: 'skill',
				setup: and('lookUpElementaryDerivative', 'findBasicDerivative'),
			},
		},
		generalDerivatives: {
			findGeneralDerivative: {
				type: 'skill',
				setup: pick(['applyProductRule', 'applyQuotientRule', 'applyChainRule']),
			},
			findAdvancedDerivative: {
				type: 'skill',
				setup: and('findBasicDerivative', 'findGeneralDerivative', pick(['applyProductRule', 'applyQuotientRule', 'applyChainRule'])),
			},
		},
	},
}
