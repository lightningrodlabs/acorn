Folders:

- Redux
  - Holochain Actions/Reducers
    - agents
    - outcomes
    - connections
    - outcome-members
    - who-am-i
  - UI only Actions/Reducers
    - outcome-form
    - hover
    - keyboard
    - mouse
    - screensize
    - selection
    - viewport
- React
  - components
  - routes
- HTML5 Canvas
  - drawing
- Keyboard, Mouse, and Screen Event Listeners
  - event-listeners
    - These should be "broken out" into separate files, rather than all stuck in here together, but all these event listeners get set up when the page first loads.

Folders are, in general, organized according to “features”, which relates to slices of the redux state. Such as “keyboard”.
Within the “keyboard” folder is “actions.js” which defines the action types, and “action creators” for those action types
https://redux.js.org/basics/actions#action-creators
Also within “keyboard” is “reducer.js” which defines the reducer which acts as the primary handler for those actions.

Heavy use of “spread” (…) operators in reducers is used, to give immutability: https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns#immutable-update-patterns

Installing redux dev-tools is highly recommended, to inspect the state and actions and see how the app behaves.
https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd

All the reducers from the different folders are combined in src/reducer.js

The aspects of redux which interact asynchronously with Holochain, use a library called “hc-redux-middleware”
https://www.npmjs.com/package/connoropolous-hc-redux-middleware

---

HTML5 Canvas drawing

The folder where this all happens is `drawing`.

`drawing/index.js` exports a `render` function which is the main one. It handles the drawing of everything from the redux state, onto the Canvas. A new paint occurs every time the redux state is udpated. It is very fast, so performance is not an issue. In order to repaint, first it clears what was drawn on the Canvas, then paints everything fresh.

Canvas is fairly easy to work with. Great resources for it can be found at MDN: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API.

It uses other functions from the folder such as `drawOutcome` `drawConnection`, etc. Files with `draw` in their name are for painting elements to the Canvas.

Because of "zooming and panning" features, there are two coordinate systems that we need to deal with. The regular coordinate system of the browser window, which appear in browser events like clicks and mousemove, etc. Then there's the zoomed and panned coordinate system of the Canvas. `coordinateSystems.js` has functions for converting from either one to the other. Internally it uses Matrix math to handle the conversion.

`layoutFormula.js` contains the 'auto-layout' algorithm that determines that layout the of the Outcomes on the screen.

`eventDetection.js` is used to check whether mousemove events, and mouseclick events occur "over" an Outcome so that we can change and update the UI, with hover states, or selection.

---

This is a sample snapshot of the redux state

```
{

This entire part (agents, outcomes, connections, outcomeMembers, whoami) of the redux state is data from Holochain

Agents are essentially the “users”. More data needs to be fetched from Holochain and stored here

  agents: [
    'HcSciGpYDHTaa5dmw583AO7Jy9kHz9K3gu6MtTsB8Nwbfe3y3hD8rOb9aj5B8za'
  ],

“Outcomes” are the primary content type of the app. They’re fetched from Holochain and stored and updated here in the state

  outcomes: {
    QmacZTkPm6qNf7sHFuHa8HEg8EPVJ6kcBi4ZyHLr1JrVCN: {
      content: 'Rapid Sensemaking Framework is online and being used everyday',
      creator_agent_pub_key: 'HcSciGpYDHTaa5dmw583AO7Jy9kHz9K3gu6MtTsB8Nwbfe3y3hD8rOb9aj5B8za',
      unix_timestamp: 1571690582945,
      hierarchy: 'Branch',
      status: 'Uncertain',
      address: 'QmacZTkPm6qNf7sHFuHa8HEg8EPVJ6kcBi4ZyHLr1JrVCN'
    },
    QmcHbFkCauYVDBodKu2N1qWr7RNYAet9k7Vd9MC8YwYb4f: {
      content: 'Expression of interest for a grant is made',
      creator_agent_pub_key: 'HcSciGpYDHTaa5dmw583AO7Jy9kHz9K3gu6MtTsB8Nwbfe3y3hD8rOb9aj5B8za',
      unix_timestamp: 1571690614733,
      hierarchy: 'Branch',
      status: 'Uncertain',
      address: 'QmcHbFkCauYVDBodKu2N1qWr7RNYAet9k7Vd9MC8YwYb4f'
    }
  },

Connections are the links between outcomes, that define a hierarchy in the data

  connections: {
    QmPQCB3Ke58RGnGXRmQagLAtvh9AToa84zgDMM3QybY5mq: {
      parent_header_hash: 'QmacZTkPm6qNf7sHFuHa8HEg8EPVJ6kcBi4ZyHLr1JrVCN',
      child_header_hash: 'QmcHbFkCauYVDBodKu2N1qWr7RNYAet9k7Vd9MC8YwYb4f',
      address: 'QmPQCB3Ke58RGnGXRmQagLAtvh9AToa84zgDMM3QybY5mq'
    },
    QmdH3ZHPYMUsqzMQQzZfTD4NHjdnJfCbwjMoacRJzAB76q: {
      parent_header_hash: 'QmcHbFkCauYVDBodKu2N1qWr7RNYAet9k7Vd9MC8YwYb4f',
      child_header_hash: 'QmbqbF2dBdZBdzQkHaX8zneCfkMz9GU3i1hYgiDCnDmjbC',
      address: 'QmdH3ZHPYMUsqzMQQzZfTD4NHjdnJfCbwjMoacRJzAB76q'
    }
  },

Outcome Members are associations between “agents” and “outcomes”, that relate to who has claimed/assigned to which Outcomes

  outcomeMembers: {},

Whoami is information about the local authenticated user

  whoami: {
    dna_address: 'QmTVA7eBGDZ3bg3PYDqDN9voJ267XH3aWwRh8jWy3eXtAe',
    dna_name: 'Acorn',
    agent_id: {
      nick: 'testAgent',
      pub_sign_key: 'HcSciGpYDHTaa5dmw583AO7Jy9kHz9K3gu6MtTsB8Nwbfe3y3hD8rOb9aj5B8za'
    },
    agent_address: 'HcSciGpYDHTaa5dmw583AO7Jy9kHz9K3gu6MtTsB8Nwbfe3y3hD8rOb9aj5B8za'
  },

This entire part of the state is client side only, it has no persistence or relation to Holochain

  ui: {

The UI element that allows users to create a new Outcome

    outcomeForm: {
      editAddress: null,
      parentActionHash: null,
      content: '',
      isOpen: false,
      leftConnectionXPosition: 0,
      topConnectionYPosition: 0
    },

Which outcomes are currently selected

    selection: {
      selectedOutcomes: []
    },

Which outcome is currently hovered over

    hover: {
      hoveredOutcome: null
    },

Which relevant keyboard keys are pressed

    keyboard: {
      shiftKeyDown: false,
      gKeyDown: false
    },

What’s the size of the screen (needs to update on resize)

    screensize: {
      width: 914,
      height: 1906
    },

Relating to the HTML5 Canvas element, how has the “viewport” been “panned” (translated) and “zoomed” (scaled)

    viewport: {
      translate: {
        x: 475.2022418640423,
        y: 174.46835450717361
      },
      scale: 0.44932896411722334
    },

Is the mouse currently being pressed (left/dominant click)

    mouse: {
      mousedown: false
    }
  }
}
```
