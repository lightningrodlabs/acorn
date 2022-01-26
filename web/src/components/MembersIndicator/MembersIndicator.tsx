import React from 'react'
import Avatar from '../Avatar/Avatar'


import './MembersIndicator.css'

export type MembersIndicatorProps = {
  // any here is a "Profile"
  // TODO: update it when have added a Profile
  // type definition
  members: Array<any>
}

const MembersIndicator: React.FC<MembersIndicatorProps> = ({members}) => {
  //   Don't show an avatar if it is imported

  // const members = [
  //   {
  //     first_name: 'Pegah',
  //     last_name: 'Vaezi',
  //     avatar_url:
  //       'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.fouladiprojects.com%2Fwp-content%2Fuploads%2F2015%2F10%2FBarbourshow1.jpg&f=1&nofb=1',
  //     is_imported: false,
  //     headerHash: 'riusry3764yiud',
  //     connectionStatus: 'connected',
  //     selfAssignedStatus: 'online',
  //   },
  //   {
  //     first_name: 'James',
  //     last_name: 'Turland',
  //     avatar_url:
  //       'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.0ywwhCouW5nzFObdsruKhgHaEo%26pid%3DApi&f=1',
  //     is_imported: false,
  //     headerHash: 'riusry3764yiudsdasfaf',
  //     connectionStatus: 'connected',
  //     selfAssignedStatus: 'online',
  //   },
  //   {
  //     first_name: 'Connor',
  //     last_name: 'Turland',
  //     avatar_url:
  //       'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F1409121%3Fv%3D4&f=1&nofb=1',
  //     is_imported: false,
  //     headerHash: 'riusry3764yiudsdasfafsdasds',
  //     connectionStatus: 'connected',
  //     selfAssignedStatus: 'online',
  //   },
  // ]

  return (
    <div className="members-indicator-wrapper">
      
      {members.map(
        (member) =>
          member && (
            <div
              key={member.headerHash}
              className="members-indicator-wrapper-avatars"
              title={`${member.first_name} ${member.last_name}`}
            >
              {/* <div className="members-indicator-avatar-circle"> */}
                <Avatar
                  first_name={member.first_name}
                  last_name={member.last_name}
                  avatar_url={member.avatar_url}
                  imported={member.is_imported}
                  smallMedium
                  withWhiteBorder
                  withStatus
                  clickable
                />
                
              </div>
            // </div>
          )
      )}
    </div>
  )
}

export default MembersIndicator
