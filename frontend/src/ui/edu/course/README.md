# Step-Wise courses

The Step-Wise courses are currently all hard-coded. They are defined in the file `frontend/src/ui/edu/courses.js`. This file exports a large `courses` object of the form `{ course1: { ... }, course2: { ... }, ... }`. Let's take a look at how each of these courses is set up.


## Defining a Step-Wise course

To define a course, you set up an object with the following format.

```javascript
courses = {
	courseId: {
		name: 'The course title',
		goals: ['finalSkill1'],
		priorKnowledge: ['priorKnowledgeSkill1', 'priorKnowledgeSkill2', 'priorKnowledgeSkill3', 'priorKnowledgeSkill4'],
		startingPoints: ['someBasicSkill1', 'someBasicSkill2'],
		blocks: [
			{
				name: 'Learning intermediate skill 1',
				goals: ['intermediateSkill1'],
			},
			{
				name: 'Learning intermediate skill 2',
				goals: ['intermediateSkill2'],
			},
			{
				name: 'Putting it all together',
				goals: ['finalSkill1'],
			},
		]
	}, ...
}
```

The most important part is the goals of the course. What are the final skills (the very end of the course skill tree) that the student should master? Also important are the prior-knowledge-skills. Which skills do you assume the student has mastered before starting the course? In addition, there are the starting-point-skills: which basic skills (so skills without prior knowledge) also consist of the course? All the skills in-between prior-knowledge-skills (exclusive)/starting-point-skills (inclusive) and final skills are skills that the student needs to master for the course. Step-Wise can figure those out by itself.

To structure matters for the students, the course is split up into blocks. (These are often connected to weeks or lectures, but this is no necessity.) Each block has its own intermediate goals. For instance, block 1 has as intermediate goal `intermediateSkill1`. All skills in-between this skill (inclusive) and skills mastered previously (exclusive) are inserted into this block. In this way, the student walks through the course step by step.


## Setting up a course: start at the end

When adding new skills to Step-Wise, it is customary to use a "start at the end" approach. First implement the very last skill that students need to master. Add exercises for that skill. Then, when you notice students struggle with certain steps, add a skill related to that step and specific exercises connected to it. This continues until you reach skills that should already be mastered by the student prior to the course.


## Skill recommendations in a course

At each course, Step-Wise gives students a skill recommendation: which skill is best to practice now? To determine this recommendation, the app first takes the learning tree related to the course, from the goals up to the prior knowledge (inclusive). Then it determines for each skill whether practice is needed for that skill.

To establish whether practice is needed, we establish an upper bound and a lower bound. These bounds are constant across the site and defined as follows. (Minor changes may occur as the website is further fine-tuned.)

- For regular course skills the upper bound (mastery) is `66%`. The lower bound is `56%`. When calculating the skill level of a regular skill `X` we *do* take into account the level the student has at potential subskills `A`, `B`, `C`.
- For prior knowledge skills the upper bound is `66%`. The lower bound is `46%`. Furthermore, when calculating the skill level of a prior knowledge skill `X` we *do not* take into account the level of its subskills.

Given these bounds, we determine whether a student needs to practice each skill.

- If the skill level of the student (the probability of success) is above the upper bound, then there is mastery. Practice is *not needed*. (Practice recommendation level 0)
- If the student has in the past obtained mastery (his highest skill level so far is above the bound) but now has a skill level in-between the bounds, then practice is *recommended* but not obligatory. (Practice recommendation level 1)
- In any other case the student does *not* have sufficient mastery of this skill. Practice is *definitely needed*. (Practice recommendation level 2)
- **Added rule:** if a skill has a certain practice recommendation level, then *all* skills above this skill (its prerequisites and their prerequisites) have *at most* this practice recommendation level, irrespective of their own scores. This ensures that, if a student manages to show mastery in a very difficult late-stage skill, all the prerequisites for this skill are automatically ticked off.

To find a skill to recommend, the Step-Wise app takes the following steps.

- Walk through the tree in the order in which skills are taught. Find the first with practice recommendation level 2. Recommend this skill.
- If there are no skills with practice recommendation level 2, do the same for practice recommendation level 1.
- All skills are mastered! (They all have practice recommendation level 0.) Recommend the *free practice mode*.

The free practice mode is a mode in which students are randomly given exercises taken from all course final goals, with higher probabilities for exercises related to skills with a lower mastery level. It is ideal for practice when the student is close to an exam or just needs to recap skills from an earlier course.

You may wonder why the percentages are chosen the way they are. Specifically, why the `46%` lower bound for prior knowledge skills? The reason is that, when a student starts a course, he does not want to be recommended prior knowledge skills right away. (Unless he has previously failed them, of course.) By setting the lower bound at `46%`, and by only taking into account experience directly related to said prior knowledge, all prior knowledge skills start at `50%` skill level. Hence students are initially not recommended to practice prior knowledge skills, and they start with the actual course material. If they subsequently fail at this, then they do potentially get a recommendation to practice prior knowledge skills.