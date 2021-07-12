
/* eslint-disable no-unused-vars */
import * as d3 from 'd3'
const c = () => {
  const timer = d3.timer((elapsed) => {
    if ((elapsed) > 5000) timer.stop()
  })
  return 'c running'
}

const a = () => {
  const timer = d3.timer((elapsed) => {
    if ((elapsed) > 5000) {
      timer.stop()
      return 'returned value from a'
    }
  })
  return 'a running'
}

const d = () => {
  console.log(1+2)
}


