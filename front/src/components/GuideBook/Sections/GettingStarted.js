import React from 'react'
import { NavItemsGroup } from '../NavItems/NavItems'
import Icon from '../../Icon/Icon'

const gettingStartedItems = [
  {
    title: 'The Basics',
    submenu: [
      { title: 'Create a card', url: 'create_a_card', tab: "How To's" },
      {
        title: 'Add a child card to an existing card',
        url: 'add_child_card',
        tab: "How To's",
      },
      {
        title: 'Change card title',
        url: 'change_card_title',
        tab: "How To's",
      },
    ],
  },
  {
    title: 'Priority View Mode',
    submenu: [
      {
        title: 'Introduction to Priority View Mode',
        url: 'introduction_to_priority_view_mode',
        tab: 'Getting Started',
        description: (
          <ol>
            <div className='guidebook-description-section'>
              <div className='guidebook-separate-line'>
                Priority View Mode is an alterntaive view mode to the map view
                mode, speicifically designed for helping you and your team with
                decision making on priority of the goals that you set on the
                map. For determining the proiority of goals we have allocated 4
                factors:
                <div className='guidebook-description-bold'>Urgence</div>
                <div className='guidebook-description-bold'>Importance</div>
                <div className='guidebook-description-bold'>Effort</div>
                <div className='guidebook-description-bold'>Impact</div>
              </div>
            </div>
            <div className='guidebook-description-section'>
              <div className='guidebook-separate-line'>
                The{' '}
                <text className='guidebook-description-bold'>
                  urgence-importance
                </text>{' '}
                intergration is inspired from a pricinciple called Eisenwhoer
                Matix.
              </div>
              <div className='guidebook-separate-line'>
                The{' '}
                <text className='guidebook-description-bold'>
                  effort-impact
                </text>{' '}
                intergration is another way of prioritizing goals. “In the
                effort-impact matrix, you evaluate tasks based on how much
                effort they’ll require to complete and the impact that
                completing them will have. The tasks in the two right-side
                quadrants are your priorities.” Quote from
                https://zapier.com/blog/how-to-prioritize/
              </div>
              <div className='guidebook-separate-line'>
                As in complex projects the number of goals (and sometimes number
                of team members) expands, it gets more difficult to determine
                ‘what to focus on next’.
              </div>
              <div className='guidebook-separate-line'>
                All the team members (who have editing permssion) would be able
                to “weigh in” their vote for these 4 facotrs for each goal
                (either in map view or priority view) The “aggregated protiory”
                that results from this collective poll will detremince where
                each goal will stand on the priority view mode.
              </div>
              <div className='guidebook-separate-line guidebook-description-bold'>
                If you have a diverse them and not sure if everyone is having a
                shared understing of what each of these priority factors mean,
                we recomemed having an onboradiang meeting/session with your
                team members to develop of shared understing of each factor in
                the context of the project you are working on.
              </div>
            </div>
          </ol>
        ),
      },
      {
        title: 'Indented Tree View',
        url: 'indented_tree_view',
        tab: 'Getting Started',
        description: (
          <ol>
            <div className='guidebook-description-section'>
              This column on the left side of Priority view page helps you with
              finding a specific goal. By sleceting that goal you would be able
              to filter the visiblity of the goals to down to only the childern
              of that selected goal on the priority Quadrants.
            </div>
          </ol>
        ),
      },
      {
        title: 'Priority Metrics tabs',
        url: 'priority_metrics_tabs',
        tab: 'Getting Started',
        description: (
          <ol>
            <div className='guidebook-description-section'>
              These tabs help you swtich between piority matrixes (unrgent x
              imprtnat and impact x effort), signle priorty facors, or
              uncategorazied goals. This gives you the flexiblty to take action
              based on a specifc factor determining a goal’s priority.
            </div>
          </ol>
        ),
      },
      {
        title: 'Priority Metrics tabs',
        url: 'priority_metrics_tabs',
        tab: 'Getting Started',
        description: (
          <ol>
            <div className='guidebook-description-section'>
              These tabs help you swtich between piority matrixes (unrgent x
              imprtnat and impact x effort), signle priorty metrics, or
              uncategorazied goals. This gives you the flexiblty to take action
              based on a specifc factor determining a goal’s priority.
            </div>
          </ol>
        ),
      },
      {
        title: 'Weign In and See My Vote buttons',
        url: 'weigh_in_and_see_my_votes_buttons',
        tab: 'Getting Started',
        description: (
          <ol>
            <div className='guidebook-description-section'>
              When hovering over goals in the priority view, “Weigh in” button
              apprears if you haven’t voted for the priority of the goal on
              hover state. If you have already voted for the priority of a goal,
              a purple dot shows up under the goal title and when hovering on
              the goal, “See my vote” button appears.
            </div>
          </ol>
        ),
      },
    ],
  },
]

// component
const Content = ({ goBack, title, description }) => (
  <div className='guidebook-section'>
    <div className='nav-item'>
      <Icon
        name='back.svg'
        size='very-small'
        className='grey'
        onClick={goBack}
      />
      <div className='guidebook-section-title'>{title}</div>
    </div>
    <div className='guidebook-section-description'>{description}</div>
  </div>
)

export default function GettingStarted({
  sectionSelected,
  goBack,
  selectSection,
}) {
  if (sectionSelected) {
    return (
      <Content
        goBack={goBack}
        title={sectionSelected.title}
        description={sectionSelected.description}
      />
    )
  }
  return (
    <NavItemsGroup items={gettingStartedItems} selectSection={selectSection} />
  )
}

// const Test = props => (
//   <div>
//     <button type='button' onClick={props.goBack}></button>
//     <h1>aja</h1>
//   </div>
// )
