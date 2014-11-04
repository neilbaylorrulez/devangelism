(function locations() {
	getData(function (data) {
		var $mapWrap = $('.location-wrapper'),
			$map = $mapWrap.find('.map'),
			$oldInfoWindow,
			$infoWindow,
			X_FACTOR_OFFSET = 0.015, //magic number!
			Y_FACTOR_OFFSET = 1.2, //magic number!
			LOCATIONS = data.filter(function (d) {return d.lng})

		function convertLatLngToPixel(lat, lng, mapHeight, mapWidth){
			return {
				y: Math.round(((-1 * lat) + 90) * ((mapHeight * Y_FACTOR_OFFSET) / 180)),
				x: Math.round((lng + 180) * ((mapWidth * (1 + X_FACTOR_OFFSET)) / 360) - (mapWidth * X_FACTOR_OFFSET))
			};
		}

		function addMarker(locations, id) {
			var location = locations[0]
			var $marker = $mapWrap.find('.marker[data-id="' + id + '"]');
			if(!$marker.length) {
				$mapWrap.append($marker = $('<img data-id="' + id + '" class="marker" src="img/marker.svg" alt="">'));
			}
			$marker.css({
				transform: 'translate(' + location.coords.x + 'px, ' + location.coords.y + 'px)'
			});
		}

		function updateInfoWindowPosition(addingNew) {
			if($infoWindow && $infoWindow.parent().length) {
				$infoWindow.css({
					transform: 'translate3d(' + $infoWindow.coords.x + 'px, ' + $infoWindow.coords.y + 'px, 0) translateX(-50%) translateY(calc(-100% - ' + (addingNew ? -40 : 9) + 'px)) ' + 'scale(' + (addingNew ? 0.01 : 1) +')',
					opacity: addingNew ? 0.15 : 0.99,
					transition: addingNew ? 'none' : ''
				});

				if($infoWindow.coords.x < 110) {
					$mapWrap.css('transform', 'translate3d(' + (110 - $infoWindow.coords.x) + 'px, 0, 0)');
				} else if(window.viewportWidth - $infoWindow.coords.x < 110) {
					$mapWrap.css('transform', 'translate3d(' + (-110 + (window.viewportWidth - $infoWindow.coords.x)) + 'px, 0, 0)');
				} else {
					$mapWrap.css('transform', '');
				}

				if(addingNew) {
					window.setTimeout(window.requestAnimationFrame.bind(null, function () {
						removeInfoWindow($oldInfoWindow);
						updateInfoWindowPosition();
					}), 0);
				}
			}
		}

		function onWinResize() {
			$('img.marker').remove()
			var loc,
				height = $map.height(),
				width = $map.width(),
				len = LOCATIONS.length,
				locations = {};

			while(len--) {
				loc = LOCATIONS[len];
				loc.id = '' + len;
				// console.log(height, width)
				loc.coords = convertLatLngToPixel(loc.lat, loc.lng, height, width);
				// addMarker(loc);
			}

			var locations = {}
			LOCATIONS.forEach(function (loc) {
				var key = loc.coords.x + '-' + loc.coords.y
				if (!locations[key]) locations[key] = []
				locations[key].push(loc)
			})
			for (var x in locations) {
				addMarker(locations[x], x)
			}
			LOCATIONS_GROUPED = locations

			updateInfoWindowPosition();
		}


		function removeInfoWindow($win) {
			if($win) {
				$win.css({
					transform: 'translate3d(' + $win.coords.x + 'px, ' + $win.coords.y + 'px, 0) translateX(-50%) translateY(calc(-100% + 28px)) scale(0.01)',
					opacity: 0.15
				});
				window.setTimeout(function () {
					$win.remove();
					$win = null;
				}, 350);
			}
		}

		function mapClick(e) {
			var $clicked = $(e.target),
				id,
				location;
			//remove old marker
			if(!$clicked.hasClass('marker')) {
				return window.setTimeout(window.requestAnimationFrame.bind(null, function () {
					$mapWrap.css('transform', '');
					removeInfoWindow($infoWindow);
				}), 0);
			}

			id = $clicked.attr('data-id');
			_locations = LOCATIONS_GROUPED[id];
			//console.error(_locations, id)
			if(!_locations || $mapWrap.find('.location-dialog[data-id="' + id + '"]').length) {
				return;
			}

			$oldInfoWindow = $infoWindow;

			var elem = '<div class="location-dialog" data-id="' + id +'">'


			//need to write logic that if there are more than 1 i, then to do a different loop
			var locationLength = _locations.length;
			
			if(locationLength > 1) {

					elem += '<h2 class="multi">There are ' + locationLength + ' Events</h2>'

				_locations.forEach(function (location, i) {
					
					elem += '<p class="multi-title">'
					elem += location.title
					elem += ' - <span class="multi-location">'
					elem += location.location
					elem += '</span> - '
					elem += '<span class="multi-date">'
					elem += location.dateString
					elem += '</span></p>'
				})

			} else {

				_locations.forEach(function (location, i) {
					elem += '<h2>'
					elem += location.title
					elem += '</h2>'
					elem += '<p class="location">'
					elem += location.location
					elem += '</p>'
					elem += '<p class="bot">'
					elem += location.dateString
					elem += '</p>'
					elem += '<p class="bot">'
					elem += location.desc
					elem += '</p>'
				})
			}

			
			elem += '</div>'

			$mapWrap.append($infoWindow = $(elem))
			$infoWindow.coords = _locations[0].coords;
			updateInfoWindowPosition(true);
		}

		function init() {
			setTimeout(onWinResize, 100)
			$(window).on('after-resize', onWinResize);
			$mapWrap.closest('section').on('click', mapClick);
		}

		window.imagesLoaded($mapWrap, init);
	})
}());
