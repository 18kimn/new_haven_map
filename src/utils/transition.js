import * as d3 from 'd3'
import displayText from './displayText.js'

import renderIntro from '../modules/renderIntro.js'
import renderProperties from '../modules/renderProperties.js'
import renderRedlining from '../modules/renderRedlining.js'
import renderGrid from './../modules/renderGrid.js'
// import renderWorld from './../modules/renderWorld.js'

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
  {selectors: ['.nhv-blocks', 'canvas.container'], 
    render: renderIntro},
  {selectors: ['.legend', '#propPopup', '#blockPopup'], 
    layers: ['og-geometries', 'propertyBlockLayer'],
    render: renderProperties},
  {layers: ['propBlackLayer' ], render: renderRedlining},
  {selectors: ['.legend'], layers: ['gridVideoLayer'], render: renderGrid},
]

const outro = (map, params) => {
  const {selectors, layers} = params
  selectors?.map((selector) => d3.selectAll(selector).transition().duration(1500).style('opacity', 0))
  layers?.map((layer) => {
    const type = map.getLayer(layer).type
    map.setPaintProperty(layer, `${type}-opacity`, 0)
  })
}

// from, to: index of the map stage that should be transitioned to and from, respectively
// to is defaulted to the next map as specified by transitionInfo, but can really be any map
const transitionMap = (map, from, to) => {
  console.log({from, to})
  // if we should transition from a defined state, do this
  if (from > -1) {
    outro(map, transitionInfo[from])
  } 

  // if we shoudl transition to a defined state, do this
  if (to <= transitionInfo.length && to > -1) {
    transitionInfo[to].render(map)
    displayText(to)

    // make buttons to transition backwards and forwards from the new map state
    d3.selectAll('.backButton') 
      .on('click', null)
      .on('click', () => transitionMap(map, to, to - 1))
    d3.selectAll('.nextButton') 
      .on('click', null)
      .on('click', () => transitionMap(map, to, to + 1))
  }
}

export default transitionMap
