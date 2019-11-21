
var _settings = rules.settings;
var sdk = typeof jsSdk === "undefined" ? "" : jsSdk;

wx.config({
    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    appId: (sdk ? sdk.appId : ''), // 必填，公众号的唯一标识
    timestamp: (sdk ? sdk.timestamp : ''), // 必填，生成签名的时间戳
    nonceStr:  (sdk ? sdk.noncestr : ''), // 必填，生成签名的随机串
    signature: (sdk ? sdk.signature : ''),// 必填，签名，见附录1
    jsApiList: ['onMenuShareTimeline','onMenuShareAppMessage','startRecord','stopRecord','onVoiceRecordEnd','playVoice','pauseVoice','stopVoice','onVoicePlayEnd'
                ,'uploadVoice','downloadVoice','chooseImage','previewImage','uploadImage','downloadImage','translateVoice','openLocation'
                ,'getLocation','hideOptionMenu','showOptionMenu','hideMenuItems','showMenuItems','scanQRCode','chooseWXPay','addCard','chooseCard','openCard'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
});

wx.ready(function(){
    // 获取域名
    var _base = getBaseOrigin();

    var shareData = {
        title: _settings.szText.shareTitile,
        imgUrl: _settings.szText.shareIcon,
        desc: _settings.szText.shareSubtitle,
        link: ""
    }

    var auth_id = getQueryString('auth_id');
    auth_id = auth_id !== null ? '&auth_id='+auth_id : '';

    // 已报名-通过审核
    if (user.reviewStatus === 1) {
      shareData.title = _settings.szText.pullTitile;
      shareData.desc = _settings.szText.pullSubtitle.replace("{{姓名}}", user.name);
      shareData.link = _base + "/ACTIVITY/view/" + activityCode + "/3?activityCode="+activityCode+'&orgId='+getQueryString("orgId") + "&userId="+ user.id + auth_id;
    }else {
      // 分享首页
      shareData.title = _settings.szText.shareTitile;
      shareData.desc = _settings.szText.shareSubtitle;
      shareData.link = _base + "/ACTIVITY/view/" + activityCode + "/1?activityCode="+activityCode+'&orgId='+getQueryString("orgId") + auth_id;
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