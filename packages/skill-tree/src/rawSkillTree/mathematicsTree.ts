import { and, repeat, pick, part } from '@step-wise/skill-setup'
import type { RawSkillTree } from '@step-wise/skill-definition'

export const mathematicsTree: RawSkillTree = {
	inputs: {
		enterExpression: {
			name: 'Enter an expression',
		},
		enterEquation: {
			name: 'Enter an equation',
		},
	},

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
				prerequisites: ['rewritePower', 'multiplyDivideFractions'],
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
					links: { skillId: 'substituteANumber', correlation: 0.4 },
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
				},
				expandDoubleBrackets: {
					name: 'Expand double brackets',
					setup: and('expandBrackets', 'expandBrackets', 'mergeSimilarTerms'),
				},
				pullFactorOutOfBrackets: {
					name: 'Pull factor out of brackets',
					setup: and('addLikeFractionsWithVariables', 'simplifyFractionWithVariables', 'expandBrackets'),
				},
			},
			powers: {
				simplifyProductOfPowers: {
					name: 'Simplify product of powers',
					setup: and('rewritePower', 'simplifyNumberProduct', 'rewritePower'),
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
						links: { skillId: 'simplifyProductOfPowers', correlation: 0.4 },
					},
					simplifyFractionOfFractionsWithVariables: {
						name: 'Simplify fraction of fractions with variables',
						setup: and(part('rewriteNegativePower', 0.5), 'multiplyDivideFractions', 'simplifyFractionWithVariables'),
					},
				},
				addingSubtracting: {
					addLikeFractionsWithVariables: {
						name: 'Add like fractions with variables',
						setup: and('expandBrackets', 'mergeSimilarTerms'),
					},
					addFractionsWithVariables: {
						name: 'Add fractions with variables',
						setup: and('cancelFractionFactors', 'expandDoubleBrackets', 'addLikeFractionsWithVariables'),
					},
					simplifyFractionOfFractionSumsWithVariables: {
						name: 'Simplify fraction of fraction sums with variables',
						setup: and('addFractionsWithVariables', 'simplifyFractionOfFractionsWithVariables'),
					},
					addFractionsWithMultipleVariables: {
						name: 'Add fractions with multiple variables',
						setup: and('simplifyFractionWithVariables', 'addLikeFractionsWithVariables'),
						links: { skillId: 'addFractionsWithVariables', correlation: 0.5 },
					},
					simplifyFractionOfFractionSumsWithMultipleVariables: {
						name: 'Simplify fraction of fraction sums with multiple variables',
						setup: and('addFractionsWithMultipleVariables', 'simplifyFractionOfFractionsWithVariables'),
						links: { skillId: 'simplifyFractionOfFractionSumsWithVariables', correlation: 0.6 },
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
					},
				},
				factors: {
					multiplyBothEquationSides: {
						name: 'Multiply both equation sides',
						links: { skillId: 'addToBothEquationSides', correlation: 0.4 },
					},
					moveEquationFactor: {
						name: 'Move equation factor',
						setup: and('multiplyBothEquationSides', 'cancelFractionFactors', part('multiplyDivideFractions', 1 / 2)),
						links: { skillId: 'moveEquationTerm', correlation: 0.4 },
					},
				},
				rational: {
					multiplyAllEquationTerms: {
						name: 'Multiply all equation terms',
						setup: and('multiplyBothEquationSides', pick(['expandBrackets', 'addLikeFractionsWithVariables']), 'simplifyFractionWithVariables'),
					},
					bringEquationToStandardForm: {
						name: 'Bring equation to standard form',
						setup: and(part('multiplyAllEquationTerms', 0.5), pick(['expandBrackets', 'expandDoubleBrackets']), 'moveEquationTerm', 'mergeSimilarTerms', 'multiplyAllEquationTerms'),
					},
				},
			},
			solving: {
				elementaryEquations: {
					// Summation equation can still be added here.
					solveProductEquation: {
						name: 'Solve product equation',
						setup: and('moveEquationFactor', part('moveEquationFactor', 0.5), 'simplifyFraction', 'checkEquationSolution'),
					},
					solveMultiVariableProductEquation: {
						name: 'Solve multi-variable product equation',
						setup: and('moveEquationFactor', part('moveEquationFactor', 0.5), 'simplifyFractionWithVariables', 'checkMultiVariableEquationSolution'),
						links: { skillId: 'solveProductEquation', correlation: 0.7 },
					},
				},
				linearEquations: {
					solveLinearEquation: {
						name: 'Solve linear equation',
						setup: and(part('expandBrackets', 2 / 3), 'moveEquationTerm', 'mergeSimilarTerms', 'solveProductEquation'),
					},
					solveLinearEquationWithFractions: {
						name: 'Solve linear equation with fractions',
						setup: and('moveEquationFactor', part('moveEquationFactor', 0.5), 'solveLinearEquation'),
					},
					solveMultiVariableLinearEquation: {
						name: 'Solve multi-variable linear equation',
						setup: and(part('expandBrackets', 0.5), 'moveEquationTerm', 'pullFactorOutOfBrackets', 'solveMultiVariableProductEquation'),
					},
					solveMultiVariableLinearEquationWithFractions: {
						name: 'Solve multi-variable linear equation with fractions',
						setup: and(part('simplifyFractionOfFractionSumsWithMultipleVariables', 0.5), 'multiplyAllEquationTerms', 'solveMultiVariableLinearEquation'),
					},
				},
				quadraticEquations: {
					solveQuadraticEquation: {
						name: 'Solve quadratic equation',
						setup: and('substituteANumber', 'calculateSumOfProducts', 'simplifyFractionSum', part('simplifyRoot', 0.5), 'checkEquationSolution'),
					},
					solveRewrittenQuadraticEquation: {
						name: 'Solve rewritten quadratic equation',
						setup: and('bringEquationToStandardForm', 'solveQuadraticEquation'),
					},
				},
				systemsOfEquations: {
					solveSystemOfLinearEquations: {
						name: 'Solve system of linear equations',
						setup: and('solveMultiVariableLinearEquation', 'substituteAnExpression', 'solveLinearEquation', 'substituteANumber'),
					},
					solveMultiVariableSystemOfLinearEquations: {
						name: 'Solve multi-variable system of linear equations',
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
				name: 'Apply the Pythagorean theorem',
			},
			applySineCosineTangent: {
				name: 'Apply the sine/cosine/tangent',
			},
			applySimilarTriangles: {
				name: 'Apply similar triangles',
			},
			calculateTriangle: {
				name: 'Calculate a triangle',
				setup: and(pick(['determine2DAngles', 'applySineCosineTangent']), pick(['solveLinearEquation', 'solveQuadraticEquation'])),
			},
		},
		anglesAndDistances: {
			determine2DAngles: {
				name: 'Determine 2D angles',
			},
			determine2DDistances: {
				name: 'Determine 2D distances',
				setup: and('determine2DAngles', repeat(pick(['applyPythagoreanTheorem', 'applySineCosineTangent', 'applySimilarTriangles']), 2)),
				thresholds: { pass: 0.35 },
			},
		},
		areasAndVolumes: {
			calculate2DShape: {
				name: 'Calculate a 2D shape',
			},
			calculate3DShape: {
				name: 'Calculate a 3D shape',
				setup: and('determine2DDistances', 'calculate2DShape'),
			},
		},
	},

	derivatives: {
		basicRules: {
			lookUpElementaryDerivative: {
				name: 'Look up an elementary derivative',
			},
			findBasicDerivative: {
				name: 'Determine a basic derivative',
				setup: repeat('lookUpElementaryDerivative', 2),
			},
		},
		combinedRules: {
			applyProductRule: {
				name: 'Apply the product rule',
				setup: and('lookUpElementaryDerivative', 'findBasicDerivative'),
			},
			applyQuotientRule: {
				name: 'Apply the quotient rule',
				setup: and('lookUpElementaryDerivative', 'findBasicDerivative'),
			},
			applyChainRule: {
				name: 'Apply the chain rule',
				setup: and('lookUpElementaryDerivative', 'findBasicDerivative'),
			},
		},
		generalDerivatives: {
			findGeneralDerivative: {
				name: 'Determine a general derivative',
				setup: pick(['applyProductRule', 'applyQuotientRule', 'applyChainRule']),
			},
			findAdvancedDerivative: {
				name: 'Determine an advanced derivative',
				setup: and('findBasicDerivative', 'findGeneralDerivative', pick(['applyProductRule', 'applyQuotientRule', 'applyChainRule'])),
			},
		},
	},
}
