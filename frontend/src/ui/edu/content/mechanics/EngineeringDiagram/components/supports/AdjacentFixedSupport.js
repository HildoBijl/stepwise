import React, { forwardRef } from 'react'

import FixedSupport from './FixedSupport'

export const AdjacentFixedSupport = forwardRef((props, ref) => {
	return <FixedSupport ref={ref} positionFactor={1} {...props} />
})
AdjacentFixedSupport.defaultProps = FixedSupport.defaultProps
export default AdjacentFixedSupport
