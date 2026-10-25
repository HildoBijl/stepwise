import React from 'react'

import { Translation } from '@step-wise/i18n'

import { Par } from '../text'

export function LoadingNote({ text }) {
	return <Par><Translation folder={[]} catalog="main" group={[]} id="loading">Loading ... {{ text }}</Translation></Par>
}
