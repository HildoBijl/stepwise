import { useCallback, useEffect } from 'react'

import { processOptions } from 'step-wise/util'

import { ensureHTMLElement } from 'util'
import { useVisible } from 'ui/components'

import { useFieldControllerContext } from '../provider'

import { useFieldActivation } from './status'

// useFieldRegistration allows any input field to input field to register to the FieldController. Just write `const [active, activate, deactivate] = useFieldRegistration({ id: 'fieldId', element: refUsedForElement, ... (other options) ... })`. There are the following options.
export const defaultFieldRegistrationOptions = {
	id: undefined, // [Mandatory] A unique string related to the field.
	element: undefined, // [Mandatory] The DOM object or a React reference to one representing the field. It's use to determine tabbing order.
	apply: true, // By setting this to false, the field is unregistered. This allows you to unregister fields without needing a conditional hook.
	useTabbing: true, // Should this object be part of the tabbing order?
	manualIndex: 0, // This index is used to sort the elements for the tabbing. On a tie in the manual index the order on the page will be used.
	autofocus: false, // When true, puts the focus on this field when it mounts. Make sure to only apply this for one input field, or the last-rendered-object gets the focus, which is usually quite arbitrary.
	focusOnClick: true, // When true, whenever a click is done on the field, it is activated. Similarly, if a click is made outside of the field when it is not active, it is deactivated.
	focusRefOnActive: false, // When true, the ref DOM object is focused with obj.focus() whenever the field becomes active.
	keyboard: undefined, // A keyboard object describing all the details of what keyboard should be shown when this field is active. It is a basic object of the form { keyFunction: keyInfo => (...change state...), settings: {...} }. When undefined, no keyboard is shown. For details, see the Keyboard component and its handlers.
}
export function useFieldRegistration(options) {
	// Process input.
	const { id, element, apply, useTabbing, manualIndex, autofocus, focusOnClick, focusRefOnActive, keyboard } = processOptions(options, defaultFieldRegistrationOptions)
	if (apply && !element)
		throw new Error(`Field registration error: no ref was given pointing to a DOM object representing the field.`)

	// Get the required handlers.
	const { registerElement, unregisterElement, storeKeyboard } = useFieldControllerContext()

	// Make sure the field is registered for tabbing.
	const visible = useVisible()
	useEffect(() => {
		if (apply && visible) {
			registerElement(id, element, manualIndex, useTabbing, autofocus, focusOnClick)
			return () => unregisterElement(id)
		}
	}, [apply, visible, id, element, manualIndex, useTabbing, autofocus, focusOnClick, registerElement, unregisterElement])

	// Focus the field if requested.
	const [isFieldActive, activateField, deactivateField] = useFieldActivation(id)
	useEffect(() => {
		if (apply && visible && isFieldActive) {
			if (focusRefOnActive) {
				const field = ensureHTMLElement(element)
				setTimeout(() => field.focus()) // Delay the focus to ensure it happens after all blurs.
				return () => field.blur()
			} else {
				// Make sure that no other element is still focused. If a button or so happens to be the active element, then we do not want to accidentally trigger it with an enter-like keypress.
				if (document.activeElement)
					document.activeElement.blur()
			}
		}
	}, [apply, visible, focusRefOnActive, isFieldActive, element])

	// Apply the given keyboard.
	useEffect(() => {
		if (apply && visible)
			storeKeyboard(id, keyboard)
	}, [apply, visible, id, keyboard, storeKeyboard])

	// On a non-applied input field (like a read-only input field) do not allow activation. Throw an error when an attempt is made.
	const throwFunction = useCallback(() => { throw new Error(`Invalid field (de)activation: cannot (de)activate an inactive field "${id}".`) }, [id])
	if (apply && visible)
		return [isFieldActive, activateField, deactivateField]
	return [false, throwFunction, throwFunction]
}
