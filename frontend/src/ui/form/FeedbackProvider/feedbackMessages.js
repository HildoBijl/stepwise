import { getRandomInteger } from 'step-wise/util'

import { Translation } from 'i18n'

// getRandomTranslatedFeedback is a support wrapper function that wraps a feedback string in a Translation component so it can be translated.
export function getRandomTranslatedFeedback(feedbackList, entryType) {
	const index = getRandomInteger(0, feedbackList.length - 1)
	return <Translation path="eduTools/feedback" entry={`${entryType}.${index}`}>{feedbackList[index]}</Translation>
}

// selectRandomCorrect gives a random correct text.
export function selectRandomCorrect(withWrapper = false) {
	if (withWrapper)
		return { correct: true, text: selectRandomCorrect() }
	return getRandomTranslatedFeedback([
		'That is correct!',
		'Nicely done.',
		'Amazing, you did it!',
		'That is the correct solution.',
		'All in order.',
		'Wonderful! Keep it up.',
		'Well on your way.',
		'Correct! Very well done.',
		'You solved it!',
		'Splendid!',
		'All perfect.',
		'Looking good.',
		'Awesome! All correct.',
		'Yes, that\'s it.',
		'That is the right answer.',
		'That is completely correct.',
	], 'correct')
}

// selectRandomIncorrect gives a random incorrect text.
export function selectRandomIncorrect(withWrapper = false) {
	if (withWrapper)
		return { correct: false, text: selectRandomIncorrect() }
	return getRandomTranslatedFeedback([
		'That is not the right solution.',
		'Sadly, that doesn\'t add up.',
		'That is not correct.',
		'Try again?',
		'This one\'s off.',
		'Unfortunately it\'s wrong.',
		'No, not the right solution.',
		'Well ... not exactly.',
		'Sorry, that\'s wrong.',
		'No, that\'s not it.',
		'Oops, that\'s a wrong answer.',
	], 'incorrect')
}
