import React, { forwardRef } from 'react'
import { Button as MuiButton } from '@mui/material'

const Button = forwardRef(({ buttonType: ButtonType = MuiButton, ...props }, ref) => {
  return <ButtonType {...props} ref={ref} />
})
export default Button
