import { ensureInt } from '@step-wise/utils'

import { Prefix } from '../Prefix'
import { type BaseUnit } from '../BaseUnit'

import { type UnitElementInput, type UnitElementStorageValue, UnitElementType } from './interpreting'
import { unitElementInputToParameters } from './construction'

export type UnitElementLike = UnitElementInput | UnitElement

export function asUnitElement(input: UnitElementLike): UnitElement {
	return input instanceof UnitElement ? input : new UnitElement(input)
}

export class UnitElement {
	readonly prefix: Prefix | undefined
	readonly unit: BaseUnit
	readonly power: number

	/*
	 * Construction
	 */

	constructor(input: UnitElementInput) {
		const { prefix, unit, power } = unitElementInputToParameters(input)
		this.prefix = prefix
		this.unit = unit
		this.power = power
	}

	/*
	 * Serialization
	 */

	get type(): UnitElementType {
		return UnitElementType
	}

	toStorageValue(): UnitElementStorageValue {
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

	hasStandardPrefix(): boolean {
		return this.prefix === this.unit.standardPrefix || (this.prefix instanceof Prefix && this.unit.standardPrefix instanceof Prefix && this.prefix.equals(this.unit.standardPrefix))
	}

	isInStandardUnits(): boolean {
		return this.unit.standard
	}

	isInStandardForm(): boolean {
		return this.isInStandardUnits() && this.hasStandardPrefix()
	}

	isInBaseUnits(): boolean {
		return this.unit.base
	}

	isInBaseForm(): boolean {
		return this.isInBaseUnits() && this.hasStandardPrefix()

	}

	/*
	 * Display
	 */

	get str(): string {
		return this.toString()
	}

	toString(): string {
		let str = this.getStringWithoutPower()
		if (this.power !== 1) str += `^${this.power}`
		return str
	}

	get tex(): string {
		return this.toTex()
	}

	toTex(): string {
		let tex = this.getStringWithoutPower()
		if (this.power !== 1) tex += `^{${this.power}}`
		return `{\\rm ${tex}}`
	}

	get prefixString(): string {
		return this.prefix ? this.prefix.letter : ''
	}

	get unitString(): string {
		return this.unit.str
	}

	getStringWithoutPower(): string {
		return this.prefixString + this.unitString
	}

	/*
	 * Operations
	 */

	removePrefix(): UnitElement {
		return new UnitElement({
			prefix: this.unit.standardPrefix ? this.unit.standardPrefix.letter : '',
			unit: this.unitString,
			power: this.power,
		})
	}

	getPrefixRemovalExponent(): number {
		return (this.prefixExponent - this.unit.defaultPrefixExponent) * this.power
	}

	setPower(power: number): UnitElement {
		power = ensureInt(power, true, true)
		return power === this.power ? this : new UnitElement({ prefix: this.prefix, unit: this.unit, power })
	}

	toPower(power: number): UnitElement {
		return this.setPower(this.power * ensureInt(power, true, true))
	}
}
