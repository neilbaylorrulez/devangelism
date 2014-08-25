(function events() {
    'use strict';

    var $window = $(window),
        winWidth = $window.width();

    var monthViewJSON = {
                            'name': 'month',
                            'children': [
                                { 'month': 'June', 'year': 2014, 'count': 1 },
                                { 'month': 'July', 'year': 2014, 'count': 1 },
                                { 'month': 'August', 'year': 2014, 'count': 2 },
                                { 'month': 'September', 'year': 2014, 'count': 3 }
                            ]
                        };

    var eventViewJSON = {
                            'name': 'month',
                            'children': [
                                { 'event': 'SuperConf', 'type': 'Event Type Here', 'count': 1 },
                                { 'event': 'SuperConf', 'type': 'Event Type Here', 'count': 1 },
                                { 'event': 'SuperConf', 'type': 'Event Type Here', 'count': 1 },
                                { 'event': 'RapidConf', 'type': 'Event Type Here', 'count': 2 },
                                { 'event': 'RapidConf', 'type': 'Event Type Here', 'count': 3 }
                            ]
                        };

    var attendeeViewJSON = {
                                'name': 'month',
                                'children': [
                                    { 'name': 'Bob Hope', 'title': 'Some Title', 'count': 8 },
                                    { 'name': 'John Edgar', 'title': 'Captain of Evangelism', 'count': 23 }
                                ]
                            };

    function render(width) {
      var pack = d3.layout
          .pack().size([width, width < 1024? width : 800])
          .padding(15)
          .value(function(d) { return d.count });
      var packCalculations1 = pack.nodes(monthViewJSON),
          packCalculations2 = pack.nodes(eventViewJSON),
          packCalculations3 = pack.nodes(attendeeViewJSON);

      // Draw monthly view SVG

      var svg = d3.select("#month-tab .content").append("svg")
      .attr("width", width)
         .attr("height", width < 1024? width : 800)
         .selectAll("g").data(packCalculations1).enter();
      var g = svg.append("g");
      g.append("circle")
          .attr("r", function(d){return d.r})
          .style("fill", function(d, i){return i?"#4a4a4a": "#B6D9A0";})
          .style("stroke", "#B6D9A0")
          .attr("transform", function(d,i)
             {return "translate(" + d.x + "," + d.y + ")"});
      g.append("circle")
          .attr("r", 14)
          .style("fill", "#4a4a4a")
          .style("stroke", "#a2a2a2")
          .style("display", function(d, i){return i?"block": "none";})
          .attr("transform", function(d,i)
             {return "translate(" + d.x + "," + (d.y - (d.r / 2) ) + ")"});
      g.append("line")
          .attr({
              x1: 0,
              y1: 0,
              x2: 14,
              y2: 0
          })
          .style("stroke", "#a2a2a2")
          .style("display", function(d, i){return i?"block": "none";})
          .attr("transform", function(d,i)
             {return "translate(" + (d.x - 7) + "," + (d.y - (d.r / 2) ) + ")"});
      g.append("line")
          .attr({
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 14
          })
          .style("stroke", "#a2a2a2")
          .style("display", function(d, i){return i?"block": "none";})
          .attr("transform", function(d,i)
             {return "translate(" + (d.x) + "," + (d.y - (d.r / 2) - 7 ) + ")"});
      g.append("text")
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .text(function(d){return d.month})
          .attr("font-size", function(d,i){ return (d.r < 51? d.r/50*15 : 18) + 'px' })
          .attr("transform", function(d,i)
               {return "translate(" + d.x + "," + d.y + ")"});
      g.append("text")
          .attr("y", 20)
          .attr("text-anchor", "middle")
          .attr("fill", "#b6d9a0")
          .attr("font-size", function(d,i){ return (d.r < 51? d.r/50*12 : 14) + 'px' })
          .text(function(d){return d.year})
          .attr("transform", function(d,i)
               {return "translate(" + d.x + "," + d.y + ")"});
      g.append("text")
          .attr("y", function(d){ return (d.r * 3.5 / 5);})
          .attr("text-anchor", "middle")
          .attr("fill", "#b6d9a0")
          .text(function(d){ return d.value})
          .attr("transform", function(d,i)
               {return "translate(" + d.x + "," + d.y + ")"});

      // Draw Event view SVG

      svg = d3.select("#event-tab .content").append("svg")
      .attr("width", width)
         .attr("height", width < 1024? width : 800)
         .selectAll("g").data(packCalculations2).enter();
      g = svg.append("g");
      g.append("circle")
          .attr("r", function(d){return d.r})
          .style("fill", function(d, i){return i?"#4a4a4a": "#B6D9A0";})
          .style("stroke", "#B6D9A0")
          .attr("transform", function(d,i)
             {return "translate(" + d.x + "," + d.y + ")"});
      g.append("circle")
          .attr("r", 14)
          .style("fill", "#4a4a4a")
          .style("stroke", "#a2a2a2")
          .style("display", function(d, i){return i?"block": "none";})
          .attr("transform", function(d,i)
             {return "translate(" + d.x + "," + (d.y - (d.r / 2) ) + ")"});
      g.append("line")
          .attr({
              x1: 0,
              y1: 0,
              x2: 14,
              y2: 0
          })
          .style("stroke", "#a2a2a2")
          .style("display", function(d, i){return i?"block": "none";})
          .attr("transform", function(d,i)
             {return "translate(" + (d.x - 7) + "," + (d.y - (d.r / 2) ) + ")"});
      g.append("line")
          .attr({
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 14
          })
          .style("stroke", "#a2a2a2")
          .style("display", function(d, i){return i?"block": "none";})
          .attr("transform", function(d,i)
             {return "translate(" + (d.x) + "," + (d.y - (d.r / 2) - 7 ) + ")"});
      g.append("text")
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .text(function(d){return d.event})
          .attr("font-size", function(d,i){ return (d.r < 51? d.r/50*15 : 18) + 'px' })
          .attr("transform", function(d,i)
              {return "translate(" + d.x + "," + d.y + ")"});
      g.append("text")
          .attr("y", 20)
          .attr("text-anchor", "middle")
          .attr("fill", "#b6d9a0")
          .attr("font-size", function(d,i){ return (d.r < 51? d.r/50*12 : 14) + 'px' })
          .text(function(d){return d.type})
          .attr("transform", function(d,i)
              {return "translate(" + d.x + "," + d.y + ")"});
      g.append("text")
          .attr("y", function(d){ return (d.r * 3.5 / 5);})
          .attr("text-anchor", "middle")
          .attr("fill", "#b6d9a0")
          .text(function(d){ return d.value})
          .attr("transform", function(d,i)
              {return "translate(" + d.x + "," + d.y + ")"});

      // Draw Attendee view SVG

      svg = d3.select("#attendee-tab .content").append("svg")
      .attr("width", width)
         .attr("height", width < 1024? width : 800)
         .selectAll("g").data(packCalculations3).enter();
      g = svg.append("g");
      g.append("circle")
          .attr("r", function(d){return d.r})
          .style("fill", function(d, i){return i?"#4a4a4a": "#B6D9A0";})
          .style("stroke", "#B6D9A0")
          .attr("transform", function(d,i)
             {return "translate(" + d.x + "," + d.y + ")"});
      g.append("circle")
          .attr("r", 14)
          .style("fill", "#4a4a4a")
          .style("stroke", "#a2a2a2")
          .style("display", function(d, i){return i?"block": "none";})
          .attr("transform", function(d,i)
             {return "translate(" + d.x + "," + (d.y - (d.r / 2) ) + ")"});
      g.append("line")
          .attr({
              x1: 0,
              y1: 0,
              x2: 14,
              y2: 0
          })
          .style("stroke", "#a2a2a2")
          .style("display", function(d, i){return i?"block": "none";})
          .attr("transform", function(d,i)
             {return "translate(" + (d.x - 7) + "," + (d.y - (d.r / 2) ) + ")"});
      g.append("line")
          .attr({
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 14
          })
          .style("stroke", "#a2a2a2")
          .style("display", function(d, i){return i?"block": "none";})
          .attr("transform", function(d,i)
             {return "translate(" + (d.x) + "," + (d.y - (d.r / 2) - 7 ) + ")"});
      g.append("text")
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .text(function(d){return d.name})
          .attr("font-size", "18px")
          .attr("transform", function(d,i)
              {return "translate(" + d.x + "," + d.y + ")"});
      g.append("text")
          .attr("y", 20)
          .attr("text-anchor", "middle")
          .attr("fill", "#b6d9a0")
          .attr("font-size", "14px")
          .text(function(d){return d.title})
          .attr("transform", function(d,i)
              {return "translate(" + d.x + "," + d.y + ")"});
      g.append("text")
          .attr("y", function(d){ return (d.r * 3.5 / 5);})
          .attr("text-anchor", "middle")
          .attr("fill", "#b6d9a0")
          .text(function(d){ return d.value})
          .attr("transform", function(d,i)
              {return "translate(" + d.x + "," + d.y + ")"});
    }

    $(function () {
      render(window.viewportWidth > 1024 ? 1024 : window.viewportWidth);
    });

    $window.on('after-resize', function() {
      $('svg').remove();
      render(window.viewportWidth > 1024 ? 1024 : window.viewportWidth);
    });

}());
