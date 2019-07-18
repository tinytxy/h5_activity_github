$(document).ready(function(){
  setToken();
  // 获取个人信息
  userTabInfo();
  // 获取活动名称
  getActivityTitle();
});

function pass(){
  var activityCode = getQueryString('activityCode');
  var params = {
    activityCode: activityCode,
    reviewStatus: 1,
    userId: getQueryString('userId')
  }

  $.ajax({
    type: 'PUT',
    url: baseUrl + '/ACTIVITY/sz/review-user/' + activityCode,
    headers: {
      'x-token': getToken()
    },
    data: params,
    success: function(data) {
        if(data.status == 200) {
            $.dialog({
              type: "alert",
              contentHtml: "<p style='text-align:center;'>操作成功</p>",
              onClosed: function(){
                window.location.reload()
              }
            });
        }
    },
    error: function() {
      $.dialog({
          type : 'tips',
          autoClose : 3000,
          infoText : '请求超时,请尝试刷新页面！'
      });
    }
  });
}

function refuse(){
  var activityCode = getQueryString('activityCode');
  var params = {
    activityCode: activityCode,
    reviewStatus: 0,
    userId: getQueryString('userId')
  }

  $.ajax({
    type: 'PUT',
    url: baseUrl + '/ACTIVITY/sz/review-user/' + activityCode,
    data: params,
    headers: {
      'x-token': getToken()
    },
    success: function(data) {
        if(data.status == 200) {
            $.dialog({
              type: "alert",
              contentHtml: "<p style='text-align:center;'>操作成功</p>",
              onClosed: function(){
                window.location.reload()
              }
            });
        }
    },
    error: function() {
      $.dialog({
          type : 'tips',
          autoClose : 3000,
          infoText : '请求超时,请尝试刷新页面！'
      });
    }
  });
}

// 个人信息展示
function userTabInfo() {
    var id = getQueryString('userId');
    var activityCode = getQueryString('activityCode');
    var params = {
        id: id
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
              var userInfoObj = data.result && data.result.records && data.result.records[0];
              $("#userName").text(userInfoObj.name);
              $("#voteCount").text(userInfoObj.voteNum);
              $("#userPhone").text(userInfoObj.userPhone);
              $("#orgName").text(userInfoObj.orgName);
              $("#enounce").text(userInfoObj.declaration);

              $("#userImage img").attr("src", userInfoObj.imageUrl);
              $("#userImage").attr("href", userInfoObj.imageUrl).show();
              
              var reviewStatus = userInfoObj.reviewStatus;
              // reviewStatus 0-待审核 1-审核通过 2-审核未通过
              if(reviewStatus == 1||reviewStatus == 2){
                $(".edit-btn").addClass("hide");
                if(reviewStatus == 1){
                  $(".status-msg").addClass("text-success").html("已通过");  
                }else if(reviewStatus == 2){
                  $(".status-msg").addClass("text-danger").html("已驳回"); 
                }
              }else if(reviewStatus == 0){
                $(".status-msg").hide();  
                $(".edit-btn").removeClass("hide");  		
              }
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
              $('#examineTitle').text(title);
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