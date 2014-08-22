(function main () {
	'use strict';

	var $window = $(window),
		$body = $(document.body),
		$wrap = $('#wrap'),
		MOBILE_WIDTH = 720,
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
				window.setTimeout(function () {
					$body.removeClass('resizing');
				}, 100);
			}, 300);
		});
	}

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