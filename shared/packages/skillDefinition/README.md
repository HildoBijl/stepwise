# Skill definitions

This package contains tools to define and handle a skill tree. It does not contain any skill trees itself.


## Creation tools

### Step 1: defining the Skill Tree

To set up a skill tree, first define the raw skill tree. This is a nested object of the form:

```
const rawSkillTree = {
	subject1: {
		category1: {
			skillId1: { ... raw skill definition ... },
			skillId2: { ... raw skill definition ... },
		},
		skillId3: { ... raw skill definition ... }, 
	},
	subject2: { ... },
}
```

Note that every object can either be another group, or a raw skill definition. It can be nested as deeply as desired.

A raw skill definition is an object that defines the skill without necessarily having all parameters. By processing it later on, default values are filled in. So an example skill might be:

```
skillId3: {
	name: "Some example skill", // Obligatory
	setup: and('skill1', 'skill2'), // Optional: setups imported from the skill-setup package.
	prerequisites: ['skill1', 'skill2'], // Optional: default [], and any skills from the set-up will always be added to the prerequisites as well.
	links: ['skill5'], // Optional
},
```

This provides sufficient information to the processing functions to set up the skill tree.

### Step 2: processing the Skill Tree

To process the Skill Tree, pass the raw skill tree to the `processSkillTree` function.

```
const skillTree = processSkillTree(rawSkillTree)
```

The result will be a flat object of the form

```
{
	skill1: { ... processed skill definition ... },
	skill2: { ... processed skill definition ... },
	skill3: { ... processed skill definition ... },
}
```

Each skill now has a variety of additional attributes. We may for instance have:

```
skillTree.skill1 => {
	skillId: 'skill1', // The key used within the raw tree.
	name: 'Some example skill',
	path: ['subject1', 'category1'], // The path within the raw tree.
	skillsInGroup: ['skill1', 'skill2'], // Skills from the same group in the raw tree.
	prerequisites: [], // Now with the skills from the set-up added to it.
	continuations: ['skill3'], // The skills that have this skill as prerequisite.
	links: [], // Links in a processed form.
	linkedSkills: [], // All skills that are present in at least one link.
}
```

This allows for easy access of all skill data.


## Searching the skill tree

To walk through the Skill Tree, there are a variety of functions. All functions expect an actual (processed) Skill Tree as first argument.

- `ensureSkillId(skillTree, skillId)` takes a `skillId` and in a case-insensitive way tries to find the matching skillId. So `ensureSkillId(skillTree, 'sKIlL1')` will return 'skill1' while a non-existing skill will throw.
- `ensureSkillIds(skillTree, skillIds)` does the same, but for a list of skillIds.
- `isSkillRequiredFor(skillTree, childId, parentId)` checks if the given child skill is a prerequisite (directly or indirectly) for the parent skill.
- `includeDirectPrerequisites(skillTree, skillIds)` takes a list of skillIds and expands it to include all direct prerequisites. No recursion is done.
- `includeDirectPrerequisitesAndLinks(skillTree, skillIds)` takes a list of skillIds and expands it to include all direct prerequisites and direct links of the given skills. No recursion is done.
