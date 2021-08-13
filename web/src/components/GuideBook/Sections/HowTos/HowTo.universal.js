import React from 'react'

export default {
  title: 'Universal Priority Mode',
  submenu: [
    {
      title: 'Introduction',
      guide_id: 'intro_universal_priority_mode',
      description: (
        <ol>
          <li>
            Priority View is an alternative view mode to the Map View,
            specifically designed for helping you and your team with decision
            making on priority of the goals that you set on the map.
          </li>
          <li>
            In Universal Priority Mode an entire team agrees to follow a set of
            ranked top priorities, there is no voting.
          </li>
          <li>
            This mode is usually beneficial for teams that have a project
            management role.
          </li>
          <li>This is the default mode for newly created projects.</li>
        </ol>
      ),
    },
    {
      title: 'Indented Tree View',
      guide_id: 'universal_indented_tree_view',
      description: (
        <ol>
          <div className="guidebook-description-section">
            This column on the left side of Priority view page helps you with
            finding and adding a specific goal card to the list of top
            priorities. To do so, search the title of the goal you're looking
            for. Next, hover over it, and click on the plus (+) button that
            appears to the right. It will be added to the bottom of the top
            priority list.
          </div>
        </ol>
      ),
    },
    {
      title: 'Mark a card as top priority',
      guide_id: 'mark_card_as_top_priority',
      description: (
        <ol>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">
              In Quick Edit Mode
            </div>
            <div className="guidebook-separate-line">
              Click on Priority button.
            </div>
            <div className="guidebook-separate-line">
              Toggle the 'This goal is top priority' switch to on, with a
              checkmark.
            </div>
          </div>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">
              In Expanded View Mode
            </div>
            <li>Click on the Priority icon on the Right Menu.</li>
          </div>
        </ol>
      ),
    },
  ],
}
