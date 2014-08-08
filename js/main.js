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
			first = true;

		window.FastClick.attach(document.body);

		$('.open-menu').on('click', function() {
			$body.toggleClass('menu');
		});

		$window.on('after-scroll', window.setTimeout.bind(null, window.requestAnimationFrame.bind(null, function() {
			$body.removeClass('menu');
		}), 100));

		$window.on('resize', function () {
			if(first) {
				$body.addClass('no-transition');
				first = false;
			}
			if(resizeTimeout) {
				window.clearTimeout(resizeTimeout);
			}
			resizeTimeout = window.setTimeout(function () {
				resizeTimeout = null;
				first = true;
				$body.removeClass('no-transition');
				$window.trigger('after-resize');
			}, 300);
		});

		window.setTimeout(function () {
			$('.overlay').removeClass('hide').addClass('show');
		}, 2000);
	}

	function init() {
		initState();
		initListeners();
	}

	$(init);
}());