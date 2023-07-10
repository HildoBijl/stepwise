import { useState, useEffect, useCallback } from 'react'
import useMediaQuery from '@material-ui/core/useMediaQuery'

// useKeyboardOpening manages the opening and closing of the keyboard. It provides a tuple [open, setOpen] that can be used for this.
export function useKeyboardOpening() {
	// Determine whether the keyboard should initially be open, depending on various factors.
	const storedStatus = (localStorage && localStorage.getItem('keyboardStatus')) || undefined // Check if anything is stored in local storage.
	const defaultOpen = useMediaQuery('(max-width:800px)') // Check the screen size: open by default on smartphones, but not on bigger screens.
	const initiallyOpen = storedStatus ? storedStatus === 'open' : defaultOpen

	// Set up a state to track if the keyboard is open or not.
	const [open, setOpen] = useState(initiallyOpen)

	// Expand the set-function to also store the result in local storage.
	const setAndStoreOpen = useCallback((open) => {
		if (localStorage)
			localStorage.setItem('keyboardStatus', open ? 'open' : 'closed')
		setOpen(open)
	}, [setOpen])

	// When the media query changes (which it can do upon loading) update the keyboardOpen parameter.
	useEffect(() => { setOpen(storedStatus ? storedStatus === 'open' : defaultOpen) }, [storedStatus, defaultOpen])

	// All done. Return the status/setter.
	return [open, setAndStoreOpen]
}
