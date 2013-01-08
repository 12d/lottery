/**
 * User: xuwei.chen
 * Date: 11-12-26
 * Time: 上午10:34
 * To change this template use File | Settings | File Templates.
 */
;(function (D){
//D.plugin.make('Dpz', function (D){
    //@const
    var EMPTY = "",
    NULL = null,
    NOOP = function (){},
    UNDEFINED = undefined,
    Ajax = AjaxReq,
    LOADED = 'loaded',
    LOGOUT = 'logout',
    PRIZE_LIST_READY = 'prizeListReady',
    PRIZE_OWNER_LIST_READY = 'prizeOwnerListReady',
    DRAW_START = 'drawStart',
    DRAW_END = 'drawEnd',
    DRAW_SUCCESS = 'drawSuccess',
    GAME_OVER = 'gameover',
    ERROR = 'error',
    /*@status code*/
     STATUS_SUCCESS = 200,
     STATUS_LOGOUT = 403,
     STATUS_PARAM_ERROR = 406,
     STATUS_GAME_OVER = 501,
     STATUS_SERVER_ERROR = 500,

     MSG_SERVER_ERROR = "网络错误，请重试",
     MSG_GAME_FINISH = '活动结束了！',

    FLASH_FUNC = {
        startDraw : "startDraw"
    },
    PREFIX = "LUCKY",

    //@absolutly private
    Swf = Swiff,
    uid = 0;

    var Lucky = new Class({
        Implements : [Options, Events],
        initialize : function (options){
            var self = this,
                opts;
    
            self.setOptions(options);
            opts = self.options;
            self._uid = uid ++;
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
            
            self.swf = new Swf(opts.swfUrl, {
                id: PREFIX+uid,
                container : opts.wrap,
                width: opts.width,
                height: opts.height,
                params: {
                    wMode: 'transparent'
                },
                vars: {
                    ratios: opts.ratios.join(opts.ratiosSeparator),
                    stageHeight : opts.height,
                    stageWidth : opts.width,
                    cursorUrl : opts.cursorUrl,
                    panelUrl : opts.panelUrl,
                    buttonUrl : opts.buttonUrl,
                    debugOn : opts.debugOn,
                    ratiosSeparator : opts.ratiosSeparator,
                    isCursorMove : opts.isCursorMove,
                    ajust : opts.ajust
                },
                callBacks: {
                    loaded : function (){
                        self.fireEvent(LOADED);
                    },
 
                    /**
                     * start draw
                     * @param {String} fn , as3 callback function
                     */
                    drawStart : function (fn){
                        self.fireEvent(DRAW_START);
                        self.draw(fn);
                    },
                    drawEnd : function (){
                        self.fireEvent(DRAW_END, self.currentResult);
                    }
                }
            });

        },
        options : {
        	title : '大转盘抽奖',
            prizeListUrl : UNDEFINED,
            drawUrl : UNDEFINED,
            swfUrl : UNDEFINED,
            cursorUrl : UNDEFINED,
            panelUrl : UNDEFINED,
            debugOn : false,
            wrap : NULL,
            height : 0,
            width : 0,
            ajust : 0,
            ratios : NULL,
            ratiosSeparator : "+",
            isCursorMove : false,
            minRound : 2,
            maxRound : 10,
            groupId : NULL,
            onLoaded : NOOP,
            onDrawSuccess : NOOP,
            onDrawStart : NOOP,
            onDrawEnd : NOOP,
            onLogout : NOOP,
            onGameover : NOOP,
            onError : NOOP,
            onPrizeListReady : NOOP,
            onPrizeOwnerListReady : NOOP,
        },
        swf : NULL,
        prizeList : NULL,
        prizeGroup : NULL,
        /**
         * get prize list from server
         */
        getPrizeList : function (){
            var self = this;
                opts = self.options;
            new Ajax({
                method : "get",
                url : opts.prizeListUrl,
                data : {groupId : opts.groupId},
                onSuccess : function (rs){
                    rs && (function (){
                        switch (rs.code){
                            case STATUS_SUCCESS:
                                var msg = rs.msg,
                                    prizeGroup = msg.prizeGroup;
                                
                                self._prizeListReady(rs);
                                self.prizeList = msg.prizeList;
                                self.prizeGroup = prizeGroup;
                                self.fireEvent(PRIZE_LIST_READY, msg);
                                if(prizeGroup.status == 1){
                                    self.fireEvent(GAME_OVER, MSG_GAME_FINISH);
                                }
                            break;
                            case STATUS_LOGOUT:
                                self._logout(rs);
                                self.fireEvent(LOGOUT, rs.msg);
                            break;
                            default:
                                self._error(rs);
                                self.fireEvent(ERROR, rs.msg);
                            break;
                        }
                    })();
                },
                onError : function (){
                    self._error();
                    self.fireEvent(ERROR, "网络错误请重试");
                }
                
            }).send(null);
        },
        /**
         * get prize list from server
         */
        getPrizeOwnerList : function (){
            var self = this;
                opts = self.options;

            new Ajax({
                method : "get",
                url : opts.prizeOwnerListUrl,
                data : {groupId : opts.groupId, max : opts.ownerListLength},
                onSuccess : function (rs){
                    //console.dir(rs.msg.recordList[0]);
                    rs && (function (){
                        switch (rs.code){
                            case STATUS_SUCCESS:
                                self._prizeOwnerListReady(rs);
                                self.fireEvent(PRIZE_OWNER_LIST_READY, rs.msg);
                            break;
                            case STATUS_LOGOUT:
                                self._logout(rs);
                                self.fireEvent(LOGOUT, rs.msg);
                            break;
                            default:
                                self._error(rs);
                                self.fireEvent(ERROR, rs.msg);
                            break;
                        }
                    })();
                },
                onError : function (){
                    self._error();
                    self.fireEvent(ERROR, MSG_SERVER_ERROR);
                }

            }).send(null);
        },
        /**
         * @type {Json}
         */
        currentResult : NULL,
        /**
         * reset draw result
         * @private
         */
        _resetDraw : function (){
            this.currentResult = NULL;
        },
        /**
         * draw lottery
         * @public
         */
        draw : function (){
            var self = this;
            opts = self.options;

            self._resetDraw();
            new Ajax({
                method : "get",
                url : opts.drawUrl,
                data : {groupId : opts.groupId, preventCache : Math.random()},
                onSuccess : function (rs){
                    rs && (function (){
                        switch (rs.code){
                            case STATUS_SUCCESS:
                                self._drawSuccess(rs);
                                self.currentResult = rs.msg;
                                self.fireEvent(DRAW_SUCCESS, rs.msg);
                            break;
                            case STATUS_GAME_OVER:
                                self._gameover(rs);
                                self.fireEvent(GAME_OVER, rs.msg);
                            break;
                            case STATUS_LOGOUT:
                                self._logout(rs);
                                self.fireEvent(LOGOUT, rs.msg);
                            break;
                            default:
                                self._error(rs);
                                self.fireEvent(ERROR, rs.msg);
                            break;
                        }
                    })();
                },
                onError : function (){
                    self._error();
                    self.fireEvent(ERROR, MSG_SERVER_ERROR);
                }

            }).send(null);
        },
        //@通知flash
        _gameover : function (rs){
            //this.swf.remote("gameover", [rs]);
        },
        _logout : function (rs){

        },
        _drawSuccess : function (rs){

        },
        _prizeListReady : function (rs){

        },
        _prizeOwnerListReady : function (rs){

        },
        _error : function (rs){

        },
        /**
         * 通知flash显示相应视图
         * @param index
         */
        showResult : function (index){
             this.swf.remote("drawLottery", [index]);
        },
        /**
         * 激活flash组件
         */
        enable : function (){
            this.swf.remote("enable");
        },
        /**
         * 禁用flash组件
         */
        disable : function (){
                                          //      alert("disable");
            this.swf.remote("disable");
        }

    });
    //@static members

    window.Lucky = Lucky;
//});
})(DP);
