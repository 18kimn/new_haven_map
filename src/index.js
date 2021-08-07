/* previously this was a giant file containing code for every map and coming in at some 900 lines
that technically worked but global scope was so polluted. So I split each map into functions exported by their own modules,
with each module receiving one input (the map) and having access to no other global variables.

This forces me to elimninate all but the strictly, strictly necessary global variables. It involves some minor violation of the DRY principle
but for overall increased readability.
*/
import * as d3 from 'd3'
import mapboxgl from 'mapbox-gl'
import './index.css'
import renderIntro from './modules/renderIntro.js'

mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/nathanckim18/ckmvgk5g10i8017mv4fmwme8j',
  minZoom: 11.5,
  maxZoom: 16.5,
  zoom: 13,
  center: [-72.931, 41.31099],
  maxBounds: [
    [-73.21036, 41.22615],
    [-72.74838, 41.39701],
  ],
})

map.on('load', () => {
  map.addSource('gridVideoSource', {
    'type': 'video',
    'urls': ['assets/grid.mp4'],
    'coordinates': [
      [-73.130985, 41.392116],
      [-72.706979, 41.393416],
      [-72.705430, 41.212327],
      [-73.130295, 41.213888],
    ],
  }).addLayer({
    'id': 'gridVideoLayer',
    'type': 'raster',
    'source': 'gridVideoSource',
    'paint': {
      'raster-opacity': 0,
    },
  }, 'settlement-subdivision-label')

  map.on('sourcedata', (e) => {
    if (e.sourceId === 'gridVideoSource' && e.isSourceLoaded === true) {
      map.getSource('gridVideoSource').getVideo().loop = false
    }
  })
  // moves mapbox attribution to the bottom left
  const attr = d3.selectAll('.mapboxgl-ctrl-attrib,.mapboxgl-ctrl-logo').nodes()
  const attrDiv = d3.selectAll('.attribution').node()
  attrDiv.appendChild(attr[0])
  attrDiv.appendChild(attr[1]) // there must be a better way to do this?
  d3.selectAll('.mapboxgl-ctrl.mapboxgl-ctrl-attrib,.mapboxgl-ctrl-logo')
    .transition().duration(1500).style('opacity', 1)
})

renderIntro(map)
