import React from 'react'
import { AgentPubKeyB64 } from '../../types/shared'
import { Profile } from '../../types'

import Avatar from '../Avatar/Avatar'
import Icon from '../Icon/Icon'

import './AvatarsList.scss'

export type AvatarsListProps = {
  size: 'small' | 'small-medium' | 'medium' | 'medium-large' | 'large'
  profiles: Profile[]
  profilesPresent?: AgentPubKeyB64[]
  showPresence?: boolean
  showInviteButton?: boolean
  showAddButton?: boolean
  onClickButton?: () => void
  withStatus?: boolean
}

const AvatarsList: React.FC<AvatarsListProps> = ({
  size = 'medium',
  profiles,
  profilesPresent = [],
  showPresence,
  showInviteButton,
  showAddButton,
  onClickButton,
  withStatus = true,
}) => {
  return (
    <div
      className={`avatars-list-wrapper ${
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
    >
      {profiles.map((profile) => {
        if (!profile) {
          return null
        }
        // check if the profile is in the
        // list of present profiles
        // (presence being "has the project open presently")
        const isProfilePresent = !!profilesPresent.find(
          (presentprofile) => profile.agentPubKey === presentprofile
        )

        return (
          <Avatar
            key={profile.agentPubKey}
            firstName={profile.firstName}
            lastName={profile.lastName}
            avatarUrl={profile.avatarUrl}
            imported={profile.isImported}
            selfAssignedStatus={profile.status}
            size={size}
            withWhiteBorder
            disconnected={showPresence && !isProfilePresent}
            withStatus={withStatus && isProfilePresent}
            clickable
            withTooltip
          />
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
            <Icon
              name={
                showInviteButton
                  ? 'user-plus.svg'
                  : showAddButton
                  ? 'plus.svg'
                  : ''
              }
              size="medium"
              className={`grey ${
                showInviteButton
                  ? 'invite-members'
                  : showAddButton
                  ? 'add-assignees'
                  : ''
              }`}
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
