// Input object legacy: in the past Booleans were stored as { type: 'Boolean', value: false } but this was overkill. The function below turns these old types into a simple boolean.

module.exports.SOtoFO = SI => SI