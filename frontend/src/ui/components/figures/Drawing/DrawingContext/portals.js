import { createContext, useContext } from 'react'

import { Portal } from 'util/react'

import { useDrawingContext } from './context'

export function HtmlPortal({ children }) {
	const { htmlContents } = useDrawingContext()
	return <Portal target={htmlContents}>{children}</Portal>
}

const IsInSvgPortalContext = createContext()
export function SvgPortal({ children }) {
	const { svg } = useDrawingContext()
	const isInSvgPortal = useContext(IsInSvgPortalContext)
	return isInSvgPortal ? children : <IsInSvgPortalContext.Provider value={true}><Portal target={svg}>{children}</Portal></IsInSvgPortalContext.Provider> // Only set up a portal on the first SVG component encountered (like a Group) and not on descendants (like shapes inside that Group).
}

export function SvgDefsPortal({ children }) {
	const { svgDefs } = useDrawingContext()
	return <Portal target={svgDefs}>{children}</Portal>
}