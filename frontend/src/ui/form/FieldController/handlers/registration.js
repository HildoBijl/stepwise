import { useStableCallback, getHTMLElement } from 'util/react' // Keep exports separate and specific due to faulty unit test package caching.

// The registration handlers arrange the registration and deregistration of fields to the FieldController.
export function useRegistrationHandlers(controllerRef, fieldTrackerRef, tabOrderRef, setTabIndex, { activate }) {
	// updateTabOrder refreshes the tab order, for instance when a new field is added. It adjusts the tab index to keep the same field active when possible.
	const updateTabOrder = useStableCallback(() => {
		const newTabOrder = getTabOrder(controllerRef.current, fieldTrackerRef.current)
		const oldTabOrder = tabOrderRef.current // This will change before the state change is finished.
		setTabIndex(tabIndex => (oldTabOrder && oldTabOrder[tabIndex] ? newTabOrder.indexOf(oldTabOrder[tabIndex]) : -1))
		tabOrderRef.current = newTabOrder
	})

	// registerElement adds an input field to the tab order.
	const registerElement = useStableCallback((id, element, manualIndex, useTabbing, autofocus, focusOnClick) => {
		if (fieldTrackerRef.current[id])
			throw new Error(`Field registration error: an input field with ID "${id}" is already registered.`)
		fieldTrackerRef.current[id] = { id, element, manualIndex, useTabbing, focusOnClick }
		updateTabOrder()
		if (autofocus)
			activate(id)
	})

	// registerElement removes an input field from the tab order.
	const unregisterElement = useStableCallback((id) => {
		delete fieldTrackerRef.current[id]
		updateTabOrder()
	})

	// All the handlers are set up. Return them!
	return { updateTabOrder, registerElement, unregisterElement }
}

// getTabOrder takes a controller DOM object and a fields object (with all fields inside this DOM object) and returns the required tabbing order, as an array of field IDs.
function getTabOrder(controller, fields) {
	// If there is no controller initialized, we cannot do anything.
	if (!controller)
		return

	// Find the element number: the number in which each registered element appears within the tab controller.
	const tags = [...controller.querySelectorAll('*')]
	const elementNumbers = []
	Object.keys(fields).forEach(id => {
		const field = fields[id]
		if (!field.useTabbing)
			return
		const number = tags.indexOf(getHTMLElement(field.element))
		if (number !== -1)
			elementNumbers.push({ id, number, manualIndex: field.manualIndex })
	})

	// From the result determine the new tab order. Give precedence to any manualIndex that has been provided, and use the number when this is inconclusive.
	elementNumbers.sort((a, b) => (a.manualIndex - b.manualIndex || a.number - b.number))
	return elementNumbers.map(data => data.id)
}
