/* previously this was a giant file containing code for every map and coming in at some 900 lines
that technically worked but global scope was so polluted. So I split each map into functions exported by their own modules,
with each module receiving one input (the map) and having access to no other global variables.

This forces me to elimninate all but the strictly, strictly necessary global variables. It involves some minor violation of the DRY principle
but for overall increased readability.
*/
import * as d3 from 'd3'
import mapboxgl from 'mapbox-gl'
import './index.css'
import transitionMap from './modules/transitionMap.js'
import makeMenu from './modules/Menu.js'

mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/nathanckim18/ckmvgk5g10i8017mv4fmwme8j/draft',
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
  }).addSource('holcSource', {
    type: 'vector',
    url: 'mapbox://nathanckim18.7vb6owli',
  }).addLayer({ // doing this for feature state usage
    // feature state is a performative update of data at runtime, which
    // we want since we want to show some features and hide others
    // depending on where the user mouse is
    'id': 'holc',
    'type': 'fill',
    'source': 'holcSource',
    'source-layer': 'holc-7f9p3p',
    'layout': {'visibility': 'none'},
    'paint': {
      'fill-color': [
        'match',
        ['get', 'holc_grade'],
        ['A'], '#608457',
        ['B'], '#699dad',
        ['C'], '#bbb865',
        ['D'], '#c27c8d',
        '#000000',
      ],
      'fill-opacity': [
        'case', ['boolean', ['feature-state', 'mousedPast'], false],
        1, 0,
      ],
    },
  })

  map.on('sourcedata', (e) => {
    if (e.sourceId === 'gridVideoSource' && e.isSourceLoaded) {
      const video = map.getSource('gridVideoSource').getVideo()
      video.loop = false
      video.autoplay = false
    }
  })

  // moves mapbox attribution to the bottom left
  const attr = d3.selectAll('.mapboxgl-ctrl-attrib,.mapboxgl-ctrl-logo').nodes()
  const attrDiv = d3.selectAll('.attribution').node()
  attrDiv.appendChild(attr[0])
  attrDiv.appendChild(attr[1]) // there must be a better way to do this?
  d3.selectAll('.mapboxgl-ctrl.mapboxgl-ctrl-attrib,.mapboxgl-ctrl-logo')
    .transition().duration(1500).style('opacity', 1)

  transitionMap(map, 0)
  makeMenu(map)
})
