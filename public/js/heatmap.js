export function updateHeatmap(checkedValue) {

    const internetUseMapping = {
        "I_IHIF": "Health information",
        "I_IUIF": "Information for goods and services",
        "I_IUBK": "Internet banking",
        "I_IUJOB": "Looking for job / job application",
        "I_IUVOTE": "Voting or online consultation",
        "I_IUOLC": "Online course",
        "I_IUSNET": "Social networks",
        "I_IUSELL": "Selling goods or services",
        "I_IUEM": "Sending or receiving emails" 
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



    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 30, bottom: 150, left: 320},
    width = 1300 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_heatmap")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`) // This makes the chart responsive
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3.csv('./csv/heatmap_processed.csv', function(data) {

        var internetUse = ["I_IHIF", "I_IUIF", "I_IUBK", "I_IUJOB", "I_IUVOTE", "I_IUOLC", "I_IUSNET", "I_IUSELL", "I_IUEM"]

        const filteredData = data.filter(d => d.geo === checkedValue);
        var heatmapData = [];
        filteredData.forEach((obj, index) => {
            for (let year in obj) {
                if (obj.hasOwnProperty(year) && year !== "geo" && year !== "indic_is") {
                    heatmapData.push({
                        year: year,
                        category: internetUseMapping[internetUse[index]] || internetUse[index],
                        value: +obj[year] // convert string to number
                    });
                }
            }
        });

        // Build X scales and axis:
        var x = d3.scaleBand()
            .range([0, width]) 
            .domain(heatmapData.map(function(d) { return d.year; }))
            .padding(0.01);


        svg.append("g")
        .style("font", "15px Montserrat")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(0))
        .select(".domain").remove()

        var internetUseLabels = internetUse.map(useKey => internetUseMapping[useKey] || useKey);

        var y = d3.scaleBand()
            .range([height, 0])
            .domain(internetUseLabels)
            .padding(0.01);
        
            
        svg.append("g")
            .style("font", "15px Montserrat")
            .call(d3.axisLeft(y).tickSize(0))
            .select(".domain").remove()


        
        var myColor = d3.scaleSequential()
            .interpolator(d3.interpolateBlues)
            //.domain([0, d3.max(heatmapData, d => d.value)])
            .domain([0.5, 96.88]);
            
        // (0.5, 96.88)

            /*
        var myColor = d3.scaleSequential()
        .interpolator(d3.interpolateBlues)
        .domain([0, 100]);*/
            

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

        // Striped pattern
        svg.append("defs")
        .append("pattern")
            .attr("id", "stripes")
            .attr("width", 4)
            .attr("height", 4)
            .attr("patternUnits", "userSpaceOnUse")
            .attr("patternTransform", "rotate(45)")
        .append("rect")
            .attr("width", 2)
            .attr("height", 4)
            .attr("transform", "translate(0,0)")
            .attr("fill", "#ccc"); 

        svg.selectAll()
        .data(heatmapData)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.year); })
        .attr("y", function(d) { return y(d.category); })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", function(d) {
            if (d.value === 0) {
                return "url(#stripes)";
            } else {
                return myColor(d.value);
            }
        })
        .style("stroke-width", 2)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", function(d) {
            d3.select(this).style("stroke", "#0e284e"); // Add border on hover

            tooltip.transition()
                .duration(100)
                .style("opacity", 0.9);
            tooltip.html(
                    
                    `
                    <strong>State:</strong> ${countryMapping[checkedValue]} <br>
                    <strong>Year:</strong> ${d.year} <br>
                    <strong>Percentage:</strong> ${d.value ? `${d.value}%` : "No data available"} <br>
                    <strong>Use:</strong> ${d.category}
                    `
                ) 
                .style("visibility", "visible")
                .style("font", "15px Montserrat")
                .style("color", "#333")
                .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 90) + "px" : (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 110) + "px" : (d3.event.pageY + 5) + "px");
        })
        .on("mousemove", function(d) {
            d3.selectAll("rect").style("stroke", "none"); 
            d3.select(this).style("stroke", "#0e284e"); 

            tooltip
            .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 90) + "px" : (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 110) + "px" : (d3.event.pageY + 5) + "px");
        })  
        .on("mouseout", function(d) {
            d3.select(this).style("stroke", "none");

            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        })


        // Append the definitions to the SVG
        var defs = svg.append("defs");

        // Define the font settings
        var legendFontFamily = "Montserrat, sans-serif";  
        var legendFontSize = "15px"; 

        // Create a linear gradient for the legend
        var linearGradient = defs.append("linearGradient")
            .attr("id", "linear-gradient");

        /* Set the gradient color for various percentages
        linearGradient.selectAll("stop")
            .data(myColor.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: myColor(t) })))
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);
            //.domain([0, d3.max(heatmapData, d => d.value)])*/
            
        // Generate stops for the gradient based on the myColor scale
        /*
        const numStops = 5; // For example, 5 stops at 0%, 25%, 50%, 75%, 100%
        linearGradient.selectAll("stop")
            .data(Array.from({length: numStops}, (_, i) => i / (numStops - 1)))
            .enter().append("stop")
            .attr("offset", d => `${d * 100}%`)
            .attr("stop-color", d => myColor(d * (96.88 - 0.5) + 0.5)); // Map the stop to the data range*/
            linearGradient.selectAll("stop")
            .data([
                {offset: "0%", color: "#f4f7fb"},   // Color for 0%
                {offset: "25%", color: myColor(25)}, // Color for 25%
                {offset: "50%", color: myColor(50)}, // Color for 50%
                {offset: "75%", color: myColor(75)}, // Color for 75%
                {offset: "100%", color: "#355584"}  // Color for 100%
            ])
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);


        // Append the legend
        var legendWidth = 600, legendHeight = 25;
        var legend = svg.append("g")
            .attr("transform", `translate(${(width - legendWidth) / 2 - 50}, ${height + margin.bottom - legendHeight - 60})`);

        legend.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#linear-gradient)");

        // Add legend text for 0%, 25%, 50%, 75%, and 100%
        const legendScale = d3.scaleLinear().domain([0, 100]).range([0, legendWidth]);
        const legendAxis = d3.axisBottom(legendScale).tickValues([0, 25, 50, 75, 100]).tickFormat(d => `${d}%`);

        legend.append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .call(legendAxis)
            .selectAll("text")
            .style("font-family", legendFontFamily)  
            .style("font-size", legendFontSize); 

        legend.selectAll(".tick line, .domain")
            .remove();

    })
}
