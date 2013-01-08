package
{
	import flash.events.Event;
	
	public class DrawEvent extends Event
	{
		public static const DRAW_START:String = "start";
		public static const DRAW_END:String = "end";
		public function DrawEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
	}
}