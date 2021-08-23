/* eslint-disable no-invalid-this */
import * as d3 from 'd3'
import mapboxgl from 'mapbox-gl'

const mouseOver = (event) => {
  d3.select(event.target)
    .transition()
    .duration(100)
    .style('fill-opacity', 0.9)
    .style('stroke', 'black')
  const nationName = d3.select(event.target)
    .data()[0]
    .properties.name

  d3.selectAll('text')
    .filter((d) => d.properties.name === nationName)
    .transition()
    .duration(100)
    .style('font-size', '25px')
}

const mouseLeave = function(event) {
  d3.select(event.target)
    .transition()
    .duration(100)
    .style('stroke', 'transparent')
    .style('fill-opacity', 0.1)
  const nationName = d3.select(event.target)
    .data()[0]
    .properties.name
  d3.selectAll('text')
    .filter((d) => d.properties.name === nationName)
    .transition()
    .duration(100)
    .style('font-size', '15px')
}


const renderIndigenous = (map) => {
  d3.select('.mapboxgl-canvas')
    .transition()
    .duration(1500)
    .style('opacity', 1)
  // basic projection for straight lon/lat -> x/y connversion
  function projection(d) {
    const {x, y} = map.project(new mapboxgl.LngLat(d[0], d[1]))
    return [x, y]
  }
  // projection function that only works within a geotransform stream
  function projectionStream(lon, lat) {
    const point = map.project(new mapboxgl.LngLat(lon, lat))
    return this.stream.point(point.x, point.y)
  }

  const transform = d3.geoTransform({point: projectionStream})
  const path = d3.geoPath().projection(transform)

  const bounds = [[-75.439, 40.89984], [-71.190, 42.334157]]
  map.setMinZoom()
    .fitBounds(bounds, {duration: 1000})
    .setMaxBounds(bounds)

  d3.select('.mapboxgl-canvas-container > svg').remove()
  const svg = d3.select('.mapboxgl-canvas-container')
    .append('svg')
    .attr('width', window.innerWidth)
    .attr('height', window.innerHeight)
    .style('position', 'absolute')

  const projectText = (d) => projection([d.properties.text_x, d.properties.text_y])
  d3.json('../assets/data/native_land.geojson')
    .then(({features}) => {
      console.log(features)
      svg.selectAll('path')
        .data(features)
        .enter()
        .append('path')
        .attr('class', 'nation')
        .attr('d', path)
        .style('fill', (d) => d.properties.fill)
        .style('pointer-events', 'all')
        .on('mouseover', mouseOver)
        .on('mouseleave', mouseLeave)

      svg.selectAll('text')
        .data(features)
        .enter().append('text')
        .attr('class', 'nation-label')
        .attr('x', (d) => projectText(d)[0])
        .attr('y', (d) => projectText(d)[1])
        .style('font-size', '15px')
        .style('text-anchor', 'middle')
        .text((d) => d.properties.name)
    })
    .catch((err) => console.log(err))


  const updateIndigenous = () => {
    d3.selectAll('.nation').attr('d', path)
    d3.selectAll('.nation-label')
      .attr('x', (d) => projectText(d)[0])
      .attr('y', (d) => projectText(d)[1])
  }
  map.on('viewreset', updateIndigenous)
    .on('move', updateIndigenous)
    .on('moveend', updateIndigenous)

  const cleanup = () => {
    map.off('viewreset', updateIndigenous)
      .off('move', updateIndigenous)
      .off('moveend', updateIndigenous)
  }
  return cleanup
}

export default renderIndigenous
