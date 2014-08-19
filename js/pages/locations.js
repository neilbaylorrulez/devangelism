(function locations() {
	'use strict';

	var $mapWrap = $('.location-wrapper'),
		$map = $mapWrap.find('.map'),
		$oldInfoWindow,
		$infoWindow,
		X_FACTOR_OFFSET = 0.015,
		Y_FACTOR_OFFSET = 1.2,
		LOCATIONS = [{
			lng: -79.3516630,
			lat: 43.6607310,
			title: 'Neil\'s House',
			date: 'July 17 - July 19',
			desc: 'Awesome stuff that is longer for stuff'
		}, {
			lng: -122.4194160,
			lat: 37.7749290,
			title: 'SF Fest',
			date: 'July 17',
			desc: 'Awesome stuff'
		}, {
			lng: 151.209900,
			lat: -33.865143,
			title: 'Sydney Australia test',
			date: 'July 17',
			desc: 'Awesome'
		}, {
			lng: 0,
			lat: 51.48,
			title: 'Greenwich England',
			date: 'July 17',
			desc: 'Cool'
		}, {
			lng: 47,
			lat: -20,
			title: 'Madagascar',
			date: 'July 17',
			desc: 'Awesome'
		}];

	function convertLatLngToPixel(lat, lng, mapHeight, mapWidth){
		return {
			y: Math.round(((-1 * lat) + 90) * ((mapHeight * Y_FACTOR_OFFSET) / 180)),
			x: Math.round((lng + 180) * ((mapWidth * (1 + X_FACTOR_OFFSET)) / 360) - (mapWidth * X_FACTOR_OFFSET))
		};
	}

	function addMarker(location) {
		var $marker = $mapWrap.find('.marker[data-id="' + location.id + '"]');
		if(!$marker.length) {
			$mapWrap.append($marker = $('<img data-id="' + location.id + '" class="marker" src="img/marker.svg" alt="">'));
		}
		$marker.css({
			transform: 'translate3d(' + location.coords.x + 'px, ' + location.coords.y + 'px, 0)'
		});
	}

	function updateInfoWindowPosition(justAdded, remove) {
		if($infoWindow) {
			$infoWindow.css({
				transform: 'translate3d(' + $infoWindow.location.coords.x + 'px, ' + $infoWindow.location.coords.y + 'px, 0) translateX(-50%) translateY(calc(-100% - ' + (justAdded ? -40 : 9) + 'px)) ' + 'scale(' + (justAdded === true ? 0 : 1) +')',
				opacity: (justAdded === true ? 0.15 : 0.99)
			});
			if(justAdded) {
				window.setTimeout(window.requestAnimationFrame.bind(null, function () {
					updateInfoWindowPosition();
					removeInfoWindow($oldInfoWindow);
				}), 0);
			}
		}
	}

	function onWinResize() {
		var loc,
			height = $map.height(),
			width = $map.width(),
			len = LOCATIONS.length;

		while(len--) {
			loc = LOCATIONS[len];
			loc.id = '' + len;
			loc.coords = convertLatLngToPixel(loc.lat, loc.lng, height, width);
			addMarker(loc);
		}
		updateInfoWindowPosition();
	}

	function removeInfoWindow($win) {
		if($win) {
			$win.css({
				transform: 'translate3d(' + $win.location.coords.x + 'px, ' + $win.location.coords.y + 'px, 0) translateX(-50%) translateY(calc(-100% + 28px)) scale(0.01)',
				opacity: 0.15
			});

			window.setTimeout(function () {
				this.remove();
			}.bind($win), 300);
		}
	}

	function mapClick(e) {
		var $clicked = $(e.target),
			id,
			location;
		if(!$clicked.hasClass('marker')) {
			return window.setTimeout(window.requestAnimationFrame.bind(null, function () {
				removeInfoWindow($infoWindow);
			}), 0);
		}

		id = parseInt($clicked.attr('data-id'), 10);
		location = LOCATIONS[id];
		if(!location || $mapWrap.find('.location-dialog[data-id="' + id + '"]').length) {
			return;
		}

		$oldInfoWindow = $infoWindow;
		$mapWrap.append($infoWindow = $('<div class="location-dialog" data-id="' + id +'"><h2>' + location.title + '</h2><p>' + location.date + '</p><p>' + location.desc + '</p></div>'))
		$infoWindow.location = location;
		updateInfoWindowPosition(true);
	}

	function init() {
		onWinResize();
		$(window).on('after-resize', onWinResize);
		$mapWrap.closest('section').on('click', mapClick);
	}

	$(init);
}());