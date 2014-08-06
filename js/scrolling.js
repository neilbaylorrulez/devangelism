(function scrolling() {
    'use strict';

    var $window = $(window),
        $wrap = $('#wrap'),
        $docEl = $('html, body'),
        curPageId = 'home',
        scrollFn,
        hashChangeFn,
        scrollTop = window.pageYOffset,
        previousScrollTop = scrollTop,
        //uggh, firefox fires the scroll event before the hashchange event, this is needed for back -> forward -> back
        IS_FIREFOX = window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
        SCROLL_TRANSITION_TIME = 800;

    function easeInOut(t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t + b;
        }

        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    }

    function skrollTo(startTime, y, newY, afterFn) {
        var now = Date.now(),
            duration = now - startTime,
            val = easeInOut(duration, y, newY, SCROLL_TRANSITION_TIME);

        window.scrollTo(0, val);
        if(y !== newY && duration < SCROLL_TRANSITION_TIME) {
            return window.requestAnimationFrame(scrollFn);
        }
        window.scrollTo(0, y + newY);
        if(afterFn) {
            window.setTimeout(afterFn, 0);
        }
    }

    function scrollToPage($page, afterFn) {
        var newTop = $page.offset().top;

        if(scrollTop !== newTop) {
            window.scrollTo(0, scrollTop);
            return window.requestAnimationFrame(scrollFn = skrollTo.bind(null, Date.now(), scrollTop, newTop - scrollTop, afterFn));
        }

        if(afterFn) {
            afterFn();
        }
    }

    function showContactPage(afterFn) {
        scrollToPage($wrap.find('[data-id="contact"]'), function () {
            $wrap.addClass('contact');
            $docEl.css('overflow', 'hidden');
            if(afterFn) {
                afterFn();
            }
        });
    }

    function hideContactPage() {
        $wrap.removeClass('contact');
        $docEl.css('overflow', '');
    }

    function showPage($page, afterFn) {
        var oldAfter = afterFn;
        afterFn = function () {
            $window.trigger('after-scroll');
            if(oldAfter) {
                oldAfter();
            }
        };
        if((curPageId = $page.attr('data-id')) === 'contact') {
            return showContactPage(afterFn);
        }
        hideContactPage();
        scrollToPage($page, afterFn);
    }

    function initState() {
        $wrap.find('> section').each(function(i, el) {
            el.setAttribute('data-id', el.id);
            el.removeAttribute('id');
        });
        previousScrollTop = scrollTop = window.pageYOffset;
        window.setTimeout(window.requestAnimationFrame.bind(null, hashChangeFn), 0);
    }

    function updateNav(clicked) {
        $(clicked).addClass('selected').siblings().removeClass('selected');
    }

    function initListeners() {
        $(document.body).on('click', 'a', function(e) {
            var curHash = window.location.hash,
                anchor = e.currentTarget,
                url = anchor.getAttribute('href'),
                $page = $wrap.find('[data-id="' + url.replace('#', '') + '"]');
            if($page.length) {
                if(IS_FIREFOX) {
                    showPage($page, function () {
                        window.location.hash = url;
                        updateNav(anchor);
                    });
                    return false;
                }
                showPage($page);
                updateNav(anchor);
            }
        });

        $window.on('hashchange', hashChangeFn = function(e) {
            var pageId = (window.location.hash.replace('#', '') || 'home'),
                $page;
            if(curPageId !== pageId) {
                if(IS_FIREFOX) {
                    scrollTop = previousScrollTop;
                }
                $page = $wrap.find('[data-id="' + pageId + '"]');
                if($page.length) {
                    showPage($page);
                    updateNav($wrap.find('nav a[href="#' + pageId + '"]')[0]);
                }
            }
        });

        $window.on('scroll', function () {
            previousScrollTop = scrollTop;
            scrollTop = window.pageYOffset;
        });

        $window.trigger('app-ready');
    }

    function init() {
        initListeners();
        initState();
    }

    $(init);

}());