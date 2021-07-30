import * as d3 from 'd3'
import mapboxgl from 'mapbox-gl'

const renderIntro = (map) => {
  // Section 1: Animation functions that will be called in d3.timer() to update the canvas

  // Given a snake (defined as a two element array, the first being geometries and the second being block IDs)
  // with index i in the snakesArray (the entire collection of snakes),
  // this function either picks a random place and color or pushes a new block onto the snake to "extend" it
  const updateSnake = (snake, i, snakesArray) => {
    const tDiscrete = tDiscreteArray[i]
    let snakeShapes; let snakeIDs
    if (tDiscrete == 0 || oldTDiscrete[0] == -1) { // if iDiscrete is 0 or oldTDiscrete is -1, that means a new snake should be started instead of an old snake appended to
      snakeColors[i] = '#' + Math.floor(Math.random()*16777215).toString(16) // generate a random color. idk where that number came from lmao
      snakeIDs = [Math.floor(Math.random() * 1494)] // pick a random block and put its ID into this array of IDs of the blocks in the snake so that we can make sure not to add a block that's already in the snake later on
      snakeShapes = [dta.features[snakeIDs]] // the corresponding geometry as a one-element array
    } else {
      snakeShapes = snake[0]
      snakeIDs = snake[1]
      // neighbors array of last census block in the snake: some choices for what to add to the snake next
      let nbors = snakeShapes.slice(-1)[0].properties.neighbors
      nbors = nbors.filter(function(x) {
        return snakeIDs.indexOf(x -1) < 0
      })[0] // get the first item in that neighbors array that doesn't overlap with what's already in the snake
      snakeIDs.push(nbors - 1) // add the corresponding geometry to the snake
      snakeShapes.push(dta.features[nbors - 1])
    }

    if (snakeShapes.length > 15) { // make sure there's only 15 elements in the snake at a time; just remove the first one to keep the snake moving
      snakeIDs.shift()
    }

    snakesArray[i] = [snakeShapes, snakeIDs]
  }

  // Given a dash array offset, an array describing the length of a dash and gap, alpha, and time,
  // this function 1) draws the blocks, 2) makes a blue "wave" spreading out from the center of New Haven, and
  // 3) renders "snakes" as updated by the updateSnake function above.
  const drawFrame = (dashOffset = 0, lineDash = [0, 0], alpha = 1, t = 0) => {
    // the main area, aka the blocks
    ctx.save()
    ctx.clearRect(0, 0, width, height)
    ctx.beginPath()
    ctx.lineWidth = 0.5
    ctx.globalAlpha = alpha
    ctx.lineDashOffset = dashOffset
    ctx.fillStyle = '#F7F7F7'
    ctx.setLineDash(lineDash)
    path(dta)
    ctx.fill()
    ctx.stroke()
    ctx.closePath()

    // the "wave": make an eight-layer fill
    ctx.beginPath()
    ctx.fillStyle = '#038cfc'
    Array(8).fill(0).forEach((_, i) => {
      // filter for the properties between given distances away from the new haven green
      const subset = dta.features.filter(function(d) {
        return d.properties.dist < t - (.05 * i) &&
      d.properties.dist > t - (0.05 * (i+1))
      })
      ctx.globalAlpha = .5 - (i * .1)
      console.log(subset)
      path({type: 'FeatureCollection',
        crs: {type: 'name', properties: {name: 'urn:ogc:def:crs:OGC:1.3:CRS84'}},
        features: subset})
      ctx.fill()
    })
    ctx.closePath()

    // draw the snakes too
    // feel a little bit bad about this below chunk because it's so many calls to the canvas
    // but because alphas, colors, geometries are different there does need to be many calls i think? how cna i batch them?
    snakes.forEach((snake, snakeIndex) => {
      snake[0].forEach((d, i) => {
        ctx.beginPath()
        ctx.fillStyle = snakeColors[snakeIndex]
        ctx.globalAlpha = .07*i
        path({type: 'FeatureCollection',
          crs: {type: 'name',
            properties: {name: 'urn:ogc:def:crs:OGC:1.3:CRS84'}},
          features: [d]})
        ctx.fill()
        ctx.restore()
      })
    })
  }

  // This function combines drawFrame() and updateSnake() to actually run the intro animation
  const animate = () => {
    timer = d3.timer((elapsed) => {
    // I want the fade-in animation to take 6 seconds and the starting gap to be 200 units ->
      const t = elapsed / 6000 // t = 1 at 6 seconds. The length of a single "cycle" of animation
      // version of t from 1 to 64 on a slightly offset cycle
      tDiscreteArray = Array(4).fill(0).map((_, i) => {
        return Math.floor(64 * (1.1*t*(i+1) - Math.floor(1.1*t*(i+1))))
      })

      // is the new set of timekeepers the same as the old set of timekeepers?
      const timeUnchanged = oldTDiscrete.every((d, i) => d === tDiscreteArray[i])
      // if not (if more than one unit of time has passed), or if this is the first run
      if (!timeUnchanged || oldTDiscrete[0] === -1) snakes.forEach(updateSnake)

      if (t < 1) { // fade-in: draw the dash array and increase opacity
        drawFrame(0, [25*t, (25 - 15*t)], t, 1.5*t - Math.floor(1.5*t))
      } else { // just move the shapes after that by incrementing the dash offset
      // keep moving opacity and dash array as they were at the end of the fade-in
        dashOffset = -(t-1)*50 // only updating it here so that it can be referred to by other functions here
        drawFrame(dashOffset, [25, 10], 1, 1.5*t - Math.floor(1.5*t))
      }

      oldTDiscrete = Object.assign([], tDiscreteArray) // update the "old t" with a deep copy
    })
  }


  // And this function does the opposite by running drawFrame "backwards" and erasing the canvas
  const animateOut = () => {
    timer.stop()
    map.easeTo({
      duration: 250,
      zoom: 13,
      center: [-72.931, 41.31099],
    })

    // preloads the grid video animation, which comes after the following map (e.g. load in advance)
    map.getSource('gridVideoSource').getVideo().loop = false

    // as before, but animate out
    timer = d3.timer((elapsed) => {
      const t = d3.easeLinear(elapsed / 750) // represents time, sort of
      if (t < 1) {
        drawFrame(dashOffset, [200-100*t, (50 + 75*t)]) // 200, 50,1 -> 0, 200, 0 over 2 seconds; alpha starts decreasing at 1 second in
      } else if (t > 1 && t < 2) {
        drawFrame(dashOffset, [200-100*t, (50 + 75*t)], 2 - t)
        d3.selectAll('.mapboxgl-canvas').style('opacity', (t - 1))
      } else {
        // canvas was covering up mapbox click events before
        // we're not going to take it off of the DOM though because we'll still use it for the world map
        canvas.style('display', 'none')
        timer.stop()
      }
    })
  }

  // __________________________________________________________________________________________________
  // Section 2: Variables needed as setup, like initializing the canvas, getting a map projection, etc.
  const canvas = d3.select('#map').select('canvas#container')
  const ctx = canvas.node().getContext('2d')
  const width = window.innerWidth
  const height = window.innerHeight
  canvas.attr('width', width * window.devicePixelRatio)
      .attr('height', height * window.devicePixelRatio)
      .style('width', width + 'px')
      .style('height', height + 'px')
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

  // projection function that only works within a geotransform stream (otherwise the "this" reference breaks)
  // also don't change the function(){} to arrow syntax here, that also breaks the "this" keyword
  const projectStream = function(lon, lat) {
    // the "rosetta stone" between mapbox gl and d3
    const point = map.project(new mapboxgl.LngLat(lon, lat))
    // eslint-disable-next-line no-invalid-this
    return this.stream.point(point.x, point.y)
  }
  // see https://franksh.com/posts/d3-mapboxgl/ and https://bl.ocks.org/shimizu/5f4cee0fddc7a64b55a9
  const transform = d3.geoTransform({point: projectStream})
  const path = d3.geoPath().projection(transform).context(ctx)

  d3.selectAll('.map-overlay#story')
      .append('text')
      .text('Map 0: Intro animation. Explanatory text will eventually go here.')
  d3.selectAll('.map-overlay#nextBox')
      .append('button')
      .on('click', animateOut)
      .text('Click me to move on.')
  const snakes = Array(4).fill(Array(2).fill(0))
  const snakeColors = Array(4)
  // a discrete time variable and a placeholder version to compare it against to see if enough time has passed
  let oldTDiscrete = Array(4).fill(-1)
  let tDiscreteArray = Array(4).fill(0)
  let dta; let timer; let dashOffset

  // Section 3: Beginning the animation in a d3.timer()
  d3.json('../assets/data/intro_nhv.json').then((processed) => {
    dta = processed
    console.log(dta)
    animate()
  })
}

export default renderIntro
