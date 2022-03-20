import React from 'react'

export default {
  title: 'Vote Based Priority Mode',
  submenu: [
    {
      title: 'Introduction',
      guide_id: 'introduction_vote_based_priority_mode',
      description: (
        <ol>
          <li>
            Priority View is an alternative view mode to the Map View,
            specifically designed for helping you and your team with decision
            making on priority of the outcomes that you set on the map.
          </li>
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
              </a>{' '}
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
      title: 'Switch to this mode',
      guide_id: 'switch_to_vote_based',
      description: (
        <ol>
          <li>
            If you're looking at the dashboard, open up the project settings by
            clicking on the three dots settings icon of the project.
          </li>
          <li>
            If you're working in a project, open up the project settings by
            clicking on the Gear settings icon next to the project title in the
            top left corner of the screen.
          </li>
          <li>Click on the 'Vote Based' option to select it.</li>
          <li>Click the 'Update' button.</li>
          <li>
            This will change both how card based priority selection works, as
            well as how the Priority View tab functions and looks.
          </li>
          <li>
            You can switch between Vote Based and Universal modes without data
            loss at any time.
          </li>
        </ol>
      ),
    },
    {
      title: 'Indented Tree View',
      guide_id: 'vote_based_indented_tree_view',
      description: (
        <ol>
          <div className="guidebook-description-section">
            This column on the left hand side of the Priority View helps you
            with finding and filtering by a specific outcome. By selecting that
            outcome you are able to filter the visiblity of the outcomes down to only
            the children of that selected outcome on the priority quadrants.
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
            development), or uncategorized (not voted on) outcomes. This gives you
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
            If you haven't voted for the priority of the outcome, when hovering
            over outcomes in the Priority View, a "Weigh In" button appears.
          </div>
          <div className="guidebook-description-section">
            If you have already voted for the priority of a outcome, a purple dot
            shows up under the outcome title and when hovering on the outcome, "See My
            Vote" button appears.
          </div>
        </ol>
      ),
    },
  ],
}
