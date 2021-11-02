const mainCAS = require('./Expression')
const functions = require('./functions')

// On top of exporting all Variables (as well as functions and other properties) in the export, also include an "expressionTypes" parameter containing only endpoints of the Expression tree. So no abstract classes, but only things that actually occur like Integer, Product, Power, Sin, etcetera.
const expressionTypes = {
	...mainCAS.expressionTypes,
	...functions,
}

module.exports = {
	...mainCAS, // Export all exports from the Expression file. This is the basic CAS functionality.
	...functions, // Export all functions too. These are add-on functionalities.
	expressionTypes,
}