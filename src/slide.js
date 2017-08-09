import React from 'react'
import { string, node } from 'prop-types'

const Slide = ({
  basis = '100%',
  gutter = '1em',
  className = '',
  children,
  ...props
}) => (
  <div
    className={className}
    style={{
      flex: '0 0 auto',
      width: basis,
      marginLeft: gutter
    }}
    {...props}
  >
    {children}
  </div>
)

Slide.propTypes = {
  basis: string,
  gutter: string,
  children: node,
  className: string
}

export default Slide
