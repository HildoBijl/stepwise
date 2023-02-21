module.exports = {
	...require('./fundamentals/SkillCombiner'),
	...require('./fundamentals/Skill'),
	...require('./fundamentals/ensureCombiner'),
	...require('./fundamentals/SkillListCombiner'),
	...require('./implementation/And'),
	...require('./implementation/Or'),
	...require('./implementation/Repeat'),
	...require('./implementation/Pick'),
	...require('./implementation/Part'),
}
