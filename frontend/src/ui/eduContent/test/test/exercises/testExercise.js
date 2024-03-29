import React from 'react'

import { toSO } from 'step-wise/inputTypes'
import { performComparison } from 'step-wise/eduTools'

import { Par, M } from 'ui/components'
import { useIdentityTransformationSettings, Circle } from 'ui/figures'
import { InputSpace } from 'ui/form'
import { DrawingInput, useInputValue, useDrawingInputData, DragMarker, IntegerInput } from 'ui/inputs'
import { SimpleExercise, getFieldInputFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ x }) {
	return <>
		<Par>Voer het getal <M>{x}</M> in.</Par>
		<InputSpace>
			<Par><IntegerInput id="ans" prelabel={<M>{x}=</M>} label={<span>Vul hier <M>{x}</M> in</span>} size='s' /></Par>
			<TestDrawingInput />
		</InputSpace>
	</>
}

function Solution({ x }) {
	return <Par>Je klikt op het invoervak en typt <M>{x}</M> in. {x < 0 ? `Het minteken kun je eventueel ook intypen na het getal. Het invoerveld snapt vanzelf dat dit minteken ervoor moet staan.` : ''}</Par>
}


function getFeedback(exerciseData) {
	const correct = performComparison(exerciseData, 'ans')
	return {
		...getFieldInputFeedback(exerciseData, {
			ans: [
				(input, solution, _, correct) => !correct && Math.abs(input) === Math.abs(solution) && (input > 0 ? exerciseData.translate('You forgot the minus sign.', 'noMinusSign') : exerciseData.translate('Try removing the minus sign.', 'unnecessaryMinusSign'))
			]
		}),
		testDI: correct,
	}
}

function TestDrawingInput() {
	const transformationSettings = useIdentityTransformationSettings(400, 300)

	const snappers = list => [[200, 150], ...list.map(circle => circle.center)]
	const selectAll = list => list.map(circle => ({ ...circle, selected: true }))
	const deselectAll = list => list.map(circle => ({ ...circle, selected: false }))
	const startDrag = deselectAll
	const endDrag = (list, downData, upData) => [
		...list.map(circle => ({ ...circle, selected: false })),
		{
			center: downData.snappedPosition,
			radius: upData.position.subtract(downData.snappedPosition).magnitude,
			selected: true,
		}
	]
	const endSelect = (list, rectangle, keys) => applySelectionRectangle(list, rectangle, keys)
	const deleteSelected = list => list.filter(circle => !circle.selected)

	return <DrawingInput
		id="testDI"
		initialSI={[]}
		validate={FO => FO.length < 2 && <>At least two circles are required to make the drawing valid.</>}
		clean={FI => FI.map(circle => {
			circle = { ...circle }
			delete circle.selected
			return toSO(circle)
		})}
		transformationSettings={transformationSettings}
		snappers={snappers}
		snapOnDrag={false}
		startDrag={startDrag}
		endDrag={endDrag}
		endSelect={endSelect}
		selectAll={selectAll}
		deselectAll={deselectAll}
		applyDeletion={deleteSelected}
		showDeleteButton={list => list.some(circle => circle.selected)}
	>
		<Circles />
		<ActiveDrag />
	</DrawingInput >
}

function applySelectionRectangle(input, rectangle, keys) {
	return input.map(circle => ({ ...circle, selected: (keys.shift && circle.selected) || rectangle.touchesCircle(circle.center, circle.radius) }))
}

function Circles() {
	let input = useInputValue()
	const { selectionRectangle, mouseData } = useDrawingInputData()
	if (selectionRectangle)
		input = applySelectionRectangle(input, selectionRectangle, mouseData?.keys)
	return input.map((circle, index) => <Circle key={index} center={circle.center} radius={circle.radius} style={{ fill: circle.selected ? '#0d8042' : 'blue' }} />)
}

function ActiveDrag() {
	const { isDragging, mouseDownData, mouseData } = useDrawingInputData()
	if (!isDragging)
		return null
	return <>
		<Circle center={mouseDownData.snappedPosition} radius={mouseData.position.subtract(mouseDownData.snappedPosition).magnitude} style={{ fill: 'red' }} />
		<DragMarker />
	</>
}
