const { UserInputError } = require('apollo-server-express')
const { randomInt } = require('crypto')

// findGroupByCode tries to find a group with that code in the database and returns it. If the group doesn’t exist, it throws an error. The code parameter is case-insensitive.
async function findGroupByCode(db, code) {
	const normalizedCode = code.toUpperCase()
	const group = await db.Group.findOne({
		where: { code: normalizedCode },
		include: {
			association: 'members',
		},
	})
	if (!group)
		throw new UserInputError('No such group.')
	return group
}
module.exports.findGroupByCode = findGroupByCode

// createRandomCode generates a random group code. The code consists of uppercase letters and digits. It doesn’t contain homoglyphs, i.e. characters that look similar and can thus be easily confused. E.g.: O <> 0, I <> 1 or 5 <> S.
function createRandomCode() {
	const ALPHABET = 'ABCDEFGHJKLMNPQRTUVWXYZ2346789'
	const LENGTH = 4
	let result = ''
	for (let i = LENGTH; i > 0; --i) {
		result += ALPHABET[randomInt(0, ALPHABET.length)]
	}
	return result
}
module.exports.createRandomCode = createRandomCode
