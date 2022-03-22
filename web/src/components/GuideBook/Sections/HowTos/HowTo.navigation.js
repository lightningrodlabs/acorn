import React from 'react'

export default {
  title: 'Navigation',
  submenu: [
    {
      title: 'Pan around in Map View Mode',
      guide_id: 'pan_around',
      description: (
        <ol>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">Trackpad</div>
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
            <div className="guidebook-separate-line sub-heading">Trackpad</div>
            <div className="guidebook-separate-line">
              Zoom by pinching in and out
            </div>
          </div>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">Mouse</div>
            <div className="guidebook-separate-line">
              {/* Use the mouse wheel while holding Ctrl/Cmd to zoom in and out */}
              Click on the "-" and "+" icons on Map View Mode. They are located
              at the bottom right corner of the Map View Mode.
            </div>
          </div>
          <div className="guidebook-description-section">
            <div className="guidebook-separate-line sub-heading">
              Current Zoom
            </div>
            <div className="guidebook-separate-line">
              The number next to the "-" and "+" icons in the bottom right
              corner of the Map View Mode represents the current level of zoom.
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
              Use the Priority View icon and Map View icon in the bottom right corner of
              the screen to switch between the two views.
            </div>
          </div>
          {/* TODO: show this instruction when the locate card on view mode gets built */}
          {/* <div className='guidebook-description-section'>
            <div className='guidebook-separate-line sub-heading'>
              Locating a specific card in a different view mode
            </div>
            <div className='guidebook-separate-line'>
              You can also locate a selected outcome card from the map view on
              priority view by selecting on the priority view icon in priority
              pop-up, and vice versa: you can locate a selected card on
              priority view to the Map view.
            </div>
          </div> */}
        </ol>
      ),
    },
  ],
}
