import React from 'react'

export default {
  title: 'Connections',
  submenu: [
    {
      title: 'Create a child card',
      guide_id: 'create_a_child',
      description: (
        <ol>
          <li>Hover over the card you want to be the parent.</li>
          <li>
            Click and drag on the purple dot that appears just below the card.
          </li>
          <li>
            Drag your mouse to an empty area of the canvas, then release your
            mouse. An empty card will appear.
          </li>
          <li>Type in a title for the child card.</li>
          <li>
            {' '}
            Press Enter or click anywhere outside the card to finish creating
            the card. It will automatically re-arrange its position in order to
            maintain organization.
          </li>
        </ol>
      ),
    },
    {
      title: 'Create a parent card',
      guide_id: 'create_a_parent',
      description: (
        <ol>
          <li>Hover over the card you want to be the child.</li>
          <li>
            Click and drag on the purple dot that appears just above the card.
          </li>
          <li>
            Drag your mouse to an empty area of the canvas, then release your
            mouse. An empty card will appear.
          </li>
          <li>Type in a title for the parent card.</li>
          <li>
            {' '}
            Press Enter or click anywhere outside the card to finish creating
            the card. It will automatically re-arrange its position in order to
            maintain organization.
          </li>
          <li>
            {/* ASSUMPTION: one parent */}
            There only can be one parent for any child at a time. If there is an
            existing parent, adding a new parent to the card would replace that
            outcome as parent.
          </li>
        </ol>
      ),
    },
    {
      title: 'Connect two existing cards',
      guide_id: 'connect-two-existing-cards',
      description: (
        <ol>
          <li>
            Hover over the first card you want to be the child or parent. Two
            purple dots will appear just below and above the card.
          </li>
          <li>
            If you want to make the card a child card, click and drag on the
            purple dot that appears just above the card.
          </li>
          <li>
            If you want to make the card a parent card, click and drag on the
            purple dot that appears just below the card.
          </li>
          <li>
            Drag your mouse till you hover over the card you wish to connect,
            then release your mouse. A new connection will appear and the tree
            will re-arrange itself to maintain organization.
          </li>
          <li>
            {/* ASSUMPTION: one parent */}
            In Acorn, if a card is already a child of another card, you won't be
            able to add another parent to it. If you wish to change its parent,
            you'd need to remove the existing connection first.
          </li>
        </ol>
      ),
    },
    {
      title: 'Connect multiple',
      guide_id: 'connect-multiple',
      description: (
        <div className="guidebook-description-section">
          <div className="guidebook-separate-line">
            If you would like to connect multiple cards to another card at once,
            you can use the Connector feature in Multi Edit Mode:
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
                select the parent card of your choice. For the "Children" choose
                the card(s) that you want connected to the chosen parent card.
              </li>
              <li>
                3. Click Preview to see how the new connection will look like on
                the map. If happy with the results, click on "Save Changes".
              </li>
            </ol>
            <b>
              Please note, the availablity of these selections depend on
              existing realtionship(s) of your selected cards. You might need to
              remove some existing connections first, to comply with the
              one-parent-only rule in Acorn.
            </b>
          </div>
        </div>
      ),
    },
    {
      title: 'Delete Connection',
      guide_id: 'delete-connection',
      description: (
        <>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line">
              If you would like to delete a connection:
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
}
