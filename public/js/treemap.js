export function updateTreemap(year) {


  if (year == 2010) {
    var path = "./csv/treemap/treemap_average2010.csv";
  } else if (year == 2011) {
    var path = "./csv/treemap/treemap_average2011.csv";
  } else if (year == 2012) {
    var path = "./csv/treemap/treemap_average2012.csv";
  } else if (year == 2013) {
    var path = "./csv/treemap/treemap_average2013.csv";
  } else if (year == 2014) {
    var path = "./csv/treemap/treemap_average2014.csv";
  } else if (year == 2015) {
    var path = "./csv/treemap/treemap_average2015.csv";
  } else if (year == 2016) {
    var path = "./csv/treemap/treemap_average2016.csv";
  } else if (year == 2017) {
    var path = "./csv/treemap/treemap_average2017.csv";
  } else if (year == 2019) {
    var path = "./csv/treemap/treemap_average2019.csv";
  }
  

  const reasonsMapping = {
    "H_XACC": { text: "Too high access costs", color: "#3F51B5" }, 
    "H_XEQU": { text: "Too high equipment costs", color: "#009688" }, 
    "H_XELSE": { text: "Access elsewhere", color: "#FF7518" }, 
    "H_XNEED": { text: "Not needed", color: "#8BC34A" }, 
    "H_XSEC": { text: "Privacy or security concerns", color: "#9C27B0" }, 
    "H_XSKL": { text: "Lack of skills", color: "#FFC107" }, 
    "H_XBBNA": { text: "Broadband not available", color: "#03A9F4" }, 
    "H_XDIS": { text: "Physical disability", color: "#FF3131" }, 
    "H_XOTH": { text: "Other reasons", color: "#FF69B4" },
    "H_XWANT": { text: "Not wanted", color: "#ADB7BD"}

  };

  
  // Define the custom text for each name
  var customTextMapping = {
      "H_XACC": "Too high access costs", 
      "H_XEQU": "Too high equipment costs", 
      "H_XELSE": "Access elsewhere", 
      "H_XNEED": "Not needed", 
      "H_XSEC": "Privacy or security concerns", 
      "H_XSKL": "Lack of skills", 
      "H_XBBNA": "Broadband N/A", 
      "H_XDIS": "Physical disability", 
      "H_XOTH": "Other reasons",
      "H_XWANT": "Not wanted"
  };



  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 950 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#my_treemap")
  .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`) // This makes the chart responsive
    .attr("preserveAspectRatio", "xMidYMid meet")
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


  // Read data
  d3.csv(path, function(data) {

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
  
          
      // stratify the data: reformatting for d3.js
      var root = d3.stratify()
          .id(function(d) { return d.name; })   // Name of the entity (column name is name in csv)
          .parentId(function(d) { return d.parent; })   // Name of the parent (column name is parent in csv)
          (data);
      root.sum(function(d) { return +d.value })   // Compute the numeric value for each entity

      // Then d3.treemap computes the position of each element of the hierarchy
      // The coordinates are added to the root object above
      d3.treemap()
          .size([width, height])
          // space between rectangles
          // .padding(8)
          (root)
        


      var format = d3.format(".2f");
      svg
      .selectAll("rect")
      .data(root.leaves())
      .enter()
      .append("rect")
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .style("fill", function(d) {
          // Assuming d.data.name contains keys like "H_XACC", "H_XEQU", etc.
          var reasonKey = d.data.name; // You might need to adjust this based on the actual structure of your data
          if (reasonsMapping[reasonKey]) {
            return reasonsMapping[reasonKey].color; // Use the color from your mapping
          } else {
            return "#000000"; // Default color if the key is not found
          }
        })

        .on("mouseover", function(d) {      
        tooltip.transition()        
            .duration(100)      
            .style("opacity", .9); 
            
            tooltip.html(
                "<span style='color: #333;'> <strong>Year: </strong> " + year + "</span><br>" +
                  "<span style='color: #333;'> <strong>Reason: </strong> " + reasonsMapping[d.data.name].text + "</span><br>" + 
                  "<span style='color: #333;'> <strong>Percentage: </strong> " + format(d.value) + "%</span><br>" 
              )
              .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 180) + "px" : (d3.event.pageX + 5) + "px")
              .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 80) + "px" : (d3.event.pageY + 5) + "px")
              
              d3.select(this)
            .style("opacity", 1);

            // Dim the other rectangles
            svg.selectAll("rect")
              .transition()
              .duration(200)
              .style("opacity", function(otherD) {
                return (otherD === d) ? 1 : 0.7;
              })
              

        })   
        .on("mousemove", function(d) {
          tooltip
          .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 180) + "px" : (d3.event.pageX + 5) + "px")
          .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 80) + "px" : (d3.event.pageY + 5) + "px");
        })  
        // fade out tooltip on mouse out               
        .on("mouseout", function(d) {       
            tooltip.transition()        
              .duration(100)      
              .style("opacity", 0)

              svg.selectAll("rect")
              .transition()
              .duration(200)
              .style("opacity", 1)
              
        })


      svg.selectAll("text")
      .data(root.leaves())
      .enter()
      .append("text")
        // Position the text in the center of the rectangle horizontally
        .attr("x", function(d) { return d.x0 + (d.x1 - d.x0) / 2; })
        // Position the text in the center of the rectangle vertically
        .attr("y", function(d) { return d.y0; }) 
        .attr("text-anchor", "middle")  // Center the text horizontally
        //.attr("dominant-baseline", "central")  // Center the text vertically
        .text(function(d) {
          return customTextMapping[d.data.name] || d.data.name; // Use custom text or fallback to name
        })
        .each(function(d) {
          var text = d3.select(this),
              words = text.text().split(/\s+/),
              wordCount = words.length,
              lineHeight = 1.1, // ems
              rectHeight = d.y1 - d.y0,
              fontSize = d.value < 1.4 ? 14 : 16,
              textHeight = wordCount * lineHeight * fontSize,
              y = d.y0 + (rectHeight / 2) - (textHeight / 2); // 16px is the font size
    
          text.text(null); // Clear the initial text

          words.forEach(function(word, index) {
          text.append("tspan")
              .attr("x", function() { return d.x0 + (d.x1 - d.x0) / 2; })
              .attr("y", function() { return y + (index * lineHeight * fontSize); }) // Adjusted for dynamic font size
              .attr("dy", "0.8em") // Adjust the dy based on your specific font and design
              .text(word)
              .attr("font-family", "Montserrat")
              .attr("font-size", fontSize)
              .attr("fill", "white");

          });
        })
          
            
    })
  
}