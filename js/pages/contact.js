(function contact () {
	'use strict';
	var $contactForm = $('section[data-id="contact"] form');

	function init () {
		$contactForm.on('submit', function () {
			alert('submit form');
			window.location.hash = '#home';
			return false;
		});
	}

	$(init);
}());