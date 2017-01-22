/***********************************************
* A JavaScript document by Carl Sack           *
* D3 Coordinated Visualization Example Code    *
* Creative Commons 3.0 license, 2015           *
***********************************************/

//wrap everything in a self-executing anonymous function to move to local scope
(function(){

//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){
	//map frame dimensions
	var width = window.innerWidth,
		height = window.innerHeight;

	//create new svg container for the map
	var map = d3.select("body")
		.append("svg")
		.attr("class", "map")
		.style("background-color", '#d8fdff')
		.attr("width", width)
		.attr("height", height);

	//create Albers equal area conic projection centered on France
	var projection = d3.geoOrthographic()
		.center([-16, 62]) //oblique view north from equator
		.rotate([123, 10, 36])
		.scale(5000)
		.translate([width / 2, height / 2]);

	var path = d3.geoPath(projection);

	//use queue.js to parallelize asynchronous data loading
	queue()
		.defer(d3.json, "data/timesapprox.topojson") //load topojson file
		.defer(d3.json, "data/moves.geojson")
		.defer(d3.json, "data/cities.geojson")
		.await(callback);

	function callback(error, data, moves, cities){
		//translate europe and France TopoJSONs
		var land = topojson.feature(data, data.objects.land),
			a0lines = topojson.feature(data, data.objects.admin0_lines),
			a1lines = topojson.feature(data, data.objects.admin1_lines);
		
		//add geometries to map
		var land_path = map.append("path")
			.datum(land)
			.attr("class", "land")
			.attr("fill", "#e2ffd8")
			.attr("stroke", "#999")
			.attr("stroke-width", "2px")
			.attr("stroke-linejoin", "round")
			.attr("d", path);

		var a1lines_path = map.append("path")
			.datum(a1lines)
			.attr("class", "a1lines")
			.attr("fill", "none")
			.attr("stroke", "#BBC7B2")
			.attr("stroke-width", "2px")
			.attr("stroke-linejoin", "round")
			.attr("d", path);

		var a0lines_path = map.append("path")
			.datum(a0lines)
			.attr("class", "a0lines")
			.attr("fill", "none")
			.attr("stroke", "#999")
			.attr("stroke-width", "2px")
			.attr("stroke-linejoin", "round")
			.attr("d", path);

		var c = 0;
		map.on("click", function(){
			if (c < 3){
				eval('setRoute'+(c+1)+'(map, path, moves.features['+c+'], cities)');
				c++;
			}
		});
	};
}; //end of setMap()

function setRoute1(map, path, line1data, cities){
	var line1 = map.append("path")
		.datum(line1data)
		.attr("class", "movelines")
		.attr("stroke-width", "0px")
		.attr("fill", "none")
		.attr("stroke", "#000")
		.attr("stroke-linejoin", "round")
		.attr("d", path);

	var line1length = line1.node().getTotalLength(),
		line1d = line1.attr('d'),
		line1firstpoint = line1d.substr(line1d.indexOf('M')+1, line1d.indexOf('L')-1),
		line1firstpointArray = line1firstpoint.split(","),
		line1firstX = parseFloat(line1firstpointArray[0]),
		line1firstY = parseFloat(line1firstpointArray[1]),
		line1lastpoint = line1d.substr(line1d.lastIndexOf('L')+1, line1d.length-1),
		line1lastpointArray = line1lastpoint.split(","),
		line1lastX = parseFloat(line1lastpointArray[0]),
		line1lastY = parseFloat(line1lastpointArray[1]),
		callout1boxY = line1lastY-342,
		callout1pathD = 'M'+line1lastpoint+' V '+callout1boxY;

	var cincyCity = map.append("path")
		.datum(cities.features[0])
		.attr("class", "cities")
		.attr("fill", "#000")
		.attr("stroke", "none")
		.attr("d", path);

	var ashlandCity = map.append("path")
		.datum(cities.features[1])
		.attr("class", "cities")
		.attr("fill", "none")
		.attr("stroke", "none")
		.attr("d", path);

	var cincyLabel = map.append("text")
		.attr("id", "cincyLabel")
		.attr("class", "label")
		.attr("font-family", "'Century Gothic', sans-serif")
		.attr("font-size", "20px")
		.attr("x", line1firstX-6)
		.attr("y", line1firstY+22)
		.attr("text-anchor", "end")
		.text("Cincinnati, OH");

	var ashlandLabel = map.append("text")
		.attr("id", "ashlandLabel")
		.attr("class", "label")
		.attr("font-family", "'Century Gothic', sans-serif")
		.attr("font-size", "20px")
		.attr("x", line1lastX-5)
		.text("Ashland, WI");

	var callout1 = map.append("g");

	var callout1path = callout1.append("path")
		.attr("id", 'callout1path')
		.attr("class", "calloutpath")
		.attr("stroke-width", "0px")
		.attr("fill", "none")
		.attr("stroke", "#414040")
		.attr("stroke-linecap", "square")
		.attr("d", callout1pathD);

	var callout1length = callout1path.node().getTotalLength();

	var callout1box = callout1.append("rect")
		.attr("id", "callout1box")
		.attr("class", "calloutbox")
		.attr("stroke-width", "2px")
		.attr("stroke", "#414040")
		.attr("fill", "#FFF")
		.attr("x", line1lastX)
		.attr("y", callout1boxY)
		.attr("height", 120)

	var callout1clippath = callout1.append('defs')
		.append('clipPath')
		.attr('id', 'callout1clippath')
		.append('rect')
		.attr("x", line1lastX)
		.attr("y", callout1boxY)
		.attr("height", 120)
		.attr("width", 0);

	var callout1image = callout1.append("image")
		.attr("xlink:href", "img/northland.jpg")
		.attr("x", line1lastX+5)
		.attr("y", callout1boxY+5)
		.attr("width", 148)
		.attr("height", 110)
		.attr("clip-path", 'url(#callout1clippath)')

	var callout1text = callout1.append("text")
		.attr("id", "callout1text")
		.attr("class", "callouttext")
		.attr("font-family", "'Century Gothic', sans-serif")
		.attr("font-size", "30px")
		.attr('clip-path', 'url(#callout1clippath)')

	var callout1textl1 = callout1text.append("tspan")
		.attr("x", line1lastX+158)
		.attr("y", callout1boxY+35)
		.text("2001– 06");

	var callout1textl2 = callout1text.append("tspan")
		.attr("x", line1lastX+158)
		.attr("y", callout1boxY+70)
		.text("Northland College");

	var callout1textl2 = callout1text.append("tspan")
		.attr("x", line1lastX+158)
		.attr("y", callout1boxY+105)
		.text("B.S. Outdoor Education");

	window.setTimeout(function(){
		line1.attr("stroke-width", "4px")
			.attr("stroke-dasharray", line1length+" "+line1length)
			.attr("stroke-dashoffset", line1length)
			.transition()
				.duration(2000)
				.ease(d3.easePoly.exponent(4))
				.attr("stroke-dashoffset", 0);
	}, 500);

	window.setTimeout(function(){
		ashlandCity.attr("fill", "#000");
		ashlandLabel.attr("y", line1lastY+20);

		callout1path.attr("stroke-width", "2px")
			.attr("stroke-dasharray", callout1length+" "+callout1length)
			.attr("stroke-dashoffset", callout1length)
			.transition()
				.duration(500)
				.ease(d3.easeLinear)
				.attr("stroke-dashoffset", 0);
	}, 2500);

	window.setTimeout(function(){
		callout1box.attr("width", 0)				
			.transition()
				.duration(500)
				.ease(d3.easeLinear)
				.attr("width", 504);

		callout1clippath.transition()
			.duration(500)
			.ease(d3.easeLinear)
			.attr("width", 504);
	}, 3000);
};

function setRoute2(map, path, line2data, cities){
	var line2 = map.append("path")
		.datum(line2data)
		.attr("id", "line2")
		.attr("class", "movelines")
		.attr("stroke-width", "0px")
		.attr("fill", "none")
		.attr("stroke", "#000")
		.attr("stroke-linejoin", "round")
		.attr("d", path);

	var line2length = line2.node().getTotalLength(),
		line2d = line2.attr('d'),
		line2firstpoint = line2d.substr(line2d.indexOf('M')+1, line2d.indexOf('L')-1),
		line2firstpointArray = line2firstpoint.split(","),
		line2firstX = parseFloat(line2firstpointArray[0]),
		line2firstY = parseFloat(line2firstpointArray[1]),
		line2lastpoint = line2d.substr(line2d.lastIndexOf('L')+1, line2d.length-1),
		line2lastpointArray = line2lastpoint.split(","),
		line2lastX = parseFloat(line2lastpointArray[0]),
		line2lastY = parseFloat(line2lastpointArray[1]),
		callout2pathD = 'M'+line2lastpoint+' V '+(line2lastY-99);

	var duluthSuperiorCity = map.append("path")
		.datum(cities.features[2])
		.attr("class", "cities")
		.attr("fill", "none")
		.attr("stroke", "none")
		.attr("d", path);

	var duluthSuperiorLabel = map.append("text")
		.attr("id", "duluthSuperiorLabel")
		.attr("class", "label")
		.attr("font-family", "'Century Gothic', sans-serif")
		.attr("font-size", "20px")
		.attr("text-anchor", "end");

	var duluthLabel = duluthSuperiorLabel.append("tspan")
		.attr("x", line2lastX-12);

	var superiorLabel = duluthSuperiorLabel.append("tspan")
		.attr("x", line2lastX-12);

	var callout2 = map.append("g");

	var callout2path = callout2.append("path")
		.attr("id", 'callout2path')
		.attr("class", "calloutpath")
		.attr("stroke-width", "0px")
		.attr("fill", "none")
		.attr("stroke", "#414040")
		.attr("stroke-linecap", "square")
		.attr("d", callout2pathD);

	var callout2length = callout2path.node().getTotalLength(),
		callout2boxX = line2lastX-300,
		callout2boxY = line2lastY-217;

	var callout2box = callout2.append("rect")
		.attr("id", "callout2box")
		.attr("class", "calloutbox")
		.attr("stroke-width", "2px")
		.attr("stroke", "#414040")
		.attr("fill", "#FFF")
		.attr("x", callout2boxX)
		.attr("y", callout2boxY)
		.attr("height", 120)

	var callout2clippath = callout2.append('defs')
		.append('clipPath')
		.attr('id', 'callout2clippath')
		.append('rect')
		.attr("x", callout2boxX)
		.attr("y", callout2boxY)
		.attr("height", 120)
		.attr("width", 0);

	var callout2image = callout2.append("image")
		.attr("xlink:href", "img/schooltrip.jpg")
		.attr("x", callout2boxX+5)
		.attr("y", callout2boxY+5)
		.attr("width", 147)
		.attr("height", 110)
		.attr("clip-path", 'url(#callout2clippath)')

	var callout2text = callout2.append("text")
		.attr("id", "callout2text")
		.attr("class", "callouttext")
		.attr("font-family", "'Century Gothic', sans-serif")
		.attr("font-size", "30px")
		.attr('clip-path', 'url(#callout2clippath)')

	var callout2text1 = callout2text.append("tspan")
		.attr("x", callout2boxX+157)
		.attr("y", callout2boxY+35)
		.text("2006 –11");

	var callout2text2 = callout2text.append("tspan")
		.attr("x", callout2boxX+157)
		.attr("y", callout2boxY+70)
		.text("High School Teacher");

	var callout2text3 = callout2text.append("tspan")
		.attr("x", callout2boxX+157)
		.attr("y", callout2boxY+105)
		.text("Science, Special Education");

	window.setTimeout(function(){
		line2.attr("stroke-width", "4px")
			.attr("stroke-dasharray", line2length+" "+line2length)
			.attr("stroke-dashoffset", line2length)
			.transition()
				.duration(1000)
				.ease(d3.easePoly.exponent(4))
				.attr("stroke-dashoffset", 0);
	}, 500);

	window.setTimeout(function(){
		duluthSuperiorCity.attr("fill", "#000");
		duluthLabel.attr("y", line2lastY-2)
			.text("Duluth, MN");
		superiorLabel.attr("y", line2lastY+20)
			.text("Superior, WI");

		callout2path.attr("stroke-width", "2px")
			.attr("stroke-dasharray", callout2length+" "+callout2length)
			.attr("stroke-dashoffset", callout2length)
			.transition()
				.duration(500)
				.ease(d3.easeLinear)
				.attr("stroke-dashoffset", 0);
	}, 1500);

	window.setTimeout(function(){
		callout2box.attr("width", 565)				
			// .transition()
			// 	.duration(500)
			// 	.ease(d3.easeLinear)
			// 	.attr("width", 565);

		callout2clippath.attr("width", 565);
			// .transition()
			// .duration(500)
			// .ease(d3.easeLinear)
			// .attr("width", 565);
	}, 2000);
};

function setRoute3(map, path, line3data, cities){
	var line3 = map.append("path")
		.datum(line3data)
		.attr("id", "line3")
		.attr("class", "movelines")
		.attr("stroke-width", "0px")
		.attr("fill", "none")
		.attr("stroke", "#000")
		.attr("stroke-linejoin", "round")
		.attr("d", path);

	var line3length = line3.node().getTotalLength(),
		line3d = line3.attr('d'),
		line3firstpoint = line3d.substr(line3d.indexOf('M')+1, line3d.indexOf('L')-1),
		line3firstpointArray = line3firstpoint.split(","),
		line3firstX = parseFloat(line3firstpointArray[0]),
		line3firstY = parseFloat(line3firstpointArray[1]),
		line3lastpoint = line3d.substr(line3d.lastIndexOf('L')+1, line3d.length-1),
		line3lastpointArray = line3lastpoint.split(","),
		line3lastX = parseFloat(line3lastpointArray[0]),
		line3lastY = parseFloat(line3lastpointArray[1]),
		callout3pathD = 'M'+line3lastpoint+' V '+(line3lastY-82);

	var madisonCity = map.append("path")
		.datum(cities.features[3])
		.attr("class", "cities")
		.attr("fill", "none")
		.attr("stroke", "none")
		.attr("d", path);

	var madisonLabel = map.append("text")
		.attr("id", "madisonLabel")
		.attr("class", "label")
		.attr("font-family", "'Century Gothic', sans-serif")
		.attr("font-size", "20px")
		.attr("text-anchor", "end")
		.attr("x", line3lastX-6);

	var callout3 = map.append("g");

	var callout3path = callout3.append("path")
		.attr("id", 'callout3path')
		.attr("class", "calloutpath")
		.attr("stroke-width", "0px")
		.attr("fill", "none")
		.attr("stroke", "#414040")
		.attr("stroke-linecap", "square")
		.attr("d", callout3pathD);

	var callout3length = callout3path.node().getTotalLength(),
		callout3boxY = line3lastY-200,
		callout3boxX = line3lastX-20;

	var callout3box = callout3.append("rect")
		.attr("id", "callout3box")
		.attr("class", "calloutbox")
		.attr("stroke-width", "2px")
		.attr("stroke", "#414040")
		.attr("fill", "#FFF")
		.attr("x", callout3boxX)
		.attr("y", callout3boxY)
		.attr("width", 599)
		.attr("height", 0)

	var callout3clippath = callout3.append('defs')
		.append('clipPath')
		.attr('id', 'callout3clippath')
		.append('rect')
		.attr("x", callout3boxX)
		.attr("y", callout3boxY)
		.attr("width", 599)
		.attr("height", 0)

	var callout3image = callout3.append("image")
		.attr("xlink:href", "img/sciencehall.jpg")
		.attr("x", callout3boxX+5)
		.attr("y", callout3boxY+5)
		.attr("width", 129)
		.attr("height", 110)
		.attr("clip-path", 'url(#callout3clippath)')

	var callout3text = callout3.append("text")
		.attr("id", "callout3text")
		.attr("class", "callouttext")
		.attr("font-family", "'Century Gothic', sans-serif")
		.attr("font-size", "30px")
		.attr('clip-path', 'url(#callout3clippath)')

	var callout3text1 = callout3text.append("tspan")
		.attr("x", callout3boxX+139)
		.attr("y", callout3boxY+35)
		.text("2011–17 UW–Madison");

	var callout3text2 = callout3text.append("tspan")
		.attr("x", callout3boxX+139)
		.attr("y", callout3boxY+70)
		.text("M.S. Cartography/GIS");

	var callout3text3 = callout3text.append("tspan")
		.attr("x", callout3boxX+139)
		.attr("y", callout3boxY+105)
		.text("Ph.D. Geography (this summer)");

	window.setTimeout(function(){
		line3.attr("stroke-width", "4px")
			.attr("stroke-dasharray", line3length+" "+line3length)
			.attr("stroke-dashoffset", line3length)
			.transition()
				.duration(1000)
				.ease(d3.easePoly.exponent(4))
				.attr("stroke-dashoffset", 0);
	}, 500);

	window.setTimeout(function(){
		madisonCity.attr("fill", "#000");
		madisonLabel.attr("y", line3lastY+24)
			.text("Madison, WI");

		callout3path.attr("stroke-width", "2px")
			.attr("stroke-dasharray", callout3length+" "+callout3length)
			.attr("stroke-dashoffset", callout3length)
			.transition()
				.duration(500)
				.ease(d3.easeLinear)
				.attr("stroke-dashoffset", 0);
	}, 1500);

	window.setTimeout(function(){
		callout3box.attr("height", 120);
			// .transition()
			// 	.duration(500)
			// 	.ease(d3.easeLinear)
			// 	.attr("height", 120);

		callout3clippath.attr("height", 120);
			// .transition()
			// .duration(500)
			// .ease(d3.easeLinear)
			// .attr("height", 120);
	}, 2000);
};


})();