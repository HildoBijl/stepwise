import { type ReactNode } from 'react'

import { type TranslatableReactNode, type TranslationVariable, type TranslationVariableShorthand } from './variable.ts'

export type ConditionProps = { children: TranslatableReactNode, value: boolean | TranslationVariable | TranslationVariableShorthand }
export type ConditionBranchProps = { children: TranslatableReactNode }

/*
 * Component definitions.
 */

// Condition: the outer container. Add the two exhaustive branches to its definition.
function ConditionRoot({ children }: ConditionProps) { return children as ReactNode }
export const Condition = Object.assign(ConditionRoot, { True, False })

function True({ children }: ConditionBranchProps) { return children as ReactNode }
function False({ children }: ConditionBranchProps) { return children as ReactNode }

/*
 * Check functions.
 */

export function isConditionConstruct(type: unknown): boolean {
	return type === ConditionRoot
}

export function getConditionBranch(type: unknown): 'true' | 'false' | undefined {
	if (type === True) return 'true'
	if (type === False) return 'false'
}
