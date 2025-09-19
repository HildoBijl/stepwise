// The Rectangle object ensures that the given HTML object always has a certain aspect ratio (height divided by width; it is 1 (square) by default). Alternatively, a falsy aspect ratio can be given to ignore the aspect ratio.

import React from 'react'
import { Box } from '@mui/material'

export default function Rectangle({ children, className, outerClassName, aspectRatio = 1 }) {
	// On a falsy aspect ratio, just give a div.
	if (!aspectRatio)
		return <div className={className}>{children}</div>

	// Set up the Rectangle properly.
	return <Box className={outerClassName} sx={{
		height: 0,
		overflow: 'hidden',
		paddingTop: `${aspectRatio * 100}%`,
		position: 'relative',
	}}>
		<Box className={className} sx={{
			height: '100%',
			width: '100%',
			left: 0,
			top: 0,
			position: 'absolute',
		}}>
			{children}
		</Box>
	</Box>
}
