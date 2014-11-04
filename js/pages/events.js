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
        var key = e.date.getUTCMonth() + ' ' + e.date.getUTCFullYear();
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
          'type': MONTHS[e.date.getUTCMonth()].substr(0, 3) + ' ' + e.date.getUTCDate() + ', ' + e.date.getUTCFullYear(),
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
      var pack = d3.layout.pack().value(function(d) { return d.count });

        var packCalculations1 = pack.nodes(getMonthView()),
          packCalculations2 = pack.nodes(getEventView()),
          packCalculations3 = pack.nodes(getAttendeeView()),
          name, type, title, location;
          

          $.each(packCalculations1, function(index, value) {
            if (index > 0) {
              $("#month-table").append('<li><a href="#" data-overlay-id="month-' + value.month + ' ' + value.year + '"><p class="label">'+ value.month + ' ' + value.year +'</p><span class="count">' + value.count + ' Conferences</span></a></li>');
            }
          });

          $.each(packCalculations2, function(index, value) {
            if (index > 0) {
              

              $.each(value.events, function(index, eventValue) {
                  name = value.name,
                  type = value.type,
                  title = eventValue.title,
                  location = eventValue.location;
              });

              //console.log(value);

              $("#event-table").append('<li><a href="#" data-overlay-id="event-' + name + '"><p class="label">'+ name +'</p><span class="count">' + type + '</span></a><div class="deck"><h3>' + name + '</h3><span class="date">' + type + ' - ' + location + '</span><h4>' + title + '</h4></div></li>');
            }
          });

          $.each(packCalculations3, function(index, value) {
            if (index > 0) {
              $("#attendee-table").append('<li><a href="#" data-overlay-id="attendee-' + value.name + '"><p class="label">'+ value.name +'</p><span class="count">' + value.count + ' Conferences</span></a></li>');
            }
          });
    }

    $(function () {

      render(window.viewportWidth > 1024 ? 1024 : window.viewportWidth);
      
      $me.on('click', 'a[data-overlay-id]', function (e) {
        var thisId = $(this).closest('ul').attr("id");

        //if this has an id of event table, dont do the rest
        if(thisId != 'event-table'){

          var overlay = e.currentTarget.getAttribute('data-overlay-id');
          if(overlay) {
            window.clickedOverlayTriggeredPage = true;
            window.location.hash = '#events/' + overlay;
          } 

        } else {
          var deck = $(this).next('.deck');
          deck.toggleClass('open');
        }
        return false;
      });
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

      html = '<div class="overlay-wrap ' + tab + '"><h1>' + child + '</h1><ul>';
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
        html += '<li><span class="date">' + '<span class="month">' + MONTHS[e.date.getUTCMonth()].substr(0, 3) + '</span>' + '<span class="day">' + e.date.getUTCDate() + '</span></span>';
        html += '<span class="details"><span class="top"><span class="location">'+ e.location + '</span><span class="event">'+ eventTitle + '</span></span><span class="title">'+ thisTitle + '</span></li>'
      })
      html += '</ul><span class="close-overlay">Close Overlay</span></div>';
      $overlay.html(html).attr('data-id', overlayId);
    });
  })
})();
