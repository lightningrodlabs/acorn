import React, { useRef } from 'react'
import useOnClickOutside from 'react-onclickoutside'
import './OnClickOutside.scss'

/*
  A higher order component to make it easier
  to implement a basic onClickOutside
  callback for the inner contents
*/

export type OnClickOutsideProps = {
  onClickOutside: () => void
}
const OnClickOutside: React.FC<OnClickOutsideProps> = ({
  children, onClickOutside
}) => {
  const ref = useRef()
  //@ts-ignore
  useOnClickOutside(ref, onClickOutside)
  return <div ref={ref}>{children}</div>
}

export default OnClickOutside
