import { type ReactNode } from 'react'

import { type TranslatableReactNode, type TranslationVariable, type TranslationVariableShorthand } from './variable.ts'

export type SelectProps = { children: TranslatableReactNode, value: string | number | boolean | TranslationVariable | TranslationVariableShorthand }
export type SelectBranchProps = { children: TranslatableReactNode, value: string }
export type SelectOtherProps = { children: TranslatableReactNode }

/*
 * Component definitions.
 */

// Select: the outer container. Add the subcontainers to its definition.
function SelectRoot({ children }: SelectProps) { return children as ReactNode }
export const Select = Object.assign(SelectRoot, { Case, Other, Value })

// Select.Case.
function Case({ children }: SelectBranchProps) { return children as ReactNode }

// Select.Other.
function Other({ children }: SelectOtherProps) { return children as ReactNode }

// Placeholder for the value of the nearest enclosing Select construct.
function Value() { return null }

/*
 * Check functions.
 */

export function isSelectConstruct(type: unknown): boolean {
	return type === SelectRoot
}

export function isSelectBranch(type: unknown): boolean {
	return type === Case || type === Other
}

export function isSelectValue(type: unknown): boolean {
	return type === Value
}
