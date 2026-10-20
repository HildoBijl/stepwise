import { type ReactNode } from 'react'

import { type PluralCategory } from '../message/index.ts'
import { type TranslationVariable } from './variable.ts'

export type PluralProps = { children: ReactNode, value: TranslationVariable, form?: 'cardinal' | 'ordinal' }
export type PluralBranchProps = { children: ReactNode }
export type ExactPluralBranchProps = PluralBranchProps & { value: number }
type PluralBranchComponent = (props: PluralBranchProps) => ReactNode

const pluralBranches = new Map<unknown, PluralCategory>()

/*
 * Component definitions.
 */

// Plural: the outer container. Add the subcontainers to its definition.
function PluralRoot({ children }: PluralProps) { return children }
export const Plural = Object.assign(PluralRoot, {
	Zero: createPluralBranch('zero'),
	One: createPluralBranch('one'),
	Two: createPluralBranch('two'),
	Few: createPluralBranch('few'),
	Many: createPluralBranch('many'),
	Other: createPluralBranch('other'),
	Exact,
})

// Helper to create a subcontainer entry.
function createPluralBranch(category: PluralCategory): PluralBranchComponent {
	function Branch({ children }: PluralBranchProps) { return children }
	pluralBranches.set(Branch, category)
	return Branch
}

// Subcontainer for exact branches.
function Exact({ children }: ExactPluralBranchProps) { return children }


/*
 * Check and get functions.
 */

export function isPluralConstruct(type: unknown): boolean {
	return type === PluralRoot
}

export function getPluralBranch(type: unknown): PluralCategory | 'exact' | undefined {
	if (type === Exact) return 'exact'
	return pluralBranches.get(type)
}
