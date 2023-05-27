// The FBDInput is an input field for Free Body Diagrams.

import React, { forwardRef, useCallback, useMemo, useState, useEffect } from 'react'
import { useTheme, makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { mod } from 'step-wise/util/numbers'
import { processOptions, filterOptions, applyToEachParameter } from 'step-wise/util/objects'
import { hasSimpleDeepEqualsMatching } from 'step-wise/util/arrays'
import { Vector, Span } from 'step-wise/geometry'
import { defaultForceLength, loadTypes, areLoadsEqual, doesLoadTouchRectangle, reverseLoad } from 'step-wise/edu/exercises/util/engineeringMechanics'

import { useEnsureRef, useEventListener } from 'util/react'
import { defaultDrawingOptions, DrawingInput, useAsDrawingInput, defaultDrawingInputOptions, SvgDefsPortal } from 'ui/components/figures'

import { render, loadColors, LoadLabel } from '../EngineeringDiagram'

import { clean, functionalize } from './support'
import { nonEmptyNoDoubles } from './validation'

export const defaultFBDInputOptions = {
	...defaultDrawingOptions,
	...defaultDrawingInputOptions,
	initialSI: [],
	validate: nonEmptyNoDoubles,
	clickMarkerSize: 6,
	minimumDragDistance: 12,
	forceLength: defaultForceLength, // The lengths of force vectors. Set to something falsy to make sure they have varying lengths.
	allowMoments: true,
	maximumMomentDistance: 60,
	getLoadNames: undefined,
}

const useStyles = makeStyles((theme) => ({
	FBDInput: {
		'& .drawing': {
			'& .figureInner': {
				cursor: ({ isSnapped, readOnly }) => readOnly ? 'default' : (isSnapped ? 'pointer' : 'crosshair'),
			},
		},
	},
}))

export const FBDInput = forwardRef((options, drawingRef) => {
	options = processOptions(options, defaultFBDInputOptions)

	// Sort out references.
	drawingRef = useEnsureRef(drawingRef)
	const container = drawingRef.current && drawingRef.current.figure && drawingRef.current.figure.inner

	// When a selection ends, process the selected objects.
	options.processSelection = (selectionRectangle, utilKeys) => {
		setFI(FI => FI.map(load => ({
			...load,
			selected: doesLoadTouchRectangle(load, selectionRectangle) || (utilKeys.shift && load.selected),
		})))
	}

	// When a draw starts, deselect all. When a drag ends, add a load.
	options.startDrag = () => {
		setFI(FI => FI.map(load => ({ ...load, selected: false })))
	}
	options.endDrag = (downState, upState) => {
		const dragObject = getDragObject(downState, upState, options)
		if (dragObject && Object.values(loadTypes).includes(dragObject.type))
			setFI(FI => [...FI, { ...dragObject, selected: true }])
	}

	// Track the hover status.
	const [hoverIndex, setHoverIndex] = useState()

	// Connect this field as a drawing input field.
	const inputData = useAsDrawingInput({
		...filterOptions(options, defaultDrawingInputOptions),
		element: container,
		drawingRef,
		clean,
		functionalize,
		equals: hasSimpleDeepEqualsMatching,
		applySnapping: hoverIndex === undefined, // On hovering prevent snapping.
	})
	const {
		readOnly, active, activateField,
		FI, setFI,
		mouseData, mouseDownData, selectionRectangle, cancelDrag,
		feedback,
	} = inputData

	// On becoming inactive, deselect all loads.
	useEffect(() => {
		if (!active)
			setFI(FI => FI.some(load => load.selected) ? FI.map(load => load.selected ? { ...load, selected: false } : load) : FI)
	}, [active, setFI])

	// Handle deletions.
	const deleteSelection = useCallback(() => {
		setFI(FI => FI.filter(load => !load.selected))
		setHoverIndex(undefined) // Ensure we don't remember a hover over a deleted arrow.
	}, [setFI])
	const hasSelectedLoad = FI.some(load => load.selected)
	options.onDelete = !readOnly && hasSelectedLoad ? deleteSelection : undefined

	// Deal with key presses.
	const keyDownHandler = useCallback((evt) => active && handleKeyPress(evt, setFI, deleteSelection), [setFI, active, deleteSelection])
	useEventListener('keydown', keyDownHandler)

	// Deal with mouse enters/leaves.
	const mouseHandlers = useMemo(() => readOnly ? {} : {
		mouseenter: (hoverIndex) => setHoverIndex(hoverIndex),
		mouseleave: () => setHoverIndex(undefined),
		mousedown: (hoverIndex, evt) => {
			evt.stopPropagation() // Prevent a drag start.
			setHoverIndex(undefined) // Cancel any remaining hover (useful for touch devices).
			cancelDrag() // Cancel a dragging effect, to prevent that a (tiny) rectangle will be processed resulting in a deselect.
			activateField() // Activate the field if not already active.
			setFI(FI => {
				// When the shift key is selected, or when no other loads are selected, flip the selection of the chosen load. Maintain object continuity wherever possible.
				if (evt.shiftKey || !FI.some((load, index) => (index !== hoverIndex && load.selected)))
					return FI.map((load, index) => index === hoverIndex ? { ...load, selected: !load.selected } : load)

				// In other cases, make sure that only the chosen load is selected.
				return FI.map((load, index) => (load.selected === (index === hoverIndex)) ? load : { ...load, selected: !load.selected })
			})
		},
	}, [readOnly, setFI, activateField, cancelDrag])

	// Sort out styles.
	const classes = useStyles({ isSnapped: mouseData.isSnapped, readOnly })
	const className = clsx(options.className, classes.FBDInput, 'FBDInput')

	// Add all drawn loads.
	const dragObject = getDragObject(mouseDownData, mouseData, options)
	const styledLoads = useMemo(() => FI.map((load, index) => styleLoad(index, { ...load, hovering: index === hoverIndex }, readOnly, mouseHandlers, selectionRectangle, feedback)), [FI, hoverIndex, readOnly, mouseHandlers, selectionRectangle, feedback])
	options.children = <>
		{options.children}
		{render(styledLoads)}
		{dragObject && render(styleLoad(undefined, dragObject, readOnly))}
	</>

	// When load names need to be displayed, add these load names.
	if (options.getLoadNames) {
		const loads = dragObject && Object.values(loadTypes).includes(dragObject.type) ? [...FI, dragObject] : FI
		const loadNames = options.getLoadNames(loads)
		options.children = <>
			{options.children}
			{loadNames.map((loadName, index) => <LoadLabel key={index} {...loadName} />)}
		</>
	}

	// Render the Engineering Diagram with the proper styling.
	return <DrawingInput ref={drawingRef} className={className} inputData={inputData} options={options}>
		<EngineeringDiagramDefs />
		{options.children}
	</DrawingInput>
})
export default FBDInput

// EngineeringDiagramDefs are SVG defs needed inside the SVG. We put them into the Drawing.
function EngineeringDiagramDefs() {
	const theme = useTheme()
	return <SvgDefsPortal>
		{[0, 0.6, 1.6, 1].map((value, index) => <filter key={index} id={`selectionFilter${index}`}>
			<feGaussianBlur stdDeviation="3" in="SourceGraphic" result="Blur" />
			<feComposite operator="out" in="Blur" in2="SourceGraphic" result="OuterBlur" />
			<feComponentTransfer in="OuterBlur" result="OuterBlurFaded">
				<feFuncA type="linear" slope={value} />
			</feComponentTransfer>
			<feFlood width="100%" height="100%" floodColor={theme.palette.primary.main} result="Color" />
			<feComposite operator="in" in="Color" in2="OuterBlurFaded" result="Glow" />
			<feMerge>
				<feMergeNode in="Glow" />
				<feMergeNode in="SourceGraphic" />
			</feMerge>
		</filter>)}
	</SvgDefsPortal>
}

function getDragObject(downData, upData, options) {
	// Don't draw if the mouse is not down or is not snapped.
	if (!downData || !downData.isSnapped || !upData || !upData.position)
		return null

	// Extract options.
	const { clickMarkerSize, minimumDragDistance, maximumMomentDistance, allowMoments, forceLength } = options

	// Calculate the resulting drag vector in various forms.
	const vector = upData.position.subtract(downData.snappedPosition)
	let snappedVector = upData.snappedPosition.subtract(downData.snappedPosition)
	let graphicalSnappedVector = upData.graphicalSnappedPosition.subtract(downData.graphicalSnappedPosition)

	// On a double snap, always give a force.
	if (upData.isSnappedTwice && !graphicalSnappedVector.isZero()) {
		if (forceLength)
			snappedVector = snappedVector.setMagnitude(forceLength)
		return { type: loadTypes.force, span: new Span({ vector: snappedVector, end: upData.snappedPosition }) }
	}

	// On a very short vector return a marker.
	if (graphicalSnappedVector.squaredMagnitude <= minimumDragDistance ** 2)
		return { type: 'Square', center: downData.snappedPosition, graphicalSide: clickMarkerSize, className: 'dragMarker' }

	// On a short distance return a moment.
	if (allowMoments && graphicalSnappedVector.squaredMagnitude <= maximumMomentDistance ** 2) {
		const angle = vector.argument
		const opening = snappedVector.argument
		return { type: loadTypes.moment, position: downData.snappedPosition, opening, clockwise: mod(angle - opening, 2 * Math.PI) > Math.PI }
	}

	// Otherwise return a Force. How to do this depends on if a fixed length has been set.
	if (forceLength)
		snappedVector = snappedVector.setMagnitude(forceLength)
	return { type: loadTypes.force, span: new Span({ start: downData.snappedPosition, vector: snappedVector }) }
}

function styleLoad(index, load, readOnly, mouseHandlers = {}, selectionRectangle, feedback) {
	load = { ...load }

	// Only style actual loads and not selection markers.
	if (Object.values(loadTypes).includes(load.type)) {
		const inSelectionRectangle = selectionRectangle && doesLoadTouchRectangle(load, selectionRectangle)
		const hoverStatus = getHoverStatus(load.selected, load.hovering, inSelectionRectangle)
		load = {
			...load,
			color: loadColors.input,
			style: readOnly ? {} : {
				filter: `url(#selectionFilter${hoverStatus})`,
				cursor: 'pointer',
			},
			...applyToEachParameter(mouseHandlers, handler => (evt) => handler(index, evt)),
		}

		// On feedback apply the specific color.
		if (feedback && feedback.affectedLoads && feedback.affectedLoads.some(affectedLoad => areLoadsEqual(load, affectedLoad)))
			load.color = feedback.color
	}

	// Remove selection/hovering data.
	delete load.selected
	delete load.hovering
	return load
}

function getHoverStatus(selected, hovering, inSelectionRectangle) {
	if (selected)
		return hovering || inSelectionRectangle ? 2 : 3
	return hovering || inSelectionRectangle ? 1 : 0
}

function handleKeyPress(evt, setFI, deleteSelection) {
	// On a delete remove all selected loads.
	if (evt.key === 'Delete' || evt.key === 'Backspace') {
		evt.preventDefault()
		return deleteSelection()
	}

	// On ctrl+a select all.
	if (evt.key === 'a' && evt.ctrlKey) {
		evt.preventDefault()
		return setFI(FI => FI.map(load => ({ ...load, selected: true })))
	}

	// On an escape or ctrl+d deselect all.
	if (evt.key === 'Escape' || (evt.key === 'd' && evt.ctrlKey)) {
		evt.preventDefault()
		return setFI(FI => FI.map(load => ({ ...load, selected: false })))
	}

	// On a reverse, reverse all selected arrows.
	if (evt.key === 'f' || evt.key === 'r' || evt.key === 'd') {
		return setFI(FI => FI.map(load => load.selected ? reverseLoad(load) : load))
	}
}

// getDefaultForceVector can take an angle and directly give a force vector with the given angle.
export const getDefaultForceVector = (angle) => Vector.fromPolar(defaultFBDInputOptions.forceLength, angle)
