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
        overlayScrollTop = null,
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

    function overlayTransition($overlay) {
        if($overlay.hasClass('show')) {
            return;
        }
        $overlay.removeClass('hide').scrollTop(0);
        if(window.pageYOffset) {
            $wrap.css({
                top: - (overlayScrollTop = window.pageYOffset)
            });
        }
        $docEl.css('overflow', 'hidden');

        window.setTimeout(window.requestAnimationFrame.bind(null, function () {
            $overlay.addClass('show');
        }), 0);
    }

    function showOverlay(url, scroll) {
        var parts = url.split('/'),
            parentPageId,
            overlayId,
            $overlay,
            afterFn;
        if(parts.length !== 2) {
            return;
        }
        parentPageId = parts[0];
        overlayId = parts[1];
        if(parentPageId === 'events') {
            $window.trigger('create-event-overlay', overlayId);
        }

        if($wrap.find('[data-id="' + parentPageId + '"]').length && ($overlay = $('.overlay.' + parentPageId + '[data-id="' + overlayId +'"]')).length) {
            if($overlay.hasClass('show')) {
                return;
            }
            hideOverlays();
            curPageId = 'overlay-' + parentPageId;
            if(!scroll) {
                return overlayTransition($overlay);
            }
            scrollToY(sections[parentPageId].top - pageTopOffset(parentPageId), getAfterFn(function () {
                overlayTransition($overlay);
            }), true);
        }
    }

    function showContactPage(afterFn) {
        $('section[data-id="contact"] form')[0].reset();
        scrollToY(0, function () {
            overlayTransition($(sections.contact.el));
            if(afterFn) {
                afterFn();
            }
        }, true);
    }

    function hideOverlays() {
        var $overlay = $('.overlay.show');
        if(!$overlay.length) {
            return;
        }
        $docEl.css('overflow', '');
        $wrap.css('top', '');
        window.scrollTo(0, scrollTop = overlayScrollTop);
        window.setTimeout(window.requestAnimationFrame.bind(null, function () {
            $overlay.addClass('close');
            window.setTimeout(function () {
                overlayScrollTop = null;
                $overlay.removeClass('show').removeClass('close').addClass('hide');
            }, 350);
        }), 0);
    }

    function pageTopOffset(pageId) {
        return pageId === 'home' ? 0 :
            (window.isMobile ?
                MOBILE_NAV_HEIGHT + MOBILE_NAV_BORDER_WIDTH :
                DESKTOP_NAV_HEIGHT + MOBILE_NAV_BORDER_WIDTH);
    }

    function getAfterFn(afterFn) {
        return function () {
            $window.trigger('after-scroll');

            if(afterFn) {
                afterFn();
            }
            window.setTimeout(function () {
                userScroll = true;
            }, 0);
        };
    }

    function showPage(pageId, afterFn) {
        userScroll = false;
        afterFn = getAfterFn(afterFn);
        hideOverlays();
        if(closedOverlayTriggeredPage) {
            curPageId = pageId;
            return afterFn();
        }

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
        $('section').each(function(i, el) {
            updateSectionMeta(el, el.getAttribute('data-id'));
        });
        window.setTimeout(window.requestAnimationFrame.bind(null, hashChangeFn), 0);
    }

    function updateNav(clicked) {
        $nav.removeClass('selected');
        $(clicked).addClass('selected');
    }

    function updateNavByScroll() {
        var i, s,
            len = sectionKeys.length;
        for(i = 0; i < len; i++) {
            s = sections[sectionKeys[i]];
            if(s.top >= scrollTop - (window.viewportHeight * PAGE_HEIGHT_CHAGE_THRESHOLD) + (window.isMobile ? MOBILE_NAV_HEIGHT : DESKTOP_NAV_HEIGHT)) {
               return updateNav(s.linkEl);
            }
        }
    }

    function initListeners() {
        $(document.body).on('click', 'a', function(e) {
            var curHash = window.location.hash,
                anchor = e.currentTarget,
                url = anchor.getAttribute('href'),
                pageId = url.replace('#', ''),
                $page = $('section[data-id="' + pageId + '"]');
            if(curPageId === pageId && pageId === 'contact') {
                getAfterFn()();
                 if(IS_FIREFOX) {
                    return false;
                }
                return;
            }

            if($page.length) {
                updateNav($('#nav a[href="#' + pageId + '"]')[0]);
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
                $page = $('section[data-id="' + pageId + '"]');
                if($page.length) {
                    showPage(pageId);
                    updateNav($('#nav a[href="#' + pageId + '"]')[0]);
                } else {
                    showOverlay(pageId, !window.clickedOverlayTriggeredPage);
                }
            }
            window.clickedOverlayTriggeredPage = false;
            closedOverlayTriggeredPage = false;
        });

        $window.on('scroll', function () {
            if(overlayScrollTop !== null) {
                return;
            }

            previousScrollTop = scrollTop;
            scrollTop = window.pageYOffset;

            if(userScroll) {
                updateNavByScroll();
            }
        });

        $window.on('after-any-resize', function () {
            window.setTimeout(function () {
                sectionKeys.forEach(function (key) {
                    updateSectionMeta(sections[key].el, key);
                });
                previousScrollTop = scrollTop = window.pageYOffset;
            }, 0);
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
        updateNavByScroll();
    }

    function removeIds() {
        $('section').each(function(i, el) {
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
