
// 公共变量
var activityCode = typeof rules !== 'undefined' ? rules.acActivity.code : '';
var baseUrl = "https://space-api.check.icaremgt.com";
var manageUrl = "https://test.icareyou.net";

// 防止投票连点
var gb_vote_loaded = false

if(typeof data !== 'undefined'){
  data.htmlJson = JSON.parse(data.htmlJson);
}

// 分享用户信息
var shareUserId = '';
var shareUserName = '';

// 设置token
function setToken(){
  if(user.token !== '') {
    sessionStorage.setItem('x-token', user.token);
  }else {
    sessionStorage.setItem('x-token', '');
  }
}

// 机构id
function orgIdFn(id) {
    var signupOrg = rules.acActivityOrgs
    var org = signupOrg && signupOrg.filter(function(item){
        return id == item.id
    })
    if(org.length == 1) {
        return org[0]
    }else {
        return null
    }
}
// 获取token
function getToken() {
  // var t = sessionStorage.getItem('x-token');
  // return t
  return user.token
}

// 获取域名及二级目录
function getBaseOrigin(){
  var _base = '';
  var _origin = window.location.origin;
  var _pathname = window.location.pathname;
  var index = _pathname.indexOf('/ACTIVITY');
  var _secondFolder = '';
  
  if(index !== 0){
      _secondFolder = _pathname.slice(0,index);
  }
  _base = _origin + _secondFolder;

  return _base;
}

// 页面跳转
function transPage(_pageNumber, _activityCode, _token, _addParam) {
  var url = '';
  var _base = '';
  var _urlParam = getRequest();
  var _newUrlParam = '';
  _base = getBaseOrigin();

  // 报名页之外的页面过滤url参数-userId
  if(_pageNumber !== '2'){
    // 移除userId参数
    delete _urlParam.userId;
    var flag = false;
    if(!$.isEmptyObject(_urlParam)){
      for(var key in _urlParam){
        // 第一次进入
        if(!flag){
          _newUrlParam += '?'+key+'='+_urlParam[key];
          flag = true;
        }else { 
          _newUrlParam += '&'+key+'='+_urlParam[key];
        }
      }
    }else {
      _newUrlParam = '';
    }
  }else {
    // 报名页面正常携带参数
    _newUrlParam = window.location.search;
  }

  if (typeof _newUrlParam !== 'undefined' && _newUrlParam !== '') {
      url = _base + "/ACTIVITY/view/" + _activityCode + "/" + _pageNumber + _newUrlParam + (_addParam !== undefined ? ('&' + _addParam) : '');
  } else {
      url = _base + "/ACTIVITY/view/" + _activityCode + "/" + _pageNumber + (_addParam !== undefined ? ('?' + _addParam) : '');
  }

  // var _form = document.createElement('form');
  // _form.action = url;
  // _form.method = "post";
  // _form.style.display = "none";

  // var inputToken = document.createElement('input');
  // inputToken.value = _token;
  // inputToken.name = 'x-token';
  // _form.appendChild(inputToken);
  // document.body.appendChild(_form);
  // _form.submit();
  window.location.href = url;
}

// 获取URL中指定参数
function getQueryString(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  if (r != null) {
      return unescape(r[2]);
  }
  return null;
}

// 获取url所有参数
function getRequest() {
  var url = window.location.search; //获取url中"?"符后的字串
  var theRequest = new Object();
  if (url.indexOf("?") != -1) {
    var str = url.substr(1);
    strs = str.split("&");
    for(var i = 0; i < strs.length; i ++) {
      theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
    }
  }
  return theRequest;
}


// 加载HTML结构
function loadHtmlJson(callback) {
  $('body').prepend(json2html(data.htmlJson));
  var _relationship = JSON.parse(data.relationship);
  for(var i=0;i<_relationship.childs.length;i++) {
      var _page = _relationship.childs[i].page
      var _pageNumber = _relationship.childs[i].pageNumber
      $('body').prepend(json2html(JSON.parse(data[_page].htmlJson)));
      $('#html-template-'+_pageNumber).addClass('global-none')
  }
  callback && callback()
}

// 获取机构名称
function getOrgNameFn(callback) {
  // var signupId = getQueryString('orgId')
  // var orgId = orgIdFn(signupId).orgId

  // 判断是否需要机构名称
  if(rules.acActivityOrgs.length === 0) {
    return
  }

  var orgId = getQueryString('orgId')
  $.ajax({
      type: 'GET',
      url: baseUrl + '/ORG/hospital/community/hospitalInfo/' + orgId,
      headers: {
          'x-token': getToken()
      },
      success: function(data) {
          if(data.code == 200) {
            callback && callback(data)
          }
      },
      error: function(data) {
          $.dialog({
            type : 'tips',
            autoClose : 3000,
            infoText : data.responseJSON.message
        });
      }
  })
}

// 关注弹出框
function appendAttentionDialog() {
  var orgId = getQueryString("orgId");
  var orgQrCode = '';

  for(var k = 0; k < rules.acActivityOrgs.length; k++){
    if(rules.acActivityOrgs[k].orgId == orgId){
      orgId = rules.acActivityOrgs[k].orgId;
      orgQrCode = rules.acActivityOrgs[k].qrCodeUrl;
      break;
    }
  }

  var str = '<section id="html-container-attention" style="display: none;">'+
              '<div>'+
                '<div class="c-modal-wrap">'+
                  '<div class="mshe-mask"></div> '+
                  '<div class="c-modal">'+
                    '<div class="modal-dialog">'+
                      '<div c_type="dialog" c_typename="dialog_playerVote1" class="modal-content" style="background: rgb(255, 255, 255);">'+
                      '<div class="modal-header">'+
                        '<img src="http://qnfile.icareyou.net/363a344aa7424d219a5fc86eff7265751561343712294.jpg" class="header-pic">'+
                      '</div>'+ 
                      '<div class="modal-body">'+
                        '<p class="struct">长按关注后继续活动</p>'+
                        '<div>'+
                          '<img src="'+ orgQrCode +'" alt="" style="width: 100%;">'+
                        '</div>'+
                      '</div>'+
                      '<div class="modal-close">'+
                        '<img src="http://qnfile.icareyou.net/ddae57885c424abdb13d37c78038c6a01561343787282.jpg">'+
                      '</div>'+
                      '</div>'+
                    '</div>'+
                  '</div>'+
                '</div>'+
              '</div>'+
            '</section>';

  $('body').prepend(str);
  // 事件绑定
  $("#html-container-attention .modal-close").off("click").on("click", function(){
    $("#html-container-attention").fadeOut();
  });

  // 获取机构名称
  getOrgNameFn(function(data){
    var orgName = '长按关注'+  data.records.orgName +'后继续活动';
    $('#html-container-attention .modal-body .struct').text(orgName);
  });

  // 未关注过默认显示弹出框  
  if (!user.attention){
    $("#html-container-attention").fadeIn('normal', function() {
      // $(document).scrollTop(0);
    });
  }
}

// 显示强关弹出框
function showAttentionDialog() {
  $("#html-container-attention").fadeIn('normal', function() {
    // $(document).scrollTop(0);
  });
}

// 隐藏强关弹出框
function hideAttentionDialog() {
  $("#html-container-attention").hide();
}

// 不在审核页面插入强关弹出框
if(typeof user !== 'undefined' && $("#examineTitle").length === 0){
  appendAttentionDialog();
}

// 判断是否关注
function isAttention(successCallback,errorCallback) {
  // 未关注
  if(!user.attention){
    if(errorCallback) {
      errorCallback();
    }else {
      // 强关弹出框
      showAttentionDialog();
    }
  } else {
    successCallback && successCallback();
  }
}

// 是否报名
function isSignUp(successCallback,errorCallback) {
  var _t = getToken();
  // 已报名
  if(user.reviewStatus !== '') {
      switch (user.reviewStatus) {
          // 0-待审核
          case 0:
              alert('您的报名信息正在审核中...');
          break;
          // 1-审核通过
          case 1:
            if(successCallback){
              successCallback();
            }else {
              alert('您当前已通过报名，请到个人主页去拉票！');
            }
          break;
          // 2-审核未通过
          case 2:
              alert('审核未通过！');
              transPage('2',activityCode,_t);
          break;
          default:
              break;
      }
  } else {// 未报名
    if(errorCallback) {
      errorCallback();
    }else {
      // 跳转到报名页面 
      transPage('2',activityCode,_t);
    }
  }
}

// 获取活动名称
function getActivityTitle() {
  var activityCode = getQueryString('activityCode');
  var params = {
    activityCode: activityCode
  }
  $.ajax({
      type: 'GET',
      url: baseUrl + '/ACTIVITY/'+ activityCode +'/settings',
      data: params,
      headers: {
        'x-token': getToken()
      },
      success: function(data) {
          if(data.status == 200) {
            var title = data.result.settings.szText.h5Title;
            document.title = title;

            // JS动态修改微信浏览器中的title
            var $body = $('body');
            var $iframe = $('<iframe src="" style="display:none;"></iframe>');
            $iframe.on('load',function() {
              setTimeout(function() {
                  $iframe.off('load').remove();
              }, 0);
            }).appendTo($body);
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

// 加载loading
function showLoading(msg){
  $.dialog({
    type : 'info',
    infoText : msg ? msg : '加载中…',
    infoIcon : 'https://raw.githubusercontent.com/tinytxy/h5_activity_github/master/showPhotos/images/loading_2.gif',
    direction: '',
	  align: 'center'
  });
}
// 关闭loading
function hideLoading(callback) {
  $.dialog.close(callback);
}

/* ***********************弹出框控制全部逻辑************************** */
// 投票
function voteClickFn(params, successCallback, errorCallback){ 

  if(gb_vote_loaded) {
    return
  }
  gb_vote_loaded = true;

  shareUserId = params.userId;
  shareUserName  = params.userName;
  
  $.ajax({
    type: 'PUT',
    url: baseUrl + '/ACTIVITY/sz/vote/' + activityCode,
    data: params,
    headers: {
        'x-token': getToken()
    },
    success: function(data) {
        
        if(data.status == 200) {
          // 已报名-通过审核
          if(user.reviewStatus === 1) {
            $('#html-template-4 .struct span').text(data.result.voteNumDay)
            $('#html-template-4').fadeIn('normal', function() {
              // $(document).scrollTop(0);
            });
          }else {
            $('#html-template-6 .struct span').text(data.result.voteNumDay)
            $('#html-template-6').fadeIn('normal', function() {
              // $(document).scrollTop(0);
            });
          }
          successCallback && successCallback(data); 
          hideLoading();
        }else if(data.status == 201) {
          // 已报名-通过审核
          if(user.reviewStatus === 1) {
            $('#html-template-5 .struct span').text(rules.settings.szRule.voteNumDay)
            $('#html-template-5').fadeIn('normal', function() {
              // $(document).scrollTop(0);
            });
          }else {
            $('#html-template-7 .struct span').text(rules.settings.szRule.voteNumDay)
            $('#html-template-7').fadeIn('normal', function() {
              // $(document).scrollTop(0);
            });
          }
          errorCallback && errorCallback(data); 
          hideLoading();
        }else {

          hideLoading(function(){
            // 异常处理
            $.dialog({
              contentHtml : '<p style="text-align:center;">'+ data.message +'</p>'
            });
          });
        }
        gb_vote_loaded = false;
    },
    error: function(data){
        hideLoading(function(){
          // 异常处理
          $.dialog({
            contentHtml : '<p style="text-align:center;">'+ data.responseJSON.message +'</p>'
          });
        });
                
        gb_vote_loaded = false;
    }
  });
}

// 参赛选手投票-有票
function playerHasVoteDialogBind(){
  // 继续投票
  $('#html-template-4 .vote-btn-1').off("click").on('click',function(){
      $('#html-template-4').fadeOut();
  });

  // 我要拉票
  $('#html-template-4 .vote-btn-2').off("click").on('click',function(){
      $('#html-template-4').hide();
      $('#html-template-8').fadeIn('normal', function() {
        $(document).scrollTop(0);
      });
      // 设置分享参数
      setWxShare({
        userId: shareUserId,
        userName: shareUserName
      });
  });

  // 关闭按钮
  $('#html-template-4 .modal-close').off("click").on('click',function(){
      $('#html-template-4').fadeOut();
  });
}

// 参赛选手投票-无票
function playerNoVoteDialogBind(){
  // 查看排行
  $('#html-template-5 .vote-btn-1').off("click").on('click',function(){
      $('#html-template-5').fadeOut();
      var _url = window.location.href;
      var indexKey = 'view/'+ activityCode + '/1';
      // 当前是首页则触发切换按钮
      if(_url.indexOf(indexKey) > -1){
        $("#act3152823482970").click();
      }else {
        // 当前非首页则跳转
        var _t = getToken();
        var _addParam = 'toRanger=1'
        transPage('1',activityCode,_t,_addParam);
      }
  });

  // 我要拉票
  $('#html-template-5 .vote-btn-2').off("click").on('click',function(){
      $('#html-template-5').hide();
      $('#html-template-8').fadeIn('normal', function() {
        $(document).scrollTop(0);
      });
      // 设置分享参数
      setWxShare({
        userId: shareUserId,
        userName: shareUserName
      });
  });

  // 关闭按钮
  $('#html-template-5 .modal-close').off("click").on('click',function(){
      $('#html-template-5').fadeOut();
  });
}

// 投票者-有票
function visitorHasVoteDialogBind(){
  // 继续投票
  $('#html-template-6 .vote-btn-1').off("click").on('click',function(){
      $('#html-template-6').fadeOut();
  });

  // 我要拉票
  $('#html-template-6 .vote-btn-2').off("click").on('click',function(){
      $('#html-template-6').hide();
      $('#html-template-8').fadeIn('normal', function() {
        $(document).scrollTop(0);
      });
      // 设置分享参数
      setWxShare({
        userId: shareUserId,
        userName: shareUserName
      });
  });

  // 关闭按钮
  $('#html-template-6 .modal-close').off("click").on('click',function(){
      $('#html-template-6').fadeOut();
  });
}

// 投票者-无票
function visitorNoVoteDialogBind(){
  // 我要参赛
  $('#html-template-7 .vote-btn-1').off("click").on('click',function(){
      $('#html-template-7').fadeOut();
      var _t = getToken();
      // 跳转到报名
      transPage('2',activityCode,_t);
  });

  // 我要拉票
  $('#html-template-7 .vote-btn-2').off("click").on('click',function(){
      $('#html-template-7').hide();
      $('#html-template-8').fadeIn('normal', function() {
        $(document).scrollTop(0);
      });
      // 设置分享参数
      setWxShare({
        userId: shareUserId,
        userName: shareUserName
      });
  });

  // 关闭按钮
  $('#html-template-7 .modal-close').off("click").on('click',function(){
      $('#html-template-7').fadeOut();
  });
}

// 拉票/活动秘籍
function voteShateDialogBind(){
  // 关闭分享弹出框
  $("#html-template-8 .modal-close").off("click").on("click", function() {
      $('#html-template-8').hide();
  });
}

// 所有投票弹出框按钮事件绑定
function voteDialogBindFn() {
  playerHasVoteDialogBind();
  playerNoVoteDialogBind();
  visitorHasVoteDialogBind();
  visitorNoVoteDialogBind();
  voteShateDialogBind();
}

// 设置分享文案
function setWxShare(data) {

  var _userId = data.userId;
  var _userName = data.userName;

  wx.ready(function(){
    // 获取域名
    var _base = getBaseOrigin();
    var _settings = rules.settings;

    var shareData = {
        title: _settings.szText.shareTitile,
        imgUrl: _settings.szText.shareIcon,
        desc: _settings.szText.shareSubtitle,
        link: ""
    }

    var auth_id = getQueryString('auth_id');
    auth_id = auth_id !== null ? '&auth_id='+auth_id : '';

    // 被分享人
    if (_userId !== '') {
      shareData.title = _settings.szText.pullTitile;
      shareData.desc = _settings.szText.pullSubtitle.replace("{{姓名}}", _userName);
      shareData.link = _base + "/ACTIVITY/view/" + activityCode + "/3?activityCode="+activityCode+"&userId="+ _userId +'&orgId='+getQueryString("orgId") + auth_id;
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
}

// 图片压缩
function compressImage(file, callback) {

  var reader = new FileReader();
  var img = new Image();

  reader.readAsDataURL(file);
  
  // 缩放图片需要的canvas
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');

  img.onload = function() {
    // 图片原始尺寸
    var originWidth = this.width;
    var originHeight = this.height;
    // 最大尺寸限制
    var maxWidth = 800, 
        maxHeight = 800;

    // 目标尺寸
    var targetWidth = originWidth, 
        targetHeight = originHeight;

    // 图片尺寸超过1024x1024的限制
    if (originWidth > maxWidth || originHeight > maxHeight) {
      if (originWidth / originHeight > maxWidth / maxHeight) {
          // 更宽，按照宽度限定尺寸
          targetWidth = maxWidth;
          targetHeight = Math.round(maxWidth * (originHeight / originWidth));
      } else {
          targetHeight = maxHeight;
          targetWidth = Math.round(maxHeight * (originWidth / originHeight));
      }
    }
        
    // canvas对图片进行缩放
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    // 清除画布
    context.clearRect(0, 0, targetWidth, targetHeight);
    // 图片压缩
    context.drawImage(img, 0, 0, targetWidth, targetHeight);
    // canvas转为blob并上传
    canvas.toBlob(function (blob) {
      callback && callback(blob);     
    }, file.type || 'image/png');
  };

  reader.onload = function(e) {
    img.src = e.target.result;
  };
}