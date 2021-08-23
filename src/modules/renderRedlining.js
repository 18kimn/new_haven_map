import * as d3 from 'd3'

const renderRedlining = (map) => {
  d3.select('#propPopup').remove()
  d3.select('#blockPopup').remove()
  d3.select('.legend').remove()

  d3.select('.mapboxgl-canvas')
    .transition()
    .duration(1000)
    .style('opacity', 1)

  map.setPaintProperty('propBlackLayer',
    'fill-opacity',
    1).easeTo({
    duration: 250,
    zoom: 13,
    center: [-72.931, 41.31099],
  })

  const features = map.querySourceFeatures('holcSource', {
    sourceLayer: 'holc-7f9p3ps',
  })
  console.log(features)
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
    const ids = 1
    // map.setFeatureState({
    //   source: 'holc-7f9p3p',
    //   id: featureID,

    // })
    // map.setFilter('holc',
    //   ['<=', ['get', 'x'],
    //     e.lngLat.lng])
  })
    .setMinZoom(11.5)
}

export default renderRedlining
