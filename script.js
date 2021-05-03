async function drawMap() {
	
	// 1. Access data
	
	const us = await d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json");
	const dataset = await d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json");
//	console.log(us);
	
	const usGeoJson = topojson.feature(us, us.objects.counties);
//	console.log(usGeoJson);

	const idAccessor = d => d.id;
//	console.log(idAccessor(usGeoJson.features[1]))
	const eduAccessor = d => d.bachelorsOrHigher;
//	console.log(dataset);

	let fipsBreakDown = {};
	dataset.forEach(d  => {
		fipsBreakDown[d["fips"].toString()] = {
			"state": d.state,
			"county": d["area_name"],
			"edu": eduAccessor(d),
		}; 
	});
//	console.log(fipsBreakDown["1003"]);

	// 2. Create chart dimensions
	
	const width = 1280;
	const height = 850;
	const marginTop = 50;
	const mapHeight = height - marginTop;

	// 3. Draw canvas
	
	const canvas = d3.select("#canvas")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	const map = canvas.append("g")
		.style("transform", `translateY(${marginTop}px)`);

	// 4. Create scales
	
	const eduBounds = d3.extent(dataset, eduAccessor);
//	console.log(eduBounds);
	
	const colorScale = d3.scaleThreshold()
		.domain([10, 20, 30, 40, 50,])
		.range(["#eff3ff", "#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"]);

	const projection = d3.geoIdentity().fitSize([width, mapHeight], usGeoJson);

	// 5. Draw data
	
	const counties = map.append("g")
		.selectAll("path")
		.data(usGeoJson.features)
		.enter()
		.append("path")
		.attr("class", "county")
		.attr("d", d => d3.geoPath(projection)(d))
		.attr("fill", d => colorScale(fipsBreakDown[idAccessor(d).toString()]["edu"]))
		.attr("data-fips", d => idAccessor(d))
		.attr("data-education", d => fipsBreakDown[idAccessor(d).toString()]["edu"]);

	const stateBorders = map.append("path")
		.datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
		.attr("fill", "none")
		.attr("stroke", "white")
		.attr("d", d => d3.geoPath(projection)(d));

	// 6. Draw peripherals

	const legendGroup = map.append("g")
		.attr("id", "legend")
		.style("transform", `translate(925px, 60px)`);

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

	const legendText = legendGroup.append("text")
		.text("Bachelor's degree or higher (%)")
		.attr("y", -5);

	const title = canvas.append("text")
		.text("United States Education Attainment")
		.attr("x", width / 2)
		.attr("y", 50)
		.attr("id", "title")
		.style("text-anchor", "middle");

	const description = canvas.append("text")
		.text("Adults age 25 with bachelor's or higher from 2010 - 2014 at the county level")
		.attr("x", width / 2)
		.attr("y", 75)
		.attr("id", "description")
		.style("text-anchor", "middle");

	// 7. Set up interactions

	map.selectAll(".county")
		.on("mouseenter", onMouseEnter)
		.on("mouseleave", onMouseLeave);

	const tooltip = d3.select("#tooltip");

	function onMouseEnter(e, datum) {
//		console.log({e, datum});
		const [centerX, centerY] = d3.geoPath(projection).centroid(datum);
//		console.log({centerX, centerY});
		const x = centerX;
		const y = centerY + marginTop;
		const {state, county, edu} = fipsBreakDown[idAccessor(datum).toString()];
		tooltip.select("#data-edu")
			.text(`${county}, ${state}: ${edu}%`);
		tooltip.style("transform", `translate(calc(5% + ${x}px), calc(-100% + ${y}px))`);
		tooltip.attr("data-education", edu);
		tooltip.style("opacity", 1);
	}
	function onMouseLeave(e, datum) {
		tooltip.style("opacity", 0);
	}

}

drawMap();
