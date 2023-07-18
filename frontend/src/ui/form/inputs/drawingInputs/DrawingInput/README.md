# DrawingInput

The `DrawingInput` component is the fundamental tool to use (or extend) when setting up interactive input fields where the user needs to do something with a `Drawing`. It has a large variety of functions that you can set up to implement it in the right way. We will display a few of them with the example of making a simple circle drawing tool.


## Input field options

In its essence the `DrawingInput` is like a `Drawing` and an `Input` component combined. In fact, it implements/extends both of these components, so all `Input` and `Drawing` options and tools are available.

### Options

When setting up a `DrawingInput` and its settings, first think about how you want to store your data in the `FI` and the `SI`. We will use a format like:

```
	FI = [{ center: new Vector(2, 3), radius: 1, selected: true }, { center: new Vector(6, 3), radius: 2, selected: false }]
	SI = [{ center: new Vector(2, 3), radius: 1 }, { center: new Vector(6, 3), radius: 2 }]
```

Note that data on which circle is selected is part of the `FI` but not of the `SI`: it does not need to be stored in the database.

To obtain the above set-up, we can use the following parameters for the `DrawingInput`.

```
import { toSO, toFO } from 'step-wise/inputTypes'
import { DrawingInput, useIdentityTransformationSettings } from 'ui/figures'

function CircleDrawingTool() {
	const transformationSettings = useIdentityTransformationSettings(400, 300)

	return <DrawingInput
		id="someFieldId"
		initialSI={[]} // Start with no circles.
		validate={FO => FO.length < 2 && <>At least two circles are required to make the drawing valid.</>} // Some validation function for the input field.
		clean={FI => FI.map(circle => { // When going from FI to SI, clear selection data.
			circle = { ...circle }
			delete circle.selected
			return toSO(circle)
		})}
		functionalize={FI => FI.map(circle => toFO({ ...circle, selected: false }))} // When going from SI to FI, make all circles deselected.
		... other parameters ... // Will be given later.
	>
		<Circles /> // Will be given later.
		<ActiveDrag /> // Will be given later.
	</DrawingInput >
}
```

Optionally, other `Input` parameters like `equals = (SI1, SI2) => { ... }` or `errorToMessage = (err) => <>Something failed during interpretation.</>` can also be given.

### Data/Hooks

Everything inside a `DrawingInput` can use the hooks from both the `Drawing` and the `Input` component. Examples include:

```
import { useInputValue } from 'ui/form'
import { useTransformationSettings } from 'ui/figures'

function Circles() {
	const FI = useInputFI()
	const transformationSettings = useTransformationSettings()
	...
}
```

See the respective components for further details. We can use these tools to set up the insides of our `DrawingInput`. This can for instance be done through:

```
function Circles() {
	let FI = useInputFI()
	const { selectionRectangle, mouseData } = useDrawingInputData() // Will be discussed later.

	// If there is a selection rectangle (will be discussed later) then already update the visuals with it.
	if (selectionRectangle)
		FI = applySelectionRectangle(FI, selectionRectangle, mouseData?.keys)

	// Show the circles based on the input value.
	return FI.map((circle, index) => <Circle key={index} center={circle.center} radius={circle.radius} style={{ fill: circle.selected ? 'green' : 'blue' }} />)
}
```

This shows the circles inside our `DrawingInput` component.


## Snapping

Crucial to an intuitive `DrawingInput` is proper snapping functionalities for the mouse.

### Options

There are a few settings for the `DrawingInput` that can/should be used for snapping.

```
	...
	snappers={FI => [[200, 150], ...FI.map(circle => circle.center)]}
	applySnapping={true} // Is already default.
	snappingDistance={20} // Is already default.
	...
```

Note that the `snappers` parameter must give a list of snapping objects: either points/vectors (which are then replaced by a horizontal and vertical line through that point) or lines, from the `geometry` toolbox. Above, we set up one point `[200, 150]` for two snapping lines, and then add snapping lines through the drawn circle centers too.

### Data/Hooks

The `DrawingInput` also has its own context providing data. It is accessed through

```
import { useDrawingInputData } from 'ui/form'

function Circles() {
	const { ... stuff ... } = useDrawingInputData()
	...
}
```

From the snapping part of the `DrawingInput`, we have the following parameters.

- `mouseData`: an object with information about the last known location/status of the mouse. It has the following subparameters.
	- `position`: the last-known location of the mouse, in drawing coordinates.
	- `snappedPosition`: the snapped location of the mouse, in drawing coordinates.
	- `graphicalPosition`: the last-known location of the mouse, in graphical coordinates. (Top-left in the figure is `[0,0]`.)
	- `graphicalSnappedPosition`: the snapped location of the mouse, in graphical coordinates.
	- `mouseInDrawing`: whether the mouse is in the drawing now.
	- `snapLines`: all snapping lines (in drawing coordinates) that pass through the `snappedPosition`.
	- `graphicalSnapLines`: all snapping lines (in graphical coordinates) that pass through the `snappedPosition`.
	- `isSnapped`: whether the mouse has been snapped or not.
	- `isSnappedTwice`: whether the mouse has been snapped to two (or more) lines and hence has a fully fixed/determined position.
	- `keys`: an object of the form `{ shift: true, alt: false, ctrl: false }` indicating which utility keys are currently pressed.
- `lines`: the collection of all snapping lines (in drawing coordinates) determined from the snappers.
- `graphicalLines`: the collection of all snapping lines (in graphical coordinates) determined from the snappers.
- `snapper`: a function that takes a point/Vector in drawing coordinates, and snaps it, giving a `mouseData` object for the given point. (It does not contain the `keys` parameter then, since this cannot be known from just a `point`.)
- `eventSnapper`: a function that takes an `event` like a mouse-move event or so, and returns a `mouseData` object for that event.


## Dragging and selecting

A user interacts with a `DrawingInput` through dragging: the mouse goes down and up. (A click is in theory also a drag, but then with equal down and up location.) It is hence crucial to set this up correctly: what should happen on a drag? Usually, it's either a selection (and a selection rectangle appears) or an actual drag, in which case something should be drawn.

### Options

For dragging/selecting the following functions can be used, as implemented for the circle drawing tool example.

```
import { applySelectinOptions } from 'ui/form'

	...
	startDrag={(FI, mouseDownData) => FI.map(circle => ({ ...circle, selected: false }))} // When starting a drag, deselect all circles.
	endDrag={(FI, mouseDownData, mouseUpData) => [...FI, { ...mouseDataToCircle(mouseDownData, mouseUpData), selected: true }]} // On ending a drag, add a circle to the list. Directly select it.
	snapOnDrag: false, // Should snap markers still be shown while dragging? (Default true.)
	applySelecting={applySelectingOptions.noSnap} // Indicate that a selection rectangle should only be used when there is no snap on the mouse position.
	startSelect={(FI, mouseDownData) => {}}, // On starting a selection rectangle, do nothing specific yet.
	endSelect={(FI, rectangle, keys) => applySelectionRectangle(FI, rectangle, keys)} // On ending a selection rectangle (the mouse goes up) apply the selection. We have a separate function for this, because this function is also used to already show the selection rectangle while displaying the visuals and before the selection rectangle is finalized.
	selectAll={FI => FI.map(circle => ({ ...circle, selected: true }))} // On a ctrl+a press, make all circles selected.
	deselectAll={FI => FI.map(circle => ({ ...circle, selected: false }))} // On a ctrl+d or escape press, make all circles deselected.
	...
	
// Some support functions.
function mouseDataToCircle(mouseDownData, mouseUpData) {
	return {
		center: mouseDownData.snappedPosition,
		radius: mouseUpData.position.subtract(mouseDownData.snappedPosition).magnitude,
	}
}
function applySelectionRectangle(FI, rectangle, keys) {
	return FI.map(circle => ({ ...circle, selected: (keys.shift && circle.selected) || rectangle.touchesCircle(circle.center, circle.radius) }))
}
```

### Data/Hooks

The dragging/selecting part provides the following data to the `DrawingInput` context.

- `mouseDownData`: the `mouseData` for the point where the mouse went down. When the mouse goes up again, this becomes `undefined` again. So you can use the existence of this parameter to check if the mouse is down.
- `canStartSelecting`: given the current mouse position and `applySelecting` settings, if the mouse would go down, would a selection start? (Otherwise a drag would start.)
- `isDragging`: whether or not we are currently dragging. (There is `mouseDownData` and a selection has not started.)
- `isSelecting`: whether or not we are currently selecting. (There is `mouseDownData` and a selection has started.)
- `selectionRectangle`: the selection Rectangle object (from the `geometry` toolbox), but only if we are actually selecting. Otherwise it is `undefined`.
- `cancelDrag`: a function that cancels any drag that is currently active.

Using the above parameters, we can show the circle that is being drawn as it is drawn. That is done through the following component.

```
import { DragMarker } from 'ui/form'

function ActiveDrag() {
	const { isDragging, mouseDownData, mouseData } = useDrawingInputData()
	if (!isDragging)
		return null
	const circle = mouseDataToCircle(mouseDownData, mouseData)
	return <>
		<Circle center={circle.center} radius={circle.radius} style={{ fill: 'red' }} />
		<DragMarker /> // The DragMarker is a small black square that appears on the mouseDownData.snappedPosition point. It shows where the mouse went down.
	</>
}
```


## Deletion

A `DrawingInput` should also facilitate deletion, to get rid of drawn elements.

### Options

There are only two options to set up deletion.

```
	...
	applyDeletion={(FI, keys) => FI => FI.filter(circle => !circle.selected)}, // Remove all selected circles.
	showDeleteButton={FI => FI.some(circle => circle.selected)}, // When any circle is selected, we show the delete button. Otherwise we do not.
	...
```

### Data/Hooks

There isn't really any data that is useful to use here.
