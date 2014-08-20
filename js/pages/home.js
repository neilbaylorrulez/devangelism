(function home () {
	'use strict';

	var $weLoveDevs = $('#home h2');

	function animate() {
		$weLoveDevs.html($weLoveDevs.text().replace(/([^\x00-\x80]|\w)/g, "<span>$&</span>"));
		window.setTimeout(window.requestAnimationFrame.bind(null, function () {
			$weLoveDevs.addClass('animate');
			window.setTimeout(function () {
				$weLoveDevs.removeClass('animate').find('span').contents().unwrap();
			}, 3000);
		}), 0);
	}

	function init() {
		animate();
	}

	$(window).load(init);
}());