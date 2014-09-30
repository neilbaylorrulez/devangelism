;(function events() {
  getData(function (data) {
    var $window = $(window),
        $me =  $('[data-id="events"]'),
        $overlay = $('.overlay.events.hide'),
        MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        EVENTS = data
        ;

    function getMonthView() {
      var view = {
          name: '',
          children: []
        },
        events = EVENTS.sort(function(a,b) {
          return b.date - a.date;
        }),
        months = {},
        key, s, m, y;

      events.forEach(function(e) {
        var key = e.date.getMonth() + ' ' + e.date.getUTCFullYear();
        if(!months.hasOwnProperty(key)) {
          return months[key] = [e];
        }
        months[key].push(e);
      });

      for(key in months) {
        if(months.hasOwnProperty(key)) {
            s = key.split(' ');
            m = s[0];
            y = s[1];
            view.children.push({
              month: MONTHS[m],
              year: y,
              events: months[key],
              count: months[key].length
            });
        }
      }

      return view;
    }

    function getEventView() {
      var view = {
          name: '',
          children: []
        },
        events = EVENTS.sort(function(a,b) {
          return b.date - a.date;
        });

      events.forEach(function(e) {
        var events = e.digitalOcean && e.digitalOcean.events ? (Array.isArray(e.digitalOcean.events) ? e.digitalOcean.events : [e.digitalOcean.events]) : [{
          title: e.description,
          date: e.date,
          location: e.location
        }];

        view.children.push({
          'name': e.title,
          'type': MONTHS[e.date.getMonth()].substr(0, 3) + ' ' + e.date.getDate() + ', ' + e.date.getUTCFullYear(),
          'count': e.speaking ? e.speaking.length : 0 + e.attending ? e.attending.length : 0,
          'events': events.map(function (ev) {
            ev.location = e.location;
            return ev;
          })
        });
      });

      return view;
    }

    function getAttendeeView() {
      var view = {
          name: '',
          children: []
        },
        events = EVENTS.sort(function(a,b) {
          return b.date - a.date;
        }),
        key,
        title,
        people = {};

      events.forEach(function(e) {
        if (e.speaking || e.attending) {
          var everyone = (e.speaking || []).concat(e.attending || [])
          everyone.forEach(function (person) {
            if (!people[person]) people[person] = []
            people[person].push(e)
          })
        }
      });
      for(key in people) {
        if(people.hasOwnProperty(key)) {
          view.children.push({
            name: key,
            events: people[key],
            count: people[key].length
          });
        }
      }

      return view;
    }

    function render(width) {
      var pack = d3.layout
            .pack().size([width, width < 1024 ? width : 800])
            .padding(15)
            .value(function(d) { return d.count }),
          packCalculations1 = pack.nodes(getMonthView()),
          packCalculations2 = pack.nodes(getEventView()),
          packCalculations3 = pack.nodes(getAttendeeView()),
          svg = d3.select("#month-tab .content").append("svg")
            .attr("width", width)
            .attr("height", width < 1024? width : 800)
            .selectAll("g").data(packCalculations1).enter(),
          g = svg.append("g")
              .attr('data-overlay-id', function(d, i) {return i ? 'month-' + d.month + ' ' + d.year : ''});

      // Draw outer circle
      g.append("circle")
          .attr("r", function(d){return d.r})
          .style("fill", function(d, i){return i?"#4a4a4a": "#B6D9A0";})
          .style("stroke", "#B6D9A0")
          .attr("transform", function(d,i)
             {return "translate(" + d.x + "," + d.y + ")"});

      // Draw additional info circle
      g.append("circle")
          .attr("r", function(d){return d.r < 51 ? d.r / 50 * 10 : 14})
          .style("fill", "#4a4a4a")
          .style("stroke", "#a2a2a2")
          .style("display", function(d, i){return i?"block": "none";})
          .attr("transform", function(d,i)
             {return "translate(" + d.x + "," + (d.y - (d.r * 3 / 5) ) + ")"});
      g.append("line")
          .attr({
              x1: 0,
              y1: 0,
              x2: function(d){return d.r < 51 ? d.r / 50 * 10 : 14},
              y2: 0
          })
          .style("stroke", "#a2a2a2")
          .style("display", function(d, i){return i?"block": "none";})
          .attr("transform", function(d,i)
             {return "translate(" + (d.x - (d.r < 51 ? d.r / 50 * 5 : 7)) + "," + (d.y - (d.r * 3 / 5) ) + ")"});
      g.append("line")
          .attr({
              x1: 0,
              y1: 0,
              x2: 0,
              y2: function(d){return d.r < 51 ? d.r / 50 * 10 : 14}
          })
          .style("stroke", "#a2a2a2")
          .style("display", function(d, i){return i?"block": "none";})
          .attr("transform", function(d,i)
             {return "translate(" + (d.x) + "," + (d.y - (d.r * 3 / 5) - (d.r < 51 ? d.r / 50 * 5 : 7) ) + ")"});

      // Draw first line text
      g.append("text")
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .text(function(d, i){ return i && d.r < 65 ? (d.month.length > 11 ? d.month.substr(0, 8) + '...' : d.month) : (d.month && d.month.length > 15 ? d.month.substr(0, 12) + '...' : d.month)})
          .attr("font-size", function(d,i){ return (d.r < 51 ? d.r/50*15 : 18) + 'px' })
          .attr("transform", function(d,i)
               {return "translate(" + d.x + "," + d.y + ")"});

      // Draw second line text
      g.append("text")
          .attr("y", function(d){ return (d.r < 51? d.r/50*15 : 20);})
          .attr("text-anchor", "middle")
          .attr("fill", "#b6d9a0")
          .attr("font-size", function(d,i){ return (d.r < 51? d.r/50*12 : 14) + 'px' })
          .text(function(d){return d.year})
          .attr("transform", function(d,i)
               {return "translate(" + d.x + "," + d.y + ")"});

      // Draw count
      g.append("text")
          .attr("y", function(d){ return (d.r * (d.r < 45 ? d.r/50 * 5 : 4) / 5);})
          .attr("text-anchor", "middle")
          .attr("fill", "#b6d9a0")
          .attr("font-size", function(d,i){ return (d.r < 51? d.r/50*14 : 16) + 'px' })
          .text(function(d){ return d.value})
          .attr("transform", function(d,i)
               {return "translate(" + d.x + "," + d.y + ")"});

      // Draw Event view SVG

      svg = d3.select("#event-tab .content").append("svg")
      .attr("width", width)
         .attr("height", width < 1024? width : 800)
         .selectAll("g").data(packCalculations2).enter();
      g = svg.append("g")
            .attr('data-overlay-id', function(d, i) {return i ? 'event-' + d.name : ''});

      g.append("circle")
          .attr("r", function(d){return d.r})
          .style("fill", function(d, i){return i?"#4a4a4a": "#B6D9A0";})
          .style("stroke", "#B6D9A0")
          .attr("transform", function(d,i)
             {return "translate(" + d.x + "," + d.y + ")"});
      g.append("circle")
          .attr("r", function(d){return d.r < 51 ? d.r / 50 * 10 : 14})
          .style("fill", "#4a4a4a")
          .style("stroke", "#a2a2a2")
          .style("display", function(d, i){return i?"block": "none";})
          .attr("transform", function(d,i)
             {return "translate(" + d.x + "," + (d.y - (d.r * 3 / 5) ) + ")"});
      g.append("line")
          .attr({
              x1: 0,
              y1: 0,
              x2: function(d){return d.r < 51 ? d.r / 50 * 10 : 14},
              y2: 0
          })
          .style("stroke", "#a2a2a2")
          .style("display", function(d, i){return i?"block": "none";})
          .attr("transform", function(d,i)
             {return "translate(" + (d.x - (d.r < 51 ? d.r / 50 * 5 : 7)) + "," + (d.y - (d.r * 3 / 5) ) + ")"});
      g.append("line")
          .attr({
              x1: 0,
              y1: 0,
              x2: 0,
              y2: function(d){return d.r < 51 ? d.r / 50 * 10 : 14}
          })
          .style("stroke", "#a2a2a2")
          .style("display", function(d, i){return i?"block": "none";})
          .attr("transform", function(d,i)
             {return "translate(" + (d.x) + "," + (d.y - (d.r * 3 / 5) - (d.r < 51 ? d.r / 50 * 5 : 7) ) + ")"});
      g.append("text")
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .text(function(d,i){return i && d.r < 65 ? (d.name.length > 11 ? d.name.substr(0, 8) + '...' : d.name) : (d.name && d.name.length > 15 ? d.name.substr(0, 12) + '...' : d.name)})
          .attr("font-size", function(d,i){ return (d.r < 51? d.r/50*15 : 18) + 'px' })
          .attr("transform", function(d,i)
              {return "translate(" + d.x + "," + d.y + ")"});
      g.append("text")
          .attr("y", function(d){ return (d.r < 51? d.r/50*15 : 20);})
          .attr("text-anchor", "middle")
          .attr("fill", "#b6d9a0")
          .attr("font-size", function(d,i){ return (d.r < 51? d.r/50*12 : 14) + 'px' })
          .text(function(d){return d.type})
          .attr("transform", function(d,i)
              {return "translate(" + d.x + "," + d.y + ")"});
      g.append("text")
          .attr("y", function(d){ return (d.r * (d.r < 45 ? d.r/50 * 5 : 4) / 5);})
          .attr("text-anchor", "middle")
          .attr("fill", "#b6d9a0")
          .attr("font-size", function(d,i){ return (d.r < 51? d.r/50*14 : 16) + 'px' })
          .text(function(d){ return d.value})
          .attr("transform", function(d,i)
              {return "translate(" + d.x + "," + d.y + ")"});

      // Draw Attendee view SVG

      svg = d3.select("#attendee-tab .content").append("svg")
      .attr("width", width)
         .attr("height", width < 1024? width : 800)
         .selectAll("g").data(packCalculations3).enter();
      g = svg.append("g")
            .attr('data-overlay-id', function(d, i) {return i ? 'attendee-' + d.name : ''});

      g.append("circle")
          .attr("r", function(d){return d.r})
          .style("fill", function(d, i){return i?"#4a4a4a": "#B6D9A0";})
          .style("stroke", "#B6D9A0")
          .attr("transform", function(d,i)
             {return "translate(" + d.x + "," + d.y + ")"});
      g.append("circle")

          .attr("r", function(d){return d.r < 51 ? d.r / 50 * 10 : 14})
          .style("fill", "#4a4a4a")
          .style("stroke", "#a2a2a2")
          .style("display", function(d, i){return i?"block": "none";})
          .attr("transform", function(d,i)
             {return "translate(" + d.x + "," + (d.y - (d.r * 3 / 5) ) + ")"});
      g.append("line")
          .attr({
              x1: 0,
              y1: 0,
              x2: function(d){return d.r < 51 ? d.r / 50 * 10 : 14},
              y2: 0
          })
          .style("stroke", "#a2a2a2")
          .style("display", function(d, i){return i?"block": "none";})
          .attr("transform", function(d,i)
             {return "translate(" + (d.x - (d.r < 51 ? d.r / 50 * 5 : 7)) + "," + (d.y - (d.r * 3 / 5) ) + ")"});
      g.append("line")
          .attr({
              x1: 0,
              y1: 0,
              x2: 0,
              y2: function(d){return d.r < 51 ? d.r / 50 * 10 : 14}
          })
          .style("stroke", "#a2a2a2")
          .style("display", function(d, i){return i?"block": "none";})
          .attr("transform", function(d,i)
             {return "translate(" + (d.x) + "," + (d.y - (d.r * 3 / 5) - (d.r < 51 ? d.r / 50 * 5 : 7) ) + ")"});
      g.append("text")
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .text(function(d, i){return i && d.r < 65 ? (d.name.length > 11 ? d.name.substr(0, 8) + '...' : d.name) : (d.name && d.name.length > 15 ? d.name.substr(0, 12) + '...' : d.name)})
          .attr("font-size", function(d,i){ return (d.r < 51? d.r/50*15 : 18) + 'px' })
          .attr("transform", function(d,i)
              {return "translate(" + d.x + "," + d.y + ")"});
      g.append("text")
          .attr("y", function(d){ return (d.r < 51? d.r/50*15 : 20);})
          .attr("text-anchor", "middle")
          .attr("fill", "#b6d9a0")
          .attr("font-size", function(d,i){ return (d.r < 51? d.r/50*12 : 14) + 'px' })
          .text(function(d){return d.title})
          .attr("transform", function(d,i)
              {return "translate(" + d.x + "," + d.y + ")"});
      g.append("text")
          .attr("y", function(d){ return (d.r * (d.r < 45 ? d.r/50 * 5 : 4) / 5);})
          .attr("text-anchor", "middle")
          .attr("fill", "#b6d9a0")
          .attr("font-size", function(d,i){ return (d.r < 51? d.r/50*14 : 16) + 'px' })
          .text(function(d){ return d.value})
          .attr("transform", function(d,i)
              {return "translate(" + d.x + "," + d.y + ")"});
    }

    $(function () {
      render(window.viewportWidth > 1024 ? 1024 : window.viewportWidth);
      $me.on('click', 'g[data-overlay-id]', function (e) {
        var overlay = e.currentTarget.getAttribute('data-overlay-id');
        if(overlay) {
          window.clickedOverlayTriggeredPage = true;
          window.location.hash = '#events/' + overlay;
        }
      });
    });

    $window.on('after-resize', function() {
      $me.find('svg').remove();
      render(window.viewportWidth > 1024 ? 1024 : window.viewportWidth);
    });

    $window.on('create-event-overlay', function(e, overlayId) {
      var tab = overlayId.split('-')[0],
          title,
          subTitle = '',
          eventTitle,
          thisTitle,
          child = overlayId.replace(tab + '-', ''),
          html,
          node;
      if(tab === 'month') {
        node = getMonthView().children.filter(function(item) {
          return item.month + ' ' + item.year === child;
        })[0];
        if(!node) {
          return;
         }
      } else if(tab === 'event') {
        node =  getEventView().children.filter(function(item) {
          return item.name  === child;
        })[0];
        if(!node) {
          return;
         }
        subTitle = node.type + (node.events && node.events.length && node.events[0].location ? ' | ' + node.events[0].location : '');
      } else {
         node = getAttendeeView().children.filter(function(item) {
            return item.name === child;
         })[0];
         if(!node) {
          return;
         }
         subTitle = node.title;
      }

      html = '<div class="overlay-wrap ' + tab + '"><h1>' + child + '</h1><h3>' + subTitle + '</h3><ul>';
      node.events.sort(function (a,b) {
        return a.date - b.date;
      }).forEach(function(e) {
        if(tab === 'month') {
          eventTitle = e.name || node.name || e.title;
          thisTitle = e.description
        } else if(tab === 'event') {
          eventTitle = node.name;
          thisTitle = e.title;
        } else {
          eventTitle = e.title;
          thisTitle = node.name + ' is attending ' + eventTitle;
        }
        html += '<li><span class="date">' + (tab !== 'month' ? '<span class="month">' + MONTHS[e.date.getMonth()].substr(0, 3) + '</span>' : '') + '<span class="day">' + e.date.getDate() + '</span></span>';
        html += '<span class="details"><span class="top"><span class="location">'+ e.location + '</span><span class="event">'+ eventTitle + '</span></span><span class="title">'+ thisTitle + '</span></li>'
      })
      html += '</ul><span class="close-overlay">Close Overlay</span></div>';
      $overlay.html(html).attr('data-id', overlayId);
    });
  })
})();
