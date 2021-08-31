// FUNCTION WRAPPER FOR 2016 DATA
function updateData() {

  // NEEDS TO BE DONE IN A BETTER WAY
  d3.select("svg").remove();

  var margin = {
    top: 80,
    right: 20,
    bottom: 10,
    left: 400
  },
    width = 1400 - margin.left - margin.right,
    height = 750 - margin.top - margin.bottom;

  var y = d3.scale.ordinal()
    .rangeRoundBands([0, height], .3);

  var x = d3.scale.linear()
    .rangeRound([0, width]);

  var color = d3.scale.ordinal()
    .range(["#da2a2a", "#f78300", "#ffba00", "#a7cbe5", "#95d568", "#70c13a", "#5ea331"]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("top");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")

  var svg = d3.select("#figure").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("id", "d3-plot")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  color.domain(["Very difficult", "Difficult", "Somewhat difficult", "Neither difficult nor easy", "Somewhat easy", "Easy", "Very easy"]);

  d3.csv("data.csv", function (error, data) {

    data.forEach(function (d) {
      // This calculates the percentages. If there are more data points, add them here and also in the var x0 section in this function.
      d["Very difficult"] = +d[1] * 100 / d.N;
      d["Difficult"] = +d[2] * 100 / d.N;
      d["Somewhat difficult"] = +d[3] * 100 / d.N;
      d["Neither difficult nor easy"] = +d[4] * 100 / d.N;
      d["Somewhat easy"] = +d[5] * 100 / d.N;
      d["Easy"] = +d[6] * 100 / d.N;
      d["Very easy"] = +d[7] * 100 / d.N;
      // add possible additional categories here. only add half of them plus the neutral one.
      var x0 = -1 * (d["Neither difficult nor easy"] / 2 + d["Somewhat difficult"] + d["Difficult"] + d["Very difficult"]);
      var idx = 0;
      d.boxes = color.domain().map(function (name) {
        return {
          name: name,
          x0: x0,
          x1: x0 += +d[name],
          N: +d.N,
          n: +d[idx += 1]
        };
      });
    });

    var min_val = d3.min(data, function (d) {
      return d.boxes["0"].x0;
    });

    var max_val = d3.max(data, function (d) {
      return d.boxes["6"].x1;
    });

    x.domain([min_val, max_val]).nice();
    y.domain(data.map(function (d) {
      return d.Question;
    }));

    svg.append("g")
      .attr("class", "x axis")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)

    var vakken = svg.selectAll(".question")
      .data(data)
      .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function (d) {
        return "translate(0," + y(d.Question) + ")";
      });

    var bars = vakken.selectAll("rect")
      .data(function (d) {
        return d.boxes;
      })
      .enter().append("g").attr("class", "subbar");

    bars.append("rect")
      .attr("height", y.rangeBand())
      .attr("x", function (d) {
        return x(d.x0);
      })
      .attr("width", function (d) {
        return x(d.x1) - x(d.x0);
      })
      .style("fill", function (d) {
        return color(d.name);
      });

    bars.append("text")
      .attr("x", function (d) {
        return x(d.x0);
      })
      .attr("y", y.rangeBand() / 2)
      .attr("dy", "0.5em")
      .attr("dx", "0.5em")
      // .style("font" ,"12px sans-serif")
      .style("text-anchor", "begin")
      .text(function (d) {
        return d.n !== 0 && (d.x1 - d.x0) > 3 ? d.n : ""
      });

    vakken.insert("rect", ":first-child")
      .attr("height", y.rangeBand())
      .attr("x", "1")
      .attr("width", width)
      .attr("fill-opacity", "0.5")
      .style("fill", "#dddddd")
      .attr("class", function (d, index) {
        return index % 2 == 0 ? "even" : "uneven";
      });

    svg.append("g")
      .attr("class", "y axis")
      .append("line")
      .attr("x1", x(0))
      .attr("x2", x(0))
      .attr("y2", height);

    var startp = svg.append("g").attr("class", "legendbox").attr("id", "mylegendbox");
    // this is not nice, we should calculate the bounding box and use that
    var legend_tabs = [-100, 70, 180, 370, 620, 800, 900];
    var legend = startp.selectAll(".legend")
      .data(color.domain().slice())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function (d, i) {
        return "translate(" + legend_tabs[i] + ",-70)";
      });

    legend.append("rect")
      .attr("x", 0)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

    legend.append("text")
      .attr("x", 20)
      .attr("y", 10)
      .attr("dy", ".35em")
      .style("text-anchor", "begin")
      // .style("font-size" ,"12px")
      //.style("font-family", "'Roboto Slab', sans-serif")
      .text(function (d) {
        return d;
      });

    d3.selectAll(".axis path")
      .style("fill", "none")
      .style("stroke", "#ccc")
      .style("shape-rendering", "crispEdges")

    d3.selectAll(".axis line")
      .style("fill", "none")
      .style("stroke", "#fff")
      .style("shape-rendering", "crispEdges")

    var movesize = width / 2 - startp.node().getBBox().width / 2 + 30;
    d3.selectAll(".legendbox").attr("transform", "translate(" + movesize + ",0)");

  });

}
