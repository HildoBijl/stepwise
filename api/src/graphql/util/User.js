// ensureUser makes sure that the given getUser function actually gives a user.
async function ensureUser(getUser) {
	const user = await getUser()
	if (!user)
		throw new Error(`No user is logged in.`)
	return user
}

module.exports = {
	ensureUser,
}
