import React, { useEffect } from 'react'
import { Box } from '@mui/material'
import { Delete } from '@mui/icons-material'

import { resolveFunctionValuesDeep } from '@step-wise/js-utils'
import { anchors, HtmlElement, useDrawingCoordinateSystem } from '@step-wise/drawing'

import { useInput } from '../../../Input'

import { useDrawingInputData } from '../context'

export function DeleteButton() {
	const { active, applyDeletion, showDeleteButton, setIsMouseOverButton, isDragging, isSelecting } = useDrawingInputData()
	const [FI, setFI] = useInput()
	const coordinateSystem = useDrawingCoordinateSystem()

	// On a mouse down event on the button, apply deletion.
	const deletionHandler = (event) => {
		event.stopPropagation()
		setFI(FI => applyDeletion(FI))
	}

	// Check if the button has to be shown. When it's not shown, note that the mouse cannot be over a button. (If this is not done, the mouse still seems to be over a button even after removing the button.)
	const showButton = applyDeletion && resolveFunctionValuesDeep(showDeleteButton, FI) && active && !isDragging && !isSelecting
	useEffect(() => {
		if (!showButton)
			setIsMouseOverButton(false)
	}, [showButton, setIsMouseOverButton])

	// If no button should be shown, show nothing.
	if (!showButton)
		return null

	// Render the marker.
	return <HtmlElement anchor={anchors.bottomRight} position={{ pixelPosition: coordinateSystem.renderToPixel([coordinateSystem.width - 10, coordinateSystem.height - 10]) }} scale={1.3} ignoreMouse={false}>
		<Box onPointerDown={deletionHandler} onMouseEnter={() => setIsMouseOverButton(true)} onMouseLeave={() => setIsMouseOverButton(false)} sx={{
			background: '#eee',
			borderRadius: '10rem',
			cursor: 'pointer',
			opacity: 0.8,
			padding: '0.3rem',
			'&:hover': { opacity: 1 },
			'& svg': { width: 'auto' },
		}}>
			<Delete />
		</Box>
	</HtmlElement>
}
