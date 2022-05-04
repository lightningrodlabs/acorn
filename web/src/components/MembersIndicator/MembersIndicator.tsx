import React from 'react'
import Avatar from '../Avatar/Avatar'
import AvatarsList from '../AvatarsList/AvatarsList'
import Icon from '../Icon/Icon'

import './MembersIndicator.scss'

export type MembersIndicatorProps = {
  // any here is a "Profile"
  // TODO: update it when have added a Profile
  // type definition
  members: Array<any>
  presentMembers: Array<any>
  onClickInviteMember: () => void
}

const MembersIndicator: React.FC<MembersIndicatorProps> = ({
  members,
  presentMembers,
  onClickInviteMember,
}) => {
  //   Don't show an avatar if it is imported

  // const members = [
  //   {
  //     firstName: 'Pegah',
  //     lastName: 'Vaezi',
  //     avatarUrl:
  //       'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.fouladiprojects.com%2Fwp-content%2Fuploads%2F2015%2F10%2FBarbourshow1.jpg&f=1&nofb=1',
  //     isImported: false,
  //     headerHash: 'riusry3764yiud',
  //     connectionStatus: 'connected',
  //     selfAssignedStatus: 'online',
  //   },
  //   {
  //     firstName: 'James',
  //     lastName: 'Turland',
  //     avatarUrl:
  //       'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.0ywwhCouW5nzFObdsruKhgHaEo%26pid%3DApi&f=1',
  //     isImported: false,
  //     headerHash: 'riusry3764yiudsdasfaf',
  //     connectionStatus: 'connected',
  //     selfAssignedStatus: 'online',
  //   },
  //   {
  //     firstName: 'Connor',
  //     lastName: 'Turland',
  //     avatarUrl:
  //       'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F1409121%3Fv%3D4&f=1&nofb=1',
  //     isImported: false,
  //     headerHash: 'riusry3764yiudsdasfafsdasds',
  //     connectionStatus: 'connected',
  //     selfAssignedStatus: 'online',
  //   },
  // ]

  return (
    <div className="members-indicator-wrapper">
      {/* TODO: re-add disconnected status */}
      <AvatarsList
        size="small-medium"
        profiles={members}
        showInviteButton
        onClickButton={onClickInviteMember}
      />
    </div>
  )
}

export default MembersIndicator
