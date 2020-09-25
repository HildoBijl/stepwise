/* Status is a wrapper used to tell input fields inside of it what the status of the problem is. It has a few parameters.
 * - done: set to true when a problem (part) is finished. It will make input fields uneditable and stop verifying.
 * - solved: set to true when a problem (part) has been solved. 
 * - showInputSpace: set to true when there's something in the input space to show. So that's when the problem is still active, or when a previous submission has been made.
 * In a containing component, use `const { done, solved, showInputSpace } = useStatus()` to check if it's done.
 */

import React, { createContext, useContext } from 'react'

import { processOptions } from 'step-wise/util/objects'

const defaults = {
	children: null,
	done: false,
	showInputSpace: true,
}

const StatusContext = createContext(defaults)

export default function Status(props) {
	const status = processOptions(props, defaults)
	return <StatusContext.Provider value={{ ...status, children: undefined }}>{props.children}</StatusContext.Provider>
}

export function useStatus() {
	return useContext(StatusContext)
}

// InputSpace is used to show or hide the input space for problems. A controlling component can either do nothing (and show input space as normal) or wrap a component into a <Status showInputSpace={false}>...</Status> component (to hide input space). Child components can then use <InputSpace>...</InputSpace> to show stuff that's hidden when input spaces are hidden. Alternatively, they can use <AntiInputSpace>...</AntiInputSpace> to show stuff that's only shown when the input space is not hidden.
export function InputSpace({ children }) {
	const { showInputSpace } = useStatus()
	return showInputSpace ? children : null
}

export function AntiInputSpace({ children }) {
	const { showInputSpace } = useStatus()
	return showInputSpace ? null : children
}

// WhenDone and WhenNotDone work similarly as InputSpace and AntiInputSpace, but then for when the problem is done. This can be useful in the case of hints.
export function WhenDone({ children }) {
	const { done } = useStatus()
	return done ? children : null
}

export function WhenNotDone({ children }) {
	const { done } = useStatus()
	return done ? null : children
}
