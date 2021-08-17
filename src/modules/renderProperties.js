import * as d3 from 'd3'
import mapboxgl from 'mapbox-gl'

const renderProperties = (map) => {
  console.log(map.getPaintProperty('propBlackLayer', 'fill-opacity'))
  d3.select('canvas.container').style('display', 'none') // double-check for pointer clicks
  d3.select('.mapboxgl-canvas')
    .transition()
    .duration(1500)
    .style('opacity', 1)
  map.setPaintProperty('og-geometries', 
    'fill-opacity',
    1)

  map.easeTo({
    duration: 250,
    zoom: 13,
    center: [-72.931, 41.31099],
  })

  map.on('click', 'og-geometries', propertyClick)
    .on('click', 'propertyBlockLayer', propertyBlockClick)
    .on('zoom', function() {
      if (map.getZoom() < 13) {
        d3.selectAll('#propPopup').remove()
      } else {
        d3.selectAll('#blockPopup').remove()
      }
    })

  const legend = d3.select('body').append('div')
    .attr('class', 'legend')
    .html('<b>Property Value</b>')
    .node()
  const layers = ['$0', '$50,000', '$75,000', '$150,000',
    '$250,000', '$500,000', '$800,000', '$1,000,000+']
  const colors = ['#150E37', '#481078', '#7B2382', '#B0357B',
    '#E34E65', '#FB845F', '#FEC185', '#FCFDBF']
  // the mapbox-given way to make a legend
  // wait hwo does this know to append to .map-overlay? I mean I guess it works? so confused
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

  function propertyClick(e) {
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(e.features[0].properties.label)
      .addTo(map)

    d3.selectAll('.mapboxgl-popup-content')
      .attr('id', 'propPopup')
  }

  function propertyBlockClick(e) {
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML('<b>Mean value: ' +
          e.features[0].properties.print_value +
          '</b><br>Zoom in to get building-level information.')
      .addTo(map)

    d3.selectAll('.mapboxgl-popup-content')
      .attr('id', 'blockPopup')
  }
}

export default renderProperties
