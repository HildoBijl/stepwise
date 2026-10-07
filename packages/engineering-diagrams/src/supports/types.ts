import type { PositionedSvgSymbolProps } from '../PositionedSvgSymbol.tsx'
import type { GroundShapeProps } from '../shapes/index.ts'

export interface SupportProps extends PositionedSvgSymbolProps {
	thickness?: number
	width?: number
	height?: number
	groundProps?: GroundShapeProps
}
