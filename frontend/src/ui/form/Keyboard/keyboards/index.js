import * as float from './float'
import * as int from './int'
import * as unit from './unit'
import * as textUnit from './textUnit'
import * as textMath from './textMath'
import * as basicMath from './basicMath'

// This is an object containing all keyboards, for easy loading.
const keyboards = {
	float,
	int,
	unit,
	textUnit,
	textMath,
	basicMath,
}
export default keyboards

// This is the order in which the tabs appear in the keyboard bar.
export const tabs = [
	'basicMath',
	'int',
	'float',
	'unit',
	'textMath',
	'textUnit',
]