(function scrolling() {
    'use strict';

    var $window = $(window),
        $wrap = $('#wrap'),
        $body = $(document.body),
        $docEl = $('html, body'),
        curPageId = 'home',
        sections = {},
        sectionKeys = [],
        winHeight,
        scrollFn,
        hashChangeFn,
        scrollTop = window.pageYOffset,
        previousScrollTop = scrollTop,
        userScroll = true,
        //Firefox fires a scroll event before the hashchange event, this flag is needed for back -> forward -> back
        IS_FIREFOX = window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
        //IOS has weird (useless?) scroll events and doesn't move the scrollbar when you go forward/back
        IS_IOS = window.navigator.userAgent.match(/(iPad|iPhone|iPod)/g),
        MOBILE_NAV_HEIGHT = 70,
        MOBILE_NAV_BORDER_WIDTH = 2,
        PAGE_HEIGHT_CHAGE_THRESHOLD = 0.75,
        SCROLL_TRANSITION_TIME = 600;

    function easeInOut(t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t + b;
        }

        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    }

    function skrollTo(startTime, y, newY, afterFn) {
        var now = Date.now(),
            duration = now - startTime,
            val = easeInOut(duration, y, newY - y, SCROLL_TRANSITION_TIME);

        window.scrollTo(0, val);
        if(y !== newY && duration < SCROLL_TRANSITION_TIME) {
            return window.requestAnimationFrame(scrollFn);
        }

        window.scrollTo(0, newY);
        if(afterFn) {
            window.setTimeout(afterFn, 0);
        }
    }

    function scrollToY(newPageTop, afterFn, noTransition) {
        if(scrollTop !== newPageTop && !noTransition) {
            if(IS_IOS) {
                scrollTop = window.pageYOffset;
            }
            window.scrollTo(0, scrollTop);
            return window.setTimeout(window.requestAnimationFrame.bind(null, function () {
                (scrollFn = skrollTo.bind(null, Date.now(), scrollTop, newPageTop, afterFn))();
            }), 0);
        }

        if(noTransition) {
            window.scrollTo(0, newPageTop);
        }

        if(afterFn) {
            afterFn();
        }
    }

    function showContactPage(afterFn) {
        scrollToY(0, function () {
            $wrap.addClass('contact');
            $docEl.css('overflow', 'hidden');
            if(afterFn) {
                afterFn();
            }
        }, true);
    }

    function hideContactPage() {
        $wrap.removeClass('contact');
        $docEl.css('overflow', '');
    }

    function showPage(pageId, afterFn) {
        var after = afterFn;
        afterFn = function () {
            $window.trigger('after-scroll');

            if(after) {
                after();
            }
            window.setTimeout(function () {
                userScroll = true;
            }, 0);
        };
        userScroll = false;

        if((curPageId = pageId) === 'contact') {
            return showContactPage(afterFn);
        }

        hideContactPage();
        scrollToY(sections[pageId].top - (window.isMobile && pageId !== 'home' ? MOBILE_NAV_HEIGHT + MOBILE_NAV_BORDER_WIDTH: MOBILE_NAV_BORDER_WIDTH), afterFn);
    }

    function updateSectionMeta(el, id) {
        sections[id] = {
            el: el,
            linkEl: $('#nav a[href="#' + id + '"]')[0],
            top: $(el).position().top
        };
    }

    function initState() {
        $wrap.find('> section').each(function(i, el) {
            updateSectionMeta(el, el.id);
            sectionKeys.push(el.id);
            el.setAttribute('data-id', el.id);
            el.removeAttribute('id');
        });
        previousScrollTop = scrollTop = window.pageYOffset;
        winHeight =  $window.height();
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
                pageId = url.replace('#', ''),
                $page = $wrap.find('[data-id="' + pageId + '"]');
            if($page.length) {
                if(IS_FIREFOX) {
                    showPage(pageId, function () {
                        window.location.hash = url;
                        updateNav(anchor);
                    });
                    return false;
                }
                showPage(pageId);
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
                    showPage(pageId);
                    updateNav($('#nav a[href="#' + pageId + '"]')[0]);
                }
            }
        });

        $window.on('scroll', function () {
            var i, s, len;
            previousScrollTop = scrollTop;
            scrollTop = window.pageYOffset;

            if(userScroll) {
                len = sectionKeys.length;
                for(i = 0; i < len; i++) {
                    s = sections[sectionKeys[i]];
                    if(s.top >= scrollTop - (winHeight * PAGE_HEIGHT_CHAGE_THRESHOLD)) {
                       return updateNav(s.linkEl);
                    }
                }
            }
        });

        $window.on('after-resize', function () {
            sectionKeys.forEach(function (key) {
                updateSectionMeta(sections[key].el, key);
            });
            winHeight =  $window.height();
            previousScrollTop = scrollTop = window.pageYOffset;
        });
    }

    function init() {
        window.scrollTo(0, 0);
        initListeners();
        initState();
    }

    window.imagesLoaded($wrap, init);
}());