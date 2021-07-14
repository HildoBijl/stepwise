import * as float from './float'
import * as int from './int'
import * as unit from './unit'
import * as textUnit from './textUnit'
import * as textMath from './textMath'
import * as basicMath from './basicMath'
import * as greek from './greek'

// This is an object containing all keyboards, for easy loading.
const keyboards = {
	float,
	int,
	unit,
	textUnit,
	textMath,
	basicMath,
	greek,
}
export default keyboards

// This is the order in which the tabs appear in the keyboard bar.
export const tabs = [
	'int',
	'float',
	'unit',
	'textMath',
	'basicMath',
	'textUnit',
	'greek',
]