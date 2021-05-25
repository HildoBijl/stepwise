import * as float from './float'
import * as int from './int'
import * as text from './text'
import * as unit from './unit'
import * as unitText from './unitText'

// This is an object containing all keyboards, for easy loading.
const keyboards = {
	float,
	int,
	text,
	unit,
	unitText,
}
export default keyboards

// This is the order in which the tabs appear in the keyboard bar.
export const tabs = [
	'int',
	'float',
	'unit',
	'text',
	'unitText',
]