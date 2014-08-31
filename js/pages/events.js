(function events() {
    'use strict';

    var $window = $(window),
        $me =  $('[data-id="events"]'),
        $overlay = $('.overlay.events.hide'),
        winWidth = $window.width(),
        MONTHS = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        EVENTS = [{
          title: 'RapidConf',
          date: new Date('September 8, 2014'),
          location: 'Grand Rapids, MI',
          digitalOcean: {
            events: [{
              date: new Date('September 8, 2014'),
              title: 'Mikeal Rogers discusses awesome stuff',
              who: 'Mikeal Rogers'
            }, {
              date: new Date('September 9, 2014'),
              title: 'John Edgar gives out free stuff',
              who: 'John Edgar'
            }],
            otherAttendees: 'Neil Taylor'
          }
        }, {
          title: 'CoolConf',
          date: new Date('September 14, 2014'),
          location: 'San Francisco, CA',
          digitalOcean: {
            events: [{
              date: new Date('September 14, 2014'),
              title: 'Mikeal Rogers discusses awesome stuff',
              who: 'Mikeal Rogers'
            }, {
              date: new Date('September 14, 2014'),
              title: 'Jay Rodriguez discusses even more awesome stuff and other good things that will be a long day, i hope you like jay, cause he can be a bit verbose - and by a bit, i mean riduiclously',
              who: 'Jay Rodriguez'
            }, {
              date: new Date('September 14, 2014'),
              title: 'John Edgar gives out free stuff',
              who: 'John Edgar'
            }],
            otherAttendees: ['Neil Taylor', 'Joseph A Bank']
          }
        }, {
          title: 'Best Event',
          date: new Date('January 9, 2015'),
          location: 'Toronto, ON',
          digitalOcean: {
            events: [{
              date: new Date('January 9, 2015'),
              title: 'Mikeal Rogers discusses awesome stuff',
              who: 'Mikeal Rogers'
            }, {
              date: new Date('January 11, 2015'),
              title: 'John Edgar gives out free stuff',
              who: 'John Edgar'
            }]
          }
        }, {
          title: 'Cool Stuff',
          date: new Date('February 12, 2015'),
          location: 'Toronto, ON',
          digitalOcean: {
            otherAttendees: ['John Edgar']
          }
        }, {
          title: 'Blarghy Stuff',
          date: new Date('February 12, 2014'),
          location: 'Rochester, NY',
          digitalOcean: {
            otherAttendees: ['John Edgar', 'Mikeal Rogers', 'Joseph A Bank']
          }
        }];

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
          title: 'Digital Ocean is attending ' + e.title,
          date: e.date,
          location: e.location
        }];
        view.children.push({
          'name': e.title,
          'type': MONTHS[e.date.getMonth()].substr(0, 3) + ' ' + e.date.getDate() + ', ' + e.date.getUTCFullYear(),
          'count': events.length,
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
        if(e.digitalOcean) {
          if(e.digitalOcean.otherAttendees) {
            if(Array.isArray(e.digitalOcean.otherAttendees)) {
              e.digitalOcean.otherAttendees.forEach(function(a) {
                if(!people.hasOwnProperty(a)) {
                  return people[a] = [e];
                }
                people[a].push(e);
              });
            } else {
              if(!people.hasOwnProperty(e.digitalOcean.otherAttendees)) {
                return people[e.digitalOcean.otherAttendees] = [e];
              }
              people[e.digitalOcean.otherAttendees].push(e);
            }
          }
          if(e.digitalOcean.events) {
            if(Array.isArray(e.digitalOcean.events)) {
              e.digitalOcean.events.forEach(function(a) {
                if(!people.hasOwnProperty(a.who)) {
                  return people[a.who] = [e];
                }
                people[a.who].push(e);
              });
            } else {
              if(!people.hasOwnProperty(e.digitalOcean.events.who)) {
                return people[e.digitalOcean.events.who] = [e];
              }
              people[e.digitalOcean.events.who].push(e);
            }
          }
         }
      });
      for(key in people) {
        if(people.hasOwnProperty(key)) {
          view.children.push({
            name: key,
            title:  $('.overlay.who h1').filter(function() {
              return $(this).text() === key;
            }).siblings('h3').text() || 'Guest',
            events: people[key],
            count: people[key].length
          });
        }
      }

      return view;
    }

    function render(width) {
      var pack = d3.layout
            .pack().size([width, width < 1024? width : 800])
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
          .text(function(d){return d.month})
          .attr("font-size", function(d,i){ return (d.r < 51? d.r/50*15 : 18) + 'px' })
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
          .attr("y", function(d){ return (d.r * (d.r < 51? d.r/50 * 4 : 3.5) / 5);})
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
          .text(function(d){return d.name})
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
          .attr("y", function(d){ return (d.r * (d.r < 51? d.r/50 * 4 : 3.5) / 5);})
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
          .text(function(d){return d.name})
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
          .attr("y", function(d){ return (d.r * (d.r < 51? d.r/50 * 4 : 3.5) / 5);})
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
          thisTitle = 'Digital Ocean is attending ' + eventTitle;
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

}());
