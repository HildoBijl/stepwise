import { and, repeat, pick, part } from '@step-wise/skill-setup'
import type { RawSkillGroup } from '@step-wise/skill-definition'

export const mathematicsTree: RawSkillGroup = {
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
				examples: ['negativeExponentToFraction', 'fractionToNegativeExponent'],
				exercises: ['negativeExponentToFraction', 'fractionToNegativeExponent'],
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
					examples: ['basicForm'],
					exercises: ['basicForm'],
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
						setup: and(part('rewriteNegativePower', 0.5), 'multiplyDivideFractions', 'simplifyFractionWithVariables'),
						examples: ['basicForm'],
						exercises: ['higherPowers', 'multipleFactors', 'multipleFactorsNegativePowers'],
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
}
