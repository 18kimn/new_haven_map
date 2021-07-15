const fs = require('fs')
const path = require('path')
/*
const topojson = require(
    path.resolve(process.cwd(),
        '../node_modules/topojson/dist/topojson.js'),
)
*/
const topojson = require('topojson')

fs.readFile('input_data/clean/intro_nhv.json', (err, data) => {
  if (err) throw err
  const obj = JSON.parse(data)
  obj.forEach(function(part, index, lst) {
    lst[index] = {type: 'Feature', geometry: part.geometry,
      properties: {neighbors: part.neighbors, dist: part.dist}}
  })

  let toWrite = {type: 'FeatureCollection',
    name: 'nhv_sample',
    crs: {type: 'name', properties: {name: 'urn:ogc:def:crs:OGC:1.3:CRS84'}},
    features: obj}
  toWrite = JSON.stringify(topojson.topology({"toWrite": toWrite}))
  fs.writeFile('src/static/data/intro_nhv.json', toWrite, (err) => {
    if (err) throw err
  })
})
