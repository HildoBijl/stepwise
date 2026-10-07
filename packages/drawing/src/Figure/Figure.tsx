import { forwardRef, useRef } from 'react'

import { ensureNumber } from '@step-wise/js-utils'
import { useElementMeasurement } from '@step-wise/react-utils'

import { type FigureAlignment, type FigureProps, ensureFigureAlignment } from './types.ts'

export const Figure = forwardRef<HTMLDivElement, FigureProps>(function Figure(props, ref) {
	// Extract and check input.
	const { children, width: widthInput, height: heightInput, maxWidth: maxWidthInput, alignment: alignmentInput = 'center', style, ...divProps } = props
	const width = ensureNumber(widthInput, { nonNegative: true, nonZero: true })
	const height = ensureNumber(heightInput, { nonNegative: true, nonZero: true })
	const maxWidth = maxWidthInput === 'none' ? 'none' : ensureNumber(maxWidthInput ?? width, { nonNegative: true, nonZero: true })
	const alignment = ensureFigureAlignment(alignmentInput)

	// Use the viewport width to determine the scale of the figure content.
	const viewportRef = useRef<HTMLDivElement>(null)
	const displayedWidth = useElementMeasurement(viewportRef, element => element.getBoundingClientRect().width)
	const scale = displayedWidth === undefined || displayedWidth === 0 ? undefined : displayedWidth / width

	// Render the figure.
	return <div {...divProps} ref={ref} style={{
		boxSizing: 'border-box',
		margin: getAlignmentMargin(alignment),
		maxWidth,
		width: '100%',
		...style,
	}}>
		<div ref={viewportRef} style={{
			aspectRatio: `${width} / ${height}`,
			position: 'relative',
			width: '100%',
		}}>
			<div style={{
				height,
				left: 0,
				position: 'absolute',
				top: 0,
				transform: `scale(${scale ?? 1})`,
				transformOrigin: 'top left',
				visibility: scale === undefined ? 'hidden' : 'visible',
				width,
			}}>
				{children}
			</div>
		</div>
	</div>
})

function getAlignmentMargin(alignment: FigureAlignment): string {
	switch (alignment) {
		case 'left': return '0 auto 0 0'
		case 'center': return '0 auto'
		case 'right': return '0 0 0 auto'
	}
}
