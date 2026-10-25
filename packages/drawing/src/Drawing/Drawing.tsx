import { useId, useImperativeHandle, useMemo, useState } from 'react'

import { useStableValue } from '@step-wise/react-utils'

import { Figure } from '../Figure/index.ts'
import { type DrawingCoordinateSystem, resolveDrawingView } from '../transforms/index.ts'
import { DrawingTargetRegistryProvider } from '../DrawingTargets/DrawingTargetRegistryProvider.tsx'

import { DrawingContextProvider } from './context.ts'
import type { DrawingFigureProps, DrawingHandle, DrawingProps } from './types.ts'

export function Drawing(props: DrawingProps) {
	const { ref, view, ...drawingProps } = props
	const coordinateSystem = useResolvedDrawingCoordinateSystem(view)
	return <ResolvedDrawing {...drawingProps} coordinateSystem={coordinateSystem} ref={ref} />
}

export function DrawingFigure(props: DrawingFigureProps) {
	const { children, clip, ref, useCanvas, useSvg, view, ...figureProps } = props
	const coordinateSystem = useResolvedDrawingCoordinateSystem(view)
	const { width, height } = coordinateSystem
	return <Figure {...figureProps} width={width} height={height}>
		<ResolvedDrawing clip={clip} coordinateSystem={coordinateSystem} ref={ref} useCanvas={useCanvas} useSvg={useSvg}>
			{children}
		</ResolvedDrawing>
	</Figure>
}

type ResolvedDrawingProps = Omit<DrawingProps, 'view'> & {
	coordinateSystem: DrawingCoordinateSystem
}

function ResolvedDrawing(props: ResolvedDrawingProps) {
	const { children, clip = false, coordinateSystem, ref, useCanvas = false, useSvg = true, ...divProps } = props
	const id = useId()
	const clipPathId = `${id}-drawing-clip`
	const { width, height } = coordinateSystem

	// Set up state for the drawing elements.
	const [element, setElement] = useState<HTMLDivElement | null>(null)
	const [svg, setSvg] = useState<SVGSVGElement | null>(null)
	const [svgDefs, setSvgDefs] = useState<SVGDefsElement | null>(null)
	const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
	const [htmlBehind, setHtmlBehind] = useState<HTMLDivElement | null>(null)
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
	const context = useMemo(() => ({ id, clipPathId, coordinateSystem, element, svg, svgDefs, canvas, htmlBehind, html }), [id, clipPathId, coordinateSystem, element, svg, svgDefs, canvas, htmlBehind, html])

	// Render the drawing.
	return <DrawingContextProvider value={context}>
		<DrawingTargetRegistryProvider element={element} coordinateSystem={coordinateSystem}>
			<div {...divProps} ref={setElement} style={{ ...divProps.style, height, overflow: clip ? 'hidden' : 'visible', position: 'relative', width }}>
				{useCanvas && <canvas height={height} ref={setCanvas} width={width} style={layerStyle(0)} />}
				<div ref={setHtmlBehind} style={{ ...layerStyle(1), pointerEvents: 'none' }} />
				{useSvg && <svg ref={setSvg} viewBox={`0 0 ${width} ${height}`} style={{ ...layerStyle(2), overflow: 'visible', pointerEvents: 'none', userSelect: 'none' }}>
					<defs ref={setSvgDefs}>
						<clipPath id={clipPathId}>
							<rect height={height} width={width} x={0} y={0} />
						</clipPath>
					</defs>
				</svg>}
				<div ref={setHtml} style={{ ...layerStyle(3), pointerEvents: 'none' }} />
				{children}
			</div>
		</DrawingTargetRegistryProvider>
	</DrawingContextProvider>
}

function useResolvedDrawingCoordinateSystem(view: DrawingProps['view']): DrawingCoordinateSystem {
	return useStableValue(resolveDrawingView(view), areDrawingCoordinateSystemsEqual)
}

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

function areDrawingCoordinateSystemsEqual(current: DrawingCoordinateSystem, previous: DrawingCoordinateSystem): boolean {
	return current.width === previous.width && current.height === previous.height && current.yDirection === previous.yDirection && current.drawingToPixelTransformation.equals(previous.drawingToPixelTransformation)
}
