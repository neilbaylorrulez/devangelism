(function scrolling () {
	'use strict';

	var $wrap = $('#wrap'),
		curPageId = 'home',
		scrollFn,
		hashChangeFn,
		scrollTop = window.pageYOffset,
		previousScrollTop = scrollTop,
		IS_FIREFOX = navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
		SCROLL_TRANSITION_TIME = 800;

	function easeInOut(t, b, c, d) {
		if ((t/=d/2) < 1) {
			return c/2*t*t + b;
		}

		return -c/2 * ((--t)*(t-2) - 1) + b;
	}

	function finishScrollTo(afterFn, newUrl, wasBack) {
		if(afterFn) {
			afterFn();
		}
	}

	function skrollTo(startTime, y, newY, newUrl, afterFn, wasBack) {
		var now = Date.now(),
			duration = now - startTime,
			val = easeInOut(duration, y, newY, SCROLL_TRANSITION_TIME);

		window.scrollTo(0, val);
		if(y !== newY && duration < SCROLL_TRANSITION_TIME) {
			return window.requestAnimationFrame(scrollFn);
		}
		window.scrollTo(0, y + newY);
		window.setTimeout(finishScrollTo.bind(null, afterFn, newUrl), 0);
	}

	function scrollToPage($page, afterFn) {
		var newTop = $page.offset().top,
			newUrl = $page.attr('data-id');

		if(scrollTop !== newTop) {
			window.scrollTo(0, scrollTop);
			console.log('set scroll top:' + scrollTop);
			return window.requestAnimationFrame(scrollFn = skrollTo.bind(null, Date.now(), scrollTop, newTop - scrollTop, newUrl, afterFn));
		}

		finishScrollTo(afterFn, newUrl);
	}

	function showContactPage(afternFn) {
		scrollToPage($('[data-id="contact"]'), function () {
			$wrap.addClass('contact');
			$('html, body').css('overflow', 'hidden');
			if(afternFn) {
				afternFn();
			}
		});
	}

	function showPage($page, afternFn) {
		if((curPageId = $page.attr('data-id')) === 'contact') {
			return showContactPage(afternFn);
		}

		scrollToPage($page, afternFn);
	}

	function initState() {
		$wrap.addClass('loaded').find('> section').each(function(i, el) {
			el.setAttribute('data-id', el.id);
			el.removeAttribute('id');
		});
		previousScrollTop = scrollTop = window.pageYOffset;
		window.setTimeout(window.requestAnimationFrame.bind(null, hashChangeFn), 0);
	}

	function initListeners() {
		$(document.body).on('click', 'a', function(e) {
			var curHash = window.location.hash,
				anchor = e.currentTarget.getAttribute('href'),
				$page = $('[data-id="' + anchor.replace('#', '') + '"]');
			if($page.length) {
				showPage($page, function () {
					window.location.hash = anchor;
				});
				return false;
			}
		});

		$(window).on('hashchange', hashChangeFn = function(e) {
			var pageId = (window.location.hash.replace('#', '') || 'home'),
				$page;
			if(curPageId !== pageId) {
				//uggh, firefox fires the scroll event before the hashchange event, this code is needed for back -> forward -> back
				if(IS_FIREFOX) {
					scrollTop = previousScrollTop;
				}
				$page = $('[data-id="' + pageId + '"]');
				if($page.length) {
					showPage($page);
				}
			}
		});

		$(window).on('scroll', function () {
			previousScrollTop = scrollTop;
			scrollTop = window.pageYOffset;
		}).trigger('app-ready');
	}

	function init() {
		initListeners();
		initState();
	}

	$(init);

}());