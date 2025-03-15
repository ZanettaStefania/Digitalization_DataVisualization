// set the dimensions and margins of the graph
var margin = {top: 70, right: 30, bottom: 50, left:80},
    width = 1200 - margin.left - margin.right,
    height = 560 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_ridgeline")
  .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`) // This makes the chart responsive
    .attr("preserveAspectRatio", "xMidYMid meet")
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//read data
d3.csv('./csv/ridgeline_processed.csv', function(data) {

    // Get the different categories and count them
    var categories = ["2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019"]
    var n = categories.length

    // Compute the mean of each group
    var allMeans = [];
    var roundedMeans = []; // New array for the rounded values
    var currentGroup;
    var mean;
    for (var i in categories){
        currentGroup = categories[i];
        mean = d3.mean(data, function(d) { return +d[currentGroup] });
        allMeans.push(mean);
        roundedMeans.push(+mean.toFixed(2)); // Push the rounded value to the new array
    }


    var startColor = "#0074ff"; // Blue
    var endColor = "#ff372c";   // Red

    // Create a custom interpolator function
    var customInterpolator = d3.interpolateRgb(startColor, endColor);

    // Create a color scale using the custom interpolator
    var myColor = function(t) {
        return customInterpolator(t);
    };

    // Tooltip
    var tooltip = d3.select('body')
    .append("div")
        .style("position", "absolute")
        .style("background", "#f0f0f0") 
        .style("padding", "10px")
        .style("border", "1px solid #ccc") 
        .style("border-radius", "8px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("font", "15px Montserrat")
        .style("color", "#333");
    

    // Add X axis
    var x = d3.scaleLinear()
        .domain([-10, 120])
        .range([ 0, width ]);
        
    svg.append("g")
        .attr("class", "xAxis")
        .style("font", "15px Montserrat")
        .attr("transform", "translate(0," + (height) + ")") 
        .call(d3.axisBottom(x).tickValues([0,25, 50, 75, 100]).tickSize(-height) )
        .select(".domain").remove()
    
    svg.selectAll(".xAxis .tick text")
        .attr("y", 10);

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 40)
        .style("font", "15px Montserrat")
        .text("Probability (%)");

    // Create a Y scale for densities
    var y = d3.scaleLinear()
        .domain([0, 0.25])
        .range([ height, 0]);

    // Create the Y axis for names
    var yName = d3.scaleBand()
        .domain(categories)
        .range([0, height])
        .paddingInner(1)

    svg.append("g")
        .call(d3.axisLeft(yName).tickSize(0))
        .style("font", "15px Montserrat")
        .select(".domain").remove()

    // Compute kernel density estimation for each column:
    var kde = kernelDensityEstimatorWithMissing(kernelEpanechnikov(7), x.ticks(40));
    var allDensity = []
    var key 
    var density
    for (i = 0; i < n; i++) {
        key = categories[i]
        density = kde( data.map(function(d){  return d[key]; }) )
        allDensity.push({key: key, density: density})
    }


    var yearMeanData = []; // This will hold the new data structure

    for (var i = 0; i < categories.length; i++) {
        var year = categories[i]; // Get the year from the categories array
        var meanValue = allMeans[i]; // Get the corresponding mean value from allMeans

        // Construct an object with year and meanValue
        var yearMeanObject = {
            year: year,
            mean: meanValue
        };
        yearMeanData.push(yearMeanObject);
    }


    // Add areas
    svg.selectAll("areas")
        .data(allDensity)
        .enter()
        .append("path")
        .attr("class", "area")
        .attr("transform", function(d){ return "translate(0," + (yName(d.key)-height) + ")" })
        .attr("fill", function(d) {
            var value = yearMeanData.find(function(yearData) { return yearData.year === d.key; }).mean;
            return myColor(value / 80);
        })
        .datum(function(d) { return d.density; })
        .attr("opacity", 0.8)
        .attr("stroke", "#000")
        .attr("stroke-width", 0.1)
        .attr("d", d3.line()
            .curve(d3.curveBasis)
            .x(function(d) { return x(d[0]); })
            .y(function(d) { return y(d[1]); })
        )
        .data(allDensity)
        .on("mouseover", function(d) {
            var yearData = yearMeanData.find(function(yearData) { return yearData.year === d.key; });
            var year = yearData.year;
            var meanValue = yearData.mean;

            d3.select(this)
            .raise() // This brings the hovered area to the front
            .transition()
            .duration(100)
            .attr("opacity", 0.8)
            .attr("stroke-width", 2);

            // Reduce opacity of other areas
            d3.selectAll('.area')
                .transition()
                .duration(100)
                .attr("opacity", function(otherD) {
                    return otherD === d ? 0.8 : 0.3;
                });
            tooltip.transition()
                .duration(100)
                .style("opacity", 0.9);
            tooltip.html(
                 "<strong>Year: </strong>" + year + "<br>" + 
                 "<strong>Mean probability: </strong>" + meanValue.toFixed(2) + "%<br>" 
               
                )
                .style("visibility", "visible")
                .style("font", "15px Montserrat")
                .style("color", "#333")
                .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 150) + "px" : (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 80) + "px" : (d3.event.pageY + 5) + "px");
        })
        .on("mousemove", function(d) {
            tooltip
            .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 150) + "px" : (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 80) + "px" : (d3.event.pageY + 5) + "px");
        }) 
        .on("mouseout", function(d) {
            d3.selectAll('.area')
            .transition()
            .duration(200)
            .attr("opacity", 0.7)
            .attr("stroke-width", 0.1);

            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        })

    })

    // Function to compute kernel density estimation while handling missing data
    function kernelDensityEstimatorWithMissing(kernel, X) {
        return function(V) {
        return X.map(function(x) {
            var validValues = V.filter(function(v) {
            return v !== ":" && !isNaN(v); // Check for missing values and NaNs
            });
            return [x, d3.mean(validValues, function(v) { return kernel(x - v); })];
        });
        };
    }
    
    // Function to compute kernel Epanechnikov kernel
    function kernelEpanechnikov(k) {
        return function(v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
        };
}