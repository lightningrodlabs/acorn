enum Status {
  Online = 'Online',
  Away = 'Away',
  Offline = 'Offline',
}

// const StatusIcons = {
//   [Status.Online]: 'checkmark-circle.svg',
//   [Status.Away]: 'user-status-away.svg',
//   [Status.Offline]: 'user-status-offline.svg',
// }

const StatusCssColorClass = {
  [Status.Online]: 'status-online',
  [Status.Away]: 'status-away',
  [Status.Offline]: 'status-offline',
}

export {
  Status,
  StatusCssColorClass
}