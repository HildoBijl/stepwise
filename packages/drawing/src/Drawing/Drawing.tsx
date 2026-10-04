import { forwardRef, useId, useImperativeHandle, useMemo, useState } from 'react'

import { Figure } from '../Figure/index.ts'
import { resolveDrawingView } from '../transforms/index.ts'

import { DrawingContextProvider } from './context.ts'
import type { DrawingHandle, DrawingProps } from './types.ts'

export const Drawing = forwardRef<DrawingHandle, DrawingProps>(function Drawing(props, ref) {
	const { children, view, useCanvas = false, useSvg = true, ...figureProps } = props
	const id = useId()

	// Resolve the drawing view to get the coordinate system and dimensions.
	const coordinateSystem = useMemo(() => resolveDrawingView(view), [view])
	const { width, height } = coordinateSystem

	// Set up state for the drawing elements.
	const [element, setElement] = useState<HTMLDivElement | null>(null)
	const [svg, setSvg] = useState<SVGSVGElement | null>(null)
	const [svgDefs, setSvgDefs] = useState<SVGDefsElement | null>(null)
	const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
	const [html, setHtml] = useState<HTMLDivElement | null>(null)

	// Set up the imperative handle for the drawing.
	useImperativeHandle(ref, () => ({
		get element() { return element },
		get svg() { return svg },
		get canvas() { return canvas },
		get context() { return canvas?.getContext('2d') ?? null },
		coordinateSystem,
		width,
		height,
		drawingToClient: position => element ? coordinateSystem.drawingToClient(position, element.getBoundingClientRect()) : undefined,
		clientToDrawing: position => element ? coordinateSystem.clientToDrawing(position, element.getBoundingClientRect()) : undefined,
	}), [canvas, coordinateSystem, element, height, svg, width])

	// Set up the drawing context for the children.
	const context = useMemo(() => ({ id, coordinateSystem, element, svg, svgDefs, canvas, html }), [id, coordinateSystem, element, svg, svgDefs, canvas, html])

	// Render the drawing.
	return <DrawingContextProvider value={context}>
		<Figure {...figureProps} width={width} height={height}>
			<div ref={setElement} style={{ height, position: 'relative', userSelect: 'none', width }}>
				{useCanvas && <canvas height={height} ref={setCanvas} width={width} style={layerStyle(0)} />}
				{useSvg && <svg ref={setSvg} viewBox={`0 0 ${width} ${height}`} style={{ ...layerStyle(1), overflow: 'visible', pointerEvents: 'none' }}>
					<defs ref={setSvgDefs} />
				</svg>}
				<div ref={setHtml} style={{ ...layerStyle(2), pointerEvents: 'none' }} />
				{children}
			</div>
		</Figure>
	</DrawingContextProvider>
})

function layerStyle(zIndex: number) {
	return {
		height: '100%',
		left: 0,
		position: 'absolute' as const,
		top: 0,
		width: '100%',
		zIndex,
	}
}
