package
{
	import flash.external.ExternalInterface;

	public class Console
	{
		public function Console()
		{
		}
		public static var debugOn:Boolean = false;
		public static function log(s:String):void
		{
			debugOn && ExternalInterface.call("flashdebug", s);
		}
	}
}