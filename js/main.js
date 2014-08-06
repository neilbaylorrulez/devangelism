(function main () {
	'use strict';

	var $window = $(window),
		$wrap = $('#wrap');

	function initState() {
		$wrap.addClass('loaded');
	}

	function initListeners() {
		var resizeTimeout = null,
			first = true;

		window.FastClick.attach(document.body);

		$wrap.find('.open-menu').on('click', function() {
			$wrap.toggleClass('menu');
		});

		$window.on('after-scroll', window.setTimeout.bind(null, window.requestAnimationFrame.bind(null, function() {
			$wrap.removeClass('menu');
		}), 100));

		$window.on('resize', function () {
			if(first) {
				$wrap.addClass('no-transition');
				first = false;
			}
			if(resizeTimeout) {
				window.clearTimeout(resizeTimeout);
			}
			resizeTimeout = window.setTimeout(function () {
				resizeTimeout = null;
				first = true;
				$wrap.removeClass('no-transition');
			}, 300);
		});
	}

	function init() {
		initState();
		initListeners();
	}

	$(init);
}());