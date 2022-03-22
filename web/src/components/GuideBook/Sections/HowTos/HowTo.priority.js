import React from 'react'

export default {
  title: 'Prioritizing',
  submenu: [
    {
      title: 'Introduction to Prioritizing',
      guide_id: 'introduction_to_priority',
      description: (
        <ol>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line">
              Priority View is an alternative view mode to the Map View ,
              specifically designed for helping you and your team with decision
              making on priority of the outcomes that you set on the map. For
              determining the priority of outcomes we have allocated 4 factors:
              <div className="guidebook-description-bold">Urgency</div>
              <div className="guidebook-description-bold">Importance</div>
              <div className="guidebook-description-bold">Effort</div>
              <div className="guidebook-description-bold">Impact</div>
            </div>
          </div>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line">
              The{' '}
              <span className="guidebook-description-bold">
                urgency-importance
              </span>{' '}
              integration is inspired from a principle called Eisenhower Matrix.
            </div>
            <div className="guidebook-separate-line">
              The{' '}
              <span className="guidebook-description-bold">effort-impact</span>{' '}
              integration is another way of prioritizing outcomes.{' '}
              <a href="https://zapier.com/blog/how-to-prioritize/" target="_blank">
                "In the effort-impact matrix, you evaluate tasks based on how
                much effort they'll require to complete and the impact that
                completing them will have."
              </a>
              The items in the left quadrants, which are both "More Impact", are
              where you would start to work on tasks from, depending on whether
              you are prepared for low or high effort.
            </div>
            <div className="guidebook-separate-line">
              In complex projects as the number of outcomes (and sometimes number
              of team members) expands, it gets more difficult to determine
              'what to focus on next'.
            </div>
            <div className="guidebook-separate-line">
              All the team members (who have editing permssion) would be able to
              "weigh in" their vote for these 4 factors for each outcome (either in
              map view or priority view) The "aggregated priority" that results
              from this collective poll will determine where each outcome will
              stand on the priority view mode.
            </div>
            <div className="guidebook-separate-line guidebook-description-bold">
              If you have a diverse team and not sure if everyone is having a
              shared understing of what each of these priority factors mean, we
              recommend having an onboarding meeting/session with your team
              members to develop a shared understing of each factor in the
              context of the project you are working on.
            </div>
          </div>
        </ol>
      ),
    },
    {
      title: 'Vote Based Priority Mode',
      guide_id: 'vote_based_priorityMode',
      description: (
        <ol>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line">
              In Vote Based Priority Mode, for determining the priority of outcomes
              there are 4 factors that get weighed:
              <div className="guidebook-description-bold">Urgency</div>
              <div className="guidebook-description-bold">Importance</div>
              <div className="guidebook-description-bold">Effort</div>
              <div className="guidebook-description-bold">Impact</div>
            </div>
          </div>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line">
              The{' '}
              <span className="guidebook-description-bold">
                urgency-importance
              </span>{' '}
              integration is inspired from a principle called Eisenhower Matrix.
            </div>
            <div className="guidebook-separate-line">
              The{' '}
              <span className="guidebook-description-bold">effort-impact</span>{' '}
              integration is another way of prioritizing outcomes.{' '}
              <a href="https://zapier.com/blog/how-to-prioritize/" target="_blank">
                "In the effort-impact matrix, you evaluate tasks based on how
                much effort they'll require to complete and the impact that
                completing them will have."
              </a>
              The items in the left quadrants, which are both "More Impact", are
              where you would start to work on tasks from, depending on whether
              you are prepared for low or high effort.
            </div>
            <div className="guidebook-separate-line">
              In complex projects as the number of outcomes (and sometimes number
              of team members) expands, it gets more difficult to determine
              'what to focus on next'.
            </div>
            <div className="guidebook-separate-line">
              All the team members (who have editing permssion) would be able to
              "weigh in" their vote for these 4 factors for each outcome (either in
              map view or priority view) The "aggregated priority" that results
              from this collective poll will determine where each outcome will
              stand on the priority view mode.
            </div>
            <div className="guidebook-separate-line guidebook-description-bold">
              If you have a diverse team and not sure if everyone is having a
              shared understing of what each of these priority factors mean, we
              recommend having an onboarding meeting/session with your team
              members to develop a shared understanding of each factor in the
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
            finding and filtering by a specific outcome. By selecting that outcome you
            would be able to filter the visiblity of the outcomes down to only the
            childern of that selected outcome on the priority quadrants.
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
            important and impact x effort), single priority factors (feature in
            developement), or uncategorized (not voted on) outcomes. This gives you
            the flexibility to take action based on a specific factor
            determining a outcome's priority.
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
            If you haven't voted for the priority of the outcome, When hovering
            over outcomes in the priority view, "Weigh In" button apprears.
          </div>
          <div className="guidebook-description-section">
            If you have already voted for the priority of a outcome, a purple dot
            shows up under the outcome title and when hovering on the outcome, "See My
            Vote" button appears.
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
              Click on "priority" button. You will be able to see the aggregated
              votes for 4 factors that determine priority of the card. For more
              information on how the prioritization system works in Acorn see
              Prioritization.
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
              Click on the Hierarchy icon from the Multi Edit Bar. Please note,
              this function will override all the existing settings for
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
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">
              In Multi Edit Mode
            </div>
            <div className="guidebook-separate-line">
              Click on the Priority icon from the Multi Edit Bar. Then Click on
              the "Weigh In" button.
            </div>
          </div>
        </ol>
      ),
    },
  ],
}
