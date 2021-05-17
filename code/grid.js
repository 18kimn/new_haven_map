//leftover code for the grid animation

function renderGrid(){


  storyText.text(files[0][2].full_text);
  nextButton.html("<button onclick='renderGrid()'>" + files[0][2].transition_next + "</button>");

  dta = files[5];

  dta.geometry.forEach(function(part, index, lst){
      lst[index] = {type: "Feature", geometry: part }
  });

  d3.selectAll(".mapboxgl-popup,.mapboxgl-canvas")
    .transition().duration(1500).style("opacity", 0).style("display", "none")
    .on("end", function(){
			d3.selectAll(".mapboxgl-popup").remove();
			map.off("click", "og-geometries");
			d3.select("canvas#container").style("display", null); //remove the "display:none" aspect of the style that was preventing the grid setup from being rendered
			animateGrid();
		}); //only after ending should the grid be animated


  currentShapes = {type: "FeatureCollection",
  name: "nhv_sample",
  crs: {type: "name", properties: {name: "urn:ogc:def:crs:OGC:1.3:CRS84"}},
   features: dta.og_geometry}
  drawGrid();
  d3.select("canvas").transition().duration(1000).style("opacity",1);

}

function animateGrid(){
	map.setMinZoom(10);
  var interp = d3.interpolatePath({type: "FeatureCollection",
	name: "nhv_sample",
	crs: {type: "name", properties: {name: "urn:ogc:def:crs:OGC:1.3:CRS84"}},
	 features: dta.og_geometry},
	 {type: "FeatureCollection",
	 name: "nhv_sample",
	 crs: {type: "name", properties: {name: "urn:ogc:def:crs:OGC:1.3:CRS84"}},
		features: dta.geometry});
	map.zoomTo(11);

  timer = d3.timer((elapsed) => {
		console.log("frame count");
    // compute how far through the animation we are (0 to 1)
    const t = d3.easeCubic(elapsed / 3000);
    currentShapes = interp(t);
		drawGrid();
    if (t > 1) {
      timer.stop();
    }
  });

}

function drawGrid(){
  //ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();
  pathCanvas(currentShapes);
	ctx.strokeStyle = '#69b3a2';
  //ctx.fill();
	ctx.stroke();
  //ctx.restore();
}
