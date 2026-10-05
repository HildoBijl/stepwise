import { createContext, useContext, type ReactNode } from 'react'

import { Portal } from '@step-wise/react-utils'

import { useDrawing } from './context.ts'

const SvgPortalContext = createContext(false)

export function SvgPortal({ children }: { children?: ReactNode }) {
	const { svg } = useDrawing()
	const isInsideSvgPortal = useContext(SvgPortalContext)
	if (isInsideSvgPortal) return children
	return <SvgPortalContext.Provider value={true}><Portal target={svg}>{children}</Portal></SvgPortalContext.Provider>
}

export function SvgDefsPortal({ children }: { children?: ReactNode }) {
	return <Portal target={useDrawing().svgDefs}>{children}</Portal>
}

export interface HtmlPortalProps {
	children?: ReactNode
	behind?: boolean
}

export function HtmlPortal({ behind = false, children }: HtmlPortalProps) {
	const { html, htmlBehind } = useDrawing()
	return <Portal target={behind ? htmlBehind : html}>{children}</Portal>
}
