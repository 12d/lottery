package
{
	import flash.display.DisplayObject;
	import flash.display.Loader;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.net.URLRequest;
	import flash.ui.Mouse;
	
	public class DrawButton extends Sprite
	{
		private var loader:Loader = new Loader();
		public var isReady:Boolean = false;
		private var onReady:Function;	
		private var clicked:Function;
		public var status:int = 0;
		
		private const DISABLED:int = 3;
		private const MOUSE_OVER:int = 1;
		private const MOUSE_DOWN:int = 2;
		private const NORMAL:int = 0;
		public function DrawButton(url:String, onReady:Function, clicked:Function)
		{
			Console.log("class DrawButton::::url:"+url);
			//super();
			this.onReady = onReady;
			this.clicked = clicked;
			this.buttonMode = true;
			loader.load(new URLRequest(url));
			loader.contentLoaderInfo.addEventListener(Event.COMPLETE, onLoaded);
			addChild(loader);
			

		}
		
		private function onMouseOut(evt:MouseEvent):void
		{
			this.updateButtonState(NORMAL);
		}
		private function onMouseUp(evt:MouseEvent):void
		{
			this.updateButtonState(NORMAL);
		}
		private function onMouseOver(evt:MouseEvent):void
		{
			this.updateButtonState(MOUSE_OVER);
		}
		private function onMouseDown(evt:MouseEvent):void
		{
			this.updateButtonState(MOUSE_DOWN);
		}	
		private function clickHandler(evt:MouseEvent):void
		{
			clicked();
		}
		private function onLoaded(evt:Event):void
		{
			var h:Number = loader.height/4;
			var w:Number = loader.width;
			createMask(h, w, this);
			Console.log("class DrawButton::::maskSize:{h=>"+h+",w=>"+w+"}");
			Console.log("class DrawButton::::img is loaded:");
			isReady = true;
			onReady();

			this.width = w;
			this.height = loader.height;
			this.x = stage.stageWidth/2-w/2;
			this.y = stage.stageHeight/2-h/2;
			var p = this.parent;
			try{
				p.setChildIndex(this,  p.getChildIndex(p.cursor)+1);
			}catch(e:Error){
				p.setChildIndex(this,  0);
			}			
			enable();
		}
		private function createMask(h:Number, w:Number, obj:DisplayObject):void
		{
			var s:Sprite = new Sprite();
			s.graphics.beginFill(0xffffff);
			s.graphics.drawRect(0,0,h,w);
			s.graphics.endFill();
			s.y = 0;
			addChild(s);
			obj.mask = s;
		}
		/**
		 * 按钮起用
		 */ 
		public function enable():void
		{
			this.buttonMode=true;
			this.updateButtonState(NORMAL);
			this.addEventListener(MouseEvent.CLICK, clickHandler);
			this.addEventListener(MouseEvent.MOUSE_OVER, onMouseOver);
			this.addEventListener(MouseEvent.MOUSE_DOWN, onMouseDown);
			this.addEventListener(MouseEvent.MOUSE_UP, onMouseUp);
			this.addEventListener(MouseEvent.MOUSE_OUT, onMouseOut);			
		}
		/**
		 * 按钮停用
		 */ 		
		public function disable():void
		{
			this.buttonMode=false;
			this.updateButtonState(DISABLED);
			this.removeEventListener(MouseEvent.CLICK, clickHandler);
			this.removeEventListener(MouseEvent.MOUSE_OVER, onMouseOver);
			this.removeEventListener(MouseEvent.MOUSE_UP, onMouseUp);
			this.removeEventListener(MouseEvent.MOUSE_DOWN, onMouseDown);
			this.removeEventListener(MouseEvent.MOUSE_OUT, onMouseOut);				
		}
		public function updateButtonState(status:int):void {
			var xOffset:Number = 0;
			var yOffset:Number = 0;
			
			loader.y = yOffset;
			
			if (status == DISABLED) {
				loader.y = this.height/4 * -3 + yOffset;
			}
			else if (status == MOUSE_DOWN) {
				loader.y = this.height/4 * -2 + yOffset;
			}
			else if (status == MOUSE_OVER) {
				loader.y = this.height/4 * -1 + yOffset;
			}
			else {
				loader.y = -yOffset;
			}
			this.status = status;
		}		
	}
}