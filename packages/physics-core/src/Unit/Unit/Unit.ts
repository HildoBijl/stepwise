import { ensureInteger, shallowEqual } from '@step-wise/js-utils'

import { type UnitFactor, type UnitFactorStorageValue } from '../UnitFactor'

import { type UnitFactorArray, type UnitStorageValue, type UnitInput, UnitType, splitUnitString, asUnitFactorArray } from './interpreting'
import { type UnitSimplificationOptionsInput, type UnitTransformationData, resolveUnitSimplificationOptions, compareUnitFactors } from './simplification'
import { type UnitEqualityOptionsInput, type UnitEqualityResult, compareUnitTransformationSize, resolveUnitEqualityOptions } from './comparison'

const unitColor = '#044488'

export type UnitLike = Unit | UnitInput

export function asUnit(input: UnitLike): Unit {
	return input instanceof Unit ? input : new Unit(input)
}

export class Unit {
	readonly numerator: UnitFactorArray
	readonly denominator: UnitFactorArray

	/*
	 * Construction
	 */

	constructor(input: UnitInput = {}) {
		if (typeof input === 'string') input = splitUnitString(input)
		this.numerator = asUnitFactorArray(input.numerator ?? [])
		this.denominator = asUnitFactorArray(input.denominator ?? [])
	}

	/*
	 * Serialization
	 */

	get type(): UnitType {
		return UnitType
	}

	toStorageValue(): UnitStorageValue {
		return {
			...(this.numerator.length === 0 ? {} : { numerator: this.numerator.map((unitFactor: UnitFactor): UnitFactorStorageValue => unitFactor.toStorageValue()) }),
			...(this.denominator.length === 0 ? {} : { denominator: this.denominator.map((unitFactor: UnitFactor): UnitFactorStorageValue => unitFactor.toStorageValue()) }),
		}
	}

	/*
	 * Basic properties
	 */

	get factors(): UnitFactor[] {
		return [...this.numerator, ...this.denominator]
	}

	isEmpty(): boolean {
		return this.factors.length === 0
	}

	usesStandardPrefixes(): boolean {
		return this.factors.every(unitFactor => unitFactor.usesStandardPrefix())
	}

	isInStandardUnits(): boolean {
		return this.factors.every(unitFactor => unitFactor.isInStandardUnits())
	}

	isInStandardForm(): boolean {
		return this.factors.every(unitFactor => unitFactor.isInStandardForm())
	}

	isInBaseUnits(): boolean {
		return this.factors.every(unitFactor => unitFactor.isInBaseUnits())
	}

	isInBaseForm(): boolean {
		return this.factors.every(unitFactor => unitFactor.isInBaseForm())
	}

	/*
	 * Display
	 */

	get str(): string {
		return this.toString()
	}

	toString(): string {
		const partToString = (part: UnitFactorArray) => part.length === 0 ? '1' : part.map(unitFactor => unitFactor.str).join(' * ')
		let str = partToString(this.numerator)
		if (this.denominator.length > 0) str += ` / ${partToString(this.denominator)}`
		return str
	}

	get tex(): string {
		return this.toTex()
	}

	toTex(): string {
		const addColor = (tex: string) => `{\\color{${unitColor}} ${tex}}`
		const partToTex = (part: UnitFactorArray) => part.length === 0 ? '1' : part.map(unitFactor => addColor(unitFactor.tex)).join(' \\cdot ')
		if (this.denominator.length > 0) return `\\frac{${partToTex(this.numerator)}}{${partToTex(this.denominator)}}`
		return partToTex(this.numerator)
	}

	get texWithBrackets(): string {
		return this.toTexWithBrackets()
	}

	toTexWithBrackets(): string {
		return `\\left[${this.toTex() || '-'}\\right]`
	}

	/*
	 * Arithmetic
	 */

	invert(): Unit {
		return this.isEmpty() ? this : new Unit({ numerator: this.denominator, denominator: this.numerator })
	}

	multiply(input: UnitLike): Unit {
		const unit = asUnit(input)
		if (unit.isEmpty()) return this
		if (this.isEmpty()) return unit
		return new Unit({
			numerator: [...this.numerator, ...unit.numerator],
			denominator: [...this.denominator, ...unit.denominator],
		})
	}

	divide(input: UnitLike): Unit {
		return this.multiply(asUnit(input).invert())
	}

	toPower(power: number): Unit {
		// Handle edge cases.
		power = ensureInteger(power)
		if (power === 0) return new Unit()
		if (power === 1) return this
		if (power < 0) return this.invert().toPower(-power)

		// Apply the power to the individual elements.
		return new Unit({
			numerator: this.numerator.map(unitFactor => unitFactor.toPower(power)),
			denominator: this.denominator.map(unitFactor => unitFactor.toPower(power)),
		})
	}

	/*
	 * Simplification
	 */

	// Combine identical units like "dm^2 * dm^3" into one, like "dm^5".
	combineLikeFactors(): Unit {
		// Set up a handler to track the total power for each unitFactor.
		const unitPowers: Record<string, { unitFactor: UnitFactor, power: number }> = {}
		const addUnitFactor = (unitFactor: UnitFactor, positive: boolean) => {
			const key = unitFactor.getSymbol()
			unitPowers[key] ??= { unitFactor, power: 0 }
			unitPowers[key].power += (positive ? 1 : -1) * unitFactor.power
		}

		// Walk through all present unit factors.
		this.numerator.forEach(unitFactor => addUnitFactor(unitFactor, true))
		this.denominator.forEach(unitFactor => addUnitFactor(unitFactor, false))

		// Reassemble the result.
		if (Object.keys(unitPowers).length === this.numerator.length + this.denominator.length) return this
		return new Unit({
			numerator: Object.values(unitPowers).filter(({ power }) => power > 0).map(({ unitFactor, power }) => unitFactor.setPower(power)),
			denominator: Object.values(unitPowers).filter(({ power }) => power < 0).map(({ unitFactor, power }) => unitFactor.setPower(-power)),
		})
	}

	// Sort units according to a standard ordering.
	sortFactors(): Unit {
		const sortUnitFactors = (unitFactors: UnitFactor[]): UnitFactor[] => [...unitFactors].sort(compareUnitFactors)
		const numerator = sortUnitFactors(this.numerator)
		const denominator = sortUnitFactors(this.denominator)
		return (shallowEqual(numerator, this.numerator) && shallowEqual(denominator, this.denominator)) ? this : new Unit({ numerator: numerator, denominator: denominator })
	}

	// Remove all prefixes.
	normalizePrefixes(): Unit {
		return this.normalizePrefixesWithData().unit
	}
	normalizePrefixesWithData(): UnitTransformationData<Unit> {
		if (this.usesStandardPrefixes()) return { unit: this, decimalExponent: 0, factor: 1, offset: 0 }
		let decimalExponent = 0
		const unit = new Unit({
			numerator: this.numerator.map(unitFactor => {
				decimalExponent += unitFactor.getPrefixNormalizationExponent()
				return unitFactor.normalizePrefix()
			}),
			denominator: this.denominator.map(unitFactor => {
				decimalExponent -= unitFactor.getPrefixNormalizationExponent()
				return unitFactor.normalizePrefix()
			}),
		})
		return { unit, decimalExponent, factor: 1, offset: 0 }
	}

	// Turn all units to standard units.
	toStandardUnits(): Unit {
		return this.toStandardUnitsWithData().unit
	}
	toStandardUnitsWithData(): UnitTransformationData<Unit> {
		const data = this.normalizePrefixesWithData()
		if (data.unit.isInStandardForm()) return data
		let { unit, decimalExponent, factor, offset } = data

		// Walk through all unit factors and transform them to standard form.
		let newUnit = new Unit()
		unit.factors.forEach((unitFactor: UnitFactor, index: number): void => {
			const inNumerator = index < unit.numerator.length
			if (unitFactor.isInStandardForm()) {
				newUnit = newUnit[inNumerator ? 'multiply' : 'divide'](new Unit({ numerator: [unitFactor] }))
			} else {
				const adjustment = unitFactor.unit.toStandard
				if (!adjustment) throw new Error(`Invalid unit conversion: unit "${unitFactor.unit}" has no standard conversion.`)
				const sign = inNumerator ? 1 : -1
				offset += (adjustment.offset ?? 0) * sign
				factor *= Math.pow(adjustment.factor ?? 1, unitFactor.power * sign)
				decimalExponent += (adjustment.decimalExponent ?? 0) * unitFactor.power * sign
				newUnit = newUnit[inNumerator ? 'multiply' : 'divide'](asUnit(adjustment.unit).toPower(unitFactor.power))
			}
		})

		// Affine shifts only apply to standalone units like °C, not J/°C or °C^2.
		if (this.numerator.length !== 1 || this.denominator.length !== 0 || this.numerator[0].power !== 1) offset = 0
		return { unit: newUnit, decimalExponent, factor, offset }
	}

	// Turn all units to base units.
	toBaseUnits(): Unit {
		return this.toBaseUnitsWithData().unit
	}
	toBaseUnitsWithData(): UnitTransformationData<Unit> {
		const data = this.toStandardUnitsWithData()
		if (data.unit.isInBaseForm()) return data
		const { unit } = data

		// Walk through all unit factors and transform them to base form.
		let newUnit = new Unit()
		unit.factors.forEach((unitFactor: UnitFactor, index: number): void => {
			const inNumerator = index < unit.numerator.length
			if (unitFactor.isInBaseForm()) {
				newUnit = newUnit[inNumerator ? 'multiply' : 'divide'](new Unit({ numerator: [unitFactor] }))
			} else {
				if (!unitFactor.unit.toBase) throw new Error(`Invalid unit conversion: unit "${unitFactor.unit}" has no base conversion.`)
				newUnit = newUnit[inNumerator ? 'multiply' : 'divide'](asUnit(unitFactor.unit.toBase).toPower(unitFactor.power))
			}
		})

		return { ...data, unit: newUnit }
	}

	// Use custom simplification options.
	simplifyWithData(options?: UnitSimplificationOptionsInput): UnitTransformationData<Unit> {
		const simplificationOptions = resolveUnitSimplificationOptions(options)
		const { target } = simplificationOptions
		let data = target === 'base' ? this.toBaseUnitsWithData() : target === 'standard' ? this.toStandardUnitsWithData() : target === 'normalizedPrefixes' ? this.normalizePrefixesWithData() : { unit: this, decimalExponent: 0, factor: 1, offset: 0 }
		if (simplificationOptions.combine) data = { ...data, unit: data.unit.combineLikeFactors() }
		if (simplificationOptions.sort) data = { ...data, unit: data.unit.sortFactors() }
		return data
	}

	/*
	 * Comparison
	 */

	equals(input: UnitLike, options?: UnitEqualityOptionsInput): boolean {
		return this.checkEquality(input, options).equal
	}

	checkEquality(input: UnitLike, options?: UnitEqualityOptionsInput): UnitEqualityResult<Unit> {
		// Process the input.
		const x = asUnit(input)
		const equalityOptions = resolveUnitEqualityOptions(options)

		// Simplify both units according to the given target.
		const simplificationOptions = { target: equalityOptions.target, combine: equalityOptions.combine, sort: equalityOptions.sort }
		const inputData = x.simplifyWithData(simplificationOptions)
		const referenceData = this.simplifyWithData(simplificationOptions)

		// Determine equality based on normalized string representation.
		const unitEqual = inputData.unit.toString() === referenceData.unit.toString()
		const size = compareUnitTransformationSize(inputData, referenceData)

		// Generate an output report.
		return {
			equal: unitEqual && (!equalityOptions.checkSize || size.equal),
			form: {
				equal: unitEqual,
				input: inputData.unit,
				reference: referenceData.unit,
			},
			size,
		}
	}
}
