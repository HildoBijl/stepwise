import React, { forwardRef } from 'react'

import RollerSupport from './RollerSupport'

export const AdjacentRollerSupport = forwardRef((props, ref) => {
	return <RollerSupport ref={ref} positionFactor={1} {...props} />
})
AdjacentRollerSupport.defaultProps = RollerSupport.defaultProps
export default AdjacentRollerSupport
