import * as float from './float'
import * as int from './int'
import * as text from './text'
import * as unit from './unit'
import * as unitText from './unitText'
import * as basicMath from './basicMath'

// This is an object containing all keyboards, for easy loading.
const keyboards = {
	float,
	int,
	text,
	unit,
	unitText,
	basicMath,
}
export default keyboards

// This is the order in which the tabs appear in the keyboard bar.
export const tabs = [
	'basicMath',
	'int',
	'float',
	'unit',
	'text',
	'unitText',
]