import * as float from './float'
import * as greek from './greek'
import * as int from './int'
import * as text from './text'
import * as unit from './unit'

// This is an object containing all keyboards, for easy loading.
const keyboards = {
	float,
	greek,
	int,
	text,
	unit,
}
export default keyboards

// This is the order in which the tabs appear in the keyboard bar.
export const tabs = [
	'int',
	'float',
	'unit',
	'text',
	'greek',
]