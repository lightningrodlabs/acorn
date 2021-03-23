import React from 'react'

import Icon from '../Icon/Icon'

function iconForHierarchy(hierarchy) {
  let hierarchyIcon = ''
  if (hierarchy == 'Leaf') {
    hierarchyIcon = 'leaf.svg'
  } else if (hierarchy == 'Branch') {
    hierarchyIcon = 'branch.svg'
  } else if (hierarchy == 'Trunk') {
    hierarchyIcon = 'trunk.svg'
  } else if (hierarchy == 'Root') {
    hierarchyIcon = 'root.svg'
  } else if (hierarchy == 'NoHierarchy') {
    hierarchyIcon = 'question-mark.svg'
  }

  return hierarchyIcon
}
export { iconForHierarchy }

function HierarchyIcon({ hierarchy, status, size, onClick }) {
  return (
    <Icon
      name={iconForHierarchy(hierarchy)}
      size={size}
      className={`not-hoverable ${status ? status : 'grey'}`}
      onClick={onClick}
    />
  )
}

export default HierarchyIcon
