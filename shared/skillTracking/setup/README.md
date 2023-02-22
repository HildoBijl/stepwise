# Describing the set-up of skills and exercises

To correctly perform/complete a skill or exercise, various steps are often required. If we know the probability of completion of each step, we can also find the probability of completion of the total skill/exercise. To describe this dependency, we have the set-up.

## Deterministic set-ups

Exercises are always described through a deterministic set-up. There are three operators that are important here.

- **and**: if `setup = and('addition', 'multiplication')` then the exercise requires the user to perform both addition and multiplcation successfully. The `and`-operator is the most common in set-ups.
- **or**: if `setup = or('addition', 'multiplication')` then the exercise requires the user to perform either addition or multiplcation successfully. This is often used when both skills could solve the exercise. You may argue that `setup = max('addition', 'multiplication')` might be more appropriate here. However, the user can also solve the exercise in both ways and compare the results, which argues that the `or` operator is more appropriate for this case.
- **repeat**: if `setup = repeat('addition', 3)` then the exercise requires the user to perform addition three times in a row correctly. This is short for `and('addition', 'addition', 'addition')`.

Using these operators, any desired exercise set-up can be described.

## Stochastic set-ups

Contrary to exercises, skills may also have a stochastic set-up. In this case there are two extra operators: `pick` and `part`.

- **pick**: if `setup = pick(['addition', 'subtraction', 'multiplication'], 2, [1,1,2])` then applying the skill requires the user to correctly perform two out of the three skills (through an `and` between those skills). Which two is random. However, the weights array at the end does indicate that multiplication is more likely to be selected, compared to addition and subtraction.
- **part**: if `setup = and('addition', part('multiplication', 0.6))` then in 60% of the cases the user needs to perform `and('addition', 'multiplication')` and in the remaining 40% of the cases the user needs to perform only `'addition'`. Similarly, if `setup = or('addition', part('multiplication', 0.6))` then in 60% of the cases the user needs to perform `or('addition', 'multiplication')` and in the remaining 40% of the cases the user needs to perform `'addition'`. The `part` operator must always be surrounded by either an `and` or `or` operator, and its functionality depends on the surrounding operator.

Using these extra operators, any desired skill set-up can be described.

## Usage

There are two ways to set up a set-up, albeit for an exercise or skill. The most common way is through functions. You could import `and` and `or` (or any other operator) and subsequently use

```
setup = and('addition', or('multiplication', 'powers'))
```

Another option is to important the class constructors `And` and `Or` (or any other operator) and use

```
setup = new And('addition', new Or('multiplication, 'powers'))
```

Although the first method internally runs the second method, it is used more often because it is shorter.

## Methods

The result of a set-up is always a `SkillCombiner` object, because it combines various skills into a joint skill. This combiner object has various useful methods. The most important ones are the following.

- `getSkillList` returns all the skills used in the combiner, as an array. It may return `['addition', 'subtraction', 'multiplication']`.
- `getSkillSet` is the same as `getSkillList` but then returns a set instead of an array.
- `getPolynomialString` returns the polynomial that could calculate the success rate of the combined skill. For instance, `and('addition', 'multiplication', 'multiplication')` has as polynomial `addition * multiplication^2`.
- `getPolynomialMatrix` returns the polynomial but then in matrix form. The index in the matrix denotes the power and the value is the constant coefficient. For instance, `and('addition', 'multiplication', 'multiplication')` has as polynomial matrix `[[0,0,0],[0,0,1]]`. Note that `matrix[1][2]` corresponds to a power `1` on addition (the first skill from the skill list and hence the first index) and a power `2` on multiplication.

Through these methods, and given data on each respective skill, the success rate for the set-up can be evaluated.
