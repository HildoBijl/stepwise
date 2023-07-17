import React from 'react'

import { selectRandomCorrect, selectRandomIncorrect } from 'util/feedbackMessages'

import { Par, M } from 'ui/components'
import IntegerInput from 'ui/form/inputs/IntegerInput'
import { InputSpace } from 'ui/form'

import { useIdentityTransformationSettings, Circle } from 'ui/figures'
import { DrawingInput, useInputValue, useDrawingInputData, DragMarker } from 'ui/form/inputs/loader'

import SimpleExercise from '../types/SimpleExercise'

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

function getFeedback({ state, input, progress }) {
	const { x } = state
	const { ans } = input
	const correct = state.x === input.ans
	if (correct)
		return { ans: { correct, text: selectRandomCorrect() }, testDI: true }
	return {
		ans: {
			correct,
			text: Math.abs(x) === Math.abs(ans) ? (
				ans > 0 ? 'Je bent het minteken vergeten.' : 'Probeer het minteken te verwijderen.'
			) : selectRandomIncorrect()
		},
		testDI: false,
	}
}

function TestDrawingInput() {
	const transformationSettings = useIdentityTransformationSettings(400, 300)

	const snappers = FI => [[200, 150], ...FI.map(circle => circle.center)]
	const selectAll = FI => FI.map(circle => ({ ...circle, selected: true }))
	const deselectAll = FI => FI.map(circle => ({ ...circle, selected: false }))
	const startDrag = deselectAll
	const endDrag = (FI, downData, upData) => [
		...FI.map(circle => ({ ...circle, selected: false })),
		{
			center: downData.snappedPosition,
			radius: upData.position.subtract(downData.snappedPosition).magnitude,
			selected: true,
		}
	]
	const endSelect = (FI, rectangle, utilKeys) => applySelectionRectangle(FI, rectangle, utilKeys)

	return <DrawingInput
		id="testDI"
		initialSI={[]}
		transformationSettings={transformationSettings}
		snappers={snappers}
		snapOnDrag={false}
		startDrag={startDrag}
		endDrag={endDrag}
		endSelect={endSelect}
		selectAll={selectAll}
		deselectAll={deselectAll}
	>
		<Circles />
		<ActiveDrag />
	</DrawingInput >
}

function applySelectionRectangle(input, rectangle, utilKeys) {
	return input.map(circle => ({ ...circle, selected: rectangle.touchesCircle(circle.center, circle.radius) }))
}

function Circles() {
	let input = useInputValue()
	const { selectionRectangle } = useDrawingInputData()
	if (selectionRectangle)
		input = applySelectionRectangle(input, selectionRectangle)
	return input.map((circle, index) => <Circle key={index} center={circle.center} radius={circle.radius} style={{ fill: circle.selected ? '#0a6f3c' : 'blue' }} />)
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

