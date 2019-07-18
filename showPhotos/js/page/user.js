
// 加载html结构
loadHtmlJson();

$(function(){
    setToken();
    // 获取活动标题
    getActivityTitle();
    btnBindClick();// 绑定点击事件
    var showTime = new Date(rules.acActivity.endTime).getTime() - new Date(currentTime).getTime()
    userCountDown(showTime/1000,$('#act31142119991744 span'));  //倒计时
    userTabInfo();
    voteDialogBindFn();
});

// 微信鉴权
function wxpermission(userId,userName) {
    wx.ready(function(){
        var shareData = {
            title: rules.settings.szText.shareTitile,
            imgUrl: rules.settings.szText.shareIcon,
            desc: rules.settings.szText.shareSubtitle,
            link: ""
        }
    
        // 已报名
        if (user.status) {
          shareData.title = rules.settings.szText.pullTitile;
          shareData.desc = rules.settings.szText.pullSubtitle.replace("{{姓名}}", userName);
          shareData.link = "/ACTIVITY/view/" + activityCode + "/3?userId="+userId;
    
        }else {
          // 分享首页
          shareData.title = rules.settings.szText.shareTitile;
          shareData.desc = rules.settings.szText.shareSubtitle;
          shareData.link = "/ACTIVITY/view/" + activityCode + "/1";
        }
    
        /**
         *分享给朋友
        */
        wx.onMenuShareAppMessage({
            title: shareData.title, // 分享标题
            desc: shareData.desc, // 分享描述
            link: shareData.link, // 分享链接
            imgUrl: shareData.imgUrl, // 分享图标
            type: 'link', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function () {
                // 用户确认分享后执行的回调函数
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
        /**
         *分享到朋友圈
        */
        wx.onMenuShareTimeline({
            title: shareData.title, // 分享标题
            desc: shareData.desc, // 分享描述
            link: shareData.link, // 分享链接
            imgUrl: shareData.imgUrl, // 分享图标
            success: function () {
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
    });
}

// 元素点击事件绑定
function btnBindClick() {
    // 返回首页
    $("#act3110143885264").off("click").on("click",function(){
        var _t = getToken();
        transPage('1',activityCode,_t);
    });
    // 拉票
    $('#act31119351441050').off("click").on("click",function(){
        $('#html-template-8').fadeIn()
    });

    // 排行榜
    $("#act41612547506702").off('click').on("click", function(){
        var _t = getToken();
        var _addParam = 'toRanger=1'
        transPage('1',activityCode,_t,_addParam);
    });

    // 选手主页    
    $("#act4161336684689").off("click").on("click", function(){
        // 判断关注
        isAttention(function(){
            // 判断是否报名
            isSignUp(function(){
                var _t = getToken();
                var urlParam = 'userId='+user.id;
                transPage('3',activityCode,_t,urlParam);
            });
        });
    });

    // 活动秘籍    
    $("#act41613113951133").off("click").on("click", function(){
        $('#html-template-8').fadeIn();
    });

    // 给用户投票
    $("#act31119414834381").off("click").on("click", function(){
        var _userId = getQueryString("userId");
        var params = {
            userId: _userId
        }
        isAttention(function(){
            voteClickFn(params, function(data){
                $('#act3932189955 .userVoteNum span').text(data.result.voteNum);
            });
        });
    });
}
// 倒计时
function userCountDown(times,ids){
    var $countDown = $('#act31142119991744')
    if($countDown.attr('c_counttime') == 'yes') {
        $countDown.removeClass('global-none')
        var timer=null;
        var self = this
        var times = times
          timer=setInterval(function(){
            var day=0,
              hour=0,
              minute=0,
              second=0;//时间默认值
            if(times > 0){
              day = Math.floor(times / (60 * 60 * 24));
              hour = Math.floor(times / (60 * 60)) - (day * 24);
              minute = Math.floor(times / 60) - (day * 24 * 60) - (hour * 60);
              second = Math.floor(times) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
            }
            if (day <= 9) day = '0' + day;
            if (hour <= 9) hour = '0' + hour;
            if (minute <= 9) minute = '0' + minute;
            if (second <= 9) second = '0' + second;
            ids.html((day != 00 ? day + "天" : '')+hour+"时"+minute+"分"+second+"秒")
            times--;
            if(times<0){
                clearInterval(timer);
                ids.parent().addClass('global-none')
              }
          },1000);
    }else {
        $countDown.addClass('global-none')
    }
}

// 个人信息展示
function userTabInfo() {
    var id = getQueryString('userId')?getQueryString('userId'):user.id;
    var params = {
        id: id,
        reviewStatus:1  // 审核状态
    }
    $.ajax({
        type: 'GET',
        url: baseUrl + '/ACTIVITY/sz/search/' + activityCode,
        data: params,
        headers: {
            'x-token': getToken()
        },
        success: function(data) {
            if(data.status == 200) {
                var userInfoObj = data.result && data.result.records && data.result.records[0]
                $('#act3932189955 .user-info .inner-pic').attr('src',userInfoObj.wechatAvatarUrl);
                var innerInfo = $('#act3932189955 .user-info .inner-info')
                innerInfo.find('.userName span').text(userInfoObj.name)
                innerInfo.find('.userNo span').text(userInfoObj.userNumber)
                innerInfo.find('.userRank span').text(userInfoObj.ranking)   // 排名
                innerInfo.find('.userVoteNum span').text(userInfoObj.voteNum)
                $('#act3932189955 .userState').val(userInfoObj.declaration)
                $('#act3932189955 .userState').attr('readOnly','readOnly')
                $('#act3932189955 .show-pic').attr('src',userInfoObj.imageUrl);
            }
            wxpermission(id,userInfoObj.name);
        },
        error: function() {
            $.dialog({
                type : 'tips',
                autoClose : 3000,
                infoText : '请求超时,请尝试刷新页面！'
            });
        }
    })
}  

