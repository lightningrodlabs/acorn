import React from 'react'

export default {
  title: 'Projects',
  submenu: [
    {
      title: 'Join a project',
      guide_id: 'join_a_project',
      description: (
        <ol>
          <li>
            When you try to join a project, by using a secret phrase given to
            you by a peer with access to that project, Acorn will attempt to
            form a network connection with any peer who is in that project, in
            order to sync the project data. This is because no data is stored on
            any servers, only on peers computers.
          </li>
          <li>
            If no peer is found within 15 seconds, then you will be notified of
            that, and your project will be placed in a queue for syncing, where
            it will regularly check its status. If it has sufficiently synced
            with a peer, then you will be able to access the project.
          </li>
          <li>
            Note that not ALL data has necessarily been synced when you access
            the project, and some data may take more time to become consistent
            with your peers. If a peer is found, you are likely to be able to
            immediately begin to access the project, although a short sync
            period in the queue may be required before you can access it.
          </li>
          <li>
            If your project is not syncing, and you believe it should, then you
            may have entered the secret phrase incorrectly, or the secret phrase
            may have been shared incorrectly with you. The secret phrase should
            always be 5 words. If you determine this is the case, you can click
            'Show details' in the project sync queue info panel, and hover over
            the project of concern, and click the 'cancel' button that appears
            there. This will exit you from that project and prevent any further
            syncing.
          </li>
        </ol>
      ),
    },
  ],
}
