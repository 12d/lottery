/**
 * Created by JetBrains WebStorm.
 * User: xuwei.chen
 * Date: 11-12-26
 * Time: 上午10:34
 * To change this template use File | Settings | File Templates.
 */
;
(function (D) {
    //@const
    var EMPTY = "",
        NULL = null,
        NOOP = function () {
        },
        UNDEFINED = undefined,
        PREFIX = "SWF",


    //@absolutly private
        uid = 0;

    var SwfObject = new Class({
        initialize:function (options) {
            var self = this;

            self.setOptions(options);
            self._uid = uid++;
            self.movieName = PREFIX + uid;
            //load flash
            self._loadFlash();
            // release memory

        },
        options:{
            wrap:NULL
        },
        //@events
        onLoaded:NOOP,

        Implements:[Events, Options],
        version:"1.0.0",
        movieName:EMPTY,
        movieElement:NULL,
        _uid:0,
        /**
         * build flash html
         * @private
         */
        _buildFlash:function () {
            var self = this,
                opts = self.options,
                flashUrl = opts.flashUrl;

            // modify flash url, if nocache is needed
            if (!opts.cached) {
                flashUrl = flashUrl + (flashUrl.indexOf("?") < 0 ? "?" : "&") + "ts=" + new Date().getTime();
            }
            // Flash Satay object syntax: http://www.alistapart.com/articles/flashsatay
            return ['<object id="', this.movieName, '" type="application/x-shockwave-flash" data="', flashUrl, '" width="', opts.width, '" height="', opts.height, '">',
                '<param name="wmode" value="', opts.wmode, '" />',
                '<param name="movie" value="', flashUrl, '" />',
                '<param name="quality" value="high" />',
                '<param name="menu" value="false" />',
                '<param name="allowScriptAccess" value="always" />',
                '<param name="flashvars" value="' + this._getFlashVars() + '" />',
                '</object>'].join("");
        },
        /**
         * get flash parameters
         * @private
         */
        _getFlashVars:function () {
            return D.toQueryString(this.options.postData);
        },
        /**
         * init flash setting in javascript
         * @private
         */
        _initSetting:function () {

        },
        /**
         * destroy flash element
         */
        destroy:function () {

        },
        /**
         * inject swf into html wrap
         * @private
         */
        _loadFlash:function () {
            var self = this,
                wrap = self.wrap,
                movieName = self.movieName;
            //if no wrap for flash, stop initializing
            if (!wrap) return;
            // Make sure an element with the ID we are going to use doesn't already exist
            if (document.getElementById(movieName) !== null) {
                throw "ID " + movieName + " is already in use. The Flash Object could not be added";
            }

            // Append the container and load the flash
            wrap.innerHTML = self._buildFlash();
        },
        /**
         * get prize list from server
         */
        getPrizeList:function () {

        },
        /**
         * draw lottery
         * @public
         * @returns {JSON}
         */
        draw:function () {

        },
        // Private: unescapeFileParams is part of a workaround for a flash bug where objects passed through ExternalInterface cannot have
        // properties that contain characters that are not valid for JavaScript identifiers. To work around this
        // the Flash Component escapes the parameter names and we must unescape again before passing them along.
        unescapeFilePostParams:function (file) {
            var reg = /[$]([0-9a-f]{4})/i;
            var unescapedPost = {};
            var uk;

            if (file != undefined) {
                for (var k in file.post) {
                    if (file.post.hasOwnProperty(k)) {
                        uk = k;
                        var match;
                        while ((match = reg.exec(uk)) !== null) {
                            uk = uk.replace(match[0], String.fromCharCode(parseInt("0x" + match[1], 16)));
                        }
                        unescapedPost[uk] = file.post[k];
                    }
                }

                file.post = unescapedPost;
            }

            return file;
        },
        getMovieElement:function () {
            var self = this;

            return self.movieElement || document.getElementById(self.movieName);
        },
        /**
         * js call flash functions
         * @param fn
         * @param args
         */
        _callFlash:function (fn, args) {
            args = args || [];
            var self = this,
                movieElement = self.getMovieElement();
            returnValue,
                returnString;

            // Flash's method if calling ExternalInterface methods (code adapted from MooTools).
            try {
                returnString = movieElement.CallFunction('<invoke name="' + fn + '" returntype="javascript">' + __flash__argumentsToXML(args, 0) + '</invoke>');
                returnValue = eval(returnString);
            } catch (ex) {
                throw "Call to " + fn + " failed";
            }

            // Unescape file post param values
            if (returnValue != undefined && typeof returnValue.post === "object") {
                returnValue = this.unescapeFilePostParams(returnValue);
            }

            return returnValue;
        },
        testExternalInterface:function () {
            try {
                return this._callFlash("TestExternalInterface");
            } catch (ex) {
                return false;
            }
        }

    });
    //@static members
    D.mix(SwfObject, {

    });
    D.SwfObject = SwfObject;
})(DP);
