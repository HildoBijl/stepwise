import { ensureInteger, shallowEqual } from '@step-wise/utils'

import { type UnitElement, type UnitElementStorageValue } from '../UnitElement'

import { type UnitElementArray, type UnitStorageValue, type UnitInput, UnitType, splitUnitString, asUnitElementArray } from './interpreting'
import { type UnitSimplificationOptionsInput, type UnitTransformationData, resolveUnitSimplificationOptions, getUnitSimplificationTargetRank, compareUnitElements } from './simplification'
import { type UnitEqualityOptionsInput, type UnitEqualityResult, compareUnitTransformationSize, resolveUnitEqualityOptions } from './comparison'

const unitColor = '#044488'

export type UnitLike = Unit | UnitInput

export function asUnit(input: UnitLike): Unit {
	return input instanceof Unit ? input : new Unit(input)
}

export class Unit {
	readonly numerator: UnitElementArray
	readonly denominator: UnitElementArray

	/*
	 * Construction
	 */

	constructor(input: UnitInput = {}) {
		if (typeof input === 'string') input = splitUnitString(input)
		this.numerator = asUnitElementArray(input.numerator ?? [])
		this.denominator = asUnitElementArray(input.denominator ?? [])
	}

	/*
	 * Serialization
	 */

	get type(): UnitType {
		return UnitType
	}

	toStorageValue(): UnitStorageValue {
		return {
			...(this.numerator.length === 0 ? {} : { numerator: this.numerator.map((unitElement: UnitElement): UnitElementStorageValue => unitElement.toStorageValue()) }),
			...(this.denominator.length === 0 ? {} : { denominator: this.denominator.map((unitElement: UnitElement): UnitElementStorageValue => unitElement.toStorageValue()) }),
		}
	}

	/*
	 * Basic properties
	 */

	get allElements(): UnitElement[] {
		return [...this.numerator, ...this.denominator]
	}

	isEmpty(): boolean {
		return this.allElements.length === 0
	}

	hasStandardPrefixes(): boolean {
		return this.allElements.every(unitElement => unitElement.hasStandardPrefix())
	}

	isInStandardUnits(): boolean {
		return this.allElements.every(unitElement => unitElement.isInStandardUnits())
	}

	isInStandardForm(): boolean {
		return this.allElements.every(unitElement => unitElement.isInStandardForm())
	}

	isInBaseUnits(): boolean {
		return this.allElements.every(unitElement => unitElement.isInBaseUnits())
	}

	isInBaseForm(): boolean {
		return this.allElements.every(unitElement => unitElement.isInBaseForm())
	}

	/*
	 * Display
	 */

	get str(): string {
		return this.toString()
	}

	toString(): string {
		const partToString = (part: UnitElementArray) => part.length === 0 ? '1' : part.map(unitElement => unitElement.str).join(' * ')
		let str = partToString(this.numerator)
		if (this.denominator.length > 0) str += ` / ${partToString(this.denominator)}`
		return str
	}

	get tex(): string {
		return this.toTex()
	}

	toTex(): string {
		const addColor = (tex: string) => `{\\color{${unitColor}} ${tex}}`
		const partToTex = (part: UnitElementArray) => part.length === 0 ? '1' : part.map(unitElement => addColor(unitElement.tex)).join(' \\cdot ')
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
			numerator: this.numerator.map(unitElement => unitElement.toPower(power)),
			denominator: this.denominator.map(unitElement => unitElement.toPower(power)),
		})
	}

	/*
	 * Simplification
	 */

	// Combine identical units like "dm^2 * dm^3" into one, like "dm^5".
	combine(): Unit {
		// Set up a handler to track the total power for each unitElement.
		const unitPowers: Record<string, { unitElement: UnitElement, power: number }> = {}
		const addUnitElement = (unitElement: UnitElement, positive: boolean) => {
			const key = unitElement.getStringWithoutPower()
			unitPowers[key] ??= { unitElement, power: 0 }
			unitPowers[key].power += (positive ? 1 : -1) * unitElement.power
		}

		// Walk through all present unit elements.
		this.numerator.forEach(unitElement => addUnitElement(unitElement, true))
		this.denominator.forEach(unitElement => addUnitElement(unitElement, false))

		// Reassemble the result.
		if (Object.keys(unitPowers).length === this.numerator.length + this.denominator.length) return this
		return new Unit({
			numerator: Object.values(unitPowers).filter(({ power }) => power > 0).map(({ unitElement, power }) => unitElement.setPower(power)),
			denominator: Object.values(unitPowers).filter(({ power }) => power < 0).map(({ unitElement, power }) => unitElement.setPower(-power)),
		})
	}

	// Sort units according to a standard ordering.
	sort(): Unit {
		const sortUnitElements = (unitElements: UnitElement[]): UnitElement[] => [...unitElements].sort(compareUnitElements)
		const numerator = sortUnitElements(this.numerator)
		const denominator = sortUnitElements(this.denominator)
		return (shallowEqual(numerator, this.numerator) && shallowEqual(denominator, this.denominator)) ? this : new Unit({ numerator: numerator, denominator: denominator })
	}

	// Remove all prefixes.
	removePrefixes(): Unit {
		return this.removePrefixesWithData().unit
	}
	removePrefixesWithData(): UnitTransformationData<Unit> {
		if (this.hasStandardPrefixes()) return { unit: this, exponent: 0, factor: 1, difference: 0 }
		let exponent = 0
		const unit = new Unit({
			numerator: this.numerator.map(unitElement => {
				exponent += unitElement.getPrefixRemovalExponent()
				return unitElement.removePrefix()
			}),
			denominator: this.denominator.map(unitElement => {
				exponent -= unitElement.getPrefixRemovalExponent()
				return unitElement.removePrefix()
			}),
		})
		return { unit, exponent, factor: 1, difference: 0 }
	}

	// Turn all units to standard units.
	toStandardUnits(): Unit {
		return this.toStandardUnitsWithData().unit
	}
	toStandardUnitsWithData(): UnitTransformationData<Unit> {
		const data = this.removePrefixesWithData()
		if (data.unit.isInStandardForm()) return data
		let { unit, exponent, factor, difference } = data

		// Walk through all unit elements and transform them to standard form.
		let newUnit = new Unit()
		unit.allElements.forEach((unitElement: UnitElement, index: number): void => {
			const inNumerator = index < unit.numerator.length
			if (unitElement.isInStandardForm()) {
				newUnit = newUnit[inNumerator ? 'multiply' : 'divide'](new Unit({ numerator: [unitElement] }))
			} else {
				const adjustment = unitElement.unit.toStandard
				if (!adjustment) throw new Error(`Invalid unit conversion: unit "${unitElement.unit}" has no standard conversion.`)
				const sign = inNumerator ? 1 : -1
				difference += (adjustment.difference ?? 0) * sign
				factor *= Math.pow(adjustment.factor ?? 1, unitElement.power * sign)
				exponent += (adjustment.exponent ?? 0) * unitElement.power * sign
				newUnit = newUnit[inNumerator ? 'multiply' : 'divide'](asUnit(adjustment.unit).toPower(unitElement.power))
			}
		})

		// Affine shifts only apply to standalone units like °C, not J/°C or °C^2.
		if (this.numerator.length !== 1 || this.denominator.length !== 0 || this.numerator[0].power !== 1) difference = 0
		return { unit: newUnit, exponent, factor, difference }
	}

	// Turn all units to base units.
	toBaseUnits(): Unit {
		return this.toBaseUnitsWithData().unit
	}
	toBaseUnitsWithData(): UnitTransformationData<Unit> {
		const data = this.toStandardUnitsWithData()
		if (data.unit.isInBaseForm()) return data
		let { unit, exponent, factor, difference } = data

		// Walk through all unit elements and transform them to base form.
		let newUnit = new Unit()
		unit.allElements.forEach((unitElement: UnitElement, index: number): void => {
			const inNumerator = index < unit.numerator.length
			if (unitElement.isInBaseForm()) {
				newUnit = newUnit[inNumerator ? 'multiply' : 'divide'](new Unit({ numerator: [unitElement] }))
			} else {
				if (!unitElement.unit.toBase) throw new Error(`Invalid unit conversion: unit "${unitElement.unit}" has no base conversion.`)
				newUnit = newUnit[inNumerator ? 'multiply' : 'divide'](asUnit(unitElement.unit.toBase).toPower(unitElement.power))
			}
		})

		return { ...data, unit: newUnit }
	}

	// Use custom simplification options.
	simplifyWithData(options?: UnitSimplificationOptionsInput): UnitTransformationData<Unit> {
		const simplificationOptions = resolveUnitSimplificationOptions(options)
		const rank = getUnitSimplificationTargetRank(simplificationOptions.target)
		let data = rank >= 3 ? this.toBaseUnitsWithData() : rank >= 2 ? this.toStandardUnitsWithData() : rank >= 1 ? this.removePrefixesWithData() : { unit: this, exponent: 0, factor: 1, difference: 0 }
		if (simplificationOptions.combine) data = { ...data, unit: data.unit.combine() }
		if (simplificationOptions.sort) data = { ...data, unit: data.unit.sort() }
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
		const simplificationOptions = { target: equalityOptions.target, combine: true, sort: true }
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
