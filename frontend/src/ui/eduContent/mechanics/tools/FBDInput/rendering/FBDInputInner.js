import React, { useEffect } from 'react'

import { processOptions } from 'step-wise/util'
import { defaultForceLength, reverseLoad } from 'step-wise/eduContent/mechanics'

import { useEventListener } from 'util'
import { useInputData } from 'ui/inputs'

import { DragLoad, InputLoads, LoadLabels } from '../components'

import { GlowDefs } from './GlowDefs'

export const defaultFBDInputInnerOptions = {
	children: null,
	minimumDragDistance: 12, // The distance (in pixels) that needs to be dragged before something is shown.
	forceLength: defaultForceLength, // The lengths of force vectors. Set to something falsy to make sure they have varying lengths.
	allowMoments: true,
	maximumMomentDistance: 60,
	getLoadNames: undefined,
}

export default function FBDInputInner(options) {
	const { children } = options = processOptions(options, defaultFBDInputInnerOptions)
	const { active, setFI } = useInputData()

	// On becoming inactive, deselect all loads.
	useEffect(() => {
		if (!active)
			setFI(FI => FI.some(load => load.selected) ? FI.map(load => load.selected ? { ...load, selected: false } : load) : FI)
	}, [active, setFI])

	// Deal with certain key presses not already caught by the DrawingInput.
	const keyDownHandler = (event) => active && handleKeyPress(event, setFI)
	useEventListener('keydown', keyDownHandler)

	return <>
		<GlowDefs />
		{children}
		<InputLoads />
		<DragLoad options={options} />
		<LoadLabels options={options} />
	</>
}

// handleKeyPress handles the situation where a key is pressed when this input field is active.
function handleKeyPress(event, setFI) {
	// On a flip/reverse, reverse all selected arrows.
	if (event.key === 'f' || event.key === 'r')
		return setFI(FI => FI.map(load => load.selected ? reverseLoad(load) : load))
}
