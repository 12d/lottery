/**
 * Created by xuwei.chen
 * User: xuwei.chen
 * Date: 12-1-10
 * Time: 上午11:42
 * To change this template use File | Settings | File Templates.
 */
;(function (){
var PrizeInfo = new Class({
    Implements: [Options, Events],
    options:{
		ajaxUrl:'/prize/ajax/ajaxInfo.action',
		title:'中奖啦！',
		items:'userName,mobileNo,address,memo',
        width: 260,
        height: 'auto',
        fn:null,
        userName:{ label: '姓名', maxlength: 20, type:'text', id: 'pop-name', value: '', reg: /^.+$/, errorMsg: '姓名不为空', info:'*' },
        mobileNo:{ label: '手机', maxlength: 11, type:'text', id: 'signup-mobile', value: '', reg: /^1\d{10}$/, errorMsg: '手机号码格式错误', info:'*' },
		address:{ label: '地址', maxlength: 200, type:'text', id: 'pop-address', value: '', reg: /^.+$/, errorMsg: '地址不为空', info:'*' },
		memo:{ label: '备注', maxlength: 200, type:'text', id: 'pop-memo', value: '', reg: /^.*$/, errorMsg: '备注格式错误', info:'' }
	},
    initialize: function (options) {
        this.setOptions(options);
        this.items = this.options.items;
        this.title = this.options.title;
        this.ajaxUrl = this.options.ajaxUrl;
        this.width = this.options.width;
        this.height = this.options.height;
        this.text.userName = this.options.userName;
        this.text.mobileNo = this.options.mobileNo;
        this.text.address = this.options.address;
        this.text.memo = this.options.memo;
        this.fn = this.options.fn;
    },
    text:{},
    initPanel:function(prize, dataArray){//dataArray为[{key:'data2',value:123},{key:'data3',value:123}]数组形式, prize为奖品对象
        if(!prize){
            Mbox.openLite('<div class="info-box">参数错误！</div>', 300, 'auto', { closable: 1 });
        	return;
        }
        var _this = this;
        var itemArray = _this.items.split(',');
        var panel = new Element('div', { 'class': 'pop-content' });
        if(prize&&prize.prizeId>0&&prize.prizeType===1){
        }else if(prize&&prize.prizeId>0&&prize.prizeType===0){
        	itemArray = ['mobileNo'];
        }else{
        	Mbox.openLite('<div class="info-box">' + a.msg.prize.prizeName + '</div>', 300, 'auto', { closable: 1 });
        	return;
        }
        itemArray.each(function (item) {
            var divEle = new Element('div', { 'class': 'pop-item clear' });
            if (_this.text[item].type === undefined || _this.text[item].type === 'text') {
                var pop_label = new Element('span', { 'class': 'text', 'html': _this.text[item].label + '：' });
                var pop_text = new Element('input', { type: 'text', id: _this.text[item].id, maxlength: _this.text[item].maxlength, value: _this.text[item].value, size: 15 });
                var pop_info = new Element('span', { 'class': 'needed', 'html': (_this.text[item].info === undefined ? '*' : _this.text[item].info) });
                pop_label.inject(divEle), pop_text.inject(divEle), pop_info.inject(divEle);
            }
            divEle.inject(panel);
        });
        _this.message = "恭喜您获得【"+prize.prizeName+"】！请填写中奖信息";
        var submit_btn = new Element('input', { type: 'button', value: '提交' });
        var buttonDiv = new Element('div', { 'class': 'pop-buttondiv' });
        submit_btn.inject(buttonDiv);
        var errorDiv = new Element('div', { 'class': 'pop-error', 'id': 'pop-error' });
        buttonDiv.inject(panel), errorDiv.inject(panel);
        Mbox.close();
        Mbox.open({ type: "ele", url: $dialog(_this.title, _this.message, [panel]), size: { x: _this.width, y: _this.height} });
        submit_btn.addEvent('click', function (e) {
            var flag = itemArray.every(function (item) {
                if (_this.text[item].type === undefined || _this.text[item].type === 'text') {
                    _this.text[item].value = $(_this.text[item].id).get('value');
                }
                if (_this.text[item].reg != undefined && !_this.text[item].reg.test($(_this.text[item].id).get('value'))) {
                    $('pop-error').set('text', _this.text[item].errorMsg);
                    return false;
                }
                return true;
            });
            if (flag) {
                $('pop-error').set('text', '');
                _data = {};
                itemArray.each(function (item) {
                    _data[item] = _this.text[item].value;
                });
                if (dataArray !== undefined && dataArray instanceof Array) {//如果传进参数
                    dataArray.each(function (item) {
                        _data[item.key] = item.value;
                    });
                }
                _data['groupId'] = _this.groupId;
                new AjaxReq({
                    url: _this.ajaxUrl,
                    method: 'post',
                    callType: 'json',
                    data: _data,
                    onSuccess: function (a) {
	                    if (a.code == '200') {
	                        if (_this.fn) {
	                            _this.fn.call(_this, a.msg);
	                        }
	                        Mbox.openLite('<div class="info-box">信息提交成功！</div>', 300, 'auto', { closable: 1 });
	                    }else {
	                        Mbox.openLite('<div class="info-box">' + a.msg.message + '</div>', 300, 'auto', { closable: 1 });
	                    }
                    },
                    onError: function (a) {
                        Mbox.openLite('<div class="info-box">网络繁忙，请稍候再试！</div>', 300, 'auto', { closable: 1 });
                    }
                }).send();
            }
        });
    }
}),

showPrize = function (prize){
    new PrizeInfo().initPanel(prize);
}
    Lucky.showPrize = showPrize;
})();
