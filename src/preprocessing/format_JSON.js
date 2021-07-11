// R doesn't support writing list-columns to a geojson file format, which
// means we lose out on some metadata and structure if we leave the intro shapefile (New Haven blocks) as JSON.
// This small script reformats that data so that the user's browser doesn't have to
import fs from 'fs'

fs.readFile('../../data/intro_nhv.json', (err, data) => {
  if (err) throw err
  const obj = JSON.parse(data)
  obj.forEach(function(part, index, lst) {
    lst[index] = {type: 'Feature', geometry: part.geometry,
      properties: {neighbors: part.neighbors, dist: part.dist}}
  })

  const toWrite = JSON.stringify({type: 'FeatureCollection',
    name: 'nhv_sample',
    crs: {type: 'name', properties: {name: 'urn:ogc:def:crs:OGC:1.3:CRS84'}},
    features: obj})

  fs.writeFile('../static/data/intro_nhv.json', toWrite, (err) => {
    if (err) throw err
  })
})

