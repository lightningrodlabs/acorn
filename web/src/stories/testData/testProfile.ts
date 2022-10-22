import { Profile } from '../../types'

const testProfile: Profile = {
  firstName: 'Kate',
  lastName: 'Johnson',
  handle: 'kate',
  status: 'Online',
  avatarUrl:
    'https://i.pinimg.com/550x/c0/3d/3f/c03d3f965a8091206f4a0e742bb97c9f.jpg',
  agentPubKey: '389457985y498592847',
  isImported: false,
}

const testProfileIsImported: Profile = {
  firstName: 'Robert',
  lastName: 'Smith',
  handle: 'robertsmith',
  status: 'Online',
  avatarUrl:
    'https://i.pinimg.com/550x/c0/3d/3f/c03d3f965a8091206f4a0e742bb97c9f.jpg',
  agentPubKey: '389457985y498592847',
  isImported: true,
}

const testProfileIsOffline: Profile = {
  firstName: 'Hope',
  lastName: 'Velasquez',
  handle: 'hopevel',
  status: 'Offline',
  avatarUrl:
    'https://i.pinimg.com/550x/c0/3d/3f/c03d3f965a8091206f4a0e742bb97c9f.jpg',
  agentPubKey: '389457985y498592847',
  isImported: false,
}

export {
  testProfileIsImported,
  testProfileIsOffline
}

export default testProfile
