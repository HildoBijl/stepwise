export function skillRecordToSkill({ exerciseData, ...skill }) {
	return exerciseData ? { ...skill, ...exerciseData } : skill
}

export function userWithSkillsRecordToUser({ sharedData, accountData, ...user }) {
	return {
		...user,
		...(sharedData ?? {}),
		...(accountData ?? {}),
		skills: sharedData?.skills.map(skillRecordToSkill) ?? [],
	}
}
