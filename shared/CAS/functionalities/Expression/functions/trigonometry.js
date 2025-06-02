const { deg2rad, rad2deg } = require('../../../../util')

const { Variable, SingleArgumentFunction, Integer, Sum, Product, Fraction, Power, Sqrt } = require('../Expression')
const { isInteger } = require('../checks')
const { equivalent } = require('../comparisons')

const halfPi = Variable.pi.divide(2)
const twoPi = Variable.pi.multiply(2)
const r2dFactor = new Integer(180).divide(Variable.pi)
const d2rFactor = Variable.pi.divide(180)

/*
 * Sine
 */

class Sin extends SingleArgumentFunction {
	toNumber() {
		return Math.sin(this.useDegrees ? deg2rad(this.argument.toNumber()) : this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		return new Product(
			new Cos(this.argument).applySettingsToSelf(this.settings),
			this.argument.getDerivative(variable), // Apply the chain rule.
			this.useDegrees ? d2rFactor : 1, // When using degrees add a compensation factor.
		)
	}

	simplifyBasic(options) {
		let { argument } = this.simplifyChildren(options)

		// Check for basic reductions.
		if (argument.isNumeric()) {
			const argumentAsPart = argument.divide(this.useDegrees ? 360 : twoPi).cleanForAnalysis()

			// Check for cases of 0, 1 or -1.
			if (options.remove01TrigFunctions) {
				if (isInteger(argumentAsPart.multiply(Integer.two)))
					return Integer.zero.simplifyBasic(options)
				if (isInteger(argumentAsPart.subtract(Fraction.quarter)))
					return Integer.one.simplifyBasic(options)
				if (isInteger(argumentAsPart.add(Fraction.quarter)))
					return Integer.minusOne.simplifyBasic(options)
			}

			// Check for cases of 1/2, 1/2*sqrt(2) and 1/2*sqrt(3).
			if (options.removeRootTrigFunctions) {
				if (isInteger(argumentAsPart.subtract(new Fraction(1, 12))) || isInteger(argumentAsPart.subtract(new Fraction(5, 12))))
					return Fraction.half.simplifyBasic(options)
				if (isInteger(argumentAsPart.add(new Fraction(1, 12))) || isInteger(argumentAsPart.add(new Fraction(5, 12))))
					return Fraction.half.applyMinus().simplifyBasic(options)
				if (isInteger(argumentAsPart.subtract(new Fraction(1, 8))) || isInteger(argumentAsPart.subtract(new Fraction(3, 8))))
					return Fraction.half.multiply(Sqrt.two).simplifyBasic(options)
				if (isInteger(argumentAsPart.add(new Fraction(1, 8))) || isInteger(argumentAsPart.add(new Fraction(3, 8))))
					return Fraction.half.applyMinus().multiply(Sqrt.two).simplifyBasic(options)
				if (isInteger(argumentAsPart.subtract(new Fraction(1, 6))) || isInteger(argumentAsPart.subtract(new Fraction(1, 3))))
					return Fraction.half.multiply(Sqrt.three).simplifyBasic(options)
				if (isInteger(argumentAsPart.add(new Fraction(1, 6))) || isInteger(argumentAsPart.add(new Fraction(1, 3))))
					return Fraction.half.applyMinus().multiply(Sqrt.three).simplifyBasic(options)
			}
		}

		return new Sin(argument).applySettingsToSelf(this.settings)
	}
}
Sin.type = 'Sin'
Sin.availableSettings = ['useDegrees']
module.exports.Sin = Sin

/*
 * Cosine
 */

class Cos extends SingleArgumentFunction {
	toNumber() {
		return Math.cos(this.useDegrees ? deg2rad(this.argument.toNumber()) : this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		return new Product(
			Integer.minusOne,
			new Sin(this.argument).applySettingsToSelf(this.settings),
			this.argument.getDerivative(variable), // Apply the chain rule.
			this.useDegrees ? d2rFactor : 1, // When using degrees add a compensation factor.
		)
	}

	simplifyBasic(options) {
		let { argument } = this.simplifyChildren(options)

		// For analysis, reduce to a sine with a phase shift.
		if (options.forAnalysis)
			return new Sin(argument.add(this.useDegrees ? 90 : halfPi)).simplifyBasic(options)

		// Check for basic reductions.
		if (argument.isNumeric()) {
			const argumentAsPart = argument.divide(this.useDegrees ? 360 : twoPi).cleanForAnalysis()

			// Check for cases of 0, 1 or -1.
			if (options.remove01TrigFunctions) {
				if (isInteger(argumentAsPart.add(Fraction.quarter).multiply(Integer.two)))
					return Integer.zero.simplifyBasic(options)
				if (isInteger(argumentAsPart))
					return Integer.one.simplifyBasic(options)
				if (isInteger(argumentAsPart.add(Fraction.half)))
					return Integer.minusOne.simplifyBasic(options)
			}

			// Check for cases of 1/2, 1/2*sqrt(2) and 1/2*sqrt(3).
			if (options.removeRootTrigFunctions) {
				if (isInteger(argumentAsPart.add(new Fraction(1, 12))) || isInteger(argumentAsPart.subtract(new Fraction(1, 12))))
					return Fraction.half.multiply(Sqrt.three).simplifyBasic(options)
				if (isInteger(argumentAsPart.add(new Fraction(5, 12))) || isInteger(argumentAsPart.subtract(new Fraction(5, 12))))
					return Fraction.half.applyMinus().multiply(Sqrt.three).simplifyBasic(options)
				if (isInteger(argumentAsPart.add(new Fraction(1, 8))) || isInteger(argumentAsPart.subtract(new Fraction(1, 8))))
					return Fraction.half.multiply(Sqrt.two).simplifyBasic(options)
				if (isInteger(argumentAsPart.add(new Fraction(3, 8))) || isInteger(argumentAsPart.subtract(new Fraction(3, 8))))
					return Fraction.half.applyMinus().multiply(Sqrt.two).simplifyBasic(options)
				if (isInteger(argumentAsPart.add(new Fraction(1, 6))) || isInteger(argumentAsPart.subtract(new Fraction(1, 6))))
					return Fraction.half.simplifyBasic(options)
				if (isInteger(argumentAsPart.add(new Fraction(1, 3))) || isInteger(argumentAsPart.subtract(new Fraction(1, 3))))
					return Fraction.half.applyMinus().simplifyBasic(options)
			}
		}

		return new Cos(argument).applySettingsToSelf(this.settings)
	}
}
Cos.type = 'Cos'
Cos.availableSettings = ['useDegrees']
module.exports.Cos = Cos

/*
 * Tangent
 */

class Tan extends SingleArgumentFunction {
	toNumber() {
		return Math.tan(this.useDegrees ? deg2rad(this.argument.toNumber()) : this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		return new Fraction({
			numerator: new Product(
				this.argument.getDerivative(variable), // Apply the chain rule.
				this.useDegrees ? d2rFactor : 1, // When using degrees add a compensation factor.
			),
			denominator: new Power(new Cos(this.argument).applySettingsToSelf(this.settings), Integer.two), // Use 1/cos(arg)^2.
		})
	}

	simplifyBasic(options) {
		let { argument } = this.simplifyChildren(options)

		// Check for basic reductions.
		if (argument.isNumeric()) {
			const argumentAsPart = argument.divide(this.useDegrees ? 360 : twoPi).cleanForAnalysis()
			const argumentAsHalfPart = argumentAsPart.multiply(Integer.two).cleanForAnalysis()

			// Check for cases of multiples of 90 degrees.
			if (options.remove01TrigFunctions) {
				if (isInteger(argumentAsHalfPart))
					return Integer.zero.simplifyBasic(options)
				if (isInteger(argumentAsPart.subtract(Fraction.quarter)))
					return Variable.infinity.simplifyBasic(options)
				if (isInteger(argumentAsPart.add(Fraction.quarter)))
					return Variable.minusInfinity.simplifyBasic(options)
			}

			// Check for cases of 30, 45 and 60 degrees, and variations of these.
			if (options.removeRootTrigFunctions) {
				if (isInteger(argumentAsHalfPart.subtract(new Fraction(1, 6))))
					return new Fraction(Integer.one, Sqrt.three).simplifyBasic(options)
				if (isInteger(argumentAsHalfPart.subtract(new Fraction(1, 4))))
					return Integer.one.simplifyBasic(options)
				if (isInteger(argumentAsHalfPart.subtract(new Fraction(1, 3))))
					return Sqrt.three.simplifyBasic(options)
				if (isInteger(argumentAsHalfPart.subtract(new Fraction(2, 6))))
					return Sqrt.three.applyMinus().simplifyBasic(options)
				if (isInteger(argumentAsHalfPart.subtract(new Fraction(3, 4))))
					return Integer.minusOne.simplifyBasic(options)
				if (isInteger(argumentAsHalfPart.subtract(new Fraction(5, 6))))
					return new Fraction(Integer.minusOne, Sqrt.three).simplifyBasic(options)
			}
		}

		// For analysis reduce to sines and cosines.
		if (options.turnTanIntoSinCos)
			return new Fraction(
				new Sin(argument).applySettingsToSelf(this.settings),
				new Cos(argument).applySettingsToSelf(this.settings),
			).simplifyBasic(options)

		return new Tan(argument).applySettingsToSelf(this.settings)
	}
}
Tan.type = 'Tan'
Tan.availableSettings = ['useDegrees']
module.exports.Tan = Tan

/*
 * Arcsine
 */

class Arcsin extends SingleArgumentFunction {
	get name() {
		return 'asin'
	}

	toNumber() {
		const result = Math.asin(this.argument.toNumber())
		return this.useDegrees ? rad2deg(result) : result
	}

	getDerivativeBasic(variable) {
		return new Fraction({
			numerator: this.argument.getDerivative(variable), // Apply the chain rule.
			denominator: new Sqrt(new Sum([Integer.one, new Power(this.argument, Integer.two).applyMinus()])), // Apply 1/sqrt(1 - arg^2).
		}).multiply(this.useDegrees ? r2dFactor : 1) // When using degrees add a compensation factor.
	}

	simplifyBasic(options) {
		let { argument } = this.simplifyChildren(options)

		// Check for basic reductions.
		if (argument.isNumeric()) {
			const processResult = (result) => (this.useDegrees ? new Integer(result) : d2rFactor.multiply(result)).simplifyBasic(options)
			const cleanedArgument = argument.cleanForAnalysis()

			// Check for cases of -1, 0 and 1.
			if (options.remove01TrigFunctions) {
				if (equivalent(cleanedArgument, Integer.minusOne))
					return processResult(-90)
				if (equivalent(cleanedArgument, Integer.zero))
					return Integer.zero
				if (equivalent(cleanedArgument, Integer.one))
					return processResult(90)
			}

			// Check for cases of 30/45/60 degree angles and similar.
			if (options.removeRootTrigFunctions) {
				const doubleArgument = cleanedArgument.multiply(Integer.two).cleanForAnalysis()
				const minusDoubleArgument = doubleArgument.applyMinus()
				if (equivalent(minusDoubleArgument, Sqrt.three))
					return processResult(-60)
				if (equivalent(minusDoubleArgument, Sqrt.two))
					return processResult(-45)
				if (equivalent(minusDoubleArgument, Integer.one))
					return processResult(-30)
				if (equivalent(doubleArgument, Integer.one))
					return processResult(30)
				if (equivalent(doubleArgument, Sqrt.two))
					return processResult(45)
				if (equivalent(doubleArgument, Sqrt.three))
					return processResult(60)
			}
		}

		return new Arcsin(argument).applySettingsToSelf(this.settings)
	}
}
Arcsin.type = 'Arcsin'
Arcsin.availableSettings = ['useDegrees']
module.exports.Arcsin = Arcsin

/*
 * Arccosine
 */

class Arccos extends SingleArgumentFunction {
	get name() {
		return 'acos'
	}

	toNumber() {
		const result = Math.acos(this.argument.toNumber())
		return this.useDegrees ? rad2deg(result) : result
	}

	getDerivativeBasic(variable) {
		return new Fraction({
			numerator: this.argument.getDerivative(variable).applyMinus(), // Apply the chain rule with a minus sign.
			denominator: new Sqrt(new Sum([Integer.one, new Power(this.argument, Integer.two).applyMinus()])), // Apply 1/sqrt(1 - arg^2).
		}).multiply(this.useDegrees ? r2dFactor : 1) // When using degrees add a compensation factor.
	}

	simplifyBasic(options) {
		let { argument } = this.simplifyChildren(options)

		// Check for basic reductions.
		if (argument.isNumeric()) {
			const processResult = (result) => (this.useDegrees ? new Integer(result) : d2rFactor.multiply(result)).simplifyBasic(options)
			const cleanedArgument = argument.cleanForAnalysis()

			// Check for cases of -1, 0 and 1.
			if (options.remove01TrigFunctions) {
				if (equivalent(cleanedArgument, Integer.minusOne))
					return processResult(180)
				if (equivalent(cleanedArgument, Integer.zero))
					return processResult(90)
				if (equivalent(cleanedArgument, Integer.one))
					return Integer.zero
			}

			// Check for cases of 30/45/60 degree angles and similar.
			if (options.removeRootTrigFunctions) {
				const doubleArgument = cleanedArgument.multiply(Integer.two).cleanForAnalysis()
				const minusDoubleArgument = doubleArgument.applyMinus()
				if (equivalent(doubleArgument, Sqrt.three))
					return processResult(30)
				if (equivalent(doubleArgument, Sqrt.two))
					return processResult(45)
				if (equivalent(doubleArgument, Integer.one))
					return processResult(60)
				if (equivalent(minusDoubleArgument, Integer.one))
					return processResult(120)
				if (equivalent(minusDoubleArgument, Sqrt.two))
					return processResult(135)
				if (equivalent(minusDoubleArgument, Sqrt.three))
					return processResult(150)
			}
		}

		return new Arccos(argument).applySettingsToSelf(this.settings)
	}
}
Arccos.type = 'Arccos'
Arccos.availableSettings = ['useDegrees']
module.exports.Arccos = Arccos

/*
 * Arctangent
 */

class Arctan extends SingleArgumentFunction {
	get name() {
		return 'atan'
	}

	toNumber() {
		const result = Math.atan(this.argument.toNumber())
		return this.useDegrees ? rad2deg(result) : result
	}

	getDerivativeBasic(variable) {
		return new Fraction({
			numerator: this.argument.getDerivative(variable), // Apply the chain rule.
			denominator: new Sum([Integer.one, new Power(this.argument, Integer.two)]), // Apply 1/(1 + arg^2).
		}).multiply(this.useDegrees ? r2dFactor : 1) // When using degrees add a compensation factor.
	}

	simplifyBasic(options) {
		let { argument } = this.simplifyChildren(options)

		// Check for basic reductions.
		if (argument.isNumeric()) {
			const processResult = (result) => (this.useDegrees ? new Integer(result) : d2rFactor.multiply(result)).simplifyBasic(options)
			const cleanedArgument = argument.cleanForAnalysis()

			// Check for cases of -infinity, 0 and infinity.
			if (options.remove01TrigFunctions) {
				if (equivalent(cleanedArgument, Variable.minusInfinity))
					return processResult(-90)
				if (equivalent(cleanedArgument, Integer.minusOne))
					return Integer.zero
				if (equivalent(cleanedArgument, Variable.infinity))
					return processResult(90)
			}

			// Check for cases of 30/45/60 degree angles and similar.
			if (options.removeRootTrigFunctions) {
				const minusArgument = cleanedArgument.applyMinus()
				const oneOverSqrtThree = new Fraction(1, Sqrt.three)
				if (equivalent(minusArgument, Sqrt.three))
					return processResult(-60)
				if (equivalent(minusArgument, Integer.one))
					return processResult(-45)
				if (equivalent(minusArgument, oneOverSqrtThree))
					return processResult(-30)
				if (equivalent(cleanedArgument, oneOverSqrtThree))
					return processResult(30)
				if (equivalent(cleanedArgument, Integer.one))
					return processResult(45)
				if (equivalent(cleanedArgument, Sqrt.three))
					return processResult(60)
			}
		}

		return new Arctan(argument).applySettingsToSelf(this.settings)
	}
}
Arctan.type = 'Arctan'
Arctan.availableSettings = ['useDegrees']
module.exports.Arctan = Arctan
