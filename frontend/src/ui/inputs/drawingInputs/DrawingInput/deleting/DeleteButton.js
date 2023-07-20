import React, { useRef, useEffect } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { Delete } from '@material-ui/icons'

import { resolveFunctions } from 'step-wise/util/functions'

import { useEventListener } from 'util/react'
import { Element, useGraphicalBounds } from 'ui/figures'

import { useInput } from '../../../Input'

import { useDrawingInputData } from '../context'

const useStyles = makeStyles((theme) => ({
	deleteButton: {
		background: '#eee',
		borderRadius: '10rem',
		cursor: 'pointer',
		opacity: 0.8,
		padding: '0.3rem',
		'&:hover': {
			opacity: 1,
		},
		'& svg': {
			width: 'auto',
		},
	},
}))

export default function DeleteButton() {
	const { active, applyDeletion, showDeleteButton, setIsMouseOverButton, isDragging, isSelecting } = useDrawingInputData()
	const [FI, setFI] = useInput()
	const classes = useStyles()
	const buttonRef = useRef()
	const graphicalBounds = useGraphicalBounds()

	// On a mouse down event on the button, apply deletion.
	const deletionHandler = (event) => {
		event.stopPropagation()
		setFI(FI => applyDeletion(FI))
	}
	useEventListener(['mousedown', 'touchstart'], deletionHandler, buttonRef)

	// Check if the button has to be shown. When it's not shown, note that the mouse cannot be over a button. (If this is not done, the mouse still seems to be over a button even after removing the button.)
	const showButton = applyDeletion && resolveFunctions(showDeleteButton, FI) && active && !isDragging && !isSelecting
	useEffect(() => {
		if (!showButton)
			setIsMouseOverButton(false)
	}, [showButton, setIsMouseOverButton])

	// If no button should be shown, show nothing.
	if (!showButton)
		return null

	// Render the marker.
	return <>
		<Element anchor={[1, 1]} graphicalPosition={[graphicalBounds.width - 10, graphicalBounds.height - 10]} scale={1.3} ignoreMouse={false}>
			<div ref={buttonRef} className={clsx(classes.deleteButton, 'deleteButton')} onMouseEnter={() => setIsMouseOverButton(true)} onMouseLeave={() => setIsMouseOverButton(false)}>
				<Delete />
			</div>
		</Element>
	</>
}
