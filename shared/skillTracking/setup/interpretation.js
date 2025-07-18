const { SkillSetup, Skill } = require('./fundamentals')
const setupTypes = require('./implementation')

// objToSetup turns a storage object into a functional set-up object.
function objToSetup(SO) {
	// On a set-up, just return it.
	if (SO instanceof SkillSetup)
		return SO

	// On a String, create a regular Skill.
	if (typeof SO === 'string')
		return new Skill(SO)

	// On an object, make it functional based on the type.
	const Type = setupTypes[SO.type]
	if (!Type)
		throw new Error(`Invalid set-up type: received a set-up object "${JSON.stringify(SO)}" but the type of this object was not known.`)
	return Type.fromSO(SO, objToSetup)
}
module.exports.objToSetup = objToSetup
