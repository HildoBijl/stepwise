import { isEmpty } from './support'

export function any() { }
export function nonEmpty(input) {
	if (isEmpty(input))
		return 'Je hebt nog niets geselecteerd.'
}
