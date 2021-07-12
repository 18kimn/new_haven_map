import * as d3 from 'd3'


const renderIndigenous () => {
    // basic projection for straight lon/lat -> x/y connversion
    function mbProject(d) {
        coords = map.project(new mapboxgl.LngLat(d[0], d[1]))
        return [coords.x, coords.y]
    }

    // projection function that only works within a geotransform stream
    // (otherwise the "this" reference breaks)
    function projectStream(lon, lat) {
        const point = map.project(new mapboxgl.LngLat(lon, lat))
        // eslint-disable-next-line no-invalid-this
        return this.stream.point(point.x, point.y)
    }// the "rosetta stone" between mapbox gl and d3
    // see https://franksh.com/posts/d3-mapboxgl/ and https://bl.ocks.org/shimizu/5f4cee0fddc7a64b55a9

    const transform = d3.geoTransform({ point: projectStream })
    const path = d3.geoPath().projection(transform)

    map.setMaxBounds([[-77.916, 40.230], [-69.824, 42.962]]).setMinZoom()
    timer.stop()
    zoomed = false
    // sequence of events
    // play video to completion
    // after video is done fade out the video layer and fade in the town boundaries layer
    // begin the zoom out sequence and fade out the administrative boundaries lmao
    // render indigenous nations svg elements
    video.play()
    timer = d3.timer((elapsed) => {
        t = d3.easeCubic((elapsed - 2500) / 500)
        if (elapsed > 2500 && t < 1) {
            map.setPaintProperty('gridVideoLayer', 'raster-opacity', 1 - t)
                .setPaintProperty('townLayer', 'line-opacity', Math.min(1, 2 * t))
        } else if (elapsed > 2500 && !zoomed) { // then after the opacity animation begin a one-second zoomout animation
            // then zoom out, but only run this chunk once (because this has built-in timing)
            map.fitBounds([[-75.439, 40.89984], [-71.190, 42.334157]], {
                duration: 1000,
            }).setMaxBounds([[-75.439, 40.89984], [-71.190, 42.334157]])
            zoomed = true
        } else if (elapsed > 2500 && elapsed < 3500) {
            // setpaintproperty doesnt have builtin timing so we have to code the values/transitions manually. that's fine
            t = d3.easeCubic((elapsed - 2500) / 1000)
            map.setPaintProperty('townLayer', 'line-opacity', Math.max(0, 1 - t))
                .setPaintProperty('admin-1-boundary', 'line-opacity', Math.max(0, 1 - t))
        } else if (elapsed > 3500) { // once everything is finished show the indigenous nations
            showNations() // is this a scoping issue? of what "this" refers to in a context?
            timer.stop()
        }
    })
}

function showNations() {
    storyText.text('Map 4: Indigenous lands in Connecticut. Explanatory text will eventually go here.')
    nextButton.html("<button onclick='renderWorld()'>Click to move on.</button>")

    svg = d3.select(container)
        .append('svg')
        .attr('width', window.innerWidth)
        .attr('height', window.innerHeight)

    indLands = svg.selectAll('path')
        .data(files[1].features)
        .enter()
        .append('path')
        .attr('class', 'nation')
        .attr('d', path)
        .style('stroke-width', 0)
        .style('opacity', 0)
        .style('fill', function (d) {
            return d.properties.fill
        })
        .on('mouseover', mouseOver)
        .on('mouseleave', mouseLeave)

    indLands.transition().duration(100).style('opacity', 0.5).style('stroke-width', 1)
    indLabs = svg.selectAll('text')
        .data(files[1].features)
        .enter().append('text')
        .attr('class', 'nation-label')
        .attr('font-size', '0px')
        .attr('x', function (d) {
            return mbProject([d.properties.text_x, d.properties.text_y])[0]
        })
        .attr('y', function (d) {
            return mbProject([d.properties.text_x, d.properties.text_y])[1]
        })
        .attr('text-anchor', 'middle')
        .text(function (d) {
            return d.properties.name
        })
    indLabs.transition().duration(100).style('font-size', '15px')
    map.on('viewreset', updateIndigenous)
    map.on('move', updateIndigenous)
    map.on('moveend', updateIndigenous)
}


function updateIndigenous() {
    indLands.attr('d', path)
    indLabs.attr('x', function (d) {
        return mbProject([d.properties.text_x, d.properties.text_y])[0]
    })
        .attr('y', function (d) {
            return mbProject([d.properties.text_x, d.properties.text_y])[1]
        })
}

const mouseOver = () => {
    d3.select(this)
        .transition()
        .duration(100)
        .style('fill-opacity', 0.9)
        .style('stroke', 'black')

    name = d3.select(this)
        .data()[0]
        .properties.name

    d3.selectAll('text')
        .filter(function () {
            return d3.select(this).text() == name
        })
        .transition()
        .duration(100)
        .style('font-size', '20px')
}

const mouseLeave = function (d) {
    d3.select(this)
        .transition()
        .duration(100)
        .style('stroke', 'transparent')
        .style('fill-opacity', 0.7)
    d3.selectAll('text')
        .filter(function () {
            return d3.select(this).text() == name
        })
        .transition()
        .duration(100)
        .style('font-size', '15px')
}


export default renderIndigenous
