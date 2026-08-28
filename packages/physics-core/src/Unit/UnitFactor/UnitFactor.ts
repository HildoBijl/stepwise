import { ensureInteger } from '@step-wise/js-utils'

import { Prefix } from '../Prefix/index.ts'
import { type UnitDefinition } from '../UnitDefinition/index.ts'

import { type UnitFactorInput, type UnitFactorStorageValue, UnitFactorType } from './interpreting.ts'
import { unitFactorInputToParameters } from './construction.ts'

export type UnitFactorLike = UnitFactorInput | UnitFactor

export function asUnitFactor(input: UnitFactorLike): UnitFactor {
	return input instanceof UnitFactor ? input : new UnitFactor(input)
}

export class UnitFactor {
	readonly prefix: Prefix | undefined
	readonly unit: UnitDefinition
	readonly power: number

	/*
	 * Construction
	 */

	constructor(input: UnitFactorInput) {
		const { prefix, unit, power } = unitFactorInputToParameters(input)
		this.prefix = prefix
		this.unit = unit
		this.power = power
	}

	/*
	 * Serialization
	 */

	get type(): UnitFactorType {
		return UnitFactorType
	}

	toStorageValue(): UnitFactorStorageValue {
		return {
			...(this.prefix ? { prefix: this.prefixString } : {}),
			unit: this.unitString,
			...(this.power === 1 ? {} : { power: this.power }),
		}
	}

	/*
	 * Basic properties
	 */

	hasPrefix(): boolean {
		return !!this.prefix
	}

	get prefixExponent(): number {
		return this.prefix ? this.prefix.exponent : 0
	}

	usesStandardPrefix(): boolean {
		return this.prefix === this.unit.standardPrefix || (this.prefix instanceof Prefix && this.unit.standardPrefix instanceof Prefix && this.prefix.equals(this.unit.standardPrefix))
	}

	isInStandardUnits(): boolean {
		return this.unit.standard
	}

	isInStandardForm(): boolean {
		return this.isInStandardUnits() && this.usesStandardPrefix()
	}

	isInBaseUnits(): boolean {
		return this.unit.base
	}

	isInBaseForm(): boolean {
		return this.isInBaseUnits() && this.usesStandardPrefix()

	}

	/*
	 * Display
	 */

	get str(): string {
		return this.toString()
	}

	toString(): string {
		let str = this.getSymbol()
		if (this.power !== 1) str += `^${this.power}`
		return str
	}

	get tex(): string {
		return this.toTex()
	}

	toTex(): string {
		let tex = this.getSymbol()
		if (this.power !== 1) tex += `^{${this.power}}`
		return `{\\rm ${tex}}`
	}

	get prefixString(): string {
		return this.prefix ? this.prefix.symbol : ''
	}

	get unitString(): string {
		return this.unit.str
	}

	getSymbol(): string {
		return this.prefixString + this.unitString
	}

	/*
	 * Operations
	 */

	normalizePrefix(): UnitFactor {
		return new UnitFactor({
			prefix: this.unit.standardPrefix ? this.unit.standardPrefix.symbol : '',
			unit: this.unitString,
			power: this.power,
		})
	}

	getPrefixNormalizationExponent(): number {
		return (this.prefixExponent - this.unit.defaultPrefixExponent) * this.power
	}

	setPower(power: number): UnitFactor {
		power = ensureInteger(power, { nonNegative: true, nonZero: true })
		return power === this.power ? this : new UnitFactor({ prefix: this.prefix, unit: this.unit, power })
	}

	toPower(power: number): UnitFactor {
		return this.setPower(this.power * ensureInteger(power, { nonNegative: true, nonZero: true }))
	}
}
