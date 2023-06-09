import React from 'react'
import AvatarsList from '../AvatarsList/AvatarsList'

import { AgentPubKeyB64 } from '../../types/shared'
import { Profile } from '../../types'

import './MembersIndicator.scss'
import useTheme from '../../hooks/useTheme'

export type MembersIndicatorProps = {
  members: Profile[]
  presentMembers: AgentPubKeyB64[]
  onClickInviteMember: () => void
}

const MembersIndicator: React.FC<MembersIndicatorProps> = ({
  members,
  presentMembers,
  onClickInviteMember,
}) => {
  const theme = useTheme()
  return (
    <div className={`members-indicator-wrapper ${theme}`}>
      <AvatarsList
        size="small-medium"
        profiles={members}
        showPresence
        profilesPresent={presentMembers}
        showInviteButton
        onClickButton={onClickInviteMember}
      />
    </div>
  )
}

export default MembersIndicator
