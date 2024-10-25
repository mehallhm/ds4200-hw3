// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function (data) {
	// Convert string values to numbers
	data.forEach(function (d) {
		d.PetalLength = +d.PetalLength;
		d.PetalWidth = +d.PetalWidth;
	});

	// Define the dimensions and margins for the SVG
	let width = 600,
		height = 400;

	let margin = {
		top: 30,
		bottom: 50,
		left: 50,
		right: 30,
	};

	// Draw the axis

	// Create the SVG container
	let svg = d3
		.select("#scatterplot")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	// Set up scales for x and y axes
	let xScale = d3
		.scaleLinear()
		.domain([0, d3.max(data, (d) => d.PetalLength) + 1])
		.range([margin.left, width - margin.right]);

	let yScale = d3
		.scaleLinear()
		.domain([0, d3.max(data, (d) => d.PetalWidth) + 1])
		.range([height - margin.bottom, margin.top]);

	const colorScale = d3
		.scaleOrdinal()
		.domain(data.map((d) => d.Species))
		.range(d3.schemeCategory10);

	// Add scales
	let xAxis = svg
		.append("g")
		.call(d3.axisBottom().scale(xScale))
		.attr("transform", `translate(0, ${height - margin.bottom})`);

	let yAxis = svg
		.append("g")
		.call(d3.axisLeft().scale(yScale))
		.attr("transform", `translate(${margin.left},0)`);

	// Add circles for each data point
	let circle = svg
		.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx", (d) => xScale(d.PetalLength))
		.attr("cy", (d) => yScale(d.PetalWidth))
		.attr("fill", (d) => colorScale(d.Species))
		.attr("r", 5);

	// Add x-axis label
	svg.append("text")
		.attr("x", width / 2)
		.attr("y", height - 15)
		.text("Name")
		.style("text-anchor", "middle");

	// Add y-axis label
	svg.append("text")
		.attr("x", 0 - height / 2)
		.attr("y", 25)
		.text("Rating")
		.style("text-anchor", "middle")
		.attr("transform", "rotate(-90)");

	// Add legend
	const legend = svg
		.selectAll(".legend")
		.data(colorScale.domain())
		.enter()
		.append("g")
		.attr("class", "legend")
		.attr("transform", (d, i) => "translate(0," + (i * 20 + 40) + ")");

	// Add text labels
	legend
		.append("text")
		.attr("x", 74)
		.attr("y", 5)
		.text((d) => d);

	// Add circles
	legend
		.append("circle")
		.attr("fill", (d) => colorScale(d))
		.attr("cx", 65)
		.attr("r", 5);
});

iris.then(function (data) {
	// Convert string values to numbers
	data.forEach(function (d) {
		d.PetalLength = +d.PetalLength;
		d.PetalWidth = +d.PetalWidth;
	});

	// Define the dimensions and margins for the SVG
	let width = 600,
		height = 400;

	let margin = {
		top: 30,
		bottom: 50,
		left: 50,
		right: 30,
	};

	// Create the SVG container
	let svg = d3
		.select("#boxplot")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	// Set up scales for x and y axes
	let xScale = d3
		.scaleBand()
		.range([0, width])
		.domain(["Iris-setosa", "Iris-versicolor", "Iris-virginica"])
		.paddingInner(0.1)
		.range([margin.left, width - margin.right]);

	let yScale = d3
		.scaleLinear()
		.domain([0, d3.max(data, (d) => d.PetalLength) + 1])
		.range([height - margin.bottom, margin.top]);

	// Add scales
	let xAxis = svg
		.append("g")
		.call(d3.axisBottom().scale(xScale))
		.attr("transform", `translate(0, ${height - margin.bottom})`);

	let yAxis = svg
		.append("g")
		.call(d3.axisLeft().scale(yScale))
		.attr("transform", `translate(${margin.left},0)`);

	// Add x-axis label
	svg.append("text")
		.attr("x", width / 2)
		.attr("y", height - 15)
		.text("Species Type")
		.style("text-anchor", "middle");

	// Add y-axis label
	svg.append("text")
		.attr("x", 0 - height / 2)
		.attr("y", 25)
		.text("Petal Legnth")
		.style("text-anchor", "middle")
		.attr("transform", "rotate(-90)");

	const rollupFunction = function (groupData) {
		const values = groupData.map((d) => d.PetalLength).sort(d3.ascending);
		const q1 = d3.quantile(values, 0.25);
		const q2 = d3.quantile(values, 0.5);
		const q3 = d3.quantile(values, 0.75);

		interQuantileRange = q3 - q1;
		min = q1 - 1.5 * interQuantileRange;
		max = q3 + 1.5 * interQuantileRange;
		return { q1, q2, q3, min, max };
	};

	const quartilesBySpecies = d3.rollup(
		data,
		rollupFunction,
		(d) => d.Species
	);

	quartilesBySpecies.forEach((quartiles, Species) => {
		const x = xScale(Species);
		const boxWidth = xScale.bandwidth();

		console.log(quartiles, Species);
		console.log(yScale(quartiles.q3) - yScale(quartiles.q1));

		// Draw vertical lines
		svg.append("line")
			.attr("x1", x + 0.5 * boxWidth)
			.attr("x2", x + 0.5 * boxWidth)
			.attr("y1", yScale(quartiles.min))
			.attr("y2", yScale(quartiles.max))
			.attr("stroke", "black")
			.style("width", 40);

		// Draw box
		svg.append("rect")
			.attr("x", x)
			.attr("y", yScale(quartiles.q3))
			.attr("width", boxWidth)
			.attr("fill", "white")
			.attr("stroke", "black")
			.attr("height", yScale(quartiles.q1) - yScale(quartiles.q3));

		// Draw median line
		svg.append("line")
			.attr("x1", x)
			.attr("x2", x + boxWidth)
			.attr("y1", yScale(quartiles.q2))
			.attr("y2", yScale(quartiles.q2))
			.attr("stroke", "black")
			.style("width", 40);
	});
});
