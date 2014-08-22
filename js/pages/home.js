(function home () {
	'use strict';

	var $weLoveDevs = $('[data-id="home"] h2');

	function animate() {
		$weLoveDevs.html($weLoveDevs.text().replace(/([^\x00-\x80]|\w)/g, "<span>$&</span>")).css('display', 'block').find('span').css('transform', 'translate3d(' + window.viewportWidth + 'px,0,0) scale(1)');
		window.setTimeout(window.requestAnimationFrame.bind(null, function () {
			$weLoveDevs.addClass('animate');
			window.setTimeout(function () {
				$weLoveDevs.removeClass('animate').find('span').contents().unwrap();
			}, 3000);
		}), 0);
	}

	$(animate);
	//we'll probably need to wait for web fonts
	//$(window).load(animate);
}());