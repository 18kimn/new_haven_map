import * as d3 from 'd3'


const renderGrid = (map) => {
  d3.select('.legend').transition()
    .style('opacity', 0).remove()
  const coords = map.getSource('gridVideoSource').coordinates
  const bounds = [coords[3], coords[1]]

  map.easeTo({
    center: [-72.975, 41.3010],
    zoom: 11.5, // fitbounds doesnt work well for some reason
  }).setMaxBounds(bounds)
    .setPaintProperty('gridVideoLayer', 'raster-opacity', 1)
  const video = map.getSource('gridVideoSource').getVideo()
  video.currentTime = 0
  video.play()
  const pauseMiddle = () => {
    if (video.currentTime >= 2) {
      video.pause()
      video.removeEventListener('timeupdate', pauseMiddle)
    }
  }
  video.addEventListener('timeupdate', pauseMiddle)
  const cleanup = () => {
    video.play()
  }
  return cleanup
}

export default renderGrid
