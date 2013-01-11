/**
 * @author xuwei.chen
 */
package {

import fl.transitions.Tween;
import fl.transitions.TweenEvent;
import fl.transitions.easing.Strong;

import flash.display.Sprite;
import flash.display.StageAlign;
import flash.display.StageScaleMode;
import flash.events.MouseEvent;
import flash.external.ExternalInterface;
import flash.filters.BitmapFilter;
import flash.filters.BitmapFilterQuality;
import flash.filters.BlurFilter;
import flash.net.URLRequest;
import flash.net.navigateToURL;
import flash.system.Security;

public class Lucky extends Sprite {
    //@const
    public const ADJUSTMENT:int = 5;
    public const ANIMATION_DURATION = 5;

    private const MIN_ROUND:int = 3;
    private const MAX_ROUND:int = 10;

    //power of 2
    private const MIN_BLUR_SPEED:int = 2;
    private const MAX_BLUR:int = 5;
    /**
     * 转盘各分块的比例
     * @type {Array}
     */
    private var ratios:Array;
    private var ajust:Number;
    private var sectorCount:int;
    private var debugOn:Boolean = false;
    private var _minRound:int;
    private var _maxRound:int;
    private var tween:Tween;
    private var blur:BlurFilter = new BlurFilter(0, 0, BitmapFilterQuality.HIGH);
    private var angle:int;
    private var isCursorMove:Boolean = false;
    private var lastAngle:Number = ADJUSTMENT;
    public var cursor:Cursor;
    public var panel:Panel;
    public var drawButton:DrawButton;
    private var movieName:String;
    private var globalObjectName:String;

    private var ratiosSeparator:String;
    private var cursorUrl:String;
    private var buttonUrl:String;
    private var panelUrl:String;

    private var debug:String;
    private var drawStartCallback:String;
    private var drawEndCallback:String;
    private var loadedCallback:String;

    public function Lucky() {
        // Do the feature detection.  Make sure this version of Flash supports the features we need. If not
        // abort initialization.
        if (!flash.net.URLRequest || !flash.external.ExternalInterface || !flash.external.ExternalInterface.available) {
            return;
        }
        Security.allowDomain("*");
        stage.align = StageAlign.TOP_LEFT;
        stage.scaleMode = StageScaleMode.NO_SCALE;

        //this.cacheAsBitmap = true;
        getFlashVars();
        setJsCallbacks();
        init();
        initUI();
        ExternalInterface.call("debug", '1');


        //navigateToURL(new URLRequest("javascript:test()"), "_self");

        //test app
        //test();

    }

    private function jsCallAs3(js:String, as3:Function):void {
        ExternalInterface.addCallback(js, as3);
    }

    //js call as3 functions
    private function setJsCallbacks():void {

        try {
            ExternalInterface.addCallback("drawLottery", this.drawLottery);
            ExternalInterface.addCallback("enable", this.enable);
            ExternalInterface.addCallback("disable", this.disable);
            jsCallAs3("gameover", this.gameover);

            ExternalInterface.addCallback("testExternalInterface", this.testExternalInterface);
        }
        catch (ex:Error) {
            Console.log("Callbacks where not set: " + ex.message);
            return;
        }
    }

    private function init():void {
        this.sectorCount = this.ratios.length;
        this.addEventListener(DrawEvent.DRAW_END, onDrawEnd);
        this.addEventListener(DrawEvent.DRAW_START, onDrawStart);
    }

    private function initUI():void {

        Console.log("cursorUrl:" + this.cursorUrl);
        Console.log("cursorUrl:" + this.panelUrl);

        this.x = 0;
        this.y = 0;
        this.panelUrl && (this.panel = new Panel(this.panelUrl, this.addPanel));
        this.drawButton = new DrawButton(this.buttonUrl, this.addDrawButton, this.prepareDraw);
        this.cursor = new Cursor(this.cursorUrl, this.addCursor);

        Console.log("stageWidth:" + stage.stageWidth.toString());
        Console.log("Lucky:" + this.width.toString());
    }

    private function getFlashVars():void {
        var vars:Object = root.loaderInfo.parameters;
        Console.debugOn = vars.debugOn == "true" || false;
        Console.log("class Lucky::::getFlashVars:debugOn=>" + vars.debugOn);
        Console.log("class Lucky::::getFlashVars:ratios=>" + this.ratios);
        //this.movieName = vars.movieName || "";
        //this.globalObjectName = vars.globalObjectName || "";
        this._minRound = vars.minRound || MIN_ROUND;
        this._maxRound = vars.maxRound || MAX_ROUND;

        this.cursorUrl = vars.cursorUrl;
        this.buttonUrl = vars.buttonUrl;
        this.panelUrl = vars.panelUrl;
        this.ratiosSeparator = vars.ratiosSeparator || "+";
        this.ajust = vars.ajust || 0;
        this.ratios = vars.ratios.split(ratiosSeparator) || [];
        this.isCursorMove = vars.isCursorMove == "true" || false;


        //as call js functions
        this.drawStartCallback = vars.drawStart;
        this.drawEndCallback = vars.drawEnd;
        this.loadedCallback = vars.loaded;


        stage.stageHeight = vars.stageHeight;
        stage.stageWidth = vars.stageWidth;

    }

    private function getSpanAngle(index:int):Number {
        var angle:Number = 0;
        var ratios:Array = this.ratios;

        do
        {
            angle += ratios[index] * 360;
        } while (index-- && index >= 0);

        return angle || 0;
    }

    private function getRandomBound(min:int, max:int):int {
        return (min + Math.random() * (max - min));
    }

    private function getRandomRound():int {
        return this.getRandomBound(_minRound, _maxRound);
    }

    private function getAngleBound(index:int):Array {
        var max:int = getSpanAngle(index);
        var min:int = getSpanAngle(--index);
        Console.log("class Lucky::::getAngleBound:{max=>" + max.toString() + ",min=>" + min.toString() + "}");
        return [min + ADJUSTMENT, max - ADJUSTMENT];
    }

    /**
     * 获取需要旋转的角度
     * @param {int} round 最小圈数
     * @return {int} 返回需要旋转的角度
     */
    private function getAngle(index:int):int {
        Console.log("class Lucky::::getAngle:index=>" + index);
        var angles:Array = this.getAngleBound(index);
        Console.log("class Lucky::::getAngle:angles=>" + angles);
        var angle:int = this.getRandomRound() * 360 + this.getRandomBound(angles[0], angles[1]);
        Console.log("class Lucky::::getAngle:angle=>" + angle);
        return angle - this.ajust;
    }

    private function getTarget():Sprite {
        return this.isCursorMove ? this.cursor : this.panel;
    }

    private function onTweenFinish(evt:TweenEvent):void {
        Console.log("onTweenFinish");
        this.lastAngle = evt.position;
        this.blurOject(evt.currentTarget.obj as Sprite, blur, 0);
        dispatchEvent(new DrawEvent(DrawEvent.DRAW_END));
    }

    private function onTweenStart(evt:TweenEvent):void {
        Console.log("onTweenStart");

    }

    /**
     * 计算需要模糊的值
     * @param {Number} speed 瞬时速度
     */
    private function getBlurVal(speed:Number):int {
        var M:int = MIN_BLUR_SPEED;
        var S:Number = speed;
        var MB:int = MAX_BLUR;
        //var B:int = int(Math.pow(2, MB)*(S-M)/S);
        var B:int = Math.pow(2, int(MB * (S - M) / S));
        B = B > 0 ? B : 0;

        Console.log("class Lucky::::getBlurVal:" + B);
        return B; //取底数2是为了考虑渲染的性能问题，http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/filters/BlurFilter.html

    }

    private function blurOject(obj:Sprite, blur:BlurFilter, blurVal:int):void {
        blur.blurX = blurVal;
        blur.blurY = blurVal;
        obj.filters = [blur];
    }

    private function onTweenChange(evt:TweenEvent):void {
        //Console.log("class Lucky::::onTweenChangle:evt.position:"+evt.position+"lastAngle:"+this.lastAngle);
        this.blurOject(evt.currentTarget.obj as Sprite, blur, this.getBlurVal(evt.position - this.lastAngle));
        this.lastAngle = evt.position;
    }

    /**
     *创建转动动画
     * @param {int} angle 需要转动的角度
     *@return {Tween} 进行动画的tween实例
     */
    private function animate(angle:int):Tween {
        /*
         tween && (function (){;
         tween.fforward();
         tween.removeEventListener(TweenEvent.MOTION_FINISH, onTweenFinish);
         tween.removeEventListener(TweenEvent.MOTION_START, onTweenStart);
         tween.removeEventListener(TweenEvent.MOTION_CHANGE, onTweenChange);
         })();
         tween = new Tween(this.getTarget(),"rotation",Strong.easeOut,this.lastAngle,angle,ANIMATION_DURATION,true);
         tween.addEventListener(TweenEvent.MOTION_FINISH, onTweenFinish);
         tween.addEventListener(TweenEvent.MOTION_START, onTweenStart);
         tween.addEventListener(TweenEvent.MOTION_CHANGE, onTweenChange);
         */
        if (tween) {
            tween.finish = angle;
        } else {
            tween = new Tween(this.getTarget(), "rotation", Strong.easeOut, this.lastAngle % 360, angle, ANIMATION_DURATION, true);
            tween.FPS = 24;
            tween.addEventListener(TweenEvent.MOTION_FINISH, onTweenFinish);
            tween.addEventListener(TweenEvent.MOTION_START, onTweenStart);
            tween.addEventListener(TweenEvent.MOTION_CHANGE, onTweenChange);
        }

        return tween;
    }

    /**
     * @setter
     * @param {int} round 最小圈数
     */
    public function set minRound(round:int):void {
        this.minRound = round;
    }

    public function get minRound():int {
        return this._minRound;
    }

    public function set maxRound(round:int):void {
        this.maxRound = round;
    }

    public function get maxRound():int {
        return this._maxRound;
    }

    /**
     * 用户点击按钮即转动转盘
     */
    private function doFakeDraw():void {
        this.animate(1440).start();

    }

    /**
     * 回调JS，发送AJAX请求
     * @public
     *
     */
    private function prepareDraw():void {
        doFakeDraw();
        dispatchEvent(new DrawEvent(DrawEvent.DRAW_START));
    }

    /**
     * 抽奖，显示相应的结果状态
     * @public
     * @param {int} index, 对应转盘的块，顺时针方向
     */
    public function drawLottery(index:int):void {
        Console.log("class Lucky::::drawLottery:index=>" + index.toString());
        index = isCursorMove ? index : (this.sectorCount - 1 - index);
        var angle:int = this.getAngle(index);
        this.angle = angle;
        Console.log("class Lucky::::drawLottery:angle=>" + angle.toString());
        this.animate(angle).start();
    }

    private function onLoaded():void {
        Console.log("class Lucky::::onLoaded is called");
        ExternalCall.loaded(this.loadedCallback);
    }

    private function onDrawStart(evt:DrawEvent):void {
        Console.log("onDrawStart");
        ExternalCall.drawStart(this.drawStartCallback, "drawLottery");
    }

    private function onDrawEnd(evt:DrawEvent):void {
        Console.log("class Lucky::::onDrawEnd is called");
        ExternalCall.drawEnd(this.drawEndCallback);
    }


    private function addCursor():void {
        Console.log("class Lucky::::addCursor:cursor added");
        this.addChild(this.cursor);
    }

    private function addDrawButton():void {
        Console.log("class Lucky::::addDrawButton:drawButton added");
        this.addChild(this.drawButton);
        onLoaded();
    }

    private function addPanel():void {
        Console.log("class Lucky::::addPanel:panel added");
        this.addChild(this.panel);
    }

    /**
     * 转盘起用
     */
    public function enable():void {
        this.drawButton.enable();
    }

    /**
     * 转盘停用
     */
    public function disable():void {
        Console.log("flash is disabled");
        this.drawButton.disable();
    }

    public function gameover(msg:Object):void {
        //do something when gameover
        Console.log("class Lucky:gameover" + msg.code.toString());
    }

    private function testExternalInterface():Boolean {
        return ExternalInterface.available;
    }

    // test app
    private function test():void {
        var s:Sprite = new Sprite();
        s.graphics.beginFill(0xff00ff);
        s.graphics.drawCircle(200, 200, 200);
        s.graphics.endFill();
        stage.addChild(s);
    }

}
}