import * as d3 from 'd3'

const renderIntro = () => {
  let oldTDiscrete = Array(4).fill(-1)
  const tDiscreteArray = Array(4).fill(0)
  const snakes = Array(4).fill(Array(2).fill(0))
  const snakeColors = Array(4)
  // render the map but make it invisible to start (see base.css)
  // "over" the map render the d3 trace of new haven shapes and animate them, importantly in the mapbox projection
  // then upon clicking the next button make them flicker and un-trace (i.e. disappear)
  // show mapbox map via transition reveal -- not sure what the best way to do this but for now (4/12) going to just to a opacity transition

  const updateSnake = (snakeShapes, i, snakesArray) => {
    snakeShapes = snakearray[0]
    snakeIDs = snakearray[1]
    tDiscrete = tDiscreteArray[i]
    if (tDiscrete == 0 || oldTDiscrete[0] == -1) { // if iDiscrete is 0 or oldTDiscrete is -1, that means a new snake should be started instead of an old snake appended to
      snakeColors[i] = '#' + Math.floor(Math.random()*16777215).toString(16) // generate a random color. idk where that number came from lmao
      snakeIDs = [Math.floor(Math.random() * 1494)] // pick a random block and put its ID into this array of IDs of the blocks in the snake so that we can make sure not to add a block that's already in the snake later on
      snakeShapes = [dta.features[snakeIDs]] // the corresponding geometry as a one-element array
    } else {
      nbors = snakeShapes.slice(-1)[0].properties.neighbors // neighbors array of last census block in the snake: some choices for what to add to the snake next
      nbors = nbors.filter(function(x) {
        return snakeIDs.indexOf(x -1) < 0
      })[0] // get the first item in that neighbors array that doesn't overlap with what's already in the snake
      snakeIDs.push(nbors - 1) // add the corresponding geometry to the snake
      snakeShapes.push(dta.features[nbors - 1])
    }

    if (snakeShapes.length > 15) { // make sure there's only 15 elements in the snake at a time; just remove the first one to keep it movin'
      snakeShapes.shift()
      snakeIDs.shift()
    }

    snakesArray[i] = [snakeShapes, snakeIDs]
  }

  const drawIntro = (dashOffset = 0, lineDash = [0, 0], alpha = 1, t = 0) => {
    ctx.save()
    ctx.clearRect(0, 0, width, height)
    ctx.beginPath()
    ctx.lineWidth = 0.5
    ctx.globalAlpha = alpha
    ctx.lineDashOffset = dashOffset
    ctx.setLineDash(lineDash)
    pathCanvas(dta)
    ctx.stroke()
    ctx.closePath()

    // the "wave": make a four-layer fill
    ctx.beginPath()
    ctx.fillStyle = '#038cfc'
    Array(8).fill(0).forEach((d, i) => {
      const subset = dta.features.filter(function(d) { // filter for the properties between given distances away from the new haven green
        return d.properties.dist < t - (.05 * i) &&
      d.properties.dist > t - (0.05 * (i+1))
      })
      ctx.globalAlpha = .5 - (i * .1)
      pathCanvas({type: 'FeatureCollection',
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
        pathCanvas({type: 'FeatureCollection',
          crs: {type: 'name',
            properties: {name: 'urn:ogc:def:crs:OGC:1.3:CRS84'}},
          features: [d]})
        ctx.fill()
        ctx.restore()
      })
    })
  }

  const canvas = d3.select('#map').select('canvas#container')
  const ctx = canvas.node().getContext('2d')
  const pathCanvas = path.context(ctx)
  canvas
      .attr('width', width * window.devicePixelRatio)
      .attr('height', height * window.devicePixelRatio)
      .style('width', width + 'px')
      .style('height', height + 'px')
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

  storyText = d3.selectAll('.map-overlay#story')
      .append('text')
      .text('Map 0: Intro animation. Explanatory text will eventually go here.')

  d3.json('../static/data/intro_nhv.json', (dta) => {
    // step 3: animation
    timer = d3.timer((elapsed) => {
    // I want the fade-in animation to take 6 seconds and the starting gap to be 200 units ->
      t = elapsed / 6000 // t = 1 at 6 seconds. The length of a single "cycle" of animation
      tDiscreteArray.forEach((_, i, arr) =>{ // version of t from 1 to 64 on a slightly offset cycle
        arr[i] = Math.floor(64 * (1.1*t*(i+1) - Math.floor(1.1*t*(i+1))))
      })

      // is the new set of timekeepers the same as the old set of timekeepers?
      timeUnchanged = oldTDiscrete.every((d, i) => {
        return d == tDiscreteArray[i]
      })
      // if it has been more than one unit of time since this was last run
      if (!timeUnchanged || oldTDiscrete[0] == -1) {
        snakes.forEach(updateSnake)
      }

      if (t < 1) { // fade-in: draw the dash array and increase opacity
        dashOffset = 0
        drawIntro(0, [25*t, (25 - 15*t)], t, 1.5*t - Math.floor(1.5*t))
      } else { // just move the shapes after that, keep opacity and dash array as they were at the end of the fade-in
        dashOffset = -(t-1)*50 // making a separate variable so it can be "remembered" on the fadeout function
        drawIntro(dashOffset, [25, 10], 1, 1.5*t - Math.floor(1.5*t))
      }

      oldTDiscrete = Object.assign([], tDiscreteArray) // update the "old t" with a deep copy
    })
  })
}

export default renderIntro
