var width = window.innerWidth,
	height = window.innerHeight;

//mapbox setup
mapboxgl.accessToken = 'pk.eyJ1IjoibmF0aGFuY2tpbTE4IiwiYSI6ImNrcXg0cjlueTBwdGYydm56M2puemFybWEifQ.xzGAUbt_oLKoYmoHnz75WA';
map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/nathanckim18/ckmvgk5g10i8017mv4fmwme8j',
		center: [-72.959704, 41.31099],
		minZoom: 11.5,
		maxZoom: 16.5,
		zoom: 12,
		maxBounds: [
			[-73.21036, 41.22615],
			[-72.74838, 41.39701]
		]
}).on("load", function(){

	map.addSource("gridVideoSource", {
			"type": "video",
			"urls": ["plots/grid.mp4"],
			"coordinates": [
				[ -73.130985, 41.392116],
				[-72.706979, 41.393416],
				[-72.705430, 41.212327],
				[-73.130295, 41.213888]
			]
	}).addLayer({
		"id": "gridVideoLayer",
		"type": "raster",
		"source": "gridVideoSource",
		"paint": {
			"raster-opacity": 0
		}
	},  "settlement-subdivision-label").addSource("propertyBlockSource", {
		"type": "vector",
		"url": "mapbox://nathanckim18.3hcemsqh"
	}).setLayerZoomRange("og-geometries", 13, 24);

	//moving logo
	attr = d3.selectAll(".mapboxgl-ctrl-attrib,.mapboxgl-ctrl-logo").nodes();
	attrDiv = d3.selectAll("#attribution").node();
		attrDiv.appendChild(attr[0]);
		attrDiv.appendChild(attr[1]); //there must be a better way to do this?
 	d3.selectAll(".mapboxgl-ctrl.mapboxgl-ctrl-attrib,.mapboxgl-ctrl-logo")
	  	.transition().duration(1500).style("opacity", 1);

	nextButton = d3.selectAll(".map-overlay#nextBox")
		.html("<button onclick='renderNewHaven()'>Click to move on.</button>");
	
})

//things to get started: projection, path generator, canvas stuff
//var projection = d3.geoEquirectangular();


//basic projection for straight lon/lat -> x/y connversion
function mbProject(d) {
	coords = map.project(new mapboxgl.LngLat(d[0], d[1]));
  return [coords.x, coords.y];
}

//different projection function that only works within a geotransform/projection stream thing (otherwise the "this" reference breaks)
function projectStream(lon, lat) {
    var point = map.project(new mapboxgl.LngLat(lon, lat));
    return this.stream.point(point.x, point.y);
}// the "rosetta stone" between mapbox gl and d3, see https://franksh.com/posts/d3-mapboxgl/ and https://bl.ocks.org/shimizu/5f4cee0fddc7a64b55a9
var transform = d3.geoTransform({point: projectStream}),
	path = d3.geoPath().projection(transform),
	project = d3.geoOrthographic()
		.translate([width / 2, height / 2])
	  .scale(width / 3);
	d3path = d3.geoPath().projection(project),
	graticule = d3.geoGraticule()
	  .step([10, 10]);
//this tweens a new geopath generator

function projectionTween(projection0, projection1) { //taken from https://bl.ocks.org/alexmacy/6700d44240d2b6d3ec9767a5a5854e42 and https://bl.ocks.org/mbostock/3711652
  return function(d) {
    var t = 0;
    var projection = d3.geoProjection(project)
        .scale(1)
        .translate([width / 2, height / 2]);
    var path = d3.geoPath(projection);
    function project(λ, φ) {
      λ *= 180 / Math.PI, φ *= 180 / Math.PI;
      var p0 = projection0([λ, φ]), p1 = projection1([λ, φ]);
      return [(1 - t) * p0[0] + t * p1[0], (1 - t) * -p0[1] + t * -p1[1]];
    }
    return function(_) {
      t = _;
      return path(d);
    };
  };
}

container = map.getCanvasContainer(),
svg = d3.select("body")
	.append("svg")
	.attr("width", width)
	.attr("height", height),
bgd = svg.append("rect")
	.attr("class", "bgd")
	.attr("width", "100%")
	.attr("height", "100%")
	.attr("opacity", 0)
var zoom = d3.zoom()
  .scaleExtent([0.1, 8])
	.on('zoom', zoomed);
const config = {
              speed: 0.005,
              verticalTilt: -15,
              horizontalTilt: -15
        }
//dont know why just updating the path/d attribute doesn't work
function zoomed(event, d) {
	svg
		.selectAll('path') // To prevent stroke width from scaling
		.transition().duration(50)
		.attr('transform', event.transform);
	svg
		.selectAll('circle') // To prevent stroke width from scaling
		.transition().duration(50)
		.attr('transform', event.transform);

	if(div.style("opacity") === "0.9"){
		currentX = Number(div.style("left").split("px")[0]);
		currentY = Number(div.style("top").split("px")[0]);
		newX = currentX*event.transform.k + event.transform.x;
		newY = currentY*event.transform.k + event.transform.y;
		div.transition().duration(50)
			.style("left", newX + "px")
			.style("right", newY + "px")
	}
}

//extra stuff: zoom and panning
//also predefining some variables that will be updated after the asynchronous data load so they can be referred to outside of that function scope
var name, indLands, indLabs,introShapes, currentShapes, point, snake,
 files, map, div, canvas, ctx, t, dashOffset, dta, redlinedShapes,
 holcRegio, mouseinfon, lastTime = d3.now(), globalElapsed = 0, elapsedVar, activePoint;
var mouseOver = function(d) {
	d3.select(this)
		.transition()
		.duration(100)
		.style("fill-opacity", 0.9)
		.style("stroke", "black");

	name = d3.select(this)
		.data()[0]
		.properties.name;

	d3.selectAll("text")
	  .filter(function(){
	    return d3.select(this).text() == name
	  })
		.transition()
		.duration(100)
		.style("font-size", "20px")
}

var mouseLeave = function(d) {
	d3.select(this)
		.transition()
		.duration(100)
		.style("stroke", "transparent")
		.style("fill-opacity", 0.7)
	d3.selectAll("text")
		.filter(function(){
			return d3.select(this).text() == name
		})
		.transition()
		.duration(100)
		.style("font-size", "15px")
}



// loading of files
var filenames = ["data/native_land.geojson", "data/holc.geojson", "data/nhv_neighborhoods.geojson",
 "data/intro_nhv.json", "data/world_map.geojson"];
var promises = [];

promises.push(d3.csv("data/text.csv"));
filenames.forEach(function(url) {
	promises.push(d3.json(url))
});
promises.push(d3.csv("data/world_map.csv"));

//action
Promise.all(promises).then(function(datasets){
	files = datasets;

	renderIntro();
});
var oldTDiscrete = Array(4).fill(-1),
		tDiscreteArray = Array(4).fill(0),
		snakes = Array(4).fill(Array(2).fill(0));
		snakeColors = ["#a503fc", "#038cfc", "#fc7303", "#fc0374"];
function renderIntro(){
	//render the map but make it invisible to start (see base.css)
	// "over" the map render the d3 trace of new haven shapes and animate them, importantly in the mapbox projection
	// then upon clicking the next button make them flicker and un-trace (i.e. disappear)
	//show mapbox map via transition reveal -- not sure what the best way to do this but for now (4/12) going to just to a opacity transition

	//step 1: set up aesthetics
  div = d3.select("#map");
  canvas = div.select('canvas#container'),
  ctx = canvas.node().getContext("2d");
  pathCanvas = path.context(ctx);
  canvas
      .attr('width', width * window.devicePixelRatio)
      .attr('height', height * window.devicePixelRatio)
      .style('width', width + 'px')
      .style('height', height + 'px');
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

	storyText = d3.selectAll(".map-overlay#story")
		.append("text").text("Map 0: Intro animation. Explanatory text will eventually go here.");
	//step 2: data cleaning
	dta = files[4];
	dta.forEach(function(part, index, lst){
      lst[index] = {type: "Feature", geometry: part.geometry, properties: {neighbors: part.neighbors, dist: part.dist} }
  }); //since R can't do this :/
	dta = {type: "FeatureCollection",
	name: "nhv_sample",
	crs: {type: "name", properties: {name: "urn:ogc:def:crs:OGC:1.3:CRS84"}},
	 features: dta}


	//step 3: animation
	timer = d3.timer((elapsed) => {
		//I want the fade-in animation to take 6 seconds and the starting gap to be 200 units ->
	    t = elapsed / 6000; //t = 1 at 6 seconds. The length of a single "cycle" of animation
			tDiscreteArray.forEach((d, i, arr) =>{ //version of t from 1 to 64 on a slightly offset cycle
				arr[i] =  Math.floor(64 * (1.1*t*(i+1) - Math.floor(1.1*t*(i+1))));
			});

			timeUnchanged = oldTDiscrete.every((d,i,arr) => { //is the new set of timekeepers the same as the old set of timekeepers?
				 return d == tDiscreteArray[i];
			 });

			if(!timeUnchanged || oldTDiscrete[0] == -1){ //if it has been more than one unit of time since this was last run
				snakes.forEach(updateSnake);
			}

	    if (t < 1) { //fade-in: draw the dash array and increase opacity
				dashOffset = 0;
				drawIntro(0, [25*t, (25 - 15*t)], t, 1.5*t - Math.floor(1.5*t));
			} else { //just move the shapes after that, keep opacity and dash array as they were at the end of the fade-in
				dashOffset = -(t-1)*50; //making a separate variable so it can be "remembered" on the fadeout function
				drawIntro(dashOffset, [25, 10], 1, 1.5*t - Math.floor(1.5*t));
	    }

			oldTDiscrete =  Object.assign([], tDiscreteArray); // update the "old t" with a deep copy
	});

}

function updateSnake(snakearray, i, arr){

	snake = snakearray[0];
	snakeIDs = snakearray[1];
	tDiscrete = tDiscreteArray[i];
	if(tDiscrete == 0 || oldTDiscrete[0] == -1){ //if iDiscrete is 0 or oldTDiscrete is -1, that means a new snake should be started instead of an old snake appended to
		snakeColors[i] = "#" + Math.floor(Math.random()*16777215).toString(16); //generate a random color. idk where that number came from lmao
		snakeIDs = [Math.floor(Math.random() * 1494)]; //pick a random block and put its ID into this array of IDs of the blocks in the snake so that we can make sure not to add a block that's already in the snake later on
		snake = [dta.features[snakeIDs]]; //the corresponding geometry as a one-element array
	} else {
		nbors = snake.slice(-1)[0].properties.neighbors; //neighbors array of last census block in the snake: some choices for what to add to the snake next
		nbors = nbors.filter(function(x){ return snakeIDs.indexOf(x -1) < 0 })[0] //get the first item in that neighbors array that doesn't overlap with what's already in the snake
		snakeIDs.push(nbors - 1); //add the corresponding geometry to the snake
		snake.push(dta.features[nbors - 1]);
	}

	if(snake.length > 15){ //make sure there's only 15 elements in the snake at a time; just remove the first one to keep it movin'
		snake.shift();
		snakeIDs.shift();
	}

	arr[i] = [snake, snakeIDs];
}

function drawIntro(dashOffset = 0, lineDash = [0,0], alpha = 1, t = 0){
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();
	ctx.lineWidth = 0.5;
	ctx.globalAlpha = alpha;
	ctx.lineDashOffset = dashOffset;
	ctx.setLineDash(lineDash);
  pathCanvas(dta);
	ctx.stroke();
	ctx.closePath();

	//the "wave": make a four-layer fill
	ctx.beginPath();
	ctx.fillStyle = "#038cfc";
	Array(8).fill(0).forEach((d, i) => {
		var subset = dta.features.filter(function(d){ //filter for the properties between given distances away from the new haven green
			return d.properties.dist < t - (.05 * i) && d.properties.dist > t - (0.05 * (i+1))
		});
		ctx.globalAlpha =  .5 - (i * .1);
		pathCanvas({type: "FeatureCollection",
		crs: {type: "name", properties: {name: "urn:ogc:def:crs:OGC:1.3:CRS84"}},
		 features: subset});
		 ctx.fill();
	});
	ctx.closePath();

	//draw the snakes too
	//feel a little bit bad about this below chunk because it's so many calls to the canvas
	// but because alphas, colors, geometries are different there does need to be many calls i think? how cna i batch them?
	snakes.forEach((snake, snakeI) => {
		color = snakeColors[snakeI];
		snake[0].forEach((d, i) => {
			ctx.beginPath();
			ctx.fillStyle = color;
			ctx.globalAlpha = .07*i;
			pathCanvas({type: "FeatureCollection",
			crs: {type: "name", properties: {name: "urn:ogc:def:crs:OGC:1.3:CRS84"}},
			features: [d]});
			ctx.fill();
			ctx.restore();
		})
	})
}

function renderNewHaven(){
	timer.stop();
	map.easeTo({
		duration: 250,
		zoom: 13,
		center: [-72.931, 41.31099]
	});
	map.getSource("gridVideoSource").getVideo().loop = false;

	//as before, but animate out
	timer = d3.timer((elapsed) => {
			t = d3.easeLinear(elapsed / 750); //represents time, sort of
			if (t < 1) {
				drawIntro(dashOffset, [200-100*t, (50 + 75*t)]); // 200, 50,1 -> 0, 200, 0 over 2 seconds; alpha starts decreasing at 1 second in
			} else if (t > 1 && t < 2){
				drawIntro(dashOffset, [200-100*t, (50 + 75*t)], 2 - t);
				d3.selectAll(".mapboxgl-canvas").style("opacity", (t - 1));
			} else {
				canvas.style("display", "none"); //canvas was covering up mapbox click events before
				map.on('click', "og-geometries", propertyClick)
				.on("click", "propertyBlockLayer", propertyBlockClick).on("zoom", function(){

					if(map.getZoom() < 13){
						d3.selectAll("#propPopup").remove()
					} else {
						d3.selectAll("#blockPopup").remove()
					}

				});
				timer.stop();
			}

			svg.style("pointer-events", "none");
});

	storyText.text("Map 1: New Haven properties, colored by value. Explanatory text will eventually go here.");
	nextButton.html("<button onclick='renderRedlining()'>Click to move on.</button>");

	d3.select("body").append("div")
		.attr("class", "map-overlay")
		.attr("id", "legend")
		.html("<b>Property Value</b>");
  var layers = ['$0', '$50,000', '$75,000', '$150,000', '$250,000', '$500,000', '$800,000', '$1,000,000+'];
  var colors = ['#150E37', '#481078', '#7B2382', '#B0357B', '#E34E65', '#FB845F', '#FEC185', '#FCFDBF'];

  // the mapbox-given way to make a legend
	//wait hwo does this know to append to .map-overlay? I mean I guess it works? so confused
  for (i = 0; i < layers.length; i++) {
    var layer = layers[i];
    var color = colors[i];
    var item = document.createElement('div');
    var key = document.createElement('span');
    key.className = 'legend-key';
    key.style.backgroundColor = color;

    var value = document.createElement('span');
    value.innerHTML = layer;
    item.appendChild(key);
    item.appendChild(value);
    legend.appendChild(item);
  }
}

function propertyClick(e){
	 new mapboxgl.Popup()
	 .setLngLat(e.lngLat)
	 .setHTML(e.features[0].properties.label)
	 .addTo(map);

	 d3.selectAll(".mapboxgl-popup-content").attr("id", "propPopup");
}

function propertyBlockClick(e){
	 new mapboxgl.Popup()
	 .setLngLat(e.lngLat)
	 .setHTML("<b>Mean value: " + e.features[0].properties.print_value + "</b><br>Zoom in to get building-level information.")
	 .addTo(map);

	 d3.selectAll(".mapboxgl-popup-content").attr("id", "blockPopup");
}

function renderRedlining(){

	storyText.text("Map 2: Proportion Black of New Haven blocks today; redlining designations of the 1930s. Explanatory text will eventually go here.");
	nextButton.html("<button onclick='renderGrid()'>Click to move on.</button>");
	d3.select("#propPopup").remove();
	d3.select("#blockPopup").remove();
	legend.remove();
	d3.select("body").append("div")
		.attr("class", "map-overlay")
		.attr("id", "legend")
		.html("<b>Percent Black</b>");
  var layers = ["0%", "10%", "20%", "30%", "40%", "50%",
								"60%", "70%", "80%", "90%"];
  var colors = ['#440154', '#482878', '#3E4A89', '#31688E', '#26828E', '#35B779', '#6DCD59', '#B4DE2C', '#FDE725'];

  // the mapbox-given way to make a legend
  for (i = 0; i < layers.length; i++) {
    var layer = layers[i];
    var color = colors[i];
    var item = document.createElement('div');
    var key = document.createElement('span');
    key.className = 'legend-key';
    key.style.backgroundColor = color;

    var value = document.createElement('span');
    value.innerHTML = layer;
    item.appendChild(key);
    item.appendChild(value);
    legend.appendChild(item);
  }


	path = d3.geoPath().projection(transform); //path.context(ctx) somehow messes up what path is so that the "this" keyword doesn't work? i think
	holc = files[2];
	neighborhoods = files[3];

	timer.stop(); //in case this transition happens before previous timer stops
	timer = d3.timer((elapsed) => {
			t = Math.min(Math.max(d3.easeCubic(elapsed / 750), 0), 1); //represents time, sort of
			map.setPaintProperty("og-geometries", "fill-opacity", 1-t)
				.setPaintProperty("propertyBlockLayer", "fill-opacity", 1-t)
				.setPaintProperty("propBlackLayer", "fill-opacity", t);
			if(t == 1){
				timer.stop();
			}
	});

	map.off('click', "og-geometries", propertyClick)
	.off("click", "propertyBlockLayer", propertyBlockClick)
	.on("mousemove", revealRedlined)
		.setMinZoom(11.5);



}

function revealRedlined(e){
		map.setFilter("holcLayer", ["<=", ["get", "x"], e.lngLat.lng]);
}

//to do 4/22: make the redlining districts render, outline automatically and fill interactively
function renderGrid(){

	storyText.text("Map 3: New Haven properties, arranged into a grid by size. Explanatory text will eventually go here.");
	nextButton.html("<button onclick='renderIndigenous()'>Click to move on.</button>");
	d3.select("#legend").transition().duration(1000).style("opacity", "0").remove();
	map.setMaxBounds([[-73.15045804423596, 41.25110810421933], [-72.76211186878697, 41.38281736836447]])
		.fitBounds([[-73.15045804423596, 41.25110810421933], [-72.76211186878697, 41.38281736836447]], {
			duration: 1000
		});
	video = map.getSource("gridVideoSource").getVideo();
	video.currentTime = 0;
	//our new strategy is to render a mapbox video :D
	timer = d3.timer((elapsed) => {
		t = d3.easeCubic(elapsed / 3500);

		//play a fraction of the video just to get it to look right (idk how to get it to appear loaded at the beginning)
		if(video.currentTime < 0.1){ //but there has to be a better way to load and stop at the first frame...
			//just setting currentTime to 0 or running a single iteration of video.play() and video.pause() doesn't work..?
			video.play();
		} else if(elapsed < 1000){ //.28 is when the 1000ms zoomout animation ends
			video.pause();
		} else if(elapsed > 1000 && video.currentTime < 2.5){
			//just make sure the pait properties finish correctly
			map.setPaintProperty("gridVideoLayer", "raster-opacity", 1)
				.setPaintProperty( "settlement-subdivision-label", "text-opacity", 0)
				.setPaintProperty("propBlackLayer", "fill-opacity", 0)
				.setPaintProperty("holcLayer", "fill-opacity", 0);
			video.play();
		} else if(video.currentTime > 2.5){
			video.pause();
			timer.stop();
		}
		//fade out the other map layers and fade in the grid layer
		if(t < 0.2858){
			map.setPaintProperty("gridVideoLayer", "raster-opacity", t * 3.5)
				.setPaintProperty( "settlement-subdivision-label", "text-opacity", 1-3.5*t)
				.setPaintProperty("propBlackLayer", "fill-opacity", 1-3.5*t)
				.setPaintProperty("holcLayer", "fill-opacity", 1-3.5*t);
		}
	});


}



function renderIndigenous(){
	map.setMaxBounds([[-77.916, 40.230], [-69.824, 42.962]]).setMinZoom();
	timer.stop();
	zoomed = false;
	//sequence of events
	// play video to completion
	//after video is done fade out the video layer and fade in the town boundaries layer
	//begin the zoom out sequence and fade out the administrative boundaries lmao
	//render indigenous nations svg elements
	video.play();
	timer = d3.timer((elapsed) => {
		t = d3.easeCubic((elapsed - 2500) / 500);
		 if(elapsed > 2500 && t < 1){
			map.setPaintProperty("gridVideoLayer", "raster-opacity", 1-t)
				.setPaintProperty("townLayer", "line-opacity", Math.min(1, 2*t));
		} else if(elapsed > 2500 && !zoomed){ //then after the opacity animation begin a one-second zoomout animation
			//then zoom out, but only run this chunk once (because this has built-in timing)
			map.fitBounds([[-75.439, 40.89984], [-71.190, 42.334157]], {
				duration: 1000
			}).setMaxBounds([[-75.439, 40.89984], [-71.190, 42.334157]]);
			zoomed =  true;
		} else if(elapsed > 2500 && elapsed < 3500){
			//setpaintproperty doesnt have builtin timing so we have to code the values/transitions manually. that's fine
			t = d3.easeCubic((elapsed - 2500) / 1000);
			map.setPaintProperty("townLayer", "line-opacity", Math.max(0, 1-t))
			.setPaintProperty("admin-1-boundary", "line-opacity", Math.max(0, 1-t));
		} else if(elapsed > 3500){ // once everything is finished show the indigenous nations
			showNations(); //is this a scoping issue? of what "this" refers to in a context?
			timer.stop();
		}

	});
}

function showNations(){
	storyText.text("Map 4: Indigenous lands in Connecticut. Explanatory text will eventually go here.");
	nextButton.html("<button onclick='renderWorld()'>Click to move on.</button>");

	subSVG = d3.select(container)
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	indLands =	subSVG.selectAll("path")
		.data(files[1].features)
		.enter()
		.append("path")
		.attr("class", "nation")
		.attr("d", path)
		.style("stroke-width", 0)
		.style("opacity", 0)
		.style("fill", function(d){
			return d.properties.fill
		})
		.on("mouseover", mouseOver )
		.on("mouseleave", mouseLeave );

	indLands.transition().duration(100).style("opacity", 0.5).style("stroke-width", 1);
	indLabs = subSVG.selectAll("text")
			.data(files[1].features)
			.enter().append("text")
			.attr("class", "nation-label")
			.attr("font-size", "0px")
			.attr("x", function(d) { return mbProject([d.properties.text_x, d.properties.text_y])[0]; })
			.attr("y", function(d) { return mbProject([d.properties.text_x, d.properties.text_y])[1]; })
			.attr("text-anchor","middle")
			.text(function(d) { return d.properties.name; });
		indLabs.transition().duration(100).style("font-size", "15px");
		map.on("viewreset", updateIndigenous);
		map.on("move", updateIndigenous);
		map.on("moveend", updateIndigenous);

}


function updateIndigenous(){

	indLands.attr("d", path);
	indLabs.attr("x", function(d) { return mbProject([d.properties.text_x, d.properties.text_y])[0]; })
	.attr("y", function(d) { return mbProject([d.properties.text_x, d.properties.text_y])[1]; });
}

function renderWorld(){
	storyText.text("Map 5: Racialized accumulation by dispossession on the global scale. Explanatory text will eventually go here.");

	indLands.transition().duration(1000).style("opacity", 0).remove();
	indLabs.transition().duration(1000).style("font-size", "0px").remove();
	map.remove();
	svg.style("pointer-events", "auto").call(zoom);

	outline = svg.append("path")
 		 .datum({type: "Sphere"})
 		 .attr("id", "outline")
 		 .attr("fill", "none")
 		 .attr("stroke", "black")
 		 .attr("stroke-width", "1")
 		 .attr("d", d3path);
 countries = svg.selectAll("path.countries")
		 .data(files[5].features)
		 .enter()
		 .append("path")
		 .attr("class", "countries")
		 .attr("d", d3path)
		 .style("stroke", "black")
		 .style("stroke-width", 1)
		 .style("fill", "none");


 gratLines = svg.selectAll('path.graticule')
   .data([graticule()])
   .enter()
   .append("path")
   .attr("d", d3path)
   .attr("fill", "none")
   .attr("stroke", "black")
   .style("stroke-opacity", "0.5")
   .attr("stroke-width", "0.3")
   .attr("d", d3path);


	points = svg.selectAll("circle")
		.data(files[6])
		.enter()
		.append("circle")
		.attr("cx", function(d){ return project([d.xlon, d.ylat])[0]})
		.attr("cy", function(d){ return project([d.xlon, d.ylat])[1]})
		.attr("r", "3px")
		.attr('fill', d => {
		 const coordinate = [d.xlon, d.ylat];
		 gdistance = d3.geoDistance(coordinate, project.invert([width/2, height/2]));
		 return gdistance > 1.57 ? 'none' : 'red';
	 });

	 div = d3.select("body").append("div")
			.attr("class", "tooltip")
			.style("opacity", 0);

 		points.on("mouseover", function(event, d){
		 d3.select(this).transition().duration(100).attr("r", "10px");
		 timer.stop();
		 }).on("mouseout", function(event, d){
			 d3.select(this).transition().duration(100).attr("r", "3px");
			 if(div.style("opacity") != "0.9"){
				 timer.restart(autorotate);
			 }
		 }).on("click", function(event, d){
		 activePoint = d;
			div.transition()
				.duration(200)
				.style("opacity", .9);
			div.html("<b>" + d.location +"</b><p>" +
			 d["short description"] + "</p>" +
		 	"<a href = " + d.link + " target='_blank'>link</a> " +
			"<a href = " + d.link + " target='_blank'>link</a> " +
			"<a href = " + d.link3 + " target='_blank'>link</a> " )
				.style("left", (project([d.xlon, d.ylat])[0]) + "px" )
				.style("top", (project([d.xlon, d.ylat])[1]) + "px" );
			timer.stop();
		 });

	 bgd.on("click", function(event, d){
		 div.style("opacity", 0);
		 timer.restart(autorotate);
	 });

	 yaleConnections = svg.selectAll("path.yaleConnections")
	 	.data(files[6])
		.enter()
		.append("path")
		.attr("d", function(d){
			return d3.line()([project([d.xlon, d.ylat]), project([-72.927887,41.308273])])
		}).attr("class", "yaleConnections")
		.attr("stroke", "black")
		.attr("stroke-width", 0.2)
		.attr("fill", "none")

	 timer = d3.timer(autorotate);

}


function autorotate(elapsed) {
	elapsedVar = elapsed;
  now = d3.now();
  diff = now - lastTime;
  if (diff < elapsed) {
    rotation = project.rotate()[0];
    rotation += diff * (6/1000);
    project.rotate([rotation, config.verticalTilt, config.horizontalTilt]);
    rotateGlobe()
  }
	t = (elapsed + globalElapsed) / 10000;
  lastTime = now;
}



function rotateGlobe(){

	d3.selectAll("path").attr("d", d3path);
	points.attr("cx", function(d){ return project([d.xlon, d.ylat])[0]})
			.attr("cy", function(d){ return project([d.xlon, d.ylat])[1]})
			.attr('fill', d => {
					 const coordinate = [d.xlon, d.ylat];
					 gdistance = d3.geoDistance(coordinate, project.invert([width/2, height/2]));
					 return gdistance > 1.57 ? 'none' : 'red';
				 });
	yaleConnections.attr("d", function(d){
		return d3.line()([project([d.xlon, d.ylat]), project([-72.927887,41.308273])])
			});
		if(div.style("opacity") === "0.9"){ //if the div is showing up calculate the new positions for it and move it
			div.style("left", (project([activePoint.xlon, activePoint.ylat])[0]) + "px" )
					 .style("top", (project([activePoint.xlon, activePoint.ylat])[1]) + "px" );
		}

}
