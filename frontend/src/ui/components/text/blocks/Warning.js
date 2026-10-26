import React from 'react'

import { withTranslation } from '@step-wise/i18n'

import Block from './Block'

function WarningBase(props) {
	return <Block type="warning" {...props}></Block>
}
export default withTranslation(WarningBase, { tag: 'warning' })
