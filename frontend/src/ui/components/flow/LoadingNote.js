import React from 'react'

import { Translation } from 'i18n'

import { Par } from '../text'

export function LoadingNote({ text }) {
	return <Par><Translation entry="loading" path="main">Loading ... {{ text }}</Translation></Par>
}
// ToDo later: get a fancy loading indicator.
