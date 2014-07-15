(function () {
	'use strict';

	var $body = $('body'),
		$wrap = $('#wrap'),
		$nextPage,
		scrollFn,
		SCROLL_TRANSITION_TIME = 800;

	function easeInOut(t, b, c, d) {
		if ((t/=d/2) < 1) {
			return c/2*t*t + b;
        }
        return -c/2 * ((--t)*(t-2) - 1) + b;
	}

	function skrollTo(startTime, y, newY, newUrl, afterFn) {
		var now = Date.now(),
			duration = now - startTime,
			val = easeInOut(duration, y, newY, SCROLL_TRANSITION_TIME);
			console.log(val);
		window.scrollTo(0, val);

		if(y !== newY && duration < SCROLL_TRANSITION_TIME) {
			window.requestAnimationFrame(scrollFn);
		} else {
			window.scrollTo(0, y);
			if(afterFn) {
				afterFn();
			}
			window.location.hash = newUrl;
		}
	}

	function skrollToPage($page, afterFn) {
		var top = window.pageYOffset,
			newTop = $page.offset().top;
		window.setTimeout(window.requestAnimationFrame(scrollFn = skrollTo.bind(null, Date.now(), top, newTop - top, $page.attr('id'), afterFn)), 0);
	}

	function showContactPage() {
		skrollToPage($('#contact'), function () {
			$wrap.addClass('contact');
			document.body.style.overflow = 'hidden';
		});
	}

	function showPage($page) {
		$nextPage = $page;
		if($page.attr('id') === 'contact') {
			return showContactPage();
		}

		skrollToPage($page);
	}

	function initState() {
		if(window.location.hash === '#contact') {
			showContactPage();
		}

		window.setTimeout(function () {
			$wrap.addClass('loaded');
		}, 0);
	}

	function initListeners() {
		$body.on('click', 'a', function(e) {
			var $page = $(e.currentTarget.getAttribute('href'));
			if($page.length) {
				showPage($page);
				return false;
			}
		});

		$body.on('transitionEnd webkitTransitionEnd', function (e) {
			if(e.target.id === 'contact' && $nextPage && $nextPage.length && $nextPage.attr('id') === 'contact') {
				window.location.hash = 'contact';
			}
		});
	}

	function init() {
		initState();
		initListeners();
	}

	$(init);

}());