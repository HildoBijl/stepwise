import { withTranslation } from '@step-wise/i18n'

import { useFormPartSettings } from './FormPart'

// InputSpace is used to show or hide the input space for forms. It checks if the input space should be shown and then either shows or hides itself.
function InputSpaceBase({ children }) {
	const { showInputSpace } = useFormPartSettings()
	return showInputSpace ? children : null
}
export const InputSpace = withTranslation(InputSpaceBase, { tag: 'input-space' })

// AntiInputSpace is the opposite of InputSpace: it shows itself when the input space is NOT visible. Perhaps the text is slightly different in this case, and this component comes in helpful.
function AntiInputSpaceBase({ children }) {
	const { showInputSpace } = useFormPartSettings()
	return showInputSpace ? null : children
}
export const AntiInputSpace = withTranslation(AntiInputSpaceBase, { tag: 'anti-input-space' })
