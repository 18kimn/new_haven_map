import * as d3 from 'd3'
import mapboxgl from 'mapbox-gl'

// parameters and a function to generically transition from one map to another

/* each map has some things they should do on an intro: 
  -- show some layers or selections
  -- ease to a zoom spot or center 
  -- run a render* function

  and some things they should do on an outro: 
  -- hide some layers or selections
  -- do the intro for a new map 

  some exceptions exist: 
  -- for map 1, how do we stop timers? 
    -- timer parameter lol
  -- for the last map, how do we tween into and out of the projections? 
    -- pass a projection in the last transitionInfo element
    -- projectionTween tweens between a mapbox projection and that projection, and is called conditionally (only if at least one projection is specified)
*/ 
const transitionInfo = [
  {selections, timers, layers, easeTo, render},
  {},
  {},
  {},
]

const projectionTween = () => {

}

const outro = (params) => {

}


const transition = (from, to = from - 1) => {

}

export default transition
