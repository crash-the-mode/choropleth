async function drawMap() {
	
	// 1. Access data
	
	const us = await d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json");
	const dataset = await d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json");
//	console.log(us);
	
	const usGeoJson = topojson.feature(us, us.objects.counties);
	console.log(usGeoJson);

	const idAccessor = d => d.id;
//	console.log(idAccessor(usGeoJson.features[1]))
	const eduAccessor = d => d.bachelorsOrHigher;
	console.log(dataset);

	let fipsBreakDown = {};
	dataset.forEach(d  => {
		fipsBreakDown[d["fips"].toString()] = {
			"state": d.state,
			"county": d["area_name"],
			"edu": eduAccessor(d),
		}; 
	});
	console.log(fipsBreakDown["1003"]);

	// 2. Create chart dimensions
	
	const width = 1440;
	const height = 900;

	// 3. Draw canvas
	
	const canvas = d3.select("#canvas")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	// 4. Create scales
	
	const eduBounds = d3.extent(dataset, eduAccessor);
//	console.log(eduBounds);
	
	const colorScale = d3.scaleThreshold()
		.domain([10, 20, 30, 40, 50,])
		.range(["#eff3ff", "#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"]);

	// 5. Draw data
	
	const counties = canvas.append("g")
		.selectAll("path")
		.data(usGeoJson.features)
		.enter()
		.append("path")
		.attr("class", "county")
		.attr("d", d => d3.geoPath()(d))
		.attr("fill", d => colorScale(fipsBreakDown[idAccessor(d).toString()]["edu"]));

}

drawMap();
