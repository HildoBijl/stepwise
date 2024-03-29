import { getRandomTranslatedFeedback, selectRandomCorrect, selectRandomIncorrect } from 'ui/form'

export { selectRandomCorrect, selectRandomIncorrect }

// selectRandomEmpty gives a random text that a field is empty.
export function selectRandomEmpty() {
	return getRandomTranslatedFeedback([
		'You did not enter anything.',
		'This field is still empty.',
		'You forgot to write something here.',
		'You have to enter something here.',
		'There\'s something missing here.',
	], 'empty')
}

// selectRandomMissingNumber gives a random text that a number is lacking.
export function selectRandomMissingNumber() {
	return getRandomTranslatedFeedback([
		'You didn\'t fill in a number.',
		'There should be a number here.',
		'Don\'t forget to enter a number!',
		'Where is the number?',
		'Oops, there\'s a number missing here.',
	], 'missingNumber')
}

// selectRandomMissingUnit gives a random text that a unit is lacking.
export function selectRandomMissingUnit() {
	return getRandomTranslatedFeedback([
		'You didn\'t fill in a unit.',
		'There should be a unit here.',
		'Don\'t forget to enter a unit.',
		'Where is the unit?',
		'Oops, there\'s a unit missing here.',
	], 'missingUnit')
}

// selectRandomInvalidUnit gives a random text that a unit is faulty.
export function selectRandomInvalidUnit() {
	return getRandomTranslatedFeedback([
		'This is not a valid unit.',
		'Check the unit here.',
		'This unit does not look correct.',
		'There\'s something wrong with your unit.',
		'There are faulty parts in your unit.',
	], 'invalidUnit')
}

// selectRandomIncorrectUnit gives a random text that a unit is incorrect.
export function selectRandomIncorrectUnit() {
	return getRandomTranslatedFeedback([
		'Your unit isn\'t correct. Have a look at that first.',
		'There\'s an error in your unit. Fix that first.',
		'Wrong unit. What unit should the answer have?',
		'It goes awry at the unit. What should it be?',
		'Oops, your unit is off. Check that one out.',
	], 'incorrectUnit')
}

// selectRandomNegative gives a random text that a number is negative.
export function selectRandomNegative() {
	return getRandomTranslatedFeedback([
		'This is a negative number.',
		'This number isn\'t positive.',
		'The minus sign shouldn\'t be there.',
		'This number is supposed to be positive.',
		'What\'s that minus sign doing there?',
	], 'negative')
}

// selectRandomDuplicate gives a random text that an answer has already been provided.
export function selectRandomDuplicate() {
	return getRandomTranslatedFeedback([
		'This value is equal to an earlier solution.',
		'No, you already gave this solution.',
		'You already entered this solution above.',
		'This is not a unique solution.',
		'Oops, you already filled this one in.',
	], 'duplicate')
}

// selectRandomNonNumeric gives a random text that an answer is not numeric.
export function selectRandomNonNumeric() {
	return getRandomTranslatedFeedback([
		'This value is not a number.',
		'There\'s still a variable in there.',
		'You entered something that is not a number.',
		'This isn\'t something that can be turned into a number.',
		'Oops, I can\'t turn this into a number.',
	], 'nonNumeric')
}
