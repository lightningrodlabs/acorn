import React from 'react'

export default {
  title: 'Projects',
  submenu: [
    {
      title: 'Invite members to a project',
      guide_id: 'invite_members_to_a_project',
      description: (
        <ol>
          <li>
            Get ready to collaborate! When you're ready to invite others to your project, follow these steps:

          </li>
          <li>
            1. In dashboard view click on the Plus icon on top right corner of your project's row (next to your avatar).
          </li>
          <li>
            2. Copy the unique Project Invitation Secret phrase.
          </li>
          <li>
            3. Paste it into your communication channel with the person you are inviting (outside Acorn!).
          </li>
          <li>
            4. Now you just have to wait for them to install Acorn on their device and follow <a>Join a Project</a> steps using the secret passphrase you've shared with them.
          </li>
          <li>
            5. At least one of your already-joined team members would need to be "online" for the joining process to be completed. Otherwise the project would go to a queue status for the invitee person until Acorn finds an online peer from the project to sync with them.
          </li>
          <li>
            That's it! Now you can enjoy a truly peer-to-peer collaboration with your team members.
          </li>
        </ol>
      ),
    },

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
    {
      title: 'Export a project',
      guide_id: 'export_a_project',
      description: (
        <ol>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line">
              You would be able to export your project data in two formats: JSON (which is importable) and CSV.
            </div>
            <div className="guidebook-separate-line">
              To export your project, go to project view and click on the Export icon on header (next to the project name), and select one of the availble formats to export your data.
            </div>
          </div>
        </ol>
      ),
    },
    {
      title: 'Import a project',
      guide_id: 'import_a_project',
      description: (
        <ol>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line">
              If you have a JSON format of your exported project's data ,
              you would be able to import it through the dashboard by clicking on
              Import Project button located on the top bar.
            </div>
          </div>
        </ol>
      ),
    },
  ],
}
