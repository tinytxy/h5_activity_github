
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

// 元素点击事件绑定
function btnBindClick() {
    // 返回首页
    $("#act3110143885264").off("click").on("click",function(){
        var _t = getToken();
        transPage('1',activityCode,_t);
    });
    // 拉票
    $('#act31119351441050').off("click").on("click",function(){
        $('#html-template-8').fadeIn('normal', function() {
            $(document).scrollTop(0);
        });
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
        $('#html-template-8').fadeIn('normal', function() {
          $(document).scrollTop(0);
        });
    });

    // 给用户投票
    $("#act31119414834381").off("click").on("click", function(){
        var _userId = shareUserId;
        var _userName = shareUserName;
        var params = {
            userId: _userId,
            userName: _userName
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

                shareUserId = userInfoObj.id;
                shareUserName = userInfoObj.name;
            }
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

