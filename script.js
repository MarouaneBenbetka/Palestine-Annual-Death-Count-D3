const data = {
	palestinians: [
		{ conversion: 274, date: "2000" },
		{ conversion: 465, date: "2001" },
		{ conversion: 1042, date: "2002" },
		{ conversion: 600, date: "2003" },
		{ conversion: 804, date: "2004" },
		{ conversion: 264, date: "2005" },
		{ conversion: 687, date: "2006" },
		{ conversion: 180, date: "2007" },
		{ conversion: 3202, date: "2008" },
		{ conversion: 7460, date: "2009" },
		{ conversion: 1659, date: "2010" },
		{ conversion: 2260, date: "2011" },
		{ conversion: 4936, date: "2012" },
		{ conversion: 3031, date: "2013" },
		{ conversion: 19860, date: "2014" },
		{ conversion: 14813, date: "2015" },
		{ conversion: 3572, date: "2016" },
		{ conversion: 8526, date: "2017" },
		{ conversion: 11558, date: "2018" },
		{ conversion: 15628, date: "2019" },
		{ conversion: 2781, date: "2020" },
		{ conversion: 260, date: "2021" },
		{ conversion: 204, date: "2022" },
		{ conversion: 23469, date: "2023" },
		{ conversion: 23469, date: "2024" },
	],
	children: [
		{ conversion: 93, date: "2000" },
		{ conversion: 98, date: "2001" },
		{ conversion: 192, date: "2002" },
		{ conversion: 130, date: "2003" },
		{ conversion: 162, date: "2004" },
		{ conversion: 52, date: "2005" },
		{ conversion: 124, date: "2006" },
		{ conversion: 50, date: "2007" },
		{ conversion: 112, date: "2008" },
		{ conversion: 315, date: "2009" },
		{ conversion: 8, date: "2010" },
		{ conversion: 15, date: "2011" },
		{ conversion: 43, date: "2012" },
		{ conversion: 5, date: "2013" },
		{ conversion: 546, date: "2014" },
		{ conversion: 31, date: "2015" },
		{ conversion: 35, date: "2016" },
		{ conversion: 15, date: "2017" },
		{ conversion: 57, date: "2018" },
		{ conversion: 28, date: "2019" },
		{ conversion: 9, date: "2020" },
		{ conversion: 78, date: "2021" },
		{ conversion: 44, date: "2022" },
		{ conversion: 6024, date: "2023" },
		{ conversion: 6024, date: "2024" },
	],

	israeli: [
		{ conversion: 32, date: "2000" },
		{ conversion: 184, date: "2001" },
		{ conversion: 415, date: "2002" },
		{ conversion: 200, date: "2003" },
		{ conversion: 110, date: "2004" },
		{ conversion: 32, date: "2005" },
		{ conversion: 20, date: "2006" },
		{ conversion: 12, date: "2007" },
		{ conversion: 853, date: "2008" },
		{ conversion: 123, date: "2009" },
		{ conversion: 185, date: "2010" },
		{ conversion: 136, date: "2011" },
		{ conversion: 578, date: "2012" },
		{ conversion: 157, date: "2013" },
		{ conversion: 2796, date: "2014" },
		{ conversion: 339, date: "2015" },
		{ conversion: 222, date: "2016" },
		{ conversion: 174, date: "2017" },
		{ conversion: 130, date: "2018" },
		{ conversion: 133, date: "2019" },
		{ conversion: 61, date: "2020" },
		{ conversion: 56, date: "2021" },
		{ conversion: 32, date: "2022" },
		{ conversion: 1200, date: "2023" },
		{ conversion: 1200, date: "2024" },
	],
};

const height = 500;
const width = 1000;

var svg = d3.select("svg").attr("width", width).attr("height", height);

/*
  Brush & Zoom area chart block to work with mulit-line charts.
  Combining d3-brush and d3-zoom to implement Focus + Context.

  The focus chart is the main larger one where the zooming occurs.
  The context chart is the smaller one below where the brush is used to specify a focused area.
  */

// sets margins for both charts
var focusChartMargin = { top: 20, right: 20, bottom: 170, left: 100 };
var contextChartMargin = { top: 360, right: 20, bottom: 90, left: 100 };

// width of both charts
var chartWidth = width - focusChartMargin.left - focusChartMargin.right;

// height of either chart
var focusChartHeight = height - focusChartMargin.top - focusChartMargin.bottom;
var contextChartHeight =
	height - contextChartMargin.top - contextChartMargin.bottom;

// bootstraps the d3 parent selection
svg.append("svg")
	.attr("width", chartWidth + focusChartMargin.left + focusChartMargin.right)
	.attr(
		"height",
		focusChartHeight + focusChartMargin.top + focusChartMargin.bottom
	)
	.append("g")
	.attr(
		"transform",
		"translate(" + focusChartMargin.left + "," + focusChartMargin.top + ")"
	)
	.attr("overflow", "visible");

// function to parse date field
var parseTime = d3.timeParse("%Y");

// group all dates to get range for x axis later
var dates = [];
// group y axis values (value) of all lines to x axis (key)
var groupValuesByX = {};
for (let key of Object.keys(data)) {
	data[key].forEach((bucketRecord) => {
		dates.push(parseTime(bucketRecord.date));

		!(bucketRecord.date in groupValuesByX) &&
			(groupValuesByX[bucketRecord.date] = {}); // if date as key does not exist then create
		groupValuesByX[bucketRecord.date][key] = bucketRecord.conversion;
	});
}

var availableDates = Object.keys(groupValuesByX);
availableDates.sort(); // sort dates in increasing order

//get max Y axis value by searching for the highest conversion rate
var maxYAxisValue = -Infinity;
for (let key of Object.keys(data)) {
	let maxYAxisValuePerBucket = Math.ceil(
		d3.max(data[key], (d) => d["conversion"])
	);
	maxYAxisValue = Math.max(maxYAxisValuePerBucket, maxYAxisValue);
}

// set the height of both y axis
var yFocus = d3.scaleLinear().range([focusChartHeight, 0]);
var yContext = d3.scaleLinear().range([contextChartHeight, 0]);

// set the width of both x axis
var xFocus = d3.scaleTime().range([0, chartWidth]);
var xContext = d3.scaleTime().range([0, chartWidth]);

// create both x axis to be rendered
var xAxisFocus = d3
	.axisBottom(xFocus)
	.ticks(10)
	.tickFormat(d3.timeFormat("%Y"));
var xAxisContext = d3
	.axisBottom(xContext)
	.ticks(10)
	.tickFormat(d3.timeFormat("%Y"));

// create the one y axis to be rendered
var yAxisFocus = d3
	.axisLeft(yFocus)
	.tickFormat((d) => (d * maxYAxisValue) / 100);

// build brush
var brush = d3
	.brushX()
	.extent([
		[0, -10],
		[chartWidth, contextChartHeight],
	])
	.on("brush end", brushed);

// build zoom for the focus chart
// as specified in "filter" - zooming in/out can be done by pinching on the trackpad while mouse is over focus chart
// zooming in can also be done by double clicking while mouse is over focus chart
var zoom = d3
	.zoom()
	.scaleExtent([1, Infinity])
	.translateExtent([
		[0, 0],
		[chartWidth, focusChartHeight],
	])
	.extent([
		[0, 0],
		[chartWidth, focusChartHeight],
	])
	.on("zoom", zoomed)
	.filter(
		() =>
			d3.event.ctrlKey ||
			d3.event.type === "dblclick" ||
			d3.event.type === "mousedown"
	);

// create a line for focus chart
var lineFocus = d3
	.line()
	.x((d) => xFocus(parseTime(d.date)))
	.y((d) => yFocus(d.conversion));

// create line for context chart
var lineContext = d3
	.line()
	.x((d) => xContext(parseTime(d.date)))
	.y((d) => yContext(d.conversion));

// es lint disabled here so react won't warn about not using variable "clip"
/* eslint-disable */

// clip is created so when the focus chart is zoomed in the data lines don't extend past the borders
var clip = svg
	.append("defs")
	.append("svg:clipPath")
	.attr("id", "clip")
	.append("svg:rect")
	.attr("width", chartWidth)
	.attr("height", focusChartHeight)
	.attr("x", 0)
	.attr("y", 0);

// append the clip
var focusChartLines = svg
	.append("g")
	.attr("class", "focus")
	.attr(
		"transform",
		"translate(" + focusChartMargin.left + "," + focusChartMargin.top + ")"
	)
	.attr("clip-path", "url(#clip)");

/* eslint-enable */

// create focus chart
var focus = svg
	.append("g")
	.attr("class", "focus")
	.attr(
		"transform",
		"translate(" + focusChartMargin.left + "," + focusChartMargin.top + ")"
	);

// create context chart
var context = svg
	.append("g")
	.attr("class", "context")
	.attr(
		"transform",
		"translate(" +
			contextChartMargin.left +
			"," +
			(contextChartMargin.top + 50) +
			")"
	);

// add data info to axis
xFocus.domain(d3.extent(dates));
yFocus.domain([0, maxYAxisValue]);
xContext.domain(d3.extent(dates));
yContext.domain(yFocus.domain());

// add axis to focus chart
focus
	.append("g")
	.attr("class", "x-axis")
	.attr("transform", "translate(0," + focusChartHeight + ")")
	.call(xAxisFocus);
focus.append("g").attr("class", "y-axis").call(yAxisFocus);

// get list of bucket names
var bucketNames = [];
for (let key of Object.keys(data)) {
	bucketNames.push(key);
}

// focus chart x label
focus
	.append("text")
	.attr(
		"transform",
		"translate(" +
			chartWidth / 2 +
			" ," +
			(focusChartHeight + focusChartMargin.top + 25) +
			")"
	)
	.style("text-anchor", "middle")
	.style("font-size", "18px")
	.text("Annual Mortality Rates in Palestine (Years)");

// match colors to bucket name
var colors = d3
	.scaleOrdinal()
	.domain(bucketNames)
	.range(["#e74c3c", "#3cab4b", "#3498db", "#73169e", "#2ecc71"]);

// go through data and create/append lines to both charts
for (let key of Object.keys(data)) {
	let bucket = data[key];
	focusChartLines
		.append("path")
		.datum(bucket)
		.attr("class", "line")
		.attr("fill", "none")
		.attr("stroke", (d) => colors(key))
		.attr("stroke-width", 1.5)
		.attr("d", lineFocus);
	context
		.append("path")
		.datum(bucket)
		.attr("class", "line")
		.attr("fill", "none")
		.attr("stroke", (d) => colors(key))
		.attr("stroke-width", 1.5)
		.attr("d", lineContext);
}

// add x axis to context chart (y axis is not needed)
context
	.append("g")
	.attr("class", "x-axis")
	.attr("transform", "translate(0," + contextChartHeight + ")")
	.call(xAxisContext);

// add bush to context chart
var contextBrush = context.append("g").attr("class", "brush").call(brush);

// style brush resize handle
var brushHandlePath = (d) => {
	var e = +(d.type === "e"),
		x = e ? 1 : -1,
		y = contextChartHeight + 10;
	return (
		"M" +
		0.5 * x +
		"," +
		y +
		"A6,6 0 0 " +
		e +
		" " +
		6.5 * x +
		"," +
		(y + 6) +
		"V" +
		(2 * y - 6) +
		"A6,6 0 0 " +
		e +
		" " +
		0.5 * x +
		"," +
		2 * y +
		"Z" +
		"M" +
		2.5 * x +
		"," +
		(y + 8) +
		"V" +
		(2 * y - 8) +
		"M" +
		4.5 * x +
		"," +
		(y + 8) +
		"V" +
		(2 * y - 8)
	);
};

var brushHandle = contextBrush
	.selectAll(".handle--custom")
	.data([{ type: "w" }, { type: "e" }])
	.enter()
	.append("path")
	.attr("class", "handle--custom")
	.attr("stroke", "#000")
	.attr("cursor", "ew-resize")
	.attr("d", brushHandlePath);

// overlay the zoom area rectangle on top of the focus chart
var rectOverlay = svg
	.append("rect")
	.attr("cursor", "move")
	.attr("fill", "none")
	.attr("pointer-events", "all")
	.attr("class", "zoom")
	.attr("width", chartWidth)
	.attr("height", focusChartHeight)
	.attr(
		"transform",
		"translate(" + focusChartMargin.left + "," + focusChartMargin.top + ")"
	)
	.call(zoom)
	.on("mousemove", focusMouseMove)
	.on("mouseover", focusMouseOver)
	.on("mouseout", focusMouseOut);

var mouseLine = focus
	.append("path") // create vertical line to follow mouse
	.attr("class", "mouse-line")
	.attr("stroke", "#303030")
	.attr("stroke-width", 2)
	.attr("opacity", "0");

var tooltip = focus
	.append("g")
	.attr("class", "tooltip-wrapper")
	.attr("display", "none");

var tooltipBackground = tooltip.append("rect").attr("fill", "#e8e8e8");

var tooltipText = tooltip.append("text");

contextBrush.call(brush.move, [0, chartWidth]);

// focus chart y label
focus
	.append("text")
	.attr("text-anchor", "middle")
	.attr(
		"transform",
		"translate(" +
			(-focusChartMargin.left + 30) +
			"," +
			focusChartHeight / 2 +
			")rotate(-90)"
	)
	.style("font-size", "18px")
	.text("Deaths Count");

function brushed() {
	if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
	tooltip.attr("display", "none");
	focus.selectAll(".tooltip-line-circles").remove();
	mouseLine.attr("opacity", "0");
	var s = d3.event.selection || xContext.range();
	xFocus.domain(s.map(xContext.invert, xContext));
	focusChartLines.selectAll(".line").attr("d", lineFocus);
	focus.select(".x-axis").call(xAxisFocus);
	svg.select(".zoom").call(
		zoom.transform,
		d3.zoomIdentity.scale(chartWidth / (s[1] - s[0])).translate(-s[0], 0)
	);
	brushHandle
		.attr("display", null)
		.attr(
			"transform",
			(d, i) => "translate(" + [s[i], -contextChartHeight - 20] + ")"
		);
}

function zoomed() {
	if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
	tooltip.attr("display", "none");
	focus.selectAll(".tooltip-line-circles").remove();
	mouseLine.attr("opacity", "0");
	var t = d3.event.transform;
	xFocus.domain(t.rescaleX(xContext).domain());
	focusChartLines.selectAll(".line").attr("d", lineFocus);
	focus.select(".x-axis").call(xAxisFocus);
	var brushSelection = xFocus.range().map(t.invertX, t);
	context.select(".brush").call(brush.move, brushSelection);
	brushHandle
		.attr("display", null)
		.attr(
			"transform",
			(d, i) =>
				"translate(" +
				[brushSelection[i], -contextChartHeight - 20] +
				")"
		);
}

function focusMouseMove() {
	tooltip.attr("display", null);
	var mouse = d3.mouse(this);
	var dateOnMouse = `${xFocus.invert(mouse[0]).getFullYear()}-1-1`;
	var nearestDateIndex = d3.bisect(availableDates, dateOnMouse.toString());
	var d0 = new Date(availableDates[nearestDateIndex - 1]);
	var d1 = new Date(availableDates[nearestDateIndex]);
	var closestDate;

	if (d0 < xFocus.domain()[0]) {
		closestDate = availableDates[nearestDateIndex];
	} else if (d1 > xFocus.domain()[1]) {
		closestDate = availableDates[nearestDateIndex - 1];
	} else {
		// decide which date is closest to the mouse
		closestDate =
			dateOnMouse - d0 > d1 - dateOnMouse
				? availableDates[nearestDateIndex - 1]
				: availableDates[nearestDateIndex];
	}

	var nearestDateYValues = groupValuesByX[closestDate];
	var nearestDateXCord = xFocus(new Date(closestDate));

	mouseLine
		.attr("d", `M ${nearestDateXCord} 0 V ${focusChartHeight}`)
		.attr("opacity", "1");

	tooltipText.selectAll(".tooltip-text-line").remove();
	focus.selectAll(".tooltip-line-circles").remove();
	var formatTime = d3.timeFormat("%Y");
	tooltipText
		.append("tspan")
		.attr("class", "tooltip-text-line")
		.attr("x", "5")
		.attr("y", "5")
		.attr("dy", "13px")
		.attr("font-weight", "bold")
		.attr("fill", "#303030")
		.text(`${closestDate}`);

	for (let key of Object.keys(nearestDateYValues)) {
		focus
			.append("circle")
			.attr("class", "tooltip-line-circles")
			.attr("r", 5)
			.attr("fill", colors(key))
			.attr("cx", nearestDateXCord)
			.attr("cy", yFocus(nearestDateYValues[key]));

		tooltipText
			.append("tspan")
			.attr("class", "tooltip-text-line")
			.attr("x", "5")
			.attr("dy", `14px`)
			.attr("fill", colors(key))
			.text(`${key}: ${nearestDateYValues[key]}`);
	}

	var tooltipWidth = tooltipText.node().getBBox().width;
	var tooltipHeight = tooltipText.node().getBBox().height;
	var rectOverlayWidth = rectOverlay.node().getBBox().width;
	tooltipBackground
		.attr("width", tooltipWidth + 10)
		.attr("height", tooltipHeight + 10);
	if (nearestDateXCord + tooltipWidth >= rectOverlayWidth) {
		tooltip.attr(
			"transform",
			"translate(" +
				(nearestDateXCord - tooltipWidth - 20) +
				"," +
				mouse[1] +
				")"
		);
	} else {
		tooltip.attr(
			"transform",
			"translate(" + (nearestDateXCord + 10) + "," + mouse[1] + ")"
		);
	}
}

function focusMouseOver() {
	mouseLine.attr("opacity", "1");
	tooltip.attr("display", null);
}

function focusMouseOut() {
	mouseLine.attr("opacity", "0");
	tooltip.attr("display", "none");
	focus.selectAll(".tooltip-line-circles").remove();
}

const toggleDarkMode = (e) => {
	e.preventDefault();

	const body = document.getElementById("body");
	body.classList.toggle("dark");

	document.getElementById("toggleDarkMode").classList.toggle("active");
};
