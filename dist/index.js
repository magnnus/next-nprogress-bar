'use strict';

var React = require('react');
var NProgress = require('nprogress');
var navigation = require('next/navigation');
var Router = require('next/router');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function isSameURL(target, current) {
    var cleanTarget = target.protocol + '//' + target.host + target.pathname + target.search;
    var cleanCurrent = current.protocol + '//' + current.host + current.pathname + current.search;
    return cleanTarget === cleanCurrent;
}
function isSameURLWithoutSearch(target, current) {
    var cleanTarget = target.protocol + '//' + target.host + target.pathname;
    var cleanCurrent = current.protocol + '//' + current.host + current.pathname;
    return cleanTarget === cleanCurrent;
}

function parsePath(path) {
    var hashIndex = path.indexOf('#');
    var queryIndex = path.indexOf('?');
    var hasQuery = queryIndex > -1 && (hashIndex < 0 || queryIndex < hashIndex);
    if (hasQuery || hashIndex > -1) {
        return {
            pathname: path.substring(0, hasQuery ? queryIndex : hashIndex),
            query: hasQuery
                ? path.substring(queryIndex, hashIndex > -1 ? hashIndex : undefined)
                : '',
            hash: hashIndex > -1 ? path.slice(hashIndex) : '',
        };
    }
    return { pathname: path, query: '', hash: '' };
}
function addPathPrefix(path, prefix) {
    if (!path.startsWith('/') || !prefix) {
        return path;
    }
    var _a = parsePath(path), pathname = _a.pathname, query = _a.query, hash = _a.hash;
    return "".concat(prefix).concat(pathname).concat(query).concat(hash);
}
function getAnchorProperty(a, key) {
    if (typeof key === 'string' && key === 'data-disable-nprogress') {
        var dataKey = key.substring(5);
        return a.dataset[dataKey];
    }
    var prop = a[key];
    if (prop instanceof SVGAnimatedString) {
        var value = prop.baseVal;
        if (key === 'href') {
            return addPathPrefix(value, location.origin);
        }
        return value;
    }
    return prop;
}

var AppProgressBar$1 = React.memo(function (_a) {
    var _b = _a.color, color = _b === void 0 ? '#0A2FFF' : _b, _c = _a.height, height = _c === void 0 ? '2px' : _c, options = _a.options, _d = _a.shallowRouting, shallowRouting = _d === void 0 ? false : _d, _e = _a.startPosition, startPosition = _e === void 0 ? 0 : _e, _f = _a.delay, delay = _f === void 0 ? 0 : _f, style = _a.style, targetPreprocessor = _a.targetPreprocessor;
    var styles = (React.createElement("style", null, style ||
        "\n          #nprogress {\n            pointer-events: none;\n          }\n\n          #nprogress .bar {\n            background: ".concat(color, ";\n\n            position: fixed;\n            z-index: 1031;\n            top: 0;\n            left: 0;\n\n            width: 100%;\n            height: ").concat(height, ";\n          }\n\n          /* Fancy blur effect */\n          #nprogress .peg {\n            display: block;\n            position: absolute;\n            right: 0px;\n            width: 100px;\n            height: 100%;\n            box-shadow: 0 0 10px ").concat(color, ", 0 0 5px ").concat(color, ";\n            opacity: 1.0;\n\n            -webkit-transform: rotate(3deg) translate(0px, -4px);\n                -ms-transform: rotate(3deg) translate(0px, -4px);\n                    transform: rotate(3deg) translate(0px, -4px);\n          }\n\n          /* Remove these to get rid of the spinner */\n          #nprogress .spinner {\n            display: block;\n            position: fixed;\n            z-index: 1031;\n            top: 15px;\n            right: 15px;\n          }\n\n          #nprogress .spinner-icon {\n            width: 18px;\n            height: 18px;\n            box-sizing: border-box;\n\n            border: solid 2px transparent;\n            border-top-color: ").concat(color, ";\n            border-left-color: ").concat(color, ";\n            border-radius: 50%;\n\n            -webkit-animation: nprogress-spinner 400ms linear infinite;\n                    animation: nprogress-spinner 400ms linear infinite;\n          }\n\n          .nprogress-custom-parent {\n            overflow: hidden;\n            position: relative;\n          }\n\n          .nprogress-custom-parent #nprogress .spinner,\n          .nprogress-custom-parent #nprogress .bar {\n            position: absolute;\n          }\n\n          @-webkit-keyframes nprogress-spinner {\n            0%   { -webkit-transform: rotate(0deg); }\n            100% { -webkit-transform: rotate(360deg); }\n          }\n          @keyframes nprogress-spinner {\n            0%   { transform: rotate(0deg); }\n            100% { transform: rotate(360deg); }\n          }\n        ")));
    NProgress.configure(options || {});
    var pathname = navigation.usePathname();
    var searchParams = navigation.useSearchParams();
    React.useEffect(function () {
        NProgress.done();
    }, [pathname, searchParams]);
    React.useEffect(function () {
        var timer;
        var startProgress = function () {
            timer = setTimeout(function () {
                if (startPosition > 0)
                    NProgress.set(startPosition);
                NProgress.start();
            }, delay);
        };
        var stopProgress = function () {
            clearTimeout(timer);
            NProgress.done();
        };
        var handleAnchorClick = function (event) {
            var anchorElement = event.currentTarget;
            var anchorTarget = getAnchorProperty(anchorElement, 'target');
            // Skip anchors with target="_blank"
            if (anchorTarget === '_blank')
                return;
            // Skip control/command/option/alt+click
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
                return;
            var targetHref = getAnchorProperty(anchorElement, 'href');
            var targetUrl = targetPreprocessor
                ? targetPreprocessor(new URL(targetHref))
                : new URL(targetHref);
            var currentUrl = new URL(location.href);
            if (shallowRouting && isSameURLWithoutSearch(targetUrl, currentUrl))
                return;
            if (isSameURL(targetUrl, currentUrl))
                return;
            startProgress();
        };
        var handleMutation = function () {
            var anchorElements = Array.from(document.querySelectorAll('a'));
            var validAnchorElements = anchorElements.filter(function (anchor) {
                var href = getAnchorProperty(anchor, 'href');
                var isNProgressDisabled = anchor.getAttribute('data-disable-nprogress') === 'true';
                var isNotTelOrMailto = href &&
                    !href.startsWith('tel:') &&
                    !href.startsWith('mailto:') &&
                    !href.startsWith('blob:');
                return (!isNProgressDisabled &&
                    isNotTelOrMailto &&
                    getAnchorProperty(anchor, 'target') !== '_blank');
            });
            validAnchorElements.forEach(function (anchor) {
                anchor.addEventListener('click', handleAnchorClick);
            });
        };
        var mutationObserver = new MutationObserver(handleMutation);
        mutationObserver.observe(document, { childList: true, subtree: true });
        window.history.pushState = new Proxy(window.history.pushState, {
            apply: function (target, thisArg, argArray) {
                stopProgress();
                return target.apply(thisArg, argArray);
            },
        });
    }, []);
    return styles;
}, function (prevProps, nextProps) {
    if (!(nextProps === null || nextProps === void 0 ? void 0 : nextProps.shouldCompareComplexProps)) {
        return true;
    }
    return ((prevProps === null || prevProps === void 0 ? void 0 : prevProps.color) === (nextProps === null || nextProps === void 0 ? void 0 : nextProps.color) &&
        (prevProps === null || prevProps === void 0 ? void 0 : prevProps.height) === (nextProps === null || nextProps === void 0 ? void 0 : nextProps.height) &&
        (prevProps === null || prevProps === void 0 ? void 0 : prevProps.shallowRouting) === (nextProps === null || nextProps === void 0 ? void 0 : nextProps.shallowRouting) &&
        (prevProps === null || prevProps === void 0 ? void 0 : prevProps.startPosition) === (nextProps === null || nextProps === void 0 ? void 0 : nextProps.startPosition) &&
        (prevProps === null || prevProps === void 0 ? void 0 : prevProps.delay) === (nextProps === null || nextProps === void 0 ? void 0 : nextProps.delay) &&
        JSON.stringify(prevProps === null || prevProps === void 0 ? void 0 : prevProps.options) ===
            JSON.stringify(nextProps === null || nextProps === void 0 ? void 0 : nextProps.options) &&
        (prevProps === null || prevProps === void 0 ? void 0 : prevProps.style) === (nextProps === null || nextProps === void 0 ? void 0 : nextProps.style));
});
function useRouter() {
    var router = navigation.useRouter();
    var startProgress = React.useCallback(function (startPosition) {
        if (startPosition && startPosition > 0)
            NProgress.set(startPosition);
        NProgress.start();
    }, [router]);
    var progress = React.useCallback(function (href, options, NProgressOptions) {
        if ((NProgressOptions === null || NProgressOptions === void 0 ? void 0 : NProgressOptions.showProgressBar) === false) {
            return router.push(href, options);
        }
        var currentUrl = new URL(location.href);
        var targetUrl = new URL(href, location.href);
        if (isSameURL(targetUrl, currentUrl))
            return router.push(href, options);
        startProgress(NProgressOptions === null || NProgressOptions === void 0 ? void 0 : NProgressOptions.startPosition);
    }, [router]);
    var push = React.useCallback(function (href, options, NProgressOptions) {
        progress(href, options, NProgressOptions);
        return router.push(href, options);
    }, [router, startProgress]);
    var replace = React.useCallback(function (href, options, NProgressOptions) {
        progress(href, options, NProgressOptions);
        return router.replace(href, options);
    }, [router, startProgress]);
    var back = React.useCallback(function (NProgressOptions) {
        if ((NProgressOptions === null || NProgressOptions === void 0 ? void 0 : NProgressOptions.showProgressBar) === false)
            return router.back();
        startProgress(NProgressOptions === null || NProgressOptions === void 0 ? void 0 : NProgressOptions.startPosition);
        return router.back();
    }, [router]);
    var enhancedRouter = React.useMemo(function () {
        return __assign(__assign({}, router), { push: push, replace: replace, back: back });
    }, [router, push, replace, back]);
    return enhancedRouter;
}

function withSuspense(Component) {
    return function WithSuspenseComponent(props) {
        return (React.createElement(React.Suspense, null,
            React.createElement(Component, __assign({}, props))));
    };
}

var PagesProgressBar = React.memo(function (_a) {
    var _b = _a.color, color = _b === void 0 ? '#0A2FFF' : _b, _c = _a.height, height = _c === void 0 ? '2px' : _c, options = _a.options, _d = _a.shallowRouting, shallowRouting = _d === void 0 ? false : _d, _e = _a.startPosition, startPosition = _e === void 0 ? 0 : _e, _f = _a.delay, delay = _f === void 0 ? 0 : _f, style = _a.style;
    var styles = (React.createElement("style", null, style ||
        "\n          #nprogress {\n            pointer-events: none;\n          }\n          \n          #nprogress .bar {\n            background: ".concat(color, ";\n          \n            position: fixed;\n            z-index: 1031;\n            top: 0;\n            left: 0;\n          \n            width: 100%;\n            height: ").concat(height, ";\n          }\n          \n          /* Fancy blur effect */\n          #nprogress .peg {\n            display: block;\n            position: absolute;\n            right: 0px;\n            width: 100px;\n            height: 100%;\n            box-shadow: 0 0 10px ").concat(color, ", 0 0 5px ").concat(color, ";\n            opacity: 1.0;\n          \n            -webkit-transform: rotate(3deg) translate(0px, -4px);\n                -ms-transform: rotate(3deg) translate(0px, -4px);\n                    transform: rotate(3deg) translate(0px, -4px);\n          }\n          \n          /* Remove these to get rid of the spinner */\n          #nprogress .spinner {\n            display: block;\n            position: fixed;\n            z-index: 1031;\n            top: 15px;\n            right: 15px;\n          }\n          \n          #nprogress .spinner-icon {\n            width: 18px;\n            height: 18px;\n            box-sizing: border-box;\n          \n            border: solid 2px transparent;\n            border-top-color: ").concat(color, ";\n            border-left-color: ").concat(color, ";\n            border-radius: 50%;\n          \n            -webkit-animation: nprogress-spinner 400ms linear infinite;\n                    animation: nprogress-spinner 400ms linear infinite;\n          }\n          \n          .nprogress-custom-parent {\n            overflow: hidden;\n            position: relative;\n          }\n          \n          .nprogress-custom-parent #nprogress .spinner,\n          .nprogress-custom-parent #nprogress .bar {\n            position: absolute;\n          }\n          \n          @-webkit-keyframes nprogress-spinner {\n            0%   { -webkit-transform: rotate(0deg); }\n            100% { -webkit-transform: rotate(360deg); }\n          }\n          @keyframes nprogress-spinner {\n            0%   { transform: rotate(0deg); }\n            100% { transform: rotate(360deg); }\n          }\n        ")));
    NProgress.configure(options || {});
    React.useEffect(function () {
        var timer;
        var startProgress = function () {
            timer = setTimeout(function () {
                if (startPosition > 0)
                    NProgress.set(startPosition);
                NProgress.start();
            }, delay);
        };
        var stopProgress = function () {
            clearTimeout(timer);
            NProgress.done();
        };
        var handleRouteStart = function (url) {
            var targetUrl = new URL(url, location.href);
            var currentUrl = new URL(Router.route, location.href);
            if (!shallowRouting || !isSameURL(targetUrl, currentUrl)) {
                startProgress();
            }
        };
        var handleRouteDone = function () { return stopProgress(); };
        Router.events.on('routeChangeStart', handleRouteStart);
        Router.events.on('routeChangeComplete', handleRouteDone);
        Router.events.on('routeChangeError', handleRouteDone);
        return function () {
            // Make sure to remove the event handler on unmount!
            Router.events.off('routeChangeStart', handleRouteStart);
            Router.events.off('routeChangeComplete', handleRouteDone);
            Router.events.off('routeChangeError', handleRouteDone);
        };
    }, []);
    return styles;
}, function (prevProps, nextProps) {
    if (!(nextProps === null || nextProps === void 0 ? void 0 : nextProps.shouldCompareComplexProps)) {
        return true;
    }
    return ((prevProps === null || prevProps === void 0 ? void 0 : prevProps.color) === (nextProps === null || nextProps === void 0 ? void 0 : nextProps.color) &&
        (prevProps === null || prevProps === void 0 ? void 0 : prevProps.height) === (nextProps === null || nextProps === void 0 ? void 0 : nextProps.height) &&
        (prevProps === null || prevProps === void 0 ? void 0 : prevProps.shallowRouting) === (nextProps === null || nextProps === void 0 ? void 0 : nextProps.shallowRouting) &&
        (prevProps === null || prevProps === void 0 ? void 0 : prevProps.startPosition) === (nextProps === null || nextProps === void 0 ? void 0 : nextProps.startPosition) &&
        (prevProps === null || prevProps === void 0 ? void 0 : prevProps.delay) === (nextProps === null || nextProps === void 0 ? void 0 : nextProps.delay) &&
        JSON.stringify(prevProps === null || prevProps === void 0 ? void 0 : prevProps.options) ===
            JSON.stringify(nextProps === null || nextProps === void 0 ? void 0 : nextProps.options) &&
        (prevProps === null || prevProps === void 0 ? void 0 : prevProps.style) === (nextProps === null || nextProps === void 0 ? void 0 : nextProps.style));
});

/**
 * @param color Color of the progress bar. @default #0A2FFF
 * @param height Height of the progress bar. @default 2px
 * @param options NProgress options. @default undefined
 * @param shallowRouting If the progress bar is not displayed when you use shallow routing - @default false
 * @param startPosition The position of the progress bar at the start of the page load - @default 0
 * @param delay When the page loads faster than the progress bar, it does not display - @default 0
 * @param style Custom css - @default undefined
 * @param shouldCompareComplexProps If you want to compare props in the React.memo return - @default false
 * @param targetPreprocessor If you want to./AppProgressBaress the target URL - @default undefined
 */
var AppProgressBar = withSuspense(AppProgressBar$1);

exports.AppProgressBar = AppProgressBar;
exports.PagesProgressBar = PagesProgressBar;
exports.useRouter = useRouter;
//# sourceMappingURL=index.js.map
