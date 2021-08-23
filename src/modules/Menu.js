import * as d3 from 'd3'

import transitionMap from './transitionMap.js'

const menuItems = [
  {name: 'Intro'},
  {name: 'Properties'},
  {name: 'Redlining'},
  {name: 'Grid'},
  {name: 'Native Land'},
  {name: 'Global Disposession'},
]

const makeMenu = (map) => {
  const menu = d3.select('#overlay')
    .append('div')
    .attr('id', 'menu')

  menuItems.map((item, i) => {
    d3.select('#menu')
      .append('div')
      .attr('class', 'menuItem')
      .text(item.name)
      .on('click', () => transitionMap(map, i))
  })
}


export default makeMenu
