import { mergeDefaults } from '@step-wise/utils'
import { type ExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNode } from '../../../construction'

import { type SimplificationOption, type SimplificationOptions, type SimplificationPreset, structureOnlyOptions, elementaryCleanOptions, removeUselessOptions, basicCleanOptions, regularCleanOptions, advancedCleanOptions, forAnalysisOptions, forDerivativesOptions, forDisplayOptions } from '../simplificationOptions'

import { repeatedSimplify } from './simplify'

type OptionAdjustments = Partial<SimplificationOptions>
type OptionList = readonly SimplificationOption[]

// Helpers to process the simplification options.
function applyOptionAdjustments(options: SimplificationOptions, adjustments: OptionAdjustments = {}): SimplificationOptions {
	return mergeDefaults(adjustments, options)
}
function applyOptionLists(options: SimplificationOptions, addOptions: OptionList = [], removeOptions: OptionList = []): SimplificationOptions {
	options = { ...options }
	addOptions.forEach(option => { options[option] = true })
	removeOptions.forEach(option => { options[option] = false })
	return options
}
function adjustPreset(preset: SimplificationPreset, adjustments?: OptionAdjustments): SimplificationPreset
function adjustPreset(preset: SimplificationPreset, addOptions?: OptionList, removeOptions?: OptionList): SimplificationPreset
function adjustPreset(preset: SimplificationPreset, arg1: OptionAdjustments | OptionList = {}, arg2: OptionList = []): SimplificationPreset {
	const adjust = (options: SimplificationOptions) => Array.isArray(arg1) ? applyOptionLists(options, arg1, arg2) : applyOptionAdjustments(options, arg1 as OptionAdjustments)
	return Array.isArray(preset) ? preset.map(adjust) : adjust(preset as SimplificationOptions)
}
function simplifyWithPreset(node: ExpressionNode, settings: Partial<ExpressionSettings>, preset: SimplificationPreset, arg1?: OptionAdjustments | OptionList, arg2?: OptionList): ExpressionNode {
	const options = Array.isArray(arg1) ? adjustPreset(preset, arg1, arg2) : adjustPreset(preset, arg1 as OptionAdjustments)
	return repeatedSimplify(node, settings, options)
}

// Simplification functions.
export function cleanStructureOnly(node: ExpressionNode, settings?: Partial<ExpressionSettings>, adjustments?: Partial<SimplificationOptions>): ExpressionNode
export function cleanStructureOnly(node: ExpressionNode, settings?: Partial<ExpressionSettings>, addOptions?: SimplificationOption[], removeOptions?: SimplificationOption[]): ExpressionNode
export function cleanStructureOnly(node: ExpressionNode, settings: Partial<ExpressionSettings> = {}, arg1: OptionAdjustments | OptionList = {}, arg2: OptionList = []) {
	return simplifyWithPreset(node, settings, structureOnlyOptions, arg1, arg2)
}

export function elementaryClean(node: ExpressionNode, settings?: Partial<ExpressionSettings>, adjustments?: Partial<SimplificationOptions>): ExpressionNode
export function elementaryClean(node: ExpressionNode, settings?: Partial<ExpressionSettings>, addOptions?: SimplificationOption[], removeOptions?: SimplificationOption[]): ExpressionNode
export function elementaryClean(node: ExpressionNode, settings: Partial<ExpressionSettings> = {}, arg1: OptionAdjustments | OptionList = {}, arg2: OptionList = []) {
	return simplifyWithPreset(node, settings, elementaryCleanOptions, arg1, arg2)
}

export function removeUseless(node: ExpressionNode, settings?: Partial<ExpressionSettings>, adjustments?: Partial<SimplificationOptions>): ExpressionNode
export function removeUseless(node: ExpressionNode, settings?: Partial<ExpressionSettings>, addOptions?: SimplificationOption[], removeOptions?: SimplificationOption[]): ExpressionNode
export function removeUseless(node: ExpressionNode, settings: Partial<ExpressionSettings> = {}, arg1: OptionAdjustments | OptionList = {}, arg2: OptionList = []) {
	return simplifyWithPreset(node, settings, removeUselessOptions, arg1, arg2)
}

export function basicClean(node: ExpressionNode, settings?: Partial<ExpressionSettings>, adjustments?: Partial<SimplificationOptions>): ExpressionNode
export function basicClean(node: ExpressionNode, settings?: Partial<ExpressionSettings>, addOptions?: SimplificationOption[], removeOptions?: SimplificationOption[]): ExpressionNode
export function basicClean(node: ExpressionNode, settings: Partial<ExpressionSettings> = {}, arg1: OptionAdjustments | OptionList = {}, arg2: OptionList = []) {
	return simplifyWithPreset(node, settings, basicCleanOptions, arg1, arg2)
}

export function regularClean(node: ExpressionNode, settings?: Partial<ExpressionSettings>, adjustments?: Partial<SimplificationOptions>): ExpressionNode
export function regularClean(node: ExpressionNode, settings?: Partial<ExpressionSettings>, addOptions?: SimplificationOption[], removeOptions?: SimplificationOption[]): ExpressionNode
export function regularClean(node: ExpressionNode, settings: Partial<ExpressionSettings> = {}, arg1: OptionAdjustments | OptionList = {}, arg2: OptionList = []) {
	return simplifyWithPreset(node, settings, regularCleanOptions, arg1, arg2)
}

export function advancedClean(node: ExpressionNode, settings?: Partial<ExpressionSettings>, adjustments?: Partial<SimplificationOptions>): ExpressionNode
export function advancedClean(node: ExpressionNode, settings?: Partial<ExpressionSettings>, addOptions?: SimplificationOption[], removeOptions?: SimplificationOption[]): ExpressionNode
export function advancedClean(node: ExpressionNode, settings: Partial<ExpressionSettings> = {}, arg1: OptionAdjustments | OptionList = {}, arg2: OptionList = []) {
	return simplifyWithPreset(node, settings, advancedCleanOptions, arg1, arg2)
}

export function cleanForAnalysis(node: ExpressionNode, settings?: Partial<ExpressionSettings>, adjustments?: Partial<SimplificationOptions>): ExpressionNode
export function cleanForAnalysis(node: ExpressionNode, settings?: Partial<ExpressionSettings>, addOptions?: SimplificationOption[], removeOptions?: SimplificationOption[]): ExpressionNode
export function cleanForAnalysis(node: ExpressionNode, settings: Partial<ExpressionSettings> = {}, arg1: OptionAdjustments | OptionList = {}, arg2: OptionList = []) {
	return simplifyWithPreset(node, settings, forAnalysisOptions, arg1, arg2)
}

export function cleanForDerivatives(node: ExpressionNode, settings?: Partial<ExpressionSettings>, adjustments?: Partial<SimplificationOptions>): ExpressionNode
export function cleanForDerivatives(node: ExpressionNode, settings?: Partial<ExpressionSettings>, addOptions?: SimplificationOption[], removeOptions?: SimplificationOption[]): ExpressionNode
export function cleanForDerivatives(node: ExpressionNode, settings: Partial<ExpressionSettings> = {}, arg1: OptionAdjustments | OptionList = {}, arg2: OptionList = []) {
	return simplifyWithPreset(node, settings, forDerivativesOptions, arg1, arg2)
}

export function cleanForDisplay(node: ExpressionNode, settings?: Partial<ExpressionSettings>, adjustments?: Partial<SimplificationOptions>): ExpressionNode
export function cleanForDisplay(node: ExpressionNode, settings?: Partial<ExpressionSettings>, addOptions?: SimplificationOption[], removeOptions?: SimplificationOption[]): ExpressionNode
export function cleanForDisplay(node: ExpressionNode, settings: Partial<ExpressionSettings> = {}, arg1: OptionAdjustments | OptionList = {}, arg2: OptionList = []) {
	return simplifyWithPreset(node, settings, forDisplayOptions, arg1, arg2)
}
