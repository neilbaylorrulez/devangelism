(function main () {
	'use strict';

	var $window = $(window),
		$body = $(document.body),
		$wrap = $('#wrap'),
		MOBILE_WIDTH = 820,
		IS_SAFARI = /^((?!chrome).)*safari/i.test(navigator.userAgent);

	function initState() {
		window.setTimeout(window.requestAnimationFrame.bind(null, function() {
			$wrap.addClass('loaded');
		}), 0);
	}

	function updateViewportInfo() {
		window.viewportWidth = $window.width();
		window.viewportHeight = $window.height();
		window.isMobile = window.viewportWidth < MOBILE_WIDTH;
	}

	function initListeners() {
		var resizeTimeout = null,
			debounce = true;

		window.FastClick.attach(document.body);

		$('.open-menu').on('click', function() {
			$body.toggleClass('menu');
		});

		$window.on('after-scroll', window.setTimeout.bind(null, window.requestAnimationFrame.bind(null, function() {
			$body.removeClass('menu');
		}), 100));

		$window.on('resize', function () {
			if(debounce) {
				$body.addClass('resizing');
				debounce = false;
			}
			if(resizeTimeout) {
				window.clearTimeout(resizeTimeout);
			}
			resizeTimeout = window.setTimeout(function () {
				var oldWidth = window.viewportWidth;
				resizeTimeout = null;
				debounce = true;
				updateViewportInfo();
				if(oldWidth !== window.viewportWidth) {
					$window.trigger('after-resize');
				}
				$window.trigger('after-any-resize');
				window.setTimeout(function () {
					$body.removeClass('resizing');
				}, 100);
			}, 300);
		});
	}

	var alldata
	  , queue = []
		;
	function flush () {
		while (queue.length) {
			queue.shift()(alldata)
		}
	}
	function getData (cb) {
		if (!alldata) queue.push(cb)
		else cb(alldata)
	}
	window.getData = getData

	$.get("/spreadsheet.json", function(data) {

		// {
		//   title: 'RapidConf',
		//   date: new Date('September 8, 2014'),
		//   location: 'Grand Rapids, MI',
		//   digitalOcean: {
		//     events: [{
		//       date: new Date('September 8, 2014'),
		//       title: 'Mikeal Rogers discusses awesome stuff',
		//       who: 'Mikeal Rogers'
		//     }, {
		//       date: new Date('September 9, 2014'),
		//       title: 'John Edgar gives out free stuff',
		//       who: 'John Edgar'
		//     }],
		//     otherAttendees: 'Neil Taylor'
		//   }
		// }

		alldata = data.map(function (data) {
			var ret =
				{ title: data.eventname
				, date: new Date(data.startdate)
				, location: data.location
				}
			if (data.speaking) {
				ret.digitalOcean = { events: [] }
				data.speaking.forEach(function (speaker) {
					ret.digitalOcean.events.push(
						{ date: new Date(data.startdate)
						, title: speaker + ' will be speaking.'
						, who: speaker
						}
					)
				})
			}
			if (data.attending) {
				ret.otherAttendees = data.attending
			}
			ret.attending = data.attending
			ret.speaking = data.speaking

			function doTitle (e) {
				var title = ''
				if (e.speaking) {
					if (e.speaking.length > 1) title += e.speaking.join(' and ') + ' are speaking.'
					else title += e.speaking[0] + ' is speaking.'
				}
				if (e.attending) {
					if (title.length) title += ' '
					if (e.attending.length > 1) title += e.attending.join(' and ') + ' are attending.'
					else title += e.attending[0] + ' is attending.'
				}
				if (!title.length) title = 'Digital Ocean is sponsoring.'
				e.description = title
			}
			doTitle(data)
			ret.description = data.description

			if (data.latlon && data.latlon.length) {
				var location = data.latlon[0]
				ret.lat = location.latitude
				ret.lng = location.longitude
				ret.desc = data.description
				if (data.startdate) {
					data.startdate = new Date(data.startdate)
					data.enddate = new Date(data.enddate)
					ret.dateString = data.startdate.toDateString().slice(4,10)
					if (data.enddate.getTime() !== data.startdate.getTime()) ret.dateString += ' - ' + data.enddate.toDateString().slice(4,10)
				}
			}

			return ret
		})
		.filter(function (d) {return d.date}).filter(upcomingMonth)

		function upcomingMonth (e) {
			var d = new Date()
			var thisMonth = new Date(d.toString().slice(4,8) + '01' + d.toString().slice(10,16) + 'UTC')
			return e.date.getTime() >= thisMonth.getTime()
		}

		flush()
	})

	function init() {
		initState();
		initListeners();
		if(IS_SAFARI) {
			$body.addClass('safari');
		}
	}

	updateViewportInfo();

	$(init);
}());
