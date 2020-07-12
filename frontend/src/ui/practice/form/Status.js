/* Status is a wrapper used to tell input fields inside of it what the status of the problem is. It has a few parameters.
 * - done: set to true when a problem (part) is finished. It will make input fields uneditable and stop verifying.
 * - solved: set to true when a problem (part) has been solved. 
 * - showInputSpace: set to true when there's something in the input space to show. So that's when the problem is still active, or when a previous submission has been made.
 * In a containing component, use `const { done, solved, showInputSpace } = useStatus()` to check if it's done.
 */

import React, { createContext, useContext } from 'react'

const defaults = {
	done: false,
	solved: false,
	showInputSpace: true,
}

const StatusContext = createContext(defaults)

export default function Status(props) {
	const status = {}
	Object.keys(defaults).forEach(key => {
		status[key] = (props[key] !== undefined ? props[key] : defaults[key])
	})
	return <StatusContext.Provider value={status}>{props.children}</StatusContext.Provider>
}

export function useStatus() {
	return useContext(StatusContext)
}