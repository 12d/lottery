package
{
	import flash.display.Loader;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.net.URLRequest;
	
	public class Cursor extends Sprite
	{
		private var loader:Loader = new Loader();
		public var isReady:Boolean = false;
		private var onReady:Function;
		public function Cursor(url:String, onReady:Function)
		{
			Console.log("class Cursor::::url:"+url);
			//super();
			this.onReady = onReady;
			//this.buttonMode = true;
			loader.load(new URLRequest(url));
			loader.contentLoaderInfo.addEventListener(Event.COMPLETE, onLoaded);
			addChild(loader);
			
		}
		private function onLoaded(evt:Event):void
		{
			/*
			var s:Sprite = new Sprite();
			s.graphics.beginFill(0xff00ff);
			s.graphics.drawRect(0,0,loader.width, loader.height);
			s.graphics.endFill();
			addChild(s);			
			*/
			Console.log("class Cursor::::img is loaded:");
			isReady = true;
			onReady();
			loader.x=-loader.width/2;
			loader.y=-loader.height;
			this.y = stage.stageHeight/2;
			this.x = stage.stageWidth/2;
			Console.log(stage.height.toString());
			var p = this.parent;
			try{
				p.setChildIndex(this,  0);
				p.setChildIndex(p.drawButton, 1);
			}catch(e:Error){
				p.setChildIndex(this,  0);
			}			
			//this.width = loader.width;
			//this.height = loader.height;			
		}
	}
}