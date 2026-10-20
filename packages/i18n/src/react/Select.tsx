import { type ReactNode } from 'react'

import { type TranslationVariable } from './variable.ts'

export type SelectProps = { children: ReactNode, value: TranslationVariable }
export type SelectBranchProps = { children: ReactNode, value: string }
export type SelectOtherProps = { children: ReactNode }

/*
 * Component definitions.
 */

// Select: the outer container. Add the subcontainers to its definition.
function SelectRoot({ children }: SelectProps) { return children }
export const Select = Object.assign(SelectRoot, { Case, Other })

// Select.Case.
function Case({ children }: SelectBranchProps) { return children }

// Select.Other.
function Other({ children }: SelectOtherProps) { return children }

/*
 * Check functions.
 */

export function isSelectConstruct(type: unknown): boolean {
	return type === SelectRoot
}

export function isSelectBranch(type: unknown): boolean {
	return type === Case || type === Other
}
