import * as d3 from 'd3'

const renderGrid = (map) => {
  d3.select('.legend').transition().duration(1000)
    .style('opacity', '0').remove()
  const coords = map.getSource('gridVideoSource').coordinates
  const bounds = [coords[3], coords[1]]
  map.setMaxBounds(bounds)
    .fitBounds(bounds, {duration: 1000})

  const video = map.getSource('gridVideoSource').getVideo()
  video.currentTime = 0
  map.setPaintProperty('gridVideoLayer', 'raster-opacity', 1)
}

export default renderGrid
