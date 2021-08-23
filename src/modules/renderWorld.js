/* eslint-disable no-invalid-this */
import * as d3 from 'd3'
// to be used when transitioning to the last map
/*
function projectionTween(projection0, projection1) { // taken from https://bl.ocks.org/alexmacy/6700d44240d2b6d3ec9767a5a5854e42 and https://bl.ocks.org/mbostock/3711652
  return function(d) {
    let t = 0
    const projection = d3.geoProjection(project)
        .scale(1)
        .translate([width / 2, height / 2])
    const path = d3.geoPath(projection)
    function project(λ, φ) {
      λ *= 180 / Math.PI, φ *= 180 / Math.PI
      const p0 = projection0([λ, φ]); const p1 = projection1([λ, φ])
      return [(1 - t) * p0[0] + t * p1[0], (1 - t) * -p0[1] + t * -p1[1]]
    }
    return function(_) {
      t = _
      return path(d)
    }
  }
}
*/


const zoomer = (event) => {
  svg
    .selectAll('path') // To prevent stroke width from scaling
    .transition().duration(50)
    .attr('transform', event.transform)
  svg
    .selectAll('circle') // To prevent stroke width from scaling
    .transition().duration(50)
    .attr('transform', event.transform)

  if (tooltip.style('opacity') === '0.9') {
    currentX = Number(tooltip.style('left').split('px')[0])
    currentY = Number(tooltip.style('top').split('px')[0])
    newX = currentX * event.transform.k + event.transform.x
    newY = currentY * event.transform.k + event.transform.y
    tooltip.transition().duration(50)
      .style('left', newX + 'px')
      .style('right', newY + 'px')
  }
}
const zoom = d3.zoom()
  .scaleExtent([0.1, 8])
  .on('zoom', zoomer)
function renderWorld(map) {
  const width = window.innerWidth
  const height = window.innerHeight

  d3.select('.mapboxgl-canvas-container')
    .transition().style('opacity', 0)
  d3.select('#map > svg')
    .style('pointer-events', 'auto')
    .call(zoom)

  const project = d3.geoOrthographic()
    .translate([width / 2, height / 2])
    .scale(width / 3)
  const path = d3.geoPath().projection(project)
  const graticule = d3.geoGraticule()
    .step([10, 10])

  const svg = d3.select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('pointer-events', 'none')
  const bgd = svg.append('rect')
    .attr('class', 'bgd')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('opacity', 0)
  const rotationConfig = {
    speed: 0.006,
    verticalTilt: -15,
    horizontalTilt: -15,
  }

  svg.append('path')
    .datum({type: 'Sphere'})
    .attr('id', 'outline')
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', '1')
    .attr('d', path)

  svg.selectAll('path.countries')
    .data(files[5].features)
    .enter()
    .append('path')
    .attr('class', 'countries')
    .attr('d', path)
    .style('stroke', 'black')
    .style('stroke-width', 1)
    .style('fill', 'none')


  svg.selectAll('path.graticule')
    .data([graticule()])
    .enter().append('path')
    .attr('d', path)
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .style('stroke-opacity', '0.5')
    .attr('stroke-width', '0.3')
    .attr('d', path)

  const connections = svg.selectAll('path.connections')
    .data(files[6])
    .enter().append('path')
    .attr('d', function(d) {
      return path({type: 'LineString',
        coordinates: [[d.xlon, d.ylat], [-72.927887, 41.308273]]})
    }).attr('class', 'connections')
    .attr('stroke', 'black')
    .attr('stroke-width', 0.2)
    .attr('fill', 'none')

  const getPosition = (d) => project([d.xlon, d.ylat])
  const colorPoints = (d) => {
    const gdistance = d3.geoDistance([d.xlon, d.ylat],
      project.invert([width / 2, height / 2]))
    return gdistance > 1.57 ? 'none' : 'red'
  }
  const points = svg.selectAll('circle')
    .data(files[6])
    .enter().append('circle')
    .attr('r', '6px')
    .attr('cx', (d) => getPosition(d)[0])
    .attr('cy', (d) => getPosition(d)[1])
    .attr('fill', colorPoints)

  const tooltip = d3.select('body')
    .append('div').attr('class', 'tooltip')
  const isTooltipActive = () => d3.select('.tooltip').style('visibility') != 'hidden'

  // similar to 'tick' in d3.force, this function forces a position update
  const updateGlobe = () => {
    d3.selectAll('path').attr('d', path)
    points.attr('cx', (d) => getPosition(d)[0])
      .attr('cy', (d) => getPosition(d)[1])
      .attr('fill', colorPoints)
    connections.attr('d', function(d) {
      return path({type: 'LineString',
        coordinates: [[d.xlon, d.ylat], [-72.927887, 41.308273]]})
    })

    // if the tooltip is showing up calculate the new positions for it and move it
    if (tooltip.style('visibility') != 'hidden') {
      const point = project([activePoint.xlon, activePoint.ylat])
      tooltip.style('left', (point[0]) + 'px' )
        .style('top', (point[1]) + 'px' )
    }
  }

  // rotate modifies project() and then calls updateGlobe()
  const rotate = (elapsed) => {
    const now = d3.now()
    const diff = now - lastTime
    if (diff < elapsed) {
      rotation = project.rotate()[0]
      rotation += diff * rotationConfig.speed
      // used to smoothly increment rotation amt
      project.rotate([rotation,
        rotationConfig.verticalTilt,
        rotationConfig.horizontalTilt])
      updateGlobe()
    }
    t = elapsed / 10000
    lastTime = now
  }
  // autorotate continually calls rotate
  const autorotate = d3.timer(rotate)


  points.on('mouseover', (event) => {
    d3.select(this).transition().duration(100).attr('r', '12px')
    autorotate.stop()
    if (typeof(startupTimer) != 'undefined') startupTimer.stop()
    slowdownTimer = d3.timer((elapsed) => {
      const newSpeed = 0.006 * (1 - d3.easeCubic(elapsed / 500))
      rotationConfig.speed = newSpeed
      autorotate(elapsed)
      if (elapsed > 500) {
        slowdownTimer.stop()
      }
    })
  }).on('mouseout', (event) => {
    d3.select(this).transition().duration(100).attr('r', '6px')
    autorotate.stop()
    slowdownTimer.stop()
    // if the popup is active don't do any of the following transitions
    if (isTooltipActive()) return null
    startupTimer = d3.timer((elapsed) => {
      const newSpeed = 0.006 * (d3.easeCubic(elapsed / 500))
      rotationConfig.speed = newSpeed
      rotate(elapsed)
      if (elapsed > 500) {
        startupTimer.stop()
        // start the automatic spin again only if the pop-up is not on the screen
        autorotate.restart(rotate)
      }
    })
  }).on('click', (d) => {
    activePoint = d
    tooltip.style('visiblility', 'visibile')
    tooltip.html('<b>' + d.location + '</b><p>' +
      d['short description'] + '</p>' +
      '<a href = ' + d.link + " target='_blank'>link</a> " +
      '<a href = ' + d.link + " target='_blank'>link</a> " +
      '<a href = ' + d.link3 + " target='_blank'>link</a> " )
      .style('left', getPosition(d)[0] + 'px' )
      .style('top', getPosition(d)[1] + 'px' )
    autorotate.stop()
  })

  bgd.on('click', () => {
    tooltip.style('visibility', 'hidden')
    timer.restart(autorotate)
  })

  const cleanup = () => {
    autorotate.stop()
    d3.select('.mapbox-canvas-container').style('display', 'block')
  }
  return cleanup
}

export default renderWorld
