import React from 'react'

export default {
  title: 'Cards',
  submenu: [
    {
      title: 'Create a card',
      guide_id: 'create_a_card',
      description: (
        <ol>
          <li>
            Hold G on keyboard and left click on any empty space on the canvas
          </li>
          <li> Type in a title for the card</li>
          <li>
            {' '}
            Press Enter or click anywhere outside the card to finish creating
            the card
          </li>
        </ol>
      ),
    },

    {
      title: 'Select multiple cards',
      guide_id: 'select_multiple_cards',
      description: (
        <ol>
          <div className="guidebook-separate-line">Either:</div>
          <li>
            Hold shift and drag your mouse over the cards, then release to enter
            the Multi Edit Mode.
          </li>
          <li>
            {' '}
            Hold shift and left click on the cards that you want to select.
          </li>
        </ol>
      ),
    },
    {
      title: 'Deselect cards',
      guide_id: 'deselect_cards',

      description: (
        <ol>
          <div className="guidebook-separate-line">
            To deselect certain selected cards, hold Shift and left click on the
            cards you wish to deselect.
          </div>
          <div className="guidebook-separate-line">
            To deselect all the cards at once click on an empty space on canvas.
          </div>
        </ol>
      ),
    },
    {
      title: 'Title',
      guide_id: 'card_title',

      description: (
        <ol>
          <div className="guidebook-separate-line">
            You can do it in three ways:
          </div>
          <li>
            - Double click directly on the title of the card and start typing in.
          </li>
          <li>
            {' '}
            - After entering the Quick Edit Mode for a card, just start typing in.
          </li>
          <li>
            {' '}
            - After Entering the Expanded View Mode for the card, just click or
            double click on the title and start typing in. Changes will take
            effect immediately.
          </li>
        </ol>
      ),
    },
    {
      title: 'Status',
      guide_id: 'card_status',
      description: (
        <ol>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">
              In Quick Edit Mode
            </div>
            <div className="guidebook-separate-line">
              Click on Status button and select the status you want for the
              card.
            </div>
          </div>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">
              In Expanded View Mode
            </div>
            <div className="guidebook-separate-line">
              Click on the Hierarchy icon (or circle if the card has no hierarchy) on top left corner of the expanded
              card which matches the color of card status. Click on the status
              color that you want for the card.
            </div>
          </div>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">
              In Multi Edit Mode
            </div>
            <div className="guidebook-separate-line">
              Click on the Squirrels icon from the Multi Edit Bar and select the
              members that you want to associate with the card from the list.
            </div>
          </div>
        </ol>
      ),
    },
    {
      title: 'Squirrels (Members)',
      guide_id: 'card_squirrels',
      description: (
        <ol>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">
              In Quick Edit Mode
            </div>
            <div className="guidebook-separate-line">
              Click on Squirrels button and select the members that you want
              to associate with the card from the list.
            </div>
          </div>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">
              In Expanded View Mode
            </div>
            <div className="guidebook-separate-line">Either:</div>
            <li>
              Hold shift and drag your mouse over the cards, then release to
              enter the Multi Edit Mode.
            </li>
            <li>
              {' '}
              Hold shift and left click on the cards that you want to select.
            </li>
          </div>
          {/* TODO: show this when multi-editing gets added for squirrels */}
          {/* <div className='guidebook-description-section'>
            <div className='guidebook-separate-line sub-heading'>
              In Multi Edit Mode
            </div>
            <div className='guidebook-separate-line'>
              Click on the Squirrels icon from the Multi Edit Bar and select
              the members that you want to associate with the card from the
              list.
            </div>
            <div className='guidebook-separate-line'>
              If wanting to associate certain members with multiple cards at
              once, you can do so in Multi Edit Mode after selecting the cards
              all together. Please note, this function will override all the
              existing settings for the associate members in all of the
              selected cards.
            </div>
          </div> */}
        </ol>
      ),
    },
    {
      title: 'Timeframe',
      guide_id: 'card_timeframe',
      description: (
        <ol>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">
              In Quick Edit Mode
            </div>
            <div className="guidebook-separate-line">
              Click on "timeframe" button and select or type in Start Date and
              End Date.
            </div>
          </div>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">
              In Expanded View Mode
            </div>
            <div className="guidebook-separate-line">Either:</div>
            <li>
              Click on the grey field under "timeframe" and select or type in
              Start Date and End Date.
            </li>
            <li>
              {' '}
              Click on the Calendar icon on the Right Menu and select or type in
              Start Date and End Date.
            </li>
          </div>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">
              In Multi Edit Mode
            </div>
            <div className="guidebook-separate-line">
              Click on the Calendar icon from the Multi Edit Bar and select or
              type in Start Date and End Date. Please note, this function will
              override all the existing settings for timeframe in all of the
              selected cards.
            </div>
          </div>
        </ol>
      ),
    },
    {
      title: 'Hierarchy',
      guide_id: 'card_hierarchy',
      description: (
        <ol>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">
              Introduction to goal hierarchy levels
            </div>
            <div className="guidebook-separate-line">
              Hierarchy adds another level of metadata to your goals. In Acorn
              there are 4 hierarchy level options available inspired by tree
              mataphore: Root (primary goal), Trunk (high-level goal), Branch
              (Sub-goal), and Leaf (small goal). There is also the default option of
              No Hierarchy.
            </div>
            <div className="guidebook-separate-line">
              Setting hierarchy for goals in a complex project
              would help you and your team to be able to see how bigger goals
              can break down into smaller units. While having the bigger goals in
              vision, your team would be able to easily identify leaf
              small goals (leaf) to complete. By completing small goals more
              effectively, your team can see the progress being made, feel
              accomplished, and know clearly where they are headed.
            </div>
          </div>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">
              In Quick Edit Mode
            </div>
            <div className="guidebook-separate-line">
              Click on Hierarchy button and select the hierarchy level that
              you want.
            </div>
          </div>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">
              In Expanded View Mode
            </div>

            <div className="guidebook-separate-line">
              Click on the Hierarchy icon on the Right Menu.
            </div>
          </div>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">
              In Multi Edit Mode
            </div>
            <div className="guidebook-separate-line">
              Click on the Hierarchy icon from the Multi Edit Bar. Please note,
              this function will override all the existing settings for
              hierarchy in all of the selected cards.
            </div>
          </div>
        </ol>
      ),
    },
    {
      title: 'Priority',
      guide_id: 'card_priority',
      description: (
        <ol>
          {/* Universal Prioritizing */}
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">
              Universal Prioritizing
            </div>
            <div className="guidebook-separate-line">
              See <a>Mark a Card as Top Priority</a> under Universal Priority Mode section.
            </div>
          </div>
          {/* Vote Based Prioritizing */}
          <div className="guidebook-separate-line sub-heading">
            Vote Based Prioritizing
          </div>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">
              In Quick Edit Mode
            </div>
            <div className="guidebook-separate-line">
              Click on "priority" button. Then click on the "Weigh In" button.
              The default vote is "medium" for all 4 factors. You can slide the
              factor bars to set your own. For more information about
              prioritization go to Priority View Mode.
            </div>
          </div>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">
              In Expanded View Mode
            </div>
            <div className="guidebook-separate-line">
              Click on "priority" button. Then click on the "Weigh In" button.
              The default vote is "medium" for all 4 factors. You can slide the
              factor bars to set your own. For more information about
              prioritization go to Priority View Mode.
            </div>
          </div>
          <div className="guidebook-separate-line sub-heading">
            See Aggregated Priority of a Card
          </div>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">
              In Quick Edit Mode
            </div>
            <div className="guidebook-separate-line">
              Click on Priority button. You will be able to see the aggregated
              votes for 4 factors that determine priority of the card. For more
              information on how the prioritization system works in Acorn see
              Prioritization.
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

    // TODO: enable this section when the multi view location gets built-in
    // {
    //   title: 'Locate a goal in different view modes',
    //   guide_id: 'locate_a_goal_in_different_view_modes',
    //
    //   description: (
    //     <ol>
    //       <div className='guidebook-description-section'>
    //         The view mode buttons will make it easier for you to locate
    //         certain goals in different view modes. In priority view, these
    //         button appear when hovering on a certain goal (map and timeline).
    //         Vice versa, if you are on the map view mode, to locate a specific
    //         goal in priority view, open the priority pop-up for that goal, and
    //         click on the icon at the bottom of the pop-up.
    //       </div>
    //     </ol>
    //   ),
    // },
  ],
}
