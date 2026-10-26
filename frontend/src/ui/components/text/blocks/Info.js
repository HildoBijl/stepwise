import React from 'react'

import { withTranslation } from '@step-wise/i18n'

import Block from './Block'

function InfoBase(props) {
	return <Block type="info" {...props}></Block>
}
export default withTranslation(InfoBase, { tag: 'info' })
