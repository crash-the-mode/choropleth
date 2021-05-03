async function drawMap() {
	
	// 1. Access data
	
	const us = await d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json");
	const dataset = await d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json");
	console.log(us);
	
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
	
	const width = 1280;
	const height = 800;

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

	const projection = d3.geoIdentity().fitSize([width, height], usGeoJson);

	// 5. Draw data
	
	const counties = canvas.append("g")
		.selectAll("path")
		.data(usGeoJson.features)
		.enter()
		.append("path")
		.attr("class", "county")
		.attr("d", d => d3.geoPath(projection)(d))
		.attr("fill", d => colorScale(fipsBreakDown[idAccessor(d).toString()]["edu"]))
		.attr("data-fips", d => idAccessor(d))
		.attr("data-education", d => fipsBreakDown[idAccessor(d).toString()]["edu"]);

	const stateBorders = canvas.append("path")
		.datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
		.attr("fill", "none")
		.attr("stroke", "white")
		.attr("d", d => d3.geoPath(projection)(d));

	// 6. Draw peripherals

	const legendGroup = canvas.append("g")
		.attr("id", "legend")
		.style("transform", `translate(900px, 60px)`);

	const legendWidth = 240;
	const colorLength = colorScale.range().length;
	const legendScale = d3.scaleLinear()
		.domain([1, colorLength - 1])
		.rangeRound([legendWidth / colorLength, legendWidth - (legendWidth / colorLength)]);

	const legendRects = legendGroup.selectAll("rect")
		.data(colorScale.range())
		.enter()
		.append("rect")
		.attr("x", (d, i) => legendScale(i))
		.attr("width", legendWidth / colorLength)
		.attr("height", legendWidth / colorLength)
		.attr("fill", d => d);

	const legendLabelGroup = legendGroup.append("g");

	const legendLabel = d3.axisBottom()
		.scale(legendScale)
		.tickValues(d3.range(1, colorLength))
		.tickFormat(i => colorScale.domain()[i - 1])
		.tickSize(10);

	const legend = legendLabelGroup.call(legendLabel)
		.style("transform", `translateY(${legendWidth / colorLength - 1}px)`);

}

drawMap();
