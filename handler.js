/**
 * Created by JetBrains WebStorm.
 * User: xuwei.chen
 * Date: 11-12-31
 * Time: 下午12:32
 * To change this template use File | Settings | File Templates.
 */
;
(function (window) {
    var isGameover = false,
        prizeIds = [],
        getPrizeIndex = function (item) {
            console.log(prizeIds);
            console.log(item.prizeId);

            var i = prizeIds.indexOf(item.prizeId);
            return i !== -1 ? i : 0;
        };
    // Mbox = D.mbox;

    Lucky.handlers = {
        loaded:function () {
            var self = this;
            self.getPrizeList();
            self.getPrizeOwnerList();
            new Marquee("marqueediv6", 2, 1, 918, 85, 20, 0, 0);
            new Marquee("marqueediv1", 0, 1, 244, 260, 30, 0, 0);
        },
        prizeListReady:function (rs) {
            rs.prizeList.forEach(function (item) {
                prizeIds.push(item.prizeId);
            });
        },
        prizeOwnerListReady:function (rs) {

            var html = "";
            rs.recordList.forEach(function (item) {
                html += '<p>' + item.userNickName + '获得' + item.prizeName + '</p>';
            });
            $("marqueediv3").set("html", html);
            new Marquee("marqueediv3", 0, 1, 244, 55, 50, 0, 0);

        },
        logout:function () {
            _authBox("春节抽奖活动——携程网");
            this.disable();
        },
        gameover:function (msg) {
            var self = this,
                msg = msg || '对不起，今天您已参与过春节抽奖活动，请明日再来！';
            //保证在最后执行以下代码
            setTimeout(function () {
                isGameover = true;
                self.disable();
                console.log(msg);
                //Mbox.openLite('<div class="info-box">' + msg + '</div>', 300, 'auto', { closable:1 });
            }, 0);
        },
        drawSuccess:function (rs) {
            var self = this;
            this.showResult(getPrizeIndex(rs.prize, self.prizeList));
            if (rs.chanceNum == 0) {
                isGameover = true;
            }
        },
        drawStart:function () {
            this.disable();
        },
        drawEnd:function (rs) {
            console.log(rs);
            var prize = rs.prize;
            showMessage(prize.prizeId, prize.prizeName);
            !isGameover && this.enable();
        },
        error:function () {
            //Mbox.openLite('<div class="info-box">网络繁忙，请稍候再试！</div>', 300, 'auto', { closable:1 });
        }
    }
})(window);
