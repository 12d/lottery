/**
 * User: xuwei.chen
 * Date: 11-12-26
 * Time: 上午10:34
 * To change this template use File | Settings | File Templates.
 */
;
(function (D) {
//D.plugin.make('Dpz', function (D){
    //@const
    var EMPTY = "",
        NULL = null,
        NOOP = function () {
        },
        UNDEFINED = undefined,
        Ajax = AjaxReq,
        LOGOUT = 'logout',
        PRIZE_LIST_READY = 'prizeListReady',
        PRIZE_OWNER_LIST_READY = 'prizeOwnerListReady',
        DRAW_SUCCESS = 'drawSuccess',
        GAME_OVER = 'gameover',
        ERROR = 'error',
    /*@status code*/
        STATUS_SUCCESS = 200,
        STATUS_LOGOUT = 403,

        STATUS_GAME_OVER = 501,


        MSG_SERVER_ERROR = "网络错误，请重试",
        MSG_GAME_FINISH = '活动结束了！',

        uid = 0;

    var Lucky = new Class({
        Implements:[Options, Events],
        initialize:function (options) {
            var self = this,
                opts;

            self.setOptions(options);
            opts = self.options;
            self._uid = uid++;
            self.title = opts.title;
            //set events
            self.onLoaded = opts.onLoaded;
            self.onDrawSuccess = opts.onDrawSuccess;
            self.onError = opts.onError;
            self.onDrawEnd = opts.onDrawEnd;
            self.onDrawStart = opts.onDrawStart;
            self.onLogout = opts.onLogout;
            self.onGameover = opts.onGameover;
            self.onPrizeListReady = opts.onPrizeListReady;
            self.onPrizeOwnerListReady = opts.onPrizeOwnerListReady;
        },
        options:{
            title:'抽奖',
            prizeListUrl:UNDEFINED,
            drawUrl:UNDEFINED,
            debugOn:false,
            wrap:NULL,
            groupId:NULL,
            onLoaded:NOOP,
            onDrawSuccess:NOOP,
            onDrawStart:NOOP,
            onDrawEnd:NOOP,
            onLogout:NOOP,
            onGameover:NOOP,
            onError:NOOP,
            onPrizeListReady:NOOP,
            onPrizeOwnerListReady:NOOP,
        },
        prizeList:NULL,
        prizeGroup:NULL,
        /**
         * get prize list from server
         */
        getPrizeList:function () {
            var self = this;
            opts = self.options;
            new Ajax({
                method:"get",
                url:opts.prizeListUrl,
                data:{groupId:opts.groupId},
                onSuccess:function (rs) {
                    rs && (function () {
                        switch (rs.code) {
                            case STATUS_SUCCESS:
                                var msg = rs.msg,
                                    prizeGroup = msg.prizeGroup;

                                self._prizeListReady(rs);
                                self.prizeList = msg.prizeList;
                                self.prizeGroup = prizeGroup;
                                self.fireEvent(PRIZE_LIST_READY, msg);
                                if (prizeGroup.status == 1) {
                                    self.fireEvent(GAME_OVER, MSG_GAME_FINISH);
                                }
                                break;
                            case STATUS_LOGOUT:
                                self.fireEvent(LOGOUT, rs.msg);
                                break;
                            default:
                                self.fireEvent(ERROR, rs.msg);
                                break;
                        }
                    })();
                },
                onError:function () {
                    self.fireEvent(ERROR, "网络错误请重试");
                }

            }).send(null);
        },
        /**
         * get prize list from server
         */
        getPrizeOwnerList:function () {
            var self = this;
            opts = self.options;

            new Ajax({
                method:"get",
                url:opts.prizeOwnerListUrl,
                data:{groupId:opts.groupId, max:opts.ownerListLength},
                onSuccess:function (rs) {
                    //console.dir(rs.msg.recordList[0]);
                    rs && (function () {
                        switch (rs.code) {
                            case STATUS_SUCCESS:
                                self.fireEvent(PRIZE_OWNER_LIST_READY, rs.msg);
                                break;
                            case STATUS_LOGOUT:
                                self.fireEvent(LOGOUT, rs.msg);
                                break;
                            default:
                                self.fireEvent(ERROR, rs.msg);
                                break;
                        }
                    })();
                },
                onError:function () {
                    self.fireEvent(ERROR, MSG_SERVER_ERROR);
                }

            }).send(null);
        },
        /**
         * @type {Json}
         */
        currentResult:NULL,
        /**
         * reset draw result
         * @private
         */
        _resetDraw:function () {
            this.currentResult = NULL;
        },
        /**
         * draw lottery
         * @public
         */
        draw:function () {
            var self = this;
            opts = self.options;

            self._resetDraw();
            new Ajax({
                method:"get",
                url:opts.drawUrl,
                data:{groupId:opts.groupId, preventCache:Math.random()},
                onSuccess:function (rs) {
                    rs && (function () {
                        switch (rs.code) {
                            case STATUS_SUCCESS:
                                self.currentResult = rs.msg;
                                self.fireEvent(DRAW_SUCCESS, rs.msg);
                                break;
                            case STATUS_GAME_OVER:
                                self.fireEvent(GAME_OVER, rs.msg);
                                break;
                            case STATUS_LOGOUT:
                                self.fireEvent(LOGOUT, rs.msg);
                                break;
                            default:
                                self.fireEvent(ERROR, rs.msg);
                                break;
                        }
                    })();
                },
                onError:function () {
                    self.fireEvent(ERROR, MSG_SERVER_ERROR);
                }

            }).send(null);
        },
        /**
         * 激活组件
         */
        enable:function () {

        },
        /**
         * 禁用组件
         */
        disable:function () {

        }

    });
    //@static members

    window.Lucky = Lucky;
//});
})(DP);
