export function updatePiechartLeft(selectedState){

    const internetUseMapping = {
        "I_IHIF": { text: "Health information", color: "#53b5ce" }, // Azzurro
        "I_IUIF": { text: "Information for goods and services", color: "#75c359" }, //green
        "I_IUBK": { text: "Internet banking", color: "#ff69b4" }, // Pink
        "I_IUJOB": { text: "Looking for job / job application", color: "#9c27b0 " }, // Purple
        "I_IUVOTE": { text: "Voting or online consultation", color: "#255be3" }, // Blue
        "I_IUOLC": { text: "Online course", color: "#547a2a " }, // Dark Verde
        "I_IUSNET": { text: "Social networks", color: "#ff6700 " }, // Arancione
        "I_IUSELL": { text: "Selling goods or services", color: "#ebc00b" }, // Yellow
        "I_IUEM": { text: "Sending or receiving emails", color: "#ff0000" } // Red
    };
    

    const countryMapping = {
        "AL": "Albania",
        "AT": "Austria",
        "BA": "Bosnia and Herzegovina",
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
        "ME": "Montenegro",
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
    }

    var container = d3.select("#my_piechart_left").node();
    var width = container.getBoundingClientRect().width;
    var height = Math.min(width, 400); 
    var margin = 30;


    // Calculate the radius dynamically
    var radius = Math.min(width, height) / 2 - margin;

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    var radius = Math.min(width, height) / 2 - margin

    // append the svg object to the div called 'my_dataviz'
    var svg = d3.select("#my_piechart_left")
    .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`) // This makes the chart responsive
        .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    d3.csv('./csv/heatmap_processed.csv', function(data) {

        var year = "2013";

        var filteredYearData = data.map(function(row) {
            return {
                '2013': row[year], // Keep only the 2013 data
                'indic_is': row['indic_is'], // Assuming you want to keep this as well
                'geo': row['geo'] // Assuming you want to keep this as well
            };
        });


        var state = selectedState;
        var filteredStateData = filteredYearData.filter(d => d.geo === state);

        var data = filteredStateData;

        var top5Data = data.sort(function(a, b) {
            return b['2013'] - a['2013']; 
        }).slice(0, 5); 


        // Set the color scale
        var color = d3.scaleOrdinal()
        .domain(Object.keys(internetUseMapping)) // Use the keys from the mapping object for the domain
        .range(Object.values(internetUseMapping).map(function(d) { return d.color; })); // Use the corresponding colors for the range


        // Compute the position of each group on the pie:
        var pie = d3.pie()
            .value(function(d) { return d['2013']; }); 

        var data_ready = pie(top5Data); // Use top5Data here

        // Shape helper to build arcs:
        var arcGenerator = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);


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

        // Build the pie chart for the top 5 values
        svg.selectAll('mySlices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr("class", "slice")
        .attr('fill', function(d){ return internetUseMapping[d.data.indic_is].color; }) 
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.8)
        .on("mouseover", function(d) {
            svg.selectAll(".slice")
                      .transition()
                      .duration(200)
                      .style("opacity", 0.2);

                      d3.select(this)
                      .transition()
                      .duration(200)
                      .style("opacity", 0.8);

            var value = (d.data['2013'] / totalValue * 100).toFixed(2); // One decimal place

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
        
                tooltip.html(
                    `
                    <strong>State:</strong> ${countryMapping[selectedState]} <br>
                    <strong>Year:</strong> 2013 <br>
                    <strong>Percentage:</strong> ${value}% <br>
                    <strong>Use:</strong> ${internetUseMapping[d.data.indic_is].text} 
                    `
                )
                .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 90) + "px" : (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 130) + "px" : (d3.event.pageY + 5) + "px")
            }
        )
        .on("mousemove", function(d) {
            svg.selectAll(".slice")
                      .transition()
                      .duration(200)
                      .style("opacity", 0.2);

                      d3.select(this)
                      .transition()
                      .duration(200)
                      .style("opacity", 0.8);

            tooltip
            .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 90) + "px" : (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 130) + "px" : (d3.event.pageY + 5) + "px");
        })  
        .on("mouseout", function() {
            svg.selectAll(".slice")
                      .transition()
                      .duration(200)
                      .style("opacity", 0.9);

            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });


        if (window.innerWidth >= 768) {
            // Add lines connecting the labels to the slices
            svg.selectAll('mySlices')
            .data(data_ready)
            .enter()
            .append('polyline')
            .attr('points', function(d) {
                var posA = arcGenerator.centroid(d) 
                var posB = arcGenerator.centroid(d) 
                var posC = arcGenerator.centroid(d); 
                var midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2 
                posC[0] = radius * 1 * (midAngle < Math.PI ? 1 : -1);
                return [posA, posB, posC]
            })
            .attr('stroke', 'black')
            .style('fill', 'none')
            .attr('stroke-width', 1);

            // Now add the labels at the end of the lines
            svg.selectAll('mySlices')
            .data(data_ready)
            .enter()
            .append('text')
            .attr('transform', function(d) {
                var pos = arcGenerator.centroid(d);
                var midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                pos[0] = radius * 1.02 * (midAngle < Math.PI ? 1 : -1);
                return 'translate(' + pos + ')';
            })
            .style('text-anchor', function(d) {
                var midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                return (midAngle < Math.PI ? 'start' : 'end');
            })
            .style("font", "15px Montserrat")
            .each(function(d) {
                var text = internetUseMapping[d.data.indic_is].text; // Use the text from the mapping
                var words = text.split(' ');
                var tspan = d3.select(this).append('tspan')
                    .attr('x', '0')
                    .attr('dy', '0.2em');

                for (var i = 0; i < words.length; i++) {
                    if (i > 0 && i % 3 === 0) { // Every three words, append a new tspan
                        tspan = d3.select(this).append('tspan')
                            .attr('x', 0)
                            .attr('dy', '1.2em');
                    }
                    tspan.text(function() { return tspan.text() + ' ' + words[i]; });
                }
            })
        }


        var totalValue = d3.sum(top5Data, function(d) { return d['2013']; });
        svg.selectAll('mySlices')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function(d) {
            var percentage = (d.data['2013'] / totalValue * 100).toFixed(2); 
            return percentage + '%'; 
        })
        .attr('transform', function(d) {
            var centroid = arcGenerator.centroid(d);
            return 'translate(' + centroid[0] + ',' + (centroid[1] - 10) + ')'; 
        })
        .style('text-anchor', 'middle')
        .style('font', '15px Montserrat')
        .attr('fill', '#333'); // Text color
    


    })
}