import * as d3 from 'd3'

const renderRedlining = (map) => {
  d3.select('#propPopup').remove()
  d3.select('#blockPopup').remove()
  d3.select('.legend').remove()

  const legend = d3.select('body').append('div')
    .attr('class', 'map-overlay')
    .attr('id', 'legend')
    .html('<b>Percent Black</b>')
  const layers = ['0%', '10%', '20%', '30%', '40%', '50%',
    '60%', '70%', '80%', '90%']
  const colors = ['#440154', '#482878', '#3E4A89', '#31688E', '#26828E', '#35B779', '#6DCD59', '#B4DE2C', '#FDE725']

  // the mapbox-given way to make a legend
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i]
    const color = colors[i]
    const item = document.createElement('div')
    const key = document.createElement('span')
    key.className = 'legend-key'
    key.style.backgroundColor = color

    const value = document.createElement('span')
    value.innerHTML = layer
    item.appendChild(key)
    item.appendChild(value)
    legend.appendChild(item)
  }


  const timer = d3.timer((elapsed) => {
    t = Math.min(Math.max(d3.easeCubic(elapsed / 750), 0), 1) // represents time, sort of
    map.setPaintProperty('og-geometries', 'fill-opacity', 1 - t)
      .setPaintProperty('propertyBlockLayer', 'fill-opacity', 1 - t)
      .setPaintProperty('propBlackLayer', 'fill-opacity', t)
    if (t == 1) {
      timer.stop()
    }
  })

  map.off('click', 'og-geometries', propertyClick)
    .off('click', 'propertyBlockLayer', propertyBlockClick)
    .on('mousemove', () => map.setFilter('holcLayer', ['<=', ['get', 'x'], e.lngLat.lng]))
    .setMinZoom(11.5)
}

export default renderRedlining
