package {
	import flash.external.ExternalInterface;
	
	internal class ExternalCall
	{
		/**
		 * call javascript::drawStart
		 * @static public
		 * @param {String} callback, {String} asFuncName 执行完JS需要回调的AS方法名
		 */
		public static function drawStart(callback:String, asFuncName:String):void
		{
			Console.log("ExternalCall::::drawStart:asFuncName-"+asFuncName)
			ExternalInterface.call(callback, asFuncName);
		}
		public static function drawEnd(callback:String):void
		{
			Console.log("ExternalCall::::drawEnd:callback-"+callback);
			ExternalInterface.call(callback);
		}
        public static function loaded(callback:String):void
        {
   			Console.log("ExternalCall::::loaded:callback-"+callback);
			ExternalInterface.call(callback);         
        }
	}
}