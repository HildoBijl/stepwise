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

The most important part is the goals of the course. What are the final skills (the very end of the course skill tree) which the student should master? Also important are the prior-knowledge-skills. Which skills do you assume the student has mastered before starting the course? All the skills in-between prior-knowledge-skills and final skills are the skills that the student needs to master for the course. Step-Wise can figure those out by itself.

To structure matters for the students, the course is split up into blocks. (These are often connected to weeks or lectures, but this is no necessity.) Each block has its own intermediate goals. For instance, block 1 has as intermediate goal `intermediateSkill1`. All skills in-between this skill (inclusive) and skills mastered previously (exclusive) are inserted into this block. In this way, the student walks through the course step by step.


## Setting up a course: start at the end

When adding new skills to Step-Wise, it is customary to use a "start at the end" approach. First implement the very last skill that students need to master. Add exercises for that skill. Then, when you notice students struggle with certain steps, add a skill related to that step and specific exercises connected to it. This continues until you reach skills that should already be mastered by the student prior to the course.