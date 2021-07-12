import * as d3 from 'd3'

const renderGrid = (map) => {
  storyText.text('Map 3: New Haven properties, arranged into a grid by size. Explanatory text will eventually go here.')
  nextButton.html("<button onclick='renderIndigenous()'>Click to move on.</button>")
  d3.select('#legend').transition().duration(1000).style('opacity', '0').remove()

  map.setMaxBounds([[-73.15045804423596, 41.25110810421933],
    [-72.76211186878697, 41.38281736836447]])
      .fitBounds([[-73.15045804423596, 41.25110810421933],
        [-72.76211186878697, 41.38281736836447]], {
        duration: 1000,
      })

  video = map.getSource('gridVideoSource').getVideo()
  video.currentTime = 0
  // our new strategy is to render a mapbox video :D
  timer = d3.timer((elapsed) => {
    t = d3.easeCubic(elapsed / 3500)

    // play a fraction of the video just to get it to look right (idk how to get it to appear loaded at the beginning)
    if (video.currentTime < 0.1) { // but there has to be a better way to load and stop at the first frame...
      // just setting currentTime to 0 or running a single iteration of video.play() and video.pause() doesn't work..?
      video.play()
    } else if (elapsed < 1000) { // .28 is when the 1000ms zoomout animation ends
      video.pause()
    } else if (elapsed > 1000 && video.currentTime < 2.5) {
      // just make sure the pait properties finish correctly
      map.setPaintProperty('gridVideoLayer', 'raster-opacity', 1)
          .setPaintProperty( 'settlement-subdivision-label', 'text-opacity', 0)
          .setPaintProperty('propBlackLayer', 'fill-opacity', 0)
          .setPaintProperty('holcLayer', 'fill-opacity', 0)
      video.play()
    } else if (video.currentTime > 2.5) {
      video.pause()
      timer.stop()
    }
    // fade out the other map layers and fade in the grid layer
    if (t < 0.2858) {
      map.setPaintProperty('gridVideoLayer', 'raster-opacity', t * 3.5)
          .setPaintProperty( 'settlement-subdivision-label', 'text-opacity', 1-3.5*t)
          .setPaintProperty('propBlackLayer', 'fill-opacity', 1-3.5*t)
          .setPaintProperty('holcLayer', 'fill-opacity', 1-3.5*t)
    }
  })
}

export default renderGrid
