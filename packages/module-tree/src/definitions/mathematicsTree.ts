import { and, repeat, pick, part } from '@step-wise/skill-setup'
import type { SkillTreeDefinition } from '@step-wise/module-tree-definition'

export const mathematicsTree: SkillTreeDefinition = {
	inputs: {
		enterExpression: {
			type: 'skill',
			name: 'Enter an expression',
		},
		enterEquation: {
			type: 'skill',
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
					type: 'skill',
					name: 'Calculate sum of products',
				},
			},
		},
		fractions: {
			calculating: {
				simplifyFraction: {
					type: 'skill',
					name: 'Simplify fraction',
				},
			},
			basicOperations: {
				multiplyDivideFractions: {
					type: 'skill',
					name: 'Multiply/divide fractions',
				},
			},
			simplification: {
				simplifyFractionOfFractions: {
					type: 'skill',
					name: 'Simplify fraction of fractions',
				},
				simplifyFractionSum: {
					type: 'skill',
					name: 'Simplify fraction sum',
				},
			},
		},
		powers: {
			rewritePower: {
				type: 'skill',
				name: 'Rewrite power',
			},
			rewriteNegativePower: {
				type: 'skill',
				name: 'Rewrite negative power',
				prerequisites: ['rewritePower', 'multiplyDivideFractions'],
			},
		},
		roots: {
			simplifyRoot: {
				type: 'skill',
				name: 'Simplify root',
			},
		},
	},

	algebra: {
		expressions: {
			substitution: {
				substituteANumber: {
					type: 'skill',
					name: 'Substitute a number',
				},
				substituteAnExpression: {
					type: 'skill',
					name: 'Substitute an expression',
					links: { skillId: 'substituteANumber', correlation: 0.4 },
				},
			},
			simplification: {
				simplifyNumberProduct: {
					type: 'skill',
					name: 'Simplify number product',
				},
				cancelSumTerms: {
					type: 'skill',
					name: 'Cancel sum terms',
				},
				mergeSimilarTerms: {
					type: 'skill',
					name: 'Merge similar terms',
				},
			},
			brackets: {
				expandBrackets: {
					type: 'skill',
					name: 'Expand brackets',
					setup: and('rewritePower', 'simplifyNumberProduct'),
				},
				expandDoubleBrackets: {
					type: 'skill',
					name: 'Expand double brackets',
					setup: and('expandBrackets', 'expandBrackets', 'mergeSimilarTerms'),
				},
				pullFactorOutOfBrackets: {
					type: 'skill',
					name: 'Pull factor out of brackets',
					setup: and('addLikeFractionsWithVariables', 'simplifyFractionWithVariables', 'expandBrackets'),
				},
			},
			powers: {
				simplifyProductOfPowers: {
					type: 'skill',
					name: 'Simplify product of powers',
					setup: and('rewritePower', 'simplifyNumberProduct', 'rewritePower'),
				},
				expandPowerOfSum: {
					type: 'skill',
					name: 'Expand power of sum',
					setup: and('simplifyProductOfPowers', 'simplifyNumberProduct'),
					prerequisites: ['expandDoubleBrackets'],
				},
			},
			fractions: {
				multiplyingDividing: {
					cancelFractionFactors: {
						type: 'skill',
						name: 'Cancel fraction factors',
					},
					simplifyFractionWithVariables: {
						type: 'skill',
						name: 'Simplify fraction with variables',
						setup: and('simplifyFraction', 'cancelFractionFactors', 'rewritePower'),
						links: { skillId: 'simplifyProductOfPowers', correlation: 0.4 },
					},
					simplifyFractionOfFractionsWithVariables: {
						type: 'skill',
						name: 'Simplify fraction of fractions with variables',
						setup: and(part('rewriteNegativePower', 0.5), 'multiplyDivideFractions', 'simplifyFractionWithVariables'),
					},
				},
				addingSubtracting: {
					addLikeFractionsWithVariables: {
						type: 'skill',
						name: 'Add like fractions with variables',
						setup: and('expandBrackets', 'mergeSimilarTerms'),
					},
					addFractionsWithVariables: {
						type: 'skill',
						name: 'Add fractions with variables',
						setup: and('cancelFractionFactors', 'expandDoubleBrackets', 'addLikeFractionsWithVariables'),
					},
					simplifyFractionOfFractionSumsWithVariables: {
						type: 'skill',
						name: 'Simplify fraction of fraction sums with variables',
						setup: and('addFractionsWithVariables', 'simplifyFractionOfFractionsWithVariables'),
					},
					addFractionsWithMultipleVariables: {
						type: 'skill',
						name: 'Add fractions with multiple variables',
						setup: and('simplifyFractionWithVariables', 'addLikeFractionsWithVariables'),
						links: { skillId: 'addFractionsWithVariables', correlation: 0.5 },
					},
					simplifyFractionOfFractionSumsWithMultipleVariables: {
						type: 'skill',
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
					type: 'skill',
					name: 'Check equation solution',
					setup: and('substituteANumber', 'calculateSumOfProducts'),
				},
				checkMultiVariableEquationSolution: {
					type: 'skill',
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
						type: 'skill',
						name: 'Add to both equation sides',
					},
					moveEquationTerm: {
						type: 'skill',
						name: 'Move equation term',
						setup: and('addToBothEquationSides', 'cancelSumTerms'),
					},
				},
				factors: {
					multiplyBothEquationSides: {
						type: 'skill',
						name: 'Multiply both equation sides',
						links: { skillId: 'addToBothEquationSides', correlation: 0.4 },
					},
					moveEquationFactor: {
						type: 'skill',
						name: 'Move equation factor',
						setup: and('multiplyBothEquationSides', 'cancelFractionFactors', part('multiplyDivideFractions', 1 / 2)),
						links: { skillId: 'moveEquationTerm', correlation: 0.4 },
					},
				},
				rational: {
					multiplyAllEquationTerms: {
						type: 'skill',
						name: 'Multiply all equation terms',
						setup: and('multiplyBothEquationSides', pick(['expandBrackets', 'addLikeFractionsWithVariables']), 'simplifyFractionWithVariables'),
					},
					bringEquationToStandardForm: {
						type: 'skill',
						name: 'Bring equation to standard form',
						setup: and(part('multiplyAllEquationTerms', 0.5), pick(['expandBrackets', 'expandDoubleBrackets']), 'moveEquationTerm', 'mergeSimilarTerms', 'multiplyAllEquationTerms'),
					},
				},
			},
			solving: {
				elementaryEquations: {
					// Summation equation can still be added here.
					solveProductEquation: {
						type: 'skill',
						name: 'Solve product equation',
						setup: and('moveEquationFactor', part('moveEquationFactor', 0.5), 'simplifyFraction', 'checkEquationSolution'),
					},
					solveMultiVariableProductEquation: {
						type: 'skill',
						name: 'Solve multi-variable product equation',
						setup: and('moveEquationFactor', part('moveEquationFactor', 0.5), 'simplifyFractionWithVariables', 'checkMultiVariableEquationSolution'),
						links: { skillId: 'solveProductEquation', correlation: 0.7 },
					},
				},
				linearEquations: {
					solveLinearEquation: {
						type: 'skill',
						name: 'Solve linear equation',
						setup: and(part('expandBrackets', 2 / 3), 'moveEquationTerm', 'mergeSimilarTerms', 'solveProductEquation'),
					},
					solveLinearEquationWithFractions: {
						type: 'skill',
						name: 'Solve linear equation with fractions',
						setup: and('moveEquationFactor', part('moveEquationFactor', 0.5), 'solveLinearEquation'),
					},
					solveMultiVariableLinearEquation: {
						type: 'skill',
						name: 'Solve multi-variable linear equation',
						setup: and(part('expandBrackets', 0.5), 'moveEquationTerm', 'pullFactorOutOfBrackets', 'solveMultiVariableProductEquation'),
					},
					solveMultiVariableLinearEquationWithFractions: {
						type: 'skill',
						name: 'Solve multi-variable linear equation with fractions',
						setup: and(part('simplifyFractionOfFractionSumsWithMultipleVariables', 0.5), 'multiplyAllEquationTerms', 'solveMultiVariableLinearEquation'),
					},
				},
				quadraticEquations: {
					solveQuadraticEquation: {
						type: 'skill',
						name: 'Solve quadratic equation',
						setup: and('substituteANumber', 'calculateSumOfProducts', 'simplifyFractionSum', part('simplifyRoot', 0.5), 'checkEquationSolution'),
					},
					solveRewrittenQuadraticEquation: {
						type: 'skill',
						name: 'Solve rewritten quadratic equation',
						setup: and('bringEquationToStandardForm', 'solveQuadraticEquation'),
					},
				},
				systemsOfEquations: {
					solveSystemOfLinearEquations: {
						type: 'skill',
						name: 'Solve system of linear equations',
						setup: and('solveMultiVariableLinearEquation', 'substituteAnExpression', 'solveLinearEquation', 'substituteANumber'),
					},
					solveMultiVariableSystemOfLinearEquations: {
						type: 'skill',
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
				type: 'skill',
				name: 'Apply the Pythagorean theorem',
			},
			applySineCosineTangent: {
				type: 'skill',
				name: 'Apply the sine/cosine/tangent',
			},
			applySimilarTriangles: {
				type: 'skill',
				name: 'Apply similar triangles',
			},
			calculateTriangle: {
				type: 'skill',
				name: 'Calculate a triangle',
				setup: and(pick(['determine2DAngles', 'applySineCosineTangent']), pick(['solveLinearEquation', 'solveQuadraticEquation'])),
			},
		},
		anglesAndDistances: {
			determine2DAngles: {
				type: 'skill',
				name: 'Determine 2D angles',
			},
			determine2DDistances: {
				type: 'skill',
				name: 'Determine 2D distances',
				setup: and('determine2DAngles', repeat(pick(['applyPythagoreanTheorem', 'applySineCosineTangent', 'applySimilarTriangles']), 2)),
				thresholds: { mastery: 0.35 },
			},
		},
		areasAndVolumes: {
			calculate2DShape: {
				type: 'skill',
				name: 'Calculate a 2D shape',
			},
			calculate3DShape: {
				type: 'skill',
				name: 'Calculate a 3D shape',
				setup: and('determine2DDistances', 'calculate2DShape'),
			},
		},
	},

	derivatives: {
		basicRules: {
			lookUpElementaryDerivative: {
				type: 'skill',
				name: 'Look up an elementary derivative',
			},
			findBasicDerivative: {
				type: 'skill',
				name: 'Determine a basic derivative',
				setup: repeat('lookUpElementaryDerivative', 2),
			},
		},
		combinedRules: {
			applyProductRule: {
				type: 'skill',
				name: 'Apply the product rule',
				setup: and('lookUpElementaryDerivative', 'findBasicDerivative'),
			},
			applyQuotientRule: {
				type: 'skill',
				name: 'Apply the quotient rule',
				setup: and('lookUpElementaryDerivative', 'findBasicDerivative'),
			},
			applyChainRule: {
				type: 'skill',
				name: 'Apply the chain rule',
				setup: and('lookUpElementaryDerivative', 'findBasicDerivative'),
			},
		},
		generalDerivatives: {
			findGeneralDerivative: {
				type: 'skill',
				name: 'Determine a general derivative',
				setup: pick(['applyProductRule', 'applyQuotientRule', 'applyChainRule']),
			},
			findAdvancedDerivative: {
				type: 'skill',
				name: 'Determine an advanced derivative',
				setup: and('findBasicDerivative', 'findGeneralDerivative', pick(['applyProductRule', 'applyQuotientRule', 'applyChainRule'])),
			},
		},
	},
}
