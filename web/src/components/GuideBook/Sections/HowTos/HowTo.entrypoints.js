import React from 'react'

export default {
  title: 'Entry Points',
  submenu: [
    {
      title: 'Introduction to Entry Points',
      guide_id: 'introduction_to_entry_points',
      description: (
        <ol>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line">
              Entry points (shown as open door icons) are like openings to
              different parts of your project's tree. You can set any card on
              your tree as an entry point. You can then access them either in
              your dahsboard under the project's name, or when clicked on the
              project, on bottom left corner of your screen, shown as an open
              door icon. When selected an entry point, you are able to
              selectively see only that entry point and its children cards.
            </div>
          </div>
        </ol>
      ),
    },
    {
      title: 'Creating Entry Points',
      guide_id: 'creating_entry_points',
      description: (
        <ol>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line">
              To set a card as an entry point to your project's tree, hover over
              the card, and click on the expanded view icon. In the expanded
              view mode, you'll see a closed door icon on the top bar. That
              means the card in NOT an entry point. By clicking on the door, you
              can change it to an open door icon, which means the card is an
              entry point now.
            </div>
          </div>
        </ol>
      ),
    },
  ],
}
