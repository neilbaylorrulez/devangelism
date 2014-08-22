(function scrolling() {
    'use strict';

    var $window = $(window),
        $wrap = $('#wrap'),
        $body = $(document.body),
        $nav = $('nav a'),
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
        closedOverlayTriggeredPage = false,
        //Firefox fires a scroll event before the hashchange event, this flag is needed for back -> forward -> back
        IS_FIREFOX = window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
        //IOS has weird (useless?) scroll events and doesn't move the scrollbar when you go forward/back
        IS_IOS = window.navigator.userAgent.match(/(iPad|iPhone|iPod)/g),
        MOBILE_NAV_HEIGHT = 70,
        DESKTOP_NAV_HEIGHT = 76,
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
        } else {
            window.scrollTo(0, newPageTop);
        }

        if(afterFn) {
            afterFn();
        }
    }

    function showOverlay($overlay) {
        if($overlay.hasClass('show')) {
            return;
        }

        $overlay.removeClass('hide');
        window.setTimeout(window.requestAnimationFrame.bind(null, function () {
            $overlay.addClass('show');
        }), 0);
    }

    function handleOverlays(pageId, scroll) {
        var parts = pageId.split('/'),
            parentPageId,
            overlayId,
            $overlay,
            afterFn;
        if(parts.length !== 2) {
            return;
        }
        parentPageId = parts[0];
        overlayId = parts[1];
        if($wrap.find('[data-id="' + parentPageId + '"]').length && ($overlay = $('.overlay.' + parentPageId + '[data-id="' + overlayId +'"]')).length) {
            hideOverlays();
            curPageId = 'overlay-' + parentPageId;
            if(!scroll) {
                return showOverlay($overlay);
            }
            scrollToY(sections[parentPageId].top - pageTopOffset(parentPageId), getAfterFn(function () {
                showOverlay($overlay);
            }), true);
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

    function hideOverlays(close) {
        var $overlay;
        if(curPageId === 'contact') {
            $docEl.css('overflow', '');
            window.setTimeout(window.requestAnimationFrame.bind(null, function () {
                $wrap.addClass('contact-hide');
                window.setTimeout(function () {
                    $wrap.removeClass('contact-hide').removeClass('contact');
                }, 400);
            }), 0);
        } else {
            window.setTimeout(window.requestAnimationFrame.bind(null, function () {
                $overlay = $('.overlay.show').addClass('close');
                window.setTimeout(function () {
                    $overlay.removeClass('show').removeClass('close').addClass('hide');
                }, 400);
            }), 0);
        }
    }

    function pageTopOffset(pageId) {
        return window.isMobile && pageId !== 'home' ?
            MOBILE_NAV_HEIGHT + MOBILE_NAV_BORDER_WIDTH :
            DESKTOP_NAV_HEIGHT + MOBILE_NAV_BORDER_WIDTH ;
    }

    function getAfterFn(afterFn) {
        var after = afterFn;

        return function () {
            $window.trigger('after-scroll');

            if(after) {
                after();
            }
            window.setTimeout(function () {
                userScroll = true;
            }, 0);
        };
    }

    function showPage(pageId, afterFn) {
        userScroll = false;
        afterFn = getAfterFn(afterFn);


        if(closedOverlayTriggeredPage) {
            hideOverlays(true);
            curPageId = pageId;
            return afterFn();
        }

        hideOverlays();
        if((curPageId = pageId) === 'contact') {
            return showContactPage(afterFn);
        }

        scrollToY(sections[pageId].top - pageTopOffset(pageId), afterFn);
    }

    function updateSectionMeta(el, id) {
        sections[id] = {
            el: el,
            linkEl: $('#nav a[href="#' + id + '"]')[0],
            top: $(el).position().top
        };
    }

    function initState() {
        previousScrollTop = scrollTop = window.pageYOffset;
        winHeight =  $window.height();
        window.setTimeout(window.requestAnimationFrame.bind(null, hashChangeFn), 0);
    }

    function updateNav(clicked) {
        $nav.removeClass('selected');
        $(clicked).addClass('selected');
    }

    function initListeners() {
        $(document.body).on('click', 'a', function(e) {
            var curHash = window.location.hash,
                anchor = e.currentTarget,
                url = anchor.getAttribute('href'),
                pageId = url.replace('#', ''),
                $page = $wrap.find('> section[data-id="' + pageId + '"]');

            if($page.length) {
                updateNav(anchor);
                if(IS_FIREFOX) {
                    showPage(pageId, function () {
                        window.location.hash = url;
                    });
                    return false;
                }
                showPage(pageId);
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
                } else {
                    handleOverlays(pageId, !window.clickedOverlayTriggeredPage);
                }
            }
            window.clickedOverlayTriggeredPage = false;
            closedOverlayTriggeredPage = false;
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

        $body.on('click', '.close-overlay', function (e) {
            var parts;
            closedOverlayTriggeredPage = true;
            if(curPageId !== 'contact') {
                parts = curPageId.split('overlay-');
                if(parts.length === 2) {
                    return window.location.hash = parts[1];
                }
            }
            window.location.hash = '#home';
        });
    }


    function init() {
        initListeners();
        initState();
    }

    function removeIds() {
        $wrap.find('> section').each(function(i, el) {
            updateSectionMeta(el, el.id);
            sectionKeys.push(el.id);
            el.setAttribute('data-id', el.id);
            el.removeAttribute('id');
        });
    }

    $(function () {
        window.scrollTo(0, 0);
    });

    removeIds();
    $window.on('load', init);

}());