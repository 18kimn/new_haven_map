import * as d3 from 'd3'
import posts from '../assets/text/posts.json'

import renderIntro from './renderIntro.js'
import renderProperties from './renderProperties.js'
import renderRedlining from './renderRedlining.js'
import renderGrid from './renderGrid.js'
import renderIndigenous from './renderIndigenous.js'
import renderWorld from './renderWorld.js'

// parameters and a function to generically transition from one map to another

/* each map has some things they should do on an intro:
  -- show some layers or selections
  -- run a render* function

  and some things they should do on an outro:
  -- hide some layers or selections
  -- bring in a new map

  This handles those.
*/

const transitionInfo = [
  {selectors: ['.nhv-blocks'],
    render: renderIntro},
  {selectors: ['.legend', '#propPopup', '#blockPopup'],
    layers: ['og-geometries', 'propertyBlockLayer'],
    render: renderProperties},
  {layers: ['propBlackLayer'], render: renderRedlining},
  {selectors: ['.legend'],
    layers: ['gridVideoLayer'],
    render: renderGrid},
  {selectors: ['.mapboxgl-canvas-container > svg'],
    render: renderIndigenous},
  {render: renderWorld},
]

const outro = (map, params) => {
  const {selectors, layers} = params
  selectors?.map((selector) => d3.selectAll(selector).transition().duration(1500).style('opacity', 0))
  layers?.map((layer) => {
    const type = map.getLayer(layer).type
    map.setPaintProperty(layer, `${type}-opacity`, 0)
  })
}

let cleanup = () => {}
let from = -1
const transitionMap = (map, to) => {
  // if we should transition from a defined state, do this
  if (from > -1) {
    cleanup && cleanup() //
    outro(map, transitionInfo[from])
  }

  // if we shoudl transition *to* a defined state, do this
  if (to <= transitionInfo.length && to > -1) {
    from = to
    cleanup = transitionInfo[to].render(map)
    d3.selectAll('.story-body')
      .property('scrollTop', 0)
      .html(posts[to])

    // make buttons to transition backwards and forwards from the new map state
    d3.selectAll('.backButton')
      .on('click', null)
      .on('click', () => transitionMap(map, to - 1))
    d3.selectAll('.nextButton')
      .on('click', null)
      .on('click', () => transitionMap(map, to + 1))
  }
}

export default transitionMap
