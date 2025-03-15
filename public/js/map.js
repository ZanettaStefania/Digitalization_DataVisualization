
  export function updateMap(year) {

    var csvUrl = "./csv/map_processed_" + year + ".csv"
    var geoJsonUrl = "./json/europe.geojson"

    // Select the chart container and clear its content
    var mapContainer = d3.select("#my_map");
    mapContainer.selectAll("*").remove(); 


    var margin = {top: 200, right: 50, bottom: 50, left: 50},
      width = 800 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;

    // The svg
    var svg = d3.select("#my_map")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`) // This makes the chart responsive
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // Map and projection
    var projection = d3.geoMercator()
      .center([13, 52])
      .scale(600)
      .translate([width / 2, height / 2]);


    // var colorScale = d3.scaleSequential(d3.interpolateRdBu)
    var colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
      .domain([0, 65]);

      // LEGEND
      var legendWidth = 90;
      var legendSpacing = 25;
      var legendX = margin.left - legendWidth; 
      var legendY = margin.top - 400; 

      // Create a group for the legend
      var legendGroup = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + legendX + "," + legendY + ")");

      // Data for legend items (5 items)
      var legendData = [
        { color: colorScale(0), label: "0% - 13%" },
        { color: colorScale(13), label: "14% - 26%" },
        { color: colorScale(26), label: "27% - 39%" },
        { color: colorScale(39), label: "40% - 52%" },
        { color: colorScale(65), label: "53% - 65%" }, 
        { color: "url(#stripes)", label: "No data" }
      ];

      // Create legend items
      var legendItems = legendGroup.selectAll(".legend-item")
        .data(legendData)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", function (d, i) {
          return "translate(0," + (i * legendSpacing) + ")";
        });

      // Add colored squares
      legendItems
        .append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function (d) { return d.color; })
        .style("stroke", "#293241") // Add a black border
        .style("stroke-width", 1);

      // Add labels
      legendItems
        .append("text")
        .attr("x", 25)
        .attr("y", 10)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .style("color", "#293241")
        .style("font", "18px Montserrat")
        .text(function (d) { return d.label; });



    var populationData = {};
    // Load external data and boot
    d3.queue()
      .defer(d3.json, geoJsonUrl)
      .defer(d3.csv, csvUrl, function(d) {
          // Store population data with country code as key
          if(d.pop !== "") {
              populationData[d.code] = +d.pop;
          }
      })
      .await(ready);

    function ready(error, topo) {
      if (error) throw error;

      let mouseOver = function(d) {
        d3.selectAll(".Country")
          .transition()
          .duration(200)
          .style("opacity", .5);

        // Highlight the border of the hovered country
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1.5)
          .style("stroke", "black") // Ensure this is visible against the map
          .style("stroke-width", "1.5px"); // Adjust the width as needed
      }

      let mouseLeave = function(d) {
        d3.selectAll(".Country")
          .transition()
          .duration(200)
          .style("opacity", .8);

        // Reset the border of the hovered country
        d3.select(this)
          .transition()
          .duration(200)
          .style("stroke", "black")
          .style("stroke-width", "1px");  // Reset the stroke width
      }

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

      // Function to show the tooltip
      function showTooltip(d) {
        tooltip
          .transition()
          .duration(100)
          .style("opacity", 0.9);
        tooltip
        .html(
          "<strong>State: </strong>" + (d.properties.NAME) + "<br>"+
          "<strong>Year: </strong>" + year + "<br>"+
          "<strong>Percentage: </strong> " + (d.total ? d.total + "%" : "No data")
        )

          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      }

      // Function to move the tooltip
      function moveTooltip(d) {
        tooltip
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      }

      // Function to hide the tooltip
      function hideTooltip(d) {
        tooltip
          .transition()
          .duration(100)
          .style("opacity", 0);
      }

      // Define the striped pattern inside your SVG
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
        .attr("fill", "white"); // Color of the stripes

      // Draw the map with modifications for null, NaN, or zero values
      svg.append("g")
      .selectAll("path")
      .data(topo.features)
      .enter()
      .append("path")
      .attr("d", d3.geoPath().projection(projection))
      .attr("fill", function (d) {
        d.total = populationData[d.properties.ISO3];

        if (d.total === null || isNaN(d.total) || d.total === 0) {
          return "url(#stripes)";
        } else {
          return colorScale(d.total); 
        }
      })
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .attr("class", function(d){ return "Country"; })
      .style("opacity", 1)

        svg.selectAll(".Country")
        .on("mouseover", function(d) {
          mouseOver.call(this, d);
          showTooltip(d);
        })
        .on("mousemove", moveTooltip)
        .on("mouseleave", function(d) {
          mouseLeave.call(this, d);
          hideTooltip(d);
        });

    }
  }