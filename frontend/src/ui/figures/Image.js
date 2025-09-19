import React, { forwardRef } from 'react'
import { Box } from '@mui/material'

import { processOptions, resolveFunctions } from 'step-wise/util'

export const defaultImageOptions = {
	src: undefined, // The path to the image.
	alt: 'Unknown image',
	maxWidth: undefined, // Max width in px. Enter a number. undefined means scale to full width when possible.
	maxHeight: undefined,
	className: '',
	style: {},
	sx: {},
}

export const Image = forwardRef((options, ref) => {
	const { src, alt, maxWidth, maxHeight, className, style, sx } = processOptions(options, defaultImageOptions)

	// Apply default styling within the sx parameter.
	const expandedSx = theme => ({
		maxWidth: maxWidth === undefined ? maxWidth : `${maxWidth}px`,
		maxHeight: maxHeight === undefined ? maxHeight : `${maxHeight}px`,
		boxSizing: 'content-box',
		display: 'block',
		margin: '1.2rem auto',
		...resolveFunctions(sx, theme)
	})

	// Render the component.
	return <Box component="img" ref={ref} src={src} alt={alt} className={className} style={style} sx={expandedSx} />
})
