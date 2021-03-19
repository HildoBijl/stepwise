// getAllUsers returns all users. It does not check whether the current user has rights for it. Optionally, skillIds can be given to load along with it.
async function getAllUsers(db, skillIds = []) {
	return await db.User.findAll({
		include: {
			association: 'skills',
			where: { skillId: skillIds },
			required: false,
		},
	})
}
module.exports.getAllUsers = getAllUsers