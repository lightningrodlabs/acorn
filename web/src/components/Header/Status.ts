enum Status {
  Online = 'Online',
  Away = 'Away',
  Offline = 'Offline',
}

const StatusCssColorClass = {
  [Status.Online]: 'status-online',
  [Status.Away]: 'status-away',
  [Status.Offline]: 'status-offline',
}

export {
  Status,
  StatusCssColorClass
}