import * as d3 from 'd3'

const renderRedlining = (map) => {
  d3.select('#propPopup').remove()
  d3.select('#blockPopup').remove()
  d3.select('.legend').remove()
  map.setPaintProperty('propBlackLayer', 
    'fill-opacity',
    1)
  const legend = d3.select('body').append('div')
    .attr('class', 'legend')
    .html('<b>Percent Black</b>')
    .node()
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

  map.on('mousemove', (e) => {
    map.setFilter('holcLayer', 
      ['<=', ['get', 'x'], 
        e.lngLat.lng])
  })
    .setMinZoom(11.5)
}

export default renderRedlining
