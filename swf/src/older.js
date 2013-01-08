function beginDraw(name){
	
      if (Page.eventStatu != "OPEN") {
				Mbox.openLite('<div class="info-box">感谢您的关注，活动已结束!</div>', 300, 'auto', { closable: 1 });
				return;
	   }
	   var userID = Page.userID;
	   if (userID <= 0) {
				_authBox('圣诞抽奖活动——大众点评网');
				return;
		}
		var exist = Page.exist;    
		if(exist == 1){
		      Mbox.openLite('<div  class="info-box">对不起，今天您已参与过圣诞抽奖活动，请明日再来！</div>', 300,'auto', { closable: 1 });
		      return;
		}else{
			getprize();
            return;
		}
}


var getprize = function(){
	var prize=-1;
	var _data = {
    		userId:Page.userID,
    		cityId:Page.cityID
		};
	new AjaxReq({
		url: '/newyear/ajax/ajaxLottery',
		method: 'post',
		callType: 'json',
		data: _data,
		onRequest:function(a){
			Mbox.close();
			Mbox.openLite('<div class="info-box">数据提交中,请稍候...</div>', 300, 'auto', { closable: 1});
		},
    	onSuccess: function (a) {
			 Mbox.close();
			 if (a.code == 403) {
					_authBox('圣诞抽奖活动——大众点评网');
	            	return;
	            }else if(a.code == 501) {
	           		 Mbox.openLite('<div class="info-box">对不起，今天您已参与过圣诞抽奖活动，请明日再来！</div>', 300, 'auto', { closable: 1 });
	            }else if(a.code == 503) {
	            	 setTimeout(function () { Server.popUp2(); }, 4500);  //受IP限制/新用户未中奖
                     var ff = thisMovie("externalInterfaceExample");//得到抽奖的flash
                     ff.goHome(1);//js调用as中的goHome方法
	            }else if(a.code == 200) {
	            	 prize = a.prize;
                     setTimeout(function () { showMessage(prize,a.msg.prizeName); }, 4500); 
                     var ff = thisMovie("externalInterfaceExample");//得到抽奖的flash
                     ff.goHome(getMap(prize));//js调用as中的goHome方法
                 }else{
                     Mbox.openLite('<div class="info-box">数据提交失败，请重试！</div>', 300, 'auto', { closable: 1 });
                 }
    		},
    		onError: function (a) {
        		Mbox.openLite('<div class="info-box">网络繁忙，请稍候再试！</div>', 300, 'auto', { closable: 1 });
    		}
	}).send();
};

var _authBox = function (authName) {
    var regBtn = new Element("button").set("html", "免费注册").addEvent("click", function () {
        window.location.href = "http://www.dianping.com/reg/" + (authName + "，请先注册").cnEncode() + "?redir=" + window.location.href;
    }),

                loginBtn = new Element("button").set("html", "立即登录").addEvent("click", function () {
                    window.location.href = "http://www.dianping.com/login/" + (authName + "，请先登录").cnEncode() + "?redir=" + window.location.href;
                }),

                cancelBtn = new Element("button").set("html", "取消").addEvent("click", function () { Mbox.close(); });

    Mbox.open({ type: "ele", url: $dialog(authName.cnDecode(), authName.cnDecode() + "，请先登录或免费注册！", [regBtn, loginBtn, cancelBtn]), size: { x: 300, y: 120} });
};

var Server = new Class();
Server.name = "";
Server.mobileNo = "";
Server.address = "";

Server.popUp = function (msg) {
    var nameDiv = new Element('div', { 'class': 'pop-namediv', 'html': '真实姓名：<input type="text" id="signup-name" size="15" maxlength="20" value="' + Server.name + '"/><span class="needed">*</span>' });
    var mobileDiv = new Element('div', { 'class': 'pop-mobliediv', 'html': '手机号码：<input type="text" id="signup-mobile" size="15" maxlength="11" value="' + Server.mobileNo + '"/><span class="needed">*</span>' });
    var addressDiv = new Element('div', { 'class': 'pop-addressdiv', 'html': '详细地址：<input type="text" id="signup-address" size="15" maxlength="100" value="' + Server.address + '"/><span class="needed">*</span>' });
    var buttonDiv = new Element('div', { 'class': 'pop-buttondiv', 'html': '<input type="button" id="signup-submit" value="提交"/>' });
    var content = new Element('div', { 'class': 'pop-content' });
    var errorDiv = new Element('div', { 'class': 'pop-error', 'id': 'pop-error' });
    nameDiv.inject(content), mobileDiv.inject(content), addressDiv.inject(content), buttonDiv.inject(content), errorDiv.inject(content);
    Mbox.open({ type: "ele", url: $dialog("恭喜中奖！", "恭喜你获得"+msg+"，请提供你的联系方式，以便我们将奖品快递给你。", [content]), size: { x: 300, y: 'auto'}, closable: false });
    $("signup-submit").addEvent('click', function (e) { Server.signUp($("signup-name").get("value"), $("signup-mobile").get("value"), $("signup-address").get("value"),msg); });
};

Server.signUp = function (name, mobileNo, address, msg) {
    Server.mobileNo = mobileNo;
    Server.address = address;
    Server.name = name;
    if (!Server.check(name, mobileNo, address)) {
        return;
    }
    new AjaxReq({
        url: '/newyear/ajax/ajaxPrizeSignUp',
        method: 'post',
        callType: 'json',
        data: {
            name:name,
            mobileNo: mobileNo,
            address: address
        },
        onRequest: function (a) {
        	Mbox.close();
            Mbox.openLite('<div class="info-box">数据处理中...</div>', 300, 'auto', { closable: 0 });
        },
        onSuccess: function (a) {
        	Mbox.close();
            if (a.code == '200') {
            	var title = "中奖啦！";
                var message = "恭喜中奖！将活动讯息同步到您的新浪微博，让大家分享您的喜悦！";//弹出框里显示的内容
            	var content = "玩“转”圣诞大转盘，赢取点评幸运豪礼！更有大量超值现金券免费送！我在点评“双旦”活动中了" + msg + "，真是开心给力啊，宠爱自己吧，圣诞元旦约会聚会赶快动起来，快点进活动页面了解详情>>";
            	var eventUrl = "http://event.dianping.com/newyear/index";
            	var imgSrc = "http://event.dianping.com/newyear/images/share.jpg";
            	shareToSina(title,message,content,imgSrc,eventUrl);
            	return;
    		} else{
                Mbox.openLite('<div class="info-box">数据提交失败，请重试！</div>', 300, 'auto', { closable: 1 });
            }
        },
		onError: function (a) {
    		Mbox.openLite('<div class="info-box">网络繁忙，请稍候再试！</div>', 300, 'auto', { closable: 1 });
    		}
    }).send();
};

Server.popUp2 = function () {
	var title = "谢谢参与圣诞抽奖活动";
    var message ="不要气馁，明天继续努力哦～</br>将活动讯息同步到您的新浪微博，让朋友们都来分享节日大礼！";//弹出框里显示的内容
	var content ="玩“转”圣诞大转盘，赢取点评幸运豪礼！更有大量超值现金券免费送！赶快赢取“双旦”大奖，宠爱自己吧，快点进活动页面了解详情>>";
	var eventUrl = "http://event.dianping.com/newyear/index";
	var imgSrc = "http://event.dianping.com/newyear/images/share.jpg";
	shareToSina(title,message,content,imgSrc,eventUrl);
	return;
};

Server.check = function (name, mobileNo, address) {
    if (name.length == 0) {
        $("pop-error").set('text', '姓名不能为空哦！');
        return false;
    }
    if (!isMobile(mobileNo)) {
        $("pop-error").set('text', '手机号码格式错误');
        return false;
    }
    if(address.length==0){
        $("pop-error").set('text', '详细地址不能为空哦！');
        return false;
    }
    return true;
};

function isMobile(s) {
    var reg0 = /^((13)|18|15)+\d{9}$/;
    var flag = false;
    if (reg0.test(s)) flag = true;
    return flag;
}

var shareToSina = function (title, message, content, imgSrc, callBackUrl) {
    var url = 'http://v.t.sina.com.cn/share/share.php?appkey=1392673069&url=' + location.href + '&title=' + encodeURI(content) + '&content=utf-8&pic=' + imgSrc;
    var loginBtn = new Element("button").set("html", "立即分享").addEvent("click", function () {
    window.open(url);
    Mbox.close();
   }),
    cancelBtn = new Element("button").set("html", "取消").addEvent("click", function () { Mbox.close(); });
    Mbox.close();
    Mbox.open({ type: "ele", url: $dialog(title, message, [loginBtn, cancelBtn]), size: { x: 300, y: 'auto'} });
};