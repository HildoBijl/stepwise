import { mod } from 'step-wise/util'

import { useStableCallback } from 'util'

// The control handlers allow the controlling/setting of which field is active.
export function useControlHandlers(tabOrderRef, tabIndexRef, setTabIndex) {
	// activate will activate the field with the given ID.
	const activate = useStableCallback((id) => {
		const index = tabOrderRef.current.indexOf(id)
		if (index === -1)
			return // Field isn't registered.
		if (index === tabIndexRef.current)
			return // Field is already active.
		setTabIndex(index)
	}, [tabOrderRef, tabIndexRef, setTabIndex])

	// deactivate will deactivate the field with the given ID, but only when it's active, and otherwise do nothing.
	const deactivate = useStableCallback((id) => {
		const index = tabOrderRef.current.indexOf(id)
		if (index === -1)
			return // Field isn't registered.
		if (index !== tabIndexRef.current)
			return // Field isn't active.
		setTabIndex(-1)
	})

	// blur will deactivate any currently active field.
	const blur = useStableCallback(() => setTabIndex(-1), [setTabIndex])
	
	// activateFirst focuses on the first field in the form. Optionally a set of IDs can be passed. When this is done, the focus is put on the first field among the given list. (This is for instance used when a form has various faulty fields and wants to activate the first of these.)
	const activateFirst = useStableCallback((ids) => {
		if (!ids)
			return setTabIndex(0)
		const id = tabOrderRef.current.find(id => ids.includes(id))
		if (id)
			activate(id)
	})

	// incrementTabIndex shifts the tab index one up, cycling at the end.
	const incrementTabIndex = useStableCallback(() => {
		if (tabOrderRef.current.length === 0)
			return setTabIndex(-1) // On no fields, do not activate a field.
		if (tabOrderRef.current.length === 1)
			return setTabIndex(tabIndex => (tabIndex === 0 ? -1 : 0)) // On a single field, switch between this field active or deactive.
		setTabIndex(mod(tabIndexRef.current + 1, tabOrderRef.current.length)) // Shift the index one up, or go to the first element on no selection present.
	})

	// decrementTabIndex shifts the tab index one down, cycling at the start.
	const decrementTabIndex = useStableCallback(() => {
		if (tabOrderRef.current.length === 0)
			return setTabIndex(-1) // On no fields, do not activate a field.
		if (tabOrderRef.current.length === 1)
			return setTabIndex(tabIndex => (tabIndex === 0 ? -1 : 0)) // On a single field, switch between this field active or deactive.
		setTabIndex(mod(tabIndexRef.current === -1 ? -1 : tabIndexRef.current - 1, tabOrderRef.current.length)) // Shift the index one down, or go to the last element on no selection present.
	})

	// getActiveFieldId returns the ID of the currently active field, or undefined on no active field.
	const getActiveFieldId = useStableCallback(() => tabOrderRef.current[tabIndexRef.current])

	// isActive takes a field ID and returns whether this field is currently active.
	const isActive = useStableCallback((id) => getActiveFieldId() === id)

	// All the handlers are set up. Return them!
	return { activate, deactivate, blur, activateFirst, incrementTabIndex, decrementTabIndex, getActiveFieldId, isActive }
}
