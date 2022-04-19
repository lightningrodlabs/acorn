import React from 'react'
import { Profile } from '../../types'

import Avatar from '../Avatar/Avatar'
import Icon from '../Icon/Icon'

import './AvatarsList.scss'

export type AvatarsListProps = {
  size: 'small' | 'small-medium' | 'medium' | 'medium-large' | 'large'
  profiles: Profile[]
  showPresence?: boolean
  showInviteButton?: boolean
  showAddButton?: boolean
  onClickButton: () => void
}

const AvatarsList: React.FC<AvatarsListProps> = ({
  size = 'medium',
  profiles,
  showPresence,
  showInviteButton,
  showAddButton,
  onClickButton,
}) => {
  return (
    <div className="avatars-list-wrapper">
      {profiles.map((profile) => {
        if (!profile) {
          return null
        }
        // check if the profile is in the
        // list of present profiles
        // (presence being "has the project open presently")

        //     const isprofilePresent = presentprofiles.find(
        //   (presentprofile) => presentprofile === profile.address
        // )

        // TODO: implement showPresence logic
        const isProfilePresent = true

        return (
          <div
            key={profile.agentPubKey}
            className={
              isProfilePresent
                ? 'avatars-list-wrapper-avatars'
                : 'avatars-list-wrapper-avatars disconnected'
            }
          >
            {/* title={`${profile.firstName} ${profile.lastName}`} */}
            <Avatar
              firstName={profile.firstName}
              lastName={profile.lastName}
              avatarUrl={profile.avatarUrl}
              imported={profile.isImported}
              selfAssignedStatus={profile.status}
              size={size}
              withWhiteBorder
              withStatus={isProfilePresent}
              clickable
              withTooltip
            />
          </div>
        )
      })}
      {/* Invite members button or Add Assignees button(optional) */}
      {(showInviteButton || showAddButton) && (
        <div className="avatars-list-button-wrapper">
          <div
            className={`avatars-list-button ${
              size === 'small'
                ? 'small'
                : size === 'small-medium'
                ? 'small-medium'
                : size === 'medium'
                ? 'medium'
                : size === 'medium-large'
                ? 'medium-large'
                : size === 'large'
                ? 'large'
                : ''
            }`}
            onClick={onClickButton}
          >
            {/* @ts-ignore */}
            <Icon
              name={
                showInviteButton
                  ? 'user-plus.svg'
                  : showAddButton
                  ? 'plus.svg'
                  : ''
              }
              size="small"
              className="dark-grey"
              withTooltip
              tooltipText={
                showInviteButton
                  ? 'Invite Members'
                  : showAddButton
                  ? 'Add Assignees'
                  : ''
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AvatarsList
