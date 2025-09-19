import React, { createContext, useContext, useState, useRef } from 'react'
import { Modal, Box, useTheme } from '@mui/material'

import { usePrevious } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests.
import { centered } from 'ui/theme'

const ModalContext = createContext(null)
export default function ModalManager({ children }) {
	const [showModal, setShowModal] = useState(false)
	const contentsRef = useRef(null)
	const theme = useTheme()

	// useModal can be called by consuming components to set up a Modal. Use [open, setOpen] = useModal(<Component />) where component is what needs to be shown in the modal.
	const useModal = (component) => {
		// Is this current modal open? For this, also check the previous component, since the component might be a new reference on every call.
		const previousComponent = usePrevious(component)
		const open = showModal && (contentsRef.current === component || contentsRef.current === previousComponent)

		// Apply the most recent component when it's open.
		if (open)
			contentsRef.current = component

		// Also apply the component on an open call.
		const setOpen = (open) => {
			contentsRef.current = component
			setShowModal(!!open)
		}
		return [open, setOpen]
	}

	const context = {
		useModal,
		closeModal: () => setShowModal(false),
	}

	return <ModalContext.Provider value={context}>
		{children}
		<Modal open={showModal} onClose={() => setShowModal(false)}>
			<Box className="modal" sx={{
				alignItems: 'stretch',
				backgroundColor: theme.palette.background.main,
				borderRadius: '1rem',
				display: 'flex',
				flexFlow: 'column nowrap',
				outline: 0,
				padding: '1.5rem',
				width: 'min(80vw, 40rem)',
				...centered,
			}}>
				{showModal ? contentsRef.current : null}
			</Box>
		</Modal>
	</ModalContext.Provider>
}

// Get the data out of the context.
export function useModalContext() {
	return useContext(ModalContext)
}

// Only get the useModal function.
export function useModal(...args) {
	const context = useModalContext()
	return context.useModal(...args)
}
