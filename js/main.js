(function () {
	'use strict';

	var $toHideOverflow = $('html, body'),
		$body = $('body'),
		$wrap = $('#wrap'),
		$nextPage,
		scrollFn,
		internalHashChange = false,
		SCROLL_TRANSITION_TIME = 800;

	function easeInOut(t, b, c, d) {
		if ((t/=d/2) < 1) {
			return c/2*t*t + b;
		}

		return -c/2 * ((--t)*(t-2) - 1) + b;
	}

	function finishScrollTo(y, newY, newUrl, afterFn) {
		window.scrollTo(0, newY);
		window.location.hash = newUrl === 'home' ? '' : newUrl;

		if(afterFn) {
			afterFn();
		}
	}

	function skrollTo(startTime, y, newY, newUrl, afterFn) {
		var now = Date.now(),
			duration = now - startTime,
			val = easeInOut(duration, y, newY, SCROLL_TRANSITION_TIME);
		window.scrollTo(0, val);

		if(y !== newY && duration < SCROLL_TRANSITION_TIME) {
			return window.requestAnimationFrame(scrollFn);
		}
		finishScrollTo(y, newY, newUrl, afterFn);
	}

	function scrollToPage($page, afterFn) {
		var top = window.pageYOffset,
			newTop = $page.offset().top,
			newUrl = $page.attr('id');
		console.log(top + ' ' + newTop);
		if(top === newTop) {
			return finishScrollTo(top, newTop, newUrl, afterFn);
		}

		window.setTimeout(window.requestAnimationFrame.bind(null, scrollFn = skrollTo.bind(null, Date.now(), top, newTop - top, newUrl, afterFn)), 0);
	}

	function showContactPage() {
		scrollToPage($('#contact'), function () {
			$wrap.addClass('contact');
			$toHideOverflow.css('overflow', 'hidden');
		});
	}

	function showPage($page) {
		$nextPage = $page;
		if($page.attr('id') === 'contact') {
			return showContactPage();
		}

		scrollToPage($page);
	}

	function initState() {
		$wrap.addClass('loaded');
		if(window.location.hash === '#contact') {
			showContactPage();
		}
	}

	function initListeners() {
		$body.on('click', 'a', function(e) {
			var curHash = window.location.hash,
				anchor = e.currentTarget.getAttribute('href'),
				$page = $(anchor);
			if($page.length) {
				internalHashChange = curHash !== anchor;
				showPage($page);
				return false;
			}
		});

		$body.on('transitionend webkitTransitionEnd', function (e) {
			if(e.target.id === 'contact' && $nextPage && $nextPage.length && $nextPage.attr('id') === 'contact') {
				window.location.hash = 'contact';
			}
		});

		$(window).on('hashchange', function() {
			if(!internalHashChange) {
				var $page = $(window.location.hash || '#home');
				if($page.length) {
					showPage($page);
				}
			}
			internalHashChange = false;
		});
	}

	function init() {
		initState();
		initListeners();
	}

	$(init);

}());