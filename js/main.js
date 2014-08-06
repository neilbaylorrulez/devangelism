(function main () {
	'use strict';

	var $window = $(window),
		$wrap = $('#wrap');

	function init() {
		window.FastClick.attach(document.body);
		$wrap.addClass('loaded').find('.open-menu').on('click', function() {
			$wrap.toggleClass('menu');
		});
		$window.on('after-scroll', window.setTimeout.bind(null, window.requestAnimationFrame.bind(null, function() {
			$wrap.removeClass('menu');
		}), 100));
	}

	$window.on('app-ready', init);

}());