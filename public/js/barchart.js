export function updateBarchart(year, selection) {

    const countryMapping = {
        "AL": "Albania",
        "AT": "Austria",
        "BA": "Bosnia / Herzegovina",
        "BE": "Belgium",
        "BG": "Bulgaria",
        "CH": "Switzerland",
        "CY": "Cyprus",
        "CZ": "Czechia",
        "DE": "Germany",
        "DK": "Denmark",
        "EE": "Estonia",
        "EL": "Greece",
        "ES": "Spain",
        "EU27_2020": "European Union",
        "FI": "Finland",
        "FR": "France",
        "HR": "Croatia",
        "HU": "Hungary",
        "IE": "Ireland",
        "IS": "Iceland",
        "IT": "Italy",
        "LT": "Lithuania",
        "LU": "Luxembourg",
        "LV": "Latvia",
        "MK": "North Macedonia",
        "MT": "Malta",
        "NL": "Netherlands",
        "NO": "Norway",
        "PL": "Poland",
        "PT": "Portugal",
        "RO": "Romania",
        "RS": "Serbia",
        "SE": "Sweden",
        "SI": "Slovenia",
        "SK": "Slovakia",
        "TR": "Turkey",
        "UK": "United Kingdom",
        "XK": "Kosovo"
    };

    
    // Year basing on which i want to update the barchart
    let yearColumn = year;

    // Select the chart container and clear its content
    var chartContainer = d3.select("#my_barchart");
    chartContainer.selectAll("*").remove(); 

    var margin = {top: 30, right: 95, bottom: 150, left: 97},
        width = 1400 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_barchart")
    .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`) // This makes the chart responsive
        .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    // load the data
    d3.csv('./csv/barchart_processed.csv', function(data) {

        data.forEach(function(d) {
            d[year] = d[year] === ":" ? null : +d[year]; // Convert to null if value is ":", else convert to number
        });

        // Sort data based on selection
        if (selection === "alphabet") {
            data.sort(function(a, b) {
                return (countryMapping[a.geo] || a.geo).localeCompare(countryMapping[b.geo] || b.geo);
            });
        } else if (selection === "value") {
            data.sort(function(a, b) {
                // Move null values to the end
                if (a[year] === null) return 1;
                if (b[year] === null) return -1;
                return b[year] - a[year]; // Descending order
            });
        }
        
        // X axis
        var x = d3.scaleBand()
            .range([ 0, width ])
            .domain(data.map(function(d) { 
                return countryMapping[d.geo] || d.geo;
            }))
            .padding(0.2);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .style("font", "17px Montserrat")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
            .style("font", "15px Montserrat");


        // Initialize max value
        let maxValue = Number.MIN_SAFE_INTEGER;

        // Find the maximum value in the dataset
        data.forEach(function(row) {
            // Check each year's column
            for (let year = 2012; year <= 2023; year++) {
                // Convert the value to a number and update maxValue if it's larger
                const value = +row[year]; 
                if (value > maxValue) {
                    maxValue = value;
                }
            }
        });


        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, maxValue + 5]) 
            .range([ height, 0]);

        // Call the Y axis on the svg
        svg.append("g")
            .call(d3.axisLeft(y))
            .style("font", "15px Montserrat");

        // Create Y grid lines
        svg.selectAll(".horizontal-grid-line")
            .data(y.ticks(10)) // This controls the number of ticks/grid lines
            .enter()
            .append("line")
            .attr("class", "horizontal-grid-line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", function(d) { return y(d); })
            .attr("y2", function(d) { return y(d); })
            .attr("stroke", "#aaaaaa") // Color of the grid lines
            .style("opacity", 0.9)  // Opacity 
            .attr("stroke-dasharray", "3,6") // Style of the grid lines
            .attr("shape-rendering", "crispEdges");
        
        
        // Color scale
        var colorScale = d3.scaleLinear();
            colorScale.domain([0, maxValue])
            colorScale.range(['#B7E0F8','#3D5A80'])

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


        // Bars without animation
        svg.selectAll(".bar")
            .data(data)
            .enter()
            //.append("rect")
            //.attr("class", "bar")
            //.attr("x", function(d) { return x(countryMapping[d.geo]); })
            //.attr("y", function(d) { return y(+d[yearColumn]); })
            //.attr("width", x.bandwidth())
            //.attr("height", function(d) { return height - y(+d[yearColumn]); })
            //.attr("fill", function(d) { return colorScale(+d[yearColumn]); })
            .append(function(d) {
                if (d[yearColumn] === ":" || isNaN(d[yearColumn]) || +d[yearColumn] === 0) {
                    return document.createElementNS(d3.namespaces.svg, 'text');
                } else {
                    return document.createElementNS(d3.namespaces.svg, 'rect');
                }
            })
            .attr("class", function(d) {
                return (d[yearColumn] === ":" || isNaN(d[yearColumn]) || +d[yearColumn] === 0) ? "no-data-label" : "bar";
            })
            .attr("x", function(d) {
                return (d[yearColumn] === ":" || isNaN(d[yearColumn]) || +d[yearColumn] === 0) ? x(countryMapping[d.geo]) + x.bandwidth() / 2 +5 : x(countryMapping[d.geo]);
            })
            .attr("y", function(d) {
                return (d[yearColumn] === ":" || isNaN(d[yearColumn]) || +d[yearColumn] === 0) ? y(0) - 5 : y(+d[yearColumn]);
            })
            .text("N/A")
            .attr("transform", function(d) {
                return (d[yearColumn] === ":" || isNaN(d[yearColumn]) || +d[yearColumn] === 0) ? "rotate( -90 " + (x(countryMapping[d.geo]) + x.bandwidth() / 2 +5) + "," + (y(0) - 5) + ")" : null;
            })
            .attr("width", function(d) {
                return (d[yearColumn] === ":" || isNaN(d[yearColumn]) || +d[yearColumn] === 0) ? 0 : x.bandwidth();
            })
            .attr("height", function(d) {
                return (d[yearColumn] === ":" || isNaN(d[yearColumn]) || +d[yearColumn] === 0) ? 0 : height - y(+d[yearColumn]);
            })
            .attr("fill", function(d) {
                return (d[yearColumn] === ":" || isNaN(d[yearColumn]) || +d[yearColumn] === 0) ? "#999999" : colorScale(+d[yearColumn]);
            })
            .style("font-family", "Montserrat")
            .style("font-weight", 500)
            .on("mouseover", function(d) { 

                d3.selectAll(".bar")
                .transition()
                .duration(200)
                .attr("fill", function(o) {
                    return (o === d) ? colorScale(+d[yearColumn]) : "#ccc"; 
                })
                
                tooltip.transition()        
                .duration(100)      
                .style("opacity", .9); 
                
                tooltip.html(
                    "<span style='color: #333;'> <strong>State: </strong> " + countryMapping[d.geo] + "</span><br>" + 
                    "<span style='color: #333;'> <strong>Year: </strong> " + yearColumn + " </span><br>" +
                    "<span style='color: #333;'> <strong>Percentage: </strong> " + 
                    (isNaN(d[yearColumn]) || d[yearColumn] === ":" || d[yearColumn] === null ? "No data available" : d[yearColumn] + "%") + 
                    "</span><br>"
                    // "<span style='color: #333;'> <strong>Percentage: </strong> " + d[yearColumn] + "% </span><br>" 
                )
                .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 180) + "px" : (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 80) + "px" : (d3.event.pageY + 5) + "px");   
            })   
            .on("mousemove", function(d) {
                tooltip
                .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 180) + "px" : (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 80) + "px" : (d3.event.pageY + 5) + "px");
            })         
            .on("mouseout", function(d) {  
                d3.selectAll(".bar")
                .transition()
                .duration(200)
                .attr("fill", function(d) { return colorScale(+d[yearColumn]); });
                
                tooltip.transition()        
                .duration(100)      
                .style("opacity", 0);   
            });
            

            // Calculate the average
            let sum = 0;
            let count = 0;
            data.forEach(function(d) {
                if (d[yearColumn] !== ":") { 
                    sum += +d[yearColumn];
                    count += 1;
                }
            });
            let average = sum / count;

            // Add the average line after the Y axis
            svg.append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", y(average))
            .attr("y2", y(average))
            .attr("stroke", "red") 
            .attr("stroke-width", "2") 
            .attr("stroke-dasharray", "5,5") 
            .attr("shape-rendering", "crispEdges")
            .style("z-index", "10"); 

            // Add a label for the average value at the end of the line
            svg.append("text")
            .attr("class", "average-label")
            .attr("x", width) 
            .attr("y", y(average)) 
            .attr("dy", "-0.5em") 
            .attr("text-anchor", "end") 
            .style("fill", "red") 
            .style("font-size", "14px") 
            .style("font-family", "Montserrat")
            .style("font-weight", 700)
            .text(`${average.toFixed(2)} %`); 

            svg.append("text")
            .attr("class", "average-label")
            .attr("x", width) 
            .attr("y", y(average) - 16) 
            .attr("dy", "-0.5em") 
            .attr("text-anchor", "end") 
            .style("fill", "red") 
            .style("font-size", "14px") 
            .style("font-family", "Montserrat")
            .style("font-weight", 700)
            .text(`average:`); 
    
        
    })
}

