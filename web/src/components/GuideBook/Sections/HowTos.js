import React, { useState, useEffect } from 'react'
import { useLocation, NavLink } from 'react-router-dom'
import Icon from '../../Icon/Icon'
import { GUIDE_IS_OPEN, CREATE_ENTRY_POINT_KEY } from '../guideIsOpen'

const howTosItems = [
  /* Cards */
  {
    title: 'Projects',
    submenu: [
      {
        title: 'Join a project',
        guide_id: 'join_a_project',
        description: (
          <ol>
            <li>
              When the project goes in your queue...
            </li>
          </ol>
        ),
      },
    ],
  },
  /* Cards */
  {
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
        title: 'Add a child card to an existing card',
        guide_id: 'add_child_card',
        description: (
          <ol>
            <li>
              Select the existing card that is going to be the parent card
            </li>
            <li>
              {' '}
              While holding G, click anywhere on the empty space in the canvas
            </li>
            <li> Type in the title for the child card</li>
            <li>
              {' '}
              Press Enter or click anywhere outside the card to finish creating
              the child card
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
              Hold shift and drag your mouse over the cards, then release to
              enter the Multi Edit Mode.
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
              To deselect certain selected cards, hold Shift and left click on
              the cards you wish to deselect.
            </div>
            <div className="guidebook-separate-line">
              To deselect all the cards at once click on an empty space on
              canvas.
            </div>
          </ol>
        ),
      },
      {
        title: 'Title: Change card title',
        guide_id: 'change_card_title',

        description: (
          <ol>
            <div className="guidebook-separate-line">
              You can do it in three ways:
            </div>
            <li>
              Double click directly on the title of the card and start typing
              in.
            </li>
            <li>
              {' '}
              After entering the Quick Edit Mode for a card, just start typing
              in.
            </li>
            <li>
              {' '}
              After Entering the Expanded View Mode for the card, just click or
              double click on the title and start typing in. Changes will take
              effect immediately.
            </li>
          </ol>
        ),
      },
      {
        title: 'Status: Change card status',
        guide_id: 'change_card_status',
        description: (
          <ol>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                In Quick Edit Mode
              </div>
              <div className="guidebook-separate-line">
                Click on “status” button and select the status you want for the
                card.
              </div>
            </div>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                In Expanded View Mode
              </div>
              <div className="guidebook-separate-line">
                Click on the Hierarchy icon on top left corner of the expanded
                card which matches the color of card status. Click on the status
                color that you want for the card.
              </div>
            </div>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                In Multi Edit Mode
              </div>
              <div className="guidebook-separate-line">
                Click on the Squirrels icon from the Multi Edit Bar and select
                the members that you want to associate with the card from the
                list.
              </div>
            </div>
          </ol>
        ),
      },
      {
        title: 'Squirrels: Associate members with cards',
        guide_id: 'associate_members_with_cards',
        description: (
          <ol>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                In Quick Edit Mode
              </div>
              <div className="guidebook-separate-line">
                Click on “squirrels” button and select the members that you want
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
        title: 'Timeframe: Add or edit timeframe of cards',
        guide_id: 'edit_timeframe_of_cards',
        description: (
          <ol>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                In Quick Edit Mode
              </div>
              <div className="guidebook-separate-line">
                Click on “timeframe” button and select or type in Start Date and
                End Date.
              </div>
            </div>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                In Expanded View Mode
              </div>
              <div className="guidebook-separate-line">Either:</div>
              <li>
                Click on the grey field under “timeframe” and select or type in
                Start Date and End Date.
              </li>
              <li>
                {' '}
                Click on the Calendar icon on the Right Menu and select or type
                in Start Date and End Date.
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
        title: 'Hierarchy: Set hierarchy level of cards',
        guide_id: 'set_hierarchy_level_of_cards',
        description: (
          <ol>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                Introduction to goal hierarchy levels
              </div>
              <div className="guidebook-separate-line">
                Hierarchy adds another level of metadata to your goals. On
                Acorn, there 4 hierarchy level options available inspired by a
                tree mataphore: Root (primary goal) Trunk (high-level goal)
                Branch (Sub-goal) Leaf (small goal) There is also the default
                option of “no hierarchy”. Setting hierarchy for goals in a
                complex project would help you and your team to be able to see
                how bigger goals can break down to smaller units. While having
                the bigger goals in the vision, your team would be able to
                easily identify leaf (small) goals to complete. Completing small
                goals more effectively, your team can see the progress being
                made, feel accomplished, and know clearly where they are headed.
              </div>
            </div>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                In Quick Edit Mode
              </div>
              <div className="guidebook-separate-line">
                Click on "hierarchy" button and select the "hierarchy" level
                that you want.
              </div>
            </div>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                In Expanded View Mode
              </div>
              <div className="guidebook-separate-line">Either:</div>
              <div className="guidebook-separate-line">
                Click on the Hierarchy icon on the Right Menu.
              </div>
            </div>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                In Multi Edit Mode
              </div>
              <div className="guidebook-separate-line">
                Click on the Hierarchy icon from the Multi Edit Bar. Please
                note, this function will override all the existing settings for
                hierarchy in all of the selected cards.
              </div>
            </div>
          </ol>
        ),
      },
      {
        title: 'Priority: See aggregated priority of a card',
        guide_id: 'aggregated_priority',
        description: (
          <ol>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                In Quick Edit Mode
              </div>
              <div className="guidebook-separate-line">
                Click on “priority” button. You will be able to see the
                aggregated votes for 4 factors that determine priority of the
                card. For more information on how the prioritization system
                works in Acorn see Prioritization.
              </div>
            </div>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                In Expanded View Mode
              </div>
              <div className="guidebook-separate-line">Either:</div>
              <li>
                Click on priority tab on Expanded View Navbar under the
                description field.
              </li>
              <li>Click on the Priority icon on the Right Menu</li>
            </div>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                In Multi Edit Mode
              </div>
              <div className="guidebook-separate-line">
                Click on the Hierarchy icon from the Multi Edit Bar. Please
                note, this function will override all the existing settings for
                hierarchy in all of the selected cards.
              </div>
            </div>
          </ol>
        ),
      },
      {
        title: 'Priority: Vote for priority of a card',
        guide_id: 'vote_for_priority_of_a_card',
        description: (
          <ol>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                In Quick Edit Mode
              </div>
              <div className="guidebook-separate-line">
                Click on “priority” button. Then click on the "Weigh In" button.
                The default vote is “medium” for all 4 factors. You can slide
                the factor bars to set your own. For more information about
                prioritization go to Priority View Mode.
              </div>
            </div>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                In Expanded View Mode
              </div>
              <div className="guidebook-separate-line">
                Click on “priority” button. Then click on the "Weigh In" button.
                The default vote is “medium” for all 4 factors. You can slide
                the factor bars to set your own. For more information about
                prioritization go to Priority View Mode.
              </div>
            </div>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                In Multi Edit Mode
              </div>
              <div className="guidebook-separate-line">
                Click on the Priority icon from the Multi Edit Bar. Then Click
                on the "Weigh In" button.
              </div>
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
  },
  /* Connections */
  {
    title: 'Connections',
    submenu: [
      {
        title: 'Create a Child Card',
        guide_id: 'create_a_child',
        description: (
          <ol>
            <li>Select a goal by clicking on it once</li>
            <li>
              Hold G on keyboard and left click on any empty space on the canvas
            </li>
            <li>
              Notice that this card being created has a built-in connection with
              the selected Goal card, which will act as the parent of your
              to-be-created Goal. Only children can be created off a selected
              Goal card at this time.
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
        title: 'Connect via Point Connector',
        guide_id: 'point-connector',
        description: (
          <div>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line">
                Point Connector is a feature that lets you connect your existing
                cards quickly by connecting them 'point-to-point'. In Acorn
                cards can only have one parent, but can have many children.
              </div>
            </div>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line">
                When you hover over or select an existing card, you will see the
                Point Connector dots near the top and/or bottom of the card. In
                order to connect the chosen card to another card simply click on
                one of the purple dots and drag the created line to near another
                card which you want to connect your cards to. Point Connector
                dots will have appeared near any card that it is possible to
                connect to. Now release the trackpad/mouse on the card, or dot
                of that card, that you want. The cards in the map will rearrange
                automatically based on the new connection. Using the top dot of
                a card means that card will be the child in the relationship.
                Using the bottom dot of the card means that it will be the
                parent in the relationship.
              </div>
            </div>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line">
                When you have initiated a point-to-point connection, but you
                want to cancel it, you can press the Escape key.
              </div>
            </div>
          </div>
        ),
      },
      {
        title: 'Connect Multiple',
        guide_id: 'connect-multiple',
        description: (
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line">
              If you would like to connect multiple cards to another card at
              once, you can use the Connector feature in Multi Edit Mode:
              <br />
              <br />
              <ol>
                <li>
                  1. Select all the cards you want to connect, then click on the
                  Connector Icon on the Multi Edit Bar at the bottom of the
                  screen.
                </li>
                <li>
                  2. You will see two drop downs: For the "Connect" dropdown
                  select the parent card of your choice. For the "Children"
                  choose the card(s) that you want connected to the chosen
                  parent card.
                </li>
                <li>
                  3. Click Preview to see how the new connection will look like
                  on the map. If happy with the results, click on "Save
                  Changes".
                </li>
              </ol>
              <b>
                Please note, the availablity of these selections depend on
                existing realtionship(s) of your selected cards. You might need
                to remove some existing connections first, to comply with the
                one-parent-only rule in Acorn.
              </b>
            </div>
          </div>
        ),
      },
      {
        title: 'Archive Connection',
        guide_id: 'archive-connection',
        description: (
          <>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line">
                If you would like to archive a connection:
              </div>
            </div>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line">
                <ol>
                  <li>select it by clicking on it once (it will turn blue)</li>
                  <li>press Delete (Mac) / Backspace (Linux). </li>
                </ol>
                Using this, and then creating a new connection, is currently the
                best way to change the parent of an card.
              </div>
            </div>
          </>
        ),
      },
    ],
  },
  /* Navigation */
  {
    title: 'Navigation',
    submenu: [
      {
        title: 'Pan around in Map View Mode',
        guide_id: 'pan_around',
        description: (
          <ol>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                Trackpad
              </div>
              <div className="guidebook-separate-line">
                Scroll the map in any direction by sliding two fingers on the
                trackpad
              </div>
            </div>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                Mouse or trackpad
              </div>
              <div className="guidebook-separate-line">
                Click and drag the canvas to pan around
              </div>
            </div>
            {/* <div className='guidebook-description-section'>
              <div className='guidebook-separate-line sub-heading'>
              Keyboard
              </div>
              <div className='guidebook-separate-line'>
              Use arrow keys to move vertically or horizontally though the canvas
              </div>
            </div> */}
          </ol>
        ),
      },
      {
        title: 'Zoom in and out in Map View Mode',
        guide_id: 'zooming_in_and_out',
        description: (
          <ol>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                Trackpad
              </div>
              <div className="guidebook-separate-line">
                Zoom by pinching in and out
              </div>
            </div>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">Mouse</div>
              <div className="guidebook-separate-line">
                {/* Use the mouse wheel while holding Ctrl/Cmd to zoom in and out */}
                Click on the "-" and "+" icons on Map View Mode. They are
                located at the bottom right corner of the Map View Mode.
              </div>
            </div>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                Current Zoom
              </div>
              <div className="guidebook-separate-line">
                The number next to the "-" and "+" icons in the bottom right
                corner of the Map View Mode represents the current level of
                zoom.
              </div>
            </div>
            {/* <div className='guidebook-description-section'>
              <div className='guidebook-separate-line sub-heading'>
              Keyboard
              </div>
              <div className='guidebook-separate-line'>
              Use + and - keys to zoom in and out.
              </div>
            </div> */}
          </ol>
        ),
      },
      {
        title: 'Switch between Map & Priority View modes',
        guide_id: 'switch_between_view_modes',
        description: (
          <ol>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line sub-heading">
                General View Mode Switching
              </div>
              <div className="guidebook-separate-line">
                Use the Priority Icon and Map View icon on bottom right corner
                of the screen to switch between the two views.
              </div>
            </div>
            {/* TODO: show this instruction when the locate card on view mode gets built */}
            {/* <div className='guidebook-description-section'>
              <div className='guidebook-separate-line sub-heading'>
                Locating a specific card in a different view mode
              </div>
              <div className='guidebook-separate-line'>
                You can also locate a selected goal card from the map view on
                priority view by selecting on the priority view icon in priority
                pop-up, and vice versa: you can locate a selected card on
                priority view to the Map view.
              </div>
            </div> */}
          </ol>
        ),
      },
    ],
  },
  /* Priority View Mode */
  {
    title: 'Priority View Mode',
    submenu: [
      {
        title: 'Introduction to Priority View Mode',
        guide_id: 'introduction_to_priority_view_mode',
        description: (
          <ol>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line">
                Priority View Mode is an alternative view mode to the Map View
                Mode, specifically designed for helping you and your team with
                decision making on priority of the goals that you set on the
                map. For determining the priority of goals we have allocated 4
                factors:
                <div className="guidebook-description-bold">Urgency</div>
                <div className="guidebook-description-bold">Importance</div>
                <div className="guidebook-description-bold">Effort</div>
                <div className="guidebook-description-bold">Impact</div>
              </div>
            </div>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line">
                The{' '}
                <text className="guidebook-description-bold">
                  urgency-importance
                </text>{' '}
                integration is inspired from a principle called Eisenhower
                Matrix.
              </div>
              <div className="guidebook-separate-line">
                The{' '}
                <text className="guidebook-description-bold">
                  effort-impact
                </text>{' '}
                integration is another way of prioritizing goals.{' '}
                <a href="https://zapier.com/blog/how-to-prioritize/">
                  “In the effort-impact matrix, you evaluate tasks based on how
                  much effort they’ll require to complete and the impact that
                  completing them will have.”
                </a>
                The items in the left quadrants, which are both "More Impact",
                are where you would start to work on tasks from, depending on
                whether you are prepared for low or high effort.
              </div>
              <div className="guidebook-separate-line">
                In complex projects as the number of goals (and sometimes number
                of team members) expands, it gets more difficult to determine
                ‘what to focus on next’.
              </div>
              <div className="guidebook-separate-line">
                All the team members (who have editing permssion) would be able
                to “weigh in” their vote for these 4 factors for each goal
                (either in map view or priority view) The “aggregated priority”
                that results from this collective poll will determine where each
                goal will stand on the priority view mode.
              </div>
              <div className="guidebook-separate-line guidebook-description-bold">
                If you have a diverse team and not sure if everyone is having a
                shared understing of what each of these priority factors mean,
                we recommend having an onboarding meeting/session with your team
                members to develop a shared understing of each factor in the
                context of the project you are working on.
              </div>
            </div>
          </ol>
        ),
      },
      {
        title: 'Indented Tree View',
        guide_id: 'indented_tree_view',
        description: (
          <ol>
            <div className="guidebook-description-section">
              This column on the left side of Priority view page helps you with
              finding and filtering by a specific goal. By selecting that goal
              you would be able to filter the visiblity of the goals down to
              only the childern of that selected goal on the priority quadrants.
            </div>
          </ol>
        ),
      },
      {
        title: 'Priority Metrics tabs',
        guide_id: 'priority_metrics_tabs',
        description: (
          <ol>
            <div className="guidebook-description-section">
              These tabs help you switch between priority matrixes (urgency x
              important and impact x effort), single priority factors (feature
              in developement), or uncategorized (not voted on) goals. This
              gives you the flexibility to take action based on a specific
              factor determining a goal’s priority.
            </div>
          </ol>
        ),
      },
      {
        title: 'Weign In and See My Vote buttons',
        guide_id: 'weigh_in_and_see_my_votes_buttons',
        description: (
          <ol>
            <div className="guidebook-description-section">
              If you haven’t voted for the priority of the goal, When hovering
              over goals in the priority view, “Weigh In” button apprears.
            </div>
            <div className="guidebook-description-section">
              If you have already voted for the priority of a goal, a purple dot
              shows up under the goal title and when hovering on the goal, “See
              My Vote” button appears.
            </div>
          </ol>
        ),
      },
    ],
  },
  /* Entry Points */
  {
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
                To set a card as an entry point to your project's tree, hover
                over the card, and click on the expanded view icon. In the
                expanded view mode, you'll see a closed door icon on the top
                bar. That means the card in NOT an entry point. By clicking on
                the door, you can change it to an open door icon, which means
                the card is an entry point now.
              </div>
            </div>
          </ol>
        ),
      },
    ],
  },
  /* My Data */
  {
    title: 'My Data',
    submenu: [
      {
        title: 'Export my data',
        guide_id: 'export_my_data',
        description: (
          <ol>
            <div className="guidebook-description-section">
              <div className="guidebook-separate-line">
                Click on the Export icon on header (next to the project name),
                and select one of the availble formats to export your data.
              </div>
            </div>
          </ol>
        ),
      },
    ],
  },
]

const Content = ({ title, description }) => (
  <div className="guidebook-section">
    <div className="guidebook-section-title">{title}</div>
    <div className="guidebook-section-description">{description}</div>
  </div>
)

function NavItem({ navItem: { submenu, title }, expanded, expand }) {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const openEntry = searchParams.get(GUIDE_IS_OPEN)
  return (
    <section>
      <div className="nav-item" onClick={expand}>
        <Icon
          name={expanded ? 'line-angle-down.svg' : 'line-angle-right.svg'}
          size="very-small"
          className="grey"
        />
        {title}
      </div>
      <div className={`sidebar-submenu ${expanded ? 'active' : ''}`}>
        <ul>
          {submenu.map((subNavItem, i) => (
            <li key={i}>
              <NavLink
                to={`${location.pathname}?${GUIDE_IS_OPEN}=${subNavItem.guide_id}`}
                isActive={(match) => match && subNavItem.guide_id === openEntry}
              >
                {subNavItem.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function HowTosNav({ navList, openNav }) {
  // store false, or the index of the currently expanded nav item
  // only one can be expanded at a time this way
  const [expanded, setExpanded] = useState(false)

  // run a check any time the 'openNav' section key changes
  // to expand the nav item who has a currently showing
  // open entry, if any
  useEffect(() => {
    if (openNav) {
      navList.forEach((navItem, index) => {
        if (navItem.title === openNav.title) {
          setExpanded(index)
        }
      })
    }
  }, [openNav])
  return (
    <nav className="how-tos-nav">
      {navList.map((navItem, i) => (
        <NavItem
          key={i}
          navItem={navItem}
          expanded={expanded === i}
          expand={() => (expanded === i ? setExpanded(false) : setExpanded(i))}
        />
      ))}
    </nav>
  )
}

// DEFAULT / TOP LEVEL EXPORT
export default function HowTos() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const openEntryKey = searchParams.get(GUIDE_IS_OPEN)
  function isOpenEntry(subItem) {
    return subItem.guide_id === openEntryKey
  }
  const openNav = howTosItems.find((navItem) => {
    return navItem.submenu.find(isOpenEntry)
  })
  const openEntry = openNav && openNav.submenu.find(isOpenEntry)

  return (
    <div className="howtos">
      <HowTosNav navList={howTosItems} openNav={openNav} />
      {openEntry && (
        <Content title={openEntry.title} description={openEntry.description} />
      )}
    </div>
  )
}
