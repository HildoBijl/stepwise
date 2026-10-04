import type { ComponentPropsWithoutRef, ReactNode } from 'react'

export const figureAlignments = ['left', 'center', 'right'] as const
export type FigureAlignment = typeof figureAlignments[number]

export function ensureFigureAlignment(value: unknown): FigureAlignment {
	if (value === 'left' || value === 'center' || value === 'right') return value
	throw new Error(`Invalid Figure alignment: expected "left", "center", or "right" but received "${String(value)}".`)
}

export type FigureProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
	children?: ReactNode
	width: number
	height: number
	maxWidth?: number
	alignment?: FigureAlignment
}
