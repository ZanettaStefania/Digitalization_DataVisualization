export function updateStacked(checkedValue) {

    const countryMapping = {
        "AL": "Albania",
        "AT": "Austria",
        "BA": "Bosnia and Herzegovina",
        "BE": "Belgium",
        "BG": "Bulgaria",
        "CH": "Switzerland",
        "CY": "Cyprus",
        "CZ": "Czech Republic",
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
        "UK": "United Kingdom"
    };


    // set the dimensions and margins of the graph
    var margin = {top: 60, right: 50, bottom: 40, left: 50},
        width = 1100 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_stacked_barchart")
    .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`) // This makes the chart responsive
        .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Parse the Data
    d3.csv('./csv/stacked_percent_processed.csv', function(data) {


        // Assuming 'data' is your dataset
        var subgroups = ['value', 'remaining'];
        var groups = d3.range(2012, 2024); // years from 2012 to 2023

        var filteredData = data.filter(function(row) {
            // return row['geo'] === 'AT';
            return row['geo'] === checkedValue;
        })[0];

        // Add X axis
        var x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2])
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .style("font", "15px Montserrat")
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);
        svg.append("g")
            .style("font", "15px Montserrat")
            .call(d3.axisLeft(y));

        // color palette = one color per subgroup
        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#75c359','#ea5d55'])

        //Add grid
        svg.selectAll("yGrid")
            .data(y.ticks(10))
            .enter()
            .append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", function(d) { return y(d); })
            .attr("y2", function(d) { return y(d); })
            .attr("stroke", "#aaaaaa")
            .attr("stroke-dasharray", 4);



        var transformedData = [];
        var years = d3.range(2012, 2024);

        years.forEach(function(year) {
            var valueStr = filteredData[year]; 
            var value = parseFloat(valueStr); 
            if (!isNaN(value)) { 
                transformedData.push({
                    year: year,
                    value: value,
                    remaining: 100 - value // Calculate the remaining part
                });
            }
        });


        var stackedData = d3.stack()
        .keys(subgroups)
        (transformedData);


        // Tooltip
        var tooltip = d3.select('body')
            .append("div")
            .style("position", "absolute")
            .style("background", "#f0f0f0") // Use a light grey color for the background
            .style("padding", "10px")
            .style("border", "1px solid #ccc") // Use a darker grey for the border
            .style("border-radius", "8px")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("font", "15px Montserrat")
            .style("color", "#333");

        // Visualization code (assuming x, y, color, and svg are already defined)
        svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .enter().append("g")
            .attr("class", "bar-group")
            .attr("fill", function(d) { return color(d.key); })
            .selectAll("rect")
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr("x", function(d) {
                return x(d.data.year) + x.bandwidth() * 0.1; // Shift the bar right to center it
            })
            .attr("y", function(d) { return y(d[1]); })
            .attr("width", x.bandwidth() * 0.8) // Shrink the width of the bar by 20%
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })

            .on("mouseover", function(d) {

                var key = d3.select(this.parentNode).datum().key; // Get the key for the current stack part
                var frequentlyUsingInternet, notFrequentlyUsingInternet;

                if (key === "value") { 
                    frequentlyUsingInternet = d[1] - d[0]; // This calculates the height of the bar, representing the percentage
                    notFrequentlyUsingInternet = 100 - frequentlyUsingInternet;
                } else { // Assuming the other part is "not frequently using internet"
                    notFrequentlyUsingInternet = d[1] - d[0]; // This calculates the height of the bar, representing the percentage
                    frequentlyUsingInternet = 100 - notFrequentlyUsingInternet;
                }

                d3.selectAll(".bar-group").selectAll("rect")
                .transition()
                .duration(200)
                .filter(function() { return !this.isSameNode(d3.event.target); })
                .attr("fill", "#ccc");

                d3.select(this)
                .transition()
                .duration(200)
                .attr("fill", function(d) {
                    if (key === "value") {
                        return "#75c359"; // Brighter green for "value"
                    } else {
                        return "#ea5d55"; // Brighter red for "remaining"
                    }
                });

                tooltip.transition()        
                    .duration(100)      
                    .style("opacity", .9); 
                
                tooltip.html(
                    "<span style='color: #333;'> <strong>State: </strong> " + countryMapping[checkedValue] + "</span><br>" +
                    "<span style='color: #333;'> <strong>Year: </strong> " + d.data.year + "</span><br>" +
                    "<span style='color: #75c359;'> <strong>Frequently using internet: </strong> " + "<span style='color: #333;'> " + frequentlyUsingInternet.toFixed(2) +"% </span><br>" + 
                    "<span style='color: #ea5d55;'> <strong>Not frequently using internet: </strong> " + "<span style='color: #333;'> " + notFrequentlyUsingInternet.toFixed(2) + "% </span><br>"
                )
                .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 180) + "px" : (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 130) + "px" : (d3.event.pageY + 5) + "px"); 
            })
            .on("mousemove", function(d) {
                d3.selectAll(".bar-group").selectAll("rect")
                .transition()
                .duration(200)
                .filter(function() { return !this.isSameNode(d3.event.target); })
                .attr("fill", "#ccc");

                var key = d3.select(this.parentNode).datum().key; 
                d3.select(this)
                .transition()
                .duration(200)
                .attr("fill", function(d) {
                    if (key === "value") {
                        return "#75c359"; // Brighter green for "value"
                    } else {
                        return "#ea5d55"; // Brighter red for "remaining"
                    }
                });

                tooltip
                .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 180) + "px" : (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 130) + "px" : (d3.event.pageY + 5) + "px");
            })         
            .on("mouseout", function(d) {  

                // Now, bind your stackedData to new 'g' elements
                d3.selectAll(".bar-group").selectAll("rect")
                .transition()
                .duration(200)
                .attr("fill", function(d) {
                    var key = d3.select(this.parentNode).datum().key; // Get the key for the current stack part
                    // Explicitly set the color based on the key
                    if (key === "value") {
                        return "#75c359"; // Green color for "value"
                    } else if (key === "remaining") {
                        return "#ea5d55"; // Red color for "remaining"
                    } else {
                        return "#ccc"; // Default color or handle other keys appropriately
                    }
                });
            
                
                tooltip.transition()        
                .duration(100)      
                .style("opacity", 0);   
            });

            
            
        // LEGEND
        // Define legend colors and labels
        var legendColors = ['#75c359', '#ea5d55']; // Green for "Frequently", Red for "Not Frequently"
        var legendText = ['Frequently using internet', 'Not frequently using internet'];

        // Create a legend group and position it
        var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width - 1000) + "," + (margin.top - 110) + ")") // Position at the top, adjust as needed
        .selectAll("g")
        .data(legendColors)
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(" + i * 300 + ",0)"; }); // Space out legend entries horizontally

        // Append colored rectangles to the legend
        legend.append("rect")
        .attr("width", 20) // Width of the legend key
        .attr("height", 20) // Height of the legend key
        .attr("stroke", "black")
        .attr("fill", function(d, i) { return legendColors[i]; });

        // Append text labels to the legend
        legend.append("text")
        .attr("x", 25) // Position text right of the rectangle
        .attr("y", 15) // Align text vertically center with the rectangle
        // .attr("dy", ".15em") // Additional adjustment to align text
        .style("text-anchor", "start")
        .text(function(d, i) { return legendText[i]; })
        .style("font", "16px Montserrat");


    
    })
}