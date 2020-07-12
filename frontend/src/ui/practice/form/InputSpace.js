// InputSpace is used to show or hide the input space for problems. A controlling component can either do nothing (and show input space as normal) or wrap a component into a <Status showInputSpace={false}>...</Status> component (to hide input space). Child components can then use <InputSpace>...</InputSpace> to show stuff that's hidden when input spaces are hidden. Alternatively, they can use <AntiInputSpace>...</AntiInputSpace> to show stuff that's only shown when the input space is not hidden.

import { useStatus } from './Status'

export function InputSpace({ children }) {
	const { showInputSpace } = useStatus()
	if (!showInputSpace)
		return null
	return children
}

export function AntiInputSpace({ children }) {
	const { showInputSpace } = useStatus()
	if (showInputSpace)
		return null
	return children
}
