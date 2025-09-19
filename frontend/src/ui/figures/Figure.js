import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import { Box } from '@mui/material'

import { processOptions, resolveFunctions } from 'step-wise/util'

export const defaultFigureOptions = {
	aspectRatio: 0.75, // Height divided by width. Enter a ratio.
	maxWidth: undefined, // Max width in px. Enter a number. undefined means scale to full width when possible.
	className: '',
	style: {},
	sx: {},
	figureInnerSx: {},
	children: null, // What is placed inside the figure.
}

export const Figure = forwardRef((options, ref) => {
	const { aspectRatio, maxWidth, className, style, sx, figureInnerSx, children } = processOptions(options, defaultFigureOptions)
	// Define refs and make them accessible to calling elements.
	const figureInner = useRef()
	const figureOuter = useRef()
	useImperativeHandle(ref, () => ({
		get inner() { return figureInner.current },
		get outer() { return figureOuter.current },
	}))

	// Render the component.
	return <Box className={className} ref={figureOuter} style={style} sx={theme => ({
		boxSizing: 'content-box',
		margin: '1.2rem auto',
		maxWidth: maxWidth !== undefined ? `${maxWidth}px` : '',
		padding: '0 1.2rem', // To make sure possible labels outside the SVG aren't cut off by the slider.
		position: 'relative',
		...resolveFunctions(sx, theme)
	})}>
		<Box ref={figureInner} sx={theme => ({
			boxSizing: 'content-box',
			height: 0,
			paddingBottom: `${aspectRatio * 100}%`,
			position: 'relative',
			width: '100%',
			...resolveFunctions(figureInnerSx, theme),
		})}>
			{children}
		</Box>
	</Box>
})
