import * as d3 from 'd3'
import mapboxgl from 'mapbox-gl'

const renderProperties = (map) => {
  // eslint-disable-next-line max-len

  map.on('click', 'og-geometries', propertyClick)
      .on('click', 'propertyBlockLayer', propertyBlockClick)
      .on('zoom', function() {
        if (map.getZoom() < 13) {
          d3.selectAll('#propPopup').remove()
        } else {
          d3.selectAll('#blockPopup').remove()
        }
      })
  storyText.text('Map 1: New Haven properties, colored by value. Explanatory text will eventually go here.')
  nextButton.html("<button onclick='renderRedlining()'>Click to move on.</button>")

  d3.select('body').append('div')
      .attr('class', 'map-overlay')
      .attr('id', 'legend')
      .html('<b>Property Value</b>')
  const layers = ['$0', '$50,000', '$75,000', '$150,000',
    '$250,000', '$500,000', '$800,000', '$1,000,000+']
  const colors = ['#150E37', '#481078', '#7B2382', '#B0357B',
    '#E34E65', '#FB845F', '#FEC185', '#FCFDBF']

  // the mapbox-given way to make a legend
  // wait hwo does this know to append to .map-overlay? I mean I guess it works? so confused
  for (i = 0; i < layers.length; i++) {
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

  d3.selectAll('.mapboxgl-popup-content').attr('id', 'blockPopup')
}

export default renderProperties
