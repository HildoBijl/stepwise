import React, { forwardRef } from 'react'

import Line from './Line'

// Polygon draws a polygon. It is effectively a closed Line.
export const Polygon = forwardRef((props, ref) => {
	return <Line ref={ref} {...props} close={true} />
})
Polygon.defaultProps = Line.defaultProps
export default Polygon
