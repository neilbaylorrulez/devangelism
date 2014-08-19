(function main () {
	'use strict';

	var $window = $(window),
		$body = $(document.body),
		$wrap = $('#wrap');

	function initState() {
		window.setTimeout(window.requestAnimationFrame.bind(null, function() {
			$wrap.addClass('loaded');
		}), 0);
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
				resizeTimeout = null;
				debounce = true;
				window.viewportWidth = $window.width();
				window.isMobile = window.viewportWidth < 720;

				$window.trigger('after-resize');
				window.setTimeout(function () {
					$body.removeClass('resizing');
				}, 100);
			}, 300);
		});
	}

	function init() {
		initState();
		initListeners();
	}

	window.viewportWidth = $window.width();
	window.isMobile = window.viewportWidth < 720;

	$(init);
}());