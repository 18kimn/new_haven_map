/* eslint-disable no-invalid-this */
import * as d3 from 'd3'
import mapboxgl from 'mapbox-gl'
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


const zoom = d3.zoom()
  .scaleExtent([0.1, 8])
  .on('zoom', zoomed)
function renderWorld() {
  const width = window.innerWidth
  const height = window.innerHeight
  storyText.text('Map 5: Racialized accumulation by dispossession on the global scale. Explanatory text will eventually go here.')

  indLands.transition().duration(1000).style('opacity', 0).remove()
  indLabs.transition().duration(1000).style('font-size', '0px').remove()
  map.remove()
  svg.style('pointer-events', 'auto').call(zoom)
  const lastTime = d3.now()

  const project = d3.geoOrthographic()
    .translate([width / 2, height / 2])
    .scale(width / 3)
  const d3path = d3.geoPath().projection(project)
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
  outline = svg.append('path')
    .datum({type: 'Sphere'})
    .attr('id', 'outline')
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', '1')
    .attr('d', d3path)

  countries = svg.selectAll('path.countries')
    .data(files[5].features)
    .enter()
    .append('path')
    .attr('class', 'countries')
    .attr('d', d3path)
    .style('stroke', 'black')
    .style('stroke-width', 1)
    .style('fill', 'none')


  gratLines = svg.selectAll('path.graticule')
    .data([graticule()])
    .enter()
    .append('path')
    .attr('d', d3path)
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .style('stroke-opacity', '0.5')
    .attr('stroke-width', '0.3')
    .attr('d', d3path)

  yaleConnections = svg.selectAll('path.yaleConnections')
    .data(files[6])
    .enter()
    .append('path')
    .attr('d', function(d) {
      return d3path({type: 'LineString',
        coordinates: [[d.xlon, d.ylat], [-72.927887, 41.308273]]})
    }).attr('class', 'yaleConnections')
    .attr('stroke', 'black')
    .attr('stroke-width', 0.2)
    .attr('fill', 'none')

  points = svg.selectAll('circle')
    .data(files[6])
    .enter()
    .append('circle')
    .attr('cx', function(d) {
      return project([d.xlon, d.ylat])[0]
    })
    .attr('cy', function(d) {
      return project([d.xlon, d.ylat])[1]
    })
    .attr('r', '6px')
    .attr('fill', (d) => {
      const coordinate = [d.xlon, d.ylat]
      const gdistance = d3.geoDistance(coordinate, 
        project.invert([width / 2, height / 2]))
      return gdistance > 1.57 ? 'none' : 'red'
    })

  const div = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)
  divActive = false


  points.on('mouseover', () => {
    d3.select(this).transition().duration(100).attr('r', '12px')
    timer.stop()
    if (typeof(startupTimer) != 'undefined') startupTimer.stop()
    slowdownTimer = d3.timer((elapsed) => {
      newSpeed = 0.006 * (1 - d3.easeCubic(elapsed / 500))
      rotationConfig.speed = newSpeed
      autorotate(elapsed)
      if (elapsed > 500) {
        slowdownTimer.stop()
      }
    })
  }).on('mouseout', () => {
    d3.select(this).transition().duration(100).attr('r', '6px')
    timer.stop()
    slowdownTimer.stop()
    // if the popup is active don't do any of the following transitions,
    // just pause everything and quit
    if (divActive) return null
    startupTimer = d3.timer((elapsed) => {
      div.transition(100).style('opacity', 0)
      newSpeed = 0.006 * (d3.easeCubic(elapsed / 500))
      rotationConfig.speed = newSpeed
      autorotate(elapsed)
      if (elapsed > 500) {
        startupTimer.stop()
        // start the automatic spin again only if the pop-up is not on the screen
        timer.restart(autorotate)
      }
    })
  }).on('click', (d) => {
    activePoint = d
    divActive = true
    div.transition()
      .duration(200)
      .style('opacity', .9)
    div.html('<b>' + d.location + '</b><p>' +
      d['short description'] + '</p>' +
      '<a href = ' + d.link + " target='_blank'>link</a> " +
      '<a href = ' + d.link + " target='_blank'>link</a> " +
      '<a href = ' + d.link3 + " target='_blank'>link</a> " )
      .style('left', (project([d.xlon, d.ylat])[0]) + 'px' )
      .style('top', (project([d.xlon, d.ylat])[1]) + 'px' )
    timer.stop()
  })

  bgd.on('click', () => {
    div.style('opacity', 0)
    divActive = false
    timer.restart(autorotate)
  })

  timer = d3.timer(autorotate)
}


function autorotate(elapsed) {
  const now = d3.now()
  const diff = now - lastTime
  if (diff < elapsed) {
    rotation = project.rotate()[0]
    rotation += diff * rotationConfig.speed
    // used to smoothly increment rotation amt
    project.rotate([rotation,
      rotationConfig.verticalTilt,
      rotationConfig.horizontalTilt])
    rotateGlobe()
  }
  t = elapsed / 10000
  lastTime = now
}


function rotateGlobe() {
  d3.selectAll('path').attr('d', d3path)
  points.attr('cx', function(d) {
    return project([d.xlon, d.ylat])[0]
  })
    .attr('cy', function(d) {
      return project([d.xlon, d.ylat])[1]
    })
    .attr('fill', (d) => {
      const coordinate = [d.xlon, d.ylat]
      const gdistance = d3.geoDistance(coordinate,
        project.invert([width / 2, height / 2]))
      return gdistance > 1.57 ? 'none' : 'red'
    })
  yaleConnections.attr('d', function(d) {
    return d3path({type: 'LineString',
      coordinates: [[d.xlon, d.ylat], [-72.927887, 41.308273]]})
  })

  if (div.style('opacity') === '0.9') { // if the div is showing up calculate the new positions for it and move it
    div.style('left',
      (project([activePoint.xlon, activePoint.ylat])[0]) + 'px' )
      .style('top',
        (project([activePoint.xlon, activePoint.ylat])[1]) + 'px' )
  }
}

const zoomed = (event) => {
  svg
    .selectAll('path') // To prevent stroke width from scaling
    .transition().duration(50)
    .attr('transform', event.transform)
  svg
    .selectAll('circle') // To prevent stroke width from scaling
    .transition().duration(50)
    .attr('transform', event.transform)

  if (div.style('opacity') === '0.9') {
    currentX = Number(div.style('left').split('px')[0])
    currentY = Number(div.style('top').split('px')[0])
    newX = currentX * event.transform.k + event.transform.x
    newY = currentY * event.transform.k + event.transform.y
    div.transition().duration(50)
      .style('left', newX + 'px')
      .style('right', newY + 'px')
  }
}

export default renderWorld
