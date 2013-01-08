package
{
	import flash.display.Loader;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.net.URLRequest;
	
	public class Panel extends Sprite
	{
		private var loader:Loader = new Loader();
		public var isReady:Boolean = false;
		private var onReady:Function;		
		public function Panel(url:String, onReady:Function)
		{
			Console.log("class Panel::::url:"+url);
			//super();
			this.onReady = onReady;
			//this.buttonMode = true;
			loader.load(new URLRequest(url));
			loader.contentLoaderInfo.addEventListener(Event.COMPLETE, onLoaded);
			addChild(loader);
		}
		private function onLoaded(evt:Event):void
		{
			Console.log("class Panel::::img is loaded:");
			isReady = true;
			onReady();
			this.width = loader.width;
			this.height = loader.height;
			this.x = stage.stageWidth/2;
			this.y = stage.stageHeight/2;	
			loader.x=-loader.width/2;
			loader.y=-loader.height/2;
			try{
				this.parent.setChildIndex(this,0);
			}catch(e:Error){

			}
		}		
	}
}