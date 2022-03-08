/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

/* constants */
const OPEN_INVITE_MEMBERS_MODAL = 'OPEN_INVITE_MEMBERS_MODAL'
const CLOSE_INVITE_MEMBERS_MODAL = 'CLOSE_INVITE_MEMBERS_MODAL'

/* action creator functions */

function openInviteMembersModal(passphrase) {
  return {
    type: OPEN_INVITE_MEMBERS_MODAL,
    payload: passphrase,
  }
}

function closeInviteMembersModal() {
  return {
    type: CLOSE_INVITE_MEMBERS_MODAL,
  }
}

export {
  OPEN_INVITE_MEMBERS_MODAL,
  CLOSE_INVITE_MEMBERS_MODAL,
  openInviteMembersModal,
  closeInviteMembersModal,
}
