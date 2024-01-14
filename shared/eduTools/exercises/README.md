# Step-Wise exercise tools

All shared tools related to exercises are here. 

- [selection](./selection/) has all functions related to selecting the right exercise for a student. Which exercises are there? How difficult are they? What can the student do? And based on that the right exercise is chosen.
- [creation](./creation/) is about generating a state for the exercise. This folder contains supporting functions.
- [checking](./checking/) concerns the grading of solutions given by users. Is a provided number or response correct or not?
- [types](./types/) has processors for the various exercise types (simpleExercise, stepExercise). These processors are used to update the exercise `progress` parameter.

As always with exercises, there are two files:

- The file in the `shared` folder, which contains the exercise logic. That is explained here.
- The file in the `frontend` folder, which renders the exercise and is about contents/visuals. More about that in the [frontend eduTools exercises](../../../frontend/src/ui/eduTools/exercises/) folder.

If you want to know how to set up the `shared` part, then read on.

## Contents of the `shared` exercise file

The shared exercise file contains an object as export. For every type of exercise, this object should at least have the following properties.

- A `metaData` object. This object can have various properties (you can plug in whatever you like) but it should at least have one of the following two properties.
	- A `skill` parameter (string) which contains a `skillId`. The exercise is then directly coupled with that skill: the difficulty of the exercise equals the difficulty of the given skill.
	- A `setup` parameter (setup object) which contains the steps needed to solve the exercise. The difficulty of the exercise is then determined based on the difficulty of the given skills. (Note that, for exercises, only the `and`, `or` and `repeat` setup functions are allowed.) See the [Skill Tracking](../../skillTracking/) folder for more info on exercise setups.

	The above information is then used to guage the difficulty of the given exercise for a student. It is possible (and quite common) to define both of the above parameters. For example, an exercise for a follow-up skill `X` could have a setup `and(A, B, C)`. If both are given, all data is combined to make a better estimate of the exercise difficulty.
- A `generateState` function. This function gets no input, and should return a randomly generated state for the exercise. For example, for the exercise "Calculate `a + b`" the generated state could look like `{ a: 23, b: 82 }`.
Note: the `generateState` function may return certain complex objects like a `FloatUnit` object. This is processed accordingly behind the scenes.
- A `processAction` function. How this is set up depends on the type of exercise. More about this can be found in the [exercise types](./types/) folder.

If these things are defined, then the `shared` part of your exercise is done!
