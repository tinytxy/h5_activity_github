
// 加载html结构
loadHtmlJson();

var gb_player_loaded = false
var gb_rank_loaded = false

$(function(){
    setToken();
    // 获取活动标题
    getActivityTitle();
    btnBindClick();// 绑定点击事件
    removeAttr();
    
    // 切换到排行榜
    if(getQueryString("toRanger") === '1') {
      $("#act3152823482970").click();
    }else {
      // 切换到参赛选手
      $("#act31528123692525").click();
    }
    
    // 排行榜列表
    voteDialogBindFn();

    var contents = json2html(data.htmlJson);
    $("#test_textarea").remove();
    $("body").append("<textarea id='test_textarea' style='width:300px;height:200px;overflow: auto;resize: auto;margin-bottom:30px;border: 1px solid #111;'></textarea>");
    $("#test_textarea").val(contents);
});

// 元素点击事件绑定
function btnBindClick() {
    // 参数选手
    $("#act31528123692525").off("click").on("click",tabChange);
    // 排行榜
    $("#act3152823482970").off("click").on("click",tabChange);
    // 搜索按钮
    $("#act3152814816164").off("click").on('click',function(){
        getAjaxListSearch('search',1,function(playerListData){
            getPlayerList(playerListData)
        })
    });

    // 参赛选手上一页
    $('#act3152978551035').off('click').on('click',function(){
        
        var page = parseInt($('#act61214527684747 .curpage').text())
        if(page > 1) {
            page -= 1
            getAjaxListSearch('player',page,function(playerListData){
                getPlayerList(playerListData)
            })  // 参赛选手列表
        }else {
            $.dialog({
                type:'tips',
                infoText : '当前是第一页',
                autoClose: 2000
            });
        }
    });
    // 参赛选手下一页
    $('#act315291899997').off('click').on('click',function(){
        var pageSize = parseInt($("#act61214527684747").attr("c_pagesize"));
        var page = parseInt($('#act61214527684747 .curpage').text());
        var total = parseInt($('#act61214527684747 .totalpage').text());
        if(page < Math.ceil(total/pageSize)) {
            page = page + 1
            getAjaxListSearch('player',page,function(playerListData){
                getPlayerList(playerListData)
            });  // 参赛选手列表
        }else {
            $.dialog({
                type:'tips',
                infoText : '当前是最后一页',
                autoClose: 2000
            });
        }
    });

    // 排行榜上一页
    $('#act514245671026').off('click').on('click',function(){
        var page = parseInt($('#act111398324601 .curpage').text())
        if(page > 1) {
            page -= 1
            getAjaxListSearch('rank',page,function(rankListData){
                getRangeList(rankListData)
            })  // 参赛选手列表
        }else {
            $.dialog({
                type:'tips',
                infoText : '当前是第一页',
                autoClose: 2000
            });
        }
    })
    // 排行榜下一页
    $('#act5142157597939').off('click').on('click',function(){
        var pageSize = parseInt($("#act111398324601").attr("c_pagesize"));
        var page = parseInt($('#act111398324601 .curpage').text())
        var total = parseInt($('#act111398324601 .totalpage').text())
        if(page < Math.ceil(total/pageSize)) {
            page = page + 1
            getAjaxListSearch('rank',page,function(rankListData){
                getRangeList(rankListData)
            })  // 参赛选手列表
        }else {
            $.dialog({
                type:'tips',
                infoText : '当前是最后一页',
                autoClose: 2000
            });
        }
    })

    // 报名按钮
    $("#act31527459124456").off("click").on("click",function(){
        // 判断关注
        isAttention(function(){
            // 是否报名
            isSignUp();
        });
    });

    // 查看排行
    $('#act5161526928645').off('click').on('click',function(){
        $('#html-template-5').fadeOut();
        $("#user-list").hide();
        $("#range-list").show();  
    })
    $('#html-template-5 .modal-close').off("click").on('click',function(){
        $('#html-template-5').fadeOut()
    })

    // 排行榜
    $("#act2165045664554").off('click').on("click", function(){
        var _t = getToken();
        var _addParam = 'toRanger=1'
        transPage('1',activityCode,_t,_addParam);
    });

    // 选手主页    
    $("#act21650126678793").off("click").on("click", function(){

        // 判断关注
        isAttention(function(){
            // 判断是否报名
            isSignUp(function(){
                var _t = getToken();
                var urlParam = 'userId='+user.id;
                transPage('3',activityCode,_t,urlParam);
            },function(){
                $.dialog({
                    contentHtml: '<p style="text-align:center;">您还未报名，请到首页报名参加后本次活动！</p>',
                    onClosed: function(){
                        var _t = getToken();
                        transPage('1',activityCode,_t);
                    }
                });
            });
        });
    });

    // 活动秘籍
    $("#act21650195017743").off("click").on("click", function(){
        $('#html-template-8').fadeIn('normal', function() {
            $(document).scrollTop(0);
        });
    });
}

// 检索参数选手列表
function getAjaxListSearch(type,page,callback) {
    if(type == 'player') {
        var descs = 'createTime'
        var searchVal = ''
        var pageSize = $('#act41530417882468').text()
        if(gb_player_loaded) {
            return
        }
        gb_player_loaded = true
    }else if(type == 'rank') {
        var descs = 'voteNum'
        var searchVal = ''
        var pageSize = $('#act4153123735791').text()
        if(gb_rank_loaded) {
            return
        }
        gb_rank_loaded = true
    }else if(type == 'search') {
        var searchVal = $('.search-input.c-read-only').val()
        var descs = 'createTime'
        // if(searchVal == '') {
        //     $.dialog({
        //         type : 'tips',
        //         autoClose : 3000,
        //         infoText : '搜索关键词不能为空'
        //     });
        //     return false
        // }
        if(gb_player_loaded) {
            return
        }
        gb_player_loaded = true
    }
    var params = {
        reviewStatus:1,  // 审核状态
        descs:descs,  // 降序排列
        curPage:page?page:1,
        pageSize:pageSize,
        activityCode:activityCode,  // 活动id
        name: searchVal   // 搜索字段
    }

    // 加载loading
    showLoading();
    $.ajax({
        type: 'GET',
        url: baseUrl + '/ACTIVITY/sz/search/' + activityCode,
        data: params,
        headers: {
            'x-token': getToken()
        },
        success: function(data) {
            if(data.status == 200) {
                if(type == 'player' || type == 'search') {
                    var playerListData = data.result
                    if(typeof callback == "function") {
                        callback(playerListData)
                    }
                    if(type == 'search') {
                        $("#user-list").show();
                        $("#range-list").hide();
                    }
                    gb_player_loaded = false
                }else if(type == 'rank') {
                    var rankListData = data.result
                    if(typeof callback == "function") {
                        callback(rankListData)
                    }
                    gb_rank_loaded = false
                }
            }
            hideLoading();
        },
        error: function() {
            if(type == 'player' || type == 'search') {
                gb_player_loaded = false
            }else if(type == 'rank') {
                gb_rank_loaded = false
            }
            hideLoading();
        }
    })
}
// 获取参赛选手列表
function getPlayerList(playerListData) {
    var list = $("#user-list .vote-con");
    list.hide()
    var i = 0
    var item = $(".item",list)[0];
    var tempItem = list.clone();
    // 清空子元素
    tempItem.empty().show();
    if(playerListData.records.length) {
        for(;i < playerListData.records.length; i++){
            // 序号替换
            $('.number-icon',item).text(playerListData.records[i].userNumber);
            // 图片url替换
            $('img',item).attr('src',playerListData.records[i].imageUrl);
            // 名称替换
            $('.user-name',item).text(playerListData.records[i].name);
            // 机构名称替换
            if(rules.acActivityOrgs.length === 0){
              $('.vote-struct',item).remove();
            }else {
              $('.vote-struct',item).text(playerListData.records[i].orgName);
            }
            
            // 票数替换
            $('.vote-num',item).text(playerListData.records[i].voteNum+'票');
            
            // 投票点击事件
            var cloneItem = $(item).clone();
            cloneItem.find('.act-btn').attr('id',playerListData.records[i].id).attr('username',playerListData.records[i].name).on('click',function(){
                var id = $(this).attr('id');
                var userName = $(this).attr('username');
                var _this = $(this)
                var params = {
                    userId: id,
                    userName: userName,
                    orgId: getQueryString('orgId') !== null ? getQueryString('orgId') : ''
                }
                
                isAttention(function(){
                    showLoading('处理中...');
                    // 投票
                    voteClickFn(params,function(data){
                        // success
                        _this.parent('.item-title').prev().find('.vote-num').text(data.result.voteNum + '票');
                    });
                });
            });
            
            // 参数选手点击事件
            cloneItem.find('.item-photo').attr('id',playerListData.records[i].id).on('click',playPageFn);
            tempItem.append(cloneItem);
        }
        $("#user-list").find('.vote-con').remove().end().prepend(tempItem);
        $('#user-list .list-empty').hide()
        $('#act61214527684747').parent('.navigation').show();
        $('#act61214527684747 .curpage').text(playerListData.current)
        $('#act61214527684747 .totalpage').text(playerListData.total)
    }else {
        $('#user-list .list-empty').show()
        $('#act61214527684747').parent('.navigation').hide();
    }
}

// 获取排行榜列表    
function getRangeList(rankListData){
   var list = $("#range-list tbody");
   list.hide()
   var tr = $("tr", list)[0];
   var i = 0
   var tempItem = list.clone();
   // 清空子元素
   tempItem.empty().show();
   if(rankListData.records.length) {
    for(;i < rankListData.records.length; i++){
        // 替换序号 badge-no1
        $('.number',tr).text(i+1);
        // 前三名有特殊图标
        if(i < 3) {
        $('.number',tr).removeClass().addClass('number ' + ('badge-no'+(i+1)));
        } else {
        $('.number',tr).removeClass().addClass('number');
        }
        // 替换名字,图片
        $('.table-info img',tr).attr('src',rankListData.records[i].imageUrl);
        $('.cell-info h4', tr).text(rankListData.records[i].name);
        // $('.cell-info small', tr).text(rankListData.records[i].userNumber);
        // 票数
        $('.ticket-total .text-red', tr).text(rankListData.records[i].voteNum);

        // 编号
        $('.cell-info small', tr).text('编号:'+ rankListData.records[i].userNumber +'号');    
        // 添加点击事件
        var cloneItem = $(tr).clone();
        tempItem.append(cloneItem);
    }
    $("#range-list table").find('tbody').remove().end().prepend(tempItem);
    $('#act111398324601').parent('.navigation').show();
    $('#act111398324601 .curpage').text(rankListData.current)
    $('#act111398324601 .totalpage').text(rankListData.total)
   }else {
    $('#act111398324601').parent('.navigation').hide();
   }
}

// tab切换
function tabChange(){
   var c_typename = $(this).attr("c_typename");
   if(c_typename === 'rangerListBtn') {
     // 排行榜列表
     getAjaxListSearch('rank',1,function(rankListData){
        getRangeList(rankListData);
        $("#user-list").hide();
        $("#range-list").show(); 
     }); 
       
   } else {
       // 参赛选手列表
     getAjaxListSearch('player',1,function(playerListData){
        getPlayerList(playerListData);
        $("#user-list").show();
        $("#range-list").hide();
     });
   }
}

// 选手主页
function playPageFn() {
  var id = $(this).attr('id');
  var urlParam = 'userId='+id;
  var _t = getToken();
  transPage('3',activityCode,_t,urlParam);
}