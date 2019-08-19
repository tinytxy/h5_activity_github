
var uploadFile = '';

// 加载html结构
loadHtmlJson(function(){
    // 判断是否需要移除机构名称
    if(rules.acActivityOrgs.length === 0) {
      $("#act11739232574395").parents(".form-row.m-b").remove();
    }
});

$(function () {
    setToken();
    // 获取活动标题
    getActivityTitle();
    removeAttr();
    btnBindClick();// 绑定点击事件
    $('#act11739232574395').attr({ 'readonly': 'readonly' });
    getOrgNameFn(function(data){
        $('#act11739232574395').val(data.records.orgName)
    });
    voteDialogBindFn();
})

// 元素点击事件绑定
function btnBindClick() {
    // 返回首页
    $("#act11534485971254").off("click").on("click", function () {
        var _t = getToken();
        transPage('1',activityCode,_t);
    });
    // 排行榜
    $("#act41612547506702").off('click').on("click", function () {
        var _t = getToken();
        var _addParam = 'toRanger=1'
        transPage('1',activityCode,_t,_addParam);
    });

    // 选手主页    
    $("#act4161336684689").off("click").on("click", function () {
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
    $("#act41613113951133").off("click").on("click", function () {
        $('#html-template-8').removeClass('global-none')
    });

    // 客服二维码弹框
    $(document).on('click', '#html-template-9 .modal-close', function () {
        var _t = getToken();
        $('#html-template-9').addClass('global-none')
        transPage('1',activityCode,_t);
    });

    
    // 上传图片
    $("#uploadImage").on('change', function () {
        var _file = this.files[0];
        // 图片大于1M压缩
        var filesize = _file.size / 1024 /1024;
        if(filesize > 1) {
            compressImage(_file, function(blob){
               // blob转file
               var newFile = blobTransferFile(blob);
                uploadFileFn(newFile);
            });
        }else {
            uploadFileFn(_file);
        }
    })

    $('#act31419345204861').on('click',function() {
        if($(this).attr('src') != '') {
            $("#uploadImage").click();
        }
    })

    // 确认提交    
    $("#act21359468086634").off("click").on("click", function () {
        var userName = $('#act11738585285947')
        var phonenum = $('#act11739141518360')
        var introDuce = $('#act11739381874636')
        var signInput = $('.sign-form .form-input-group input[c_validate="idcard"]')
        var addInput = JSON.parse(data.dataJson).addGroup
        var uploadImg = $('#act31419345204861 img')

        var flag = validateForm();
        if(!flag) {
            return false;
        }

        // 验证上传图片
        if (uploadImg.attr('src') == '') {
            $.dialog({
                type : 'tips',
                autoClose : 3000,
                infoText : '请上传一张照片'
            });
            return false
        }
        // var signupId = getQueryString('bindId')
        // var orgId = orgIdFn(signupId).orgId
        // 当前不需要机构名称
        var orgId = rules.acActivityOrgs.length > 0 ? getQueryString('orgId') : null
        var params = {
            orgId: orgId,      //模板变量中获取，机构id
            declaration: introDuce.val(),   //参赛宣言
            imageUrl: uploadFile,  //上传图片地址
            name: userName.val(),  // 姓名
            userPhone: phonenum.val(),   //用户填写的手机号
        }

        // 移除orgId
        orgId === null ? delete params.orgId : ''

        if (addInput.length) {
            for (var i = 0; i < addInput.length; i++) {
                params['x'+ (i+1)] = $('#'+addInput[i].id).val()
            }
        }
        var _token = getToken();
        $.ajax({
            type: 'POST',
            headers: {'content-type': 'application/json','x-token': _token},
            url: baseUrl + '/ACTIVITY/sz/sign-up/' + activityCode,
            data: JSON.stringify(params),
            success: function (data) {
                if(data.status >= 200 && data.status < 300){
                    $('#html-template-9').removeClass('global-none')
                    // $.dialog({
                    //     showTitle : false,
                    //     contentHtml : '您的资料已成功提交审核中，请耐心等待审核结果',
                    //     onClickOk: function() {
                    //         transPage('1',activityCode,_token);     
                    //     }
                    // });
                }else {
                    // 异常处理
                    $.dialog({
                        contentHtml : '<p style="text-align:center;">'+ data.responseJSON.message +'</p>'
                    });
                }
            },
            error: function(data){
                // 异常处理
                $.dialog({
                    contentHtml : '<p style="text-align:center;">'+ data.responseJSON.message +'</p>'
                });
            }
        })
    });
}

function selectFileImage(fileObj) {
    var file = fileObj;
    //图片方向角 added by lzk  
    var Orientation = null;

    if (file) {
        console.log("正在上传,请稍后...");
        var rFilter = /^(image\/jpeg|image\/png|image\/jpg|image\/gif)$/i; // 检查图片格式  
        if (!rFilter.test(file.type)) {
            $.dialog({
                type : 'tips',
                autoClose : 3000,
                infoText : '请选择jpeg/jpg/gif/png格式的图片'
            });
            return;
        }
        //获取照片方向角属性，用户旋转控制  
        EXIF.getData(file, function () {
            EXIF.getAllTags(this);
            Orientation = EXIF.getTag(this, 'Orientation');
            //return;  
        });

        var oReader = new FileReader();
        oReader.onload = function (e) {
            //var blob = URL.createObjectURL(file);  
            //_compress(blob, file, basePath);  
            var image = new Image();
            image.src = e.target.result;
            image.onload = function () {
                var expectWidth = this.naturalWidth;
                var expectHeight = this.naturalHeight;

                if (this.naturalWidth > this.naturalHeight && this.naturalWidth > 800) {
                    expectWidth = 800;
                    expectHeight = expectWidth * this.naturalHeight / this.naturalWidth;
                } else if (this.naturalHeight > this.naturalWidth && this.naturalHeight > 1200) {
                    expectHeight = 1200;
                    expectWidth = expectHeight * this.naturalWidth / this.naturalHeight;
                }
                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext("2d");
                canvas.width = expectWidth;
                canvas.height = expectHeight;
                ctx.drawImage(this, 0, 0, expectWidth, expectHeight);
                var base64 = null;
                //修复ios  
                if (navigator.userAgent.match(/iphone/i)) {
                    //如果方向角不为1，都需要进行旋转  
                    if (Orientation != "" && Orientation != 1) {
                        switch (Orientation) {
                            case 6://需要顺时针（向左）90度旋转    
                                rotateImg(this, 'left', canvas);
                                break;
                            case 8://需要逆时针（向右）90度旋转   
                                rotateImg(this, 'right', canvas);
                                break;
                            case 3://需要180度旋转  
                                rotateImg(this, 'right', canvas);//转两次  
                                rotateImg(this, 'right', canvas);
                                break;
                        }
                    }
                    base64 = canvas.toDataURL("image/jpeg", 0.8);
                } else if (navigator.userAgent.match(/Android/i)) {// 修复android  
                    var encoder = new JPEGEncoder();
                    base64 = encoder.encode(ctx.getImageData(0, 0, expectWidth, expectHeight), 80);
                } else {
                    if (Orientation != "" && Orientation != 1) {
                        switch (Orientation) {
                            case 6://需要顺时针（向左）90度旋转    
                                rotateImg(this, 'left', canvas);
                                break;
                            case 8://需要逆时针（向右）90度旋转 
                                rotateImg(this, 'right', canvas);
                                break;
                            case 3://需要180度旋转  
                                rotateImg(this, 'right', canvas);//转两次  
                                rotateImg(this, 'right', canvas);
                                break;
                        }
                    }

                    base64 = canvas.toDataURL("image/jpeg", 0.8);
                }
                $("#act31419345204861 img").attr("src", base64);
            };
        };
        oReader.readAsDataURL(file);
    }
}

//对图片旋转处理 
function rotateImg(img, direction, canvas) {
    //最小与最大旋转方向，图片旋转4次后回到原方向    
    var min_step = 0;
    var max_step = 3;
    //var img = document.getElementById(pid);    
    if (img == null) return;
    //img的高度和宽度不能在img元素隐藏后获取，否则会出错    
    var height = img.height;
    var width = img.width;
    //var step = img.getAttribute('step');    
    var step = 2;
    if (step == null) {
        step = min_step;
    }
    if (direction == 'right') {
        step++;
        //旋转到原位置，即超过最大值    
        step > max_step && (step = min_step);
    } else {
        step--;
        step < min_step && (step = max_step);
    }
    //旋转角度以弧度值为参数    
    var degree = step * 90 * Math.PI / 180;
    var ctx = canvas.getContext('2d');
    switch (step) {
        case 0:
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0);
            break;
        case 1:
            canvas.width = height;
            canvas.height = width;
            ctx.rotate(degree);
            ctx.drawImage(img, 0, -height);
            break;
        case 2:
            canvas.width = width;
            canvas.height = height;
            ctx.rotate(degree);
            ctx.drawImage(img, -width, -height);
            break;
        case 3:
            canvas.width = height;
            canvas.height = width;
            ctx.rotate(degree);
            ctx.drawImage(img, -width, 0);
            break;
    }
}

// 验证身份证
function validateIDNumber(card) {
    var vcity = {
        11: '北京', 12: '天津', 13: '河北', 14: '山西', 15: '内蒙古',
        21: '辽宁', 22: '吉林', 23: '黑龙江', 31: '上海', 32: '江苏',
        33: '浙江', 34: '安徽', 35: '福建', 36: '江西', 37: '山东', 41: '河南',
        42: '湖北', 43: '湖南', 44: '广东', 45: '广西', 46: '海南', 50: '重庆',
        51: '四川', 52: '贵州', 53: '云南', 54: '西藏', 61: '陕西', 62: '甘肃',
        63: '青海', 64: '宁夏', 65: '新疆', 71: '台湾', 81: '香港', 82: '澳门', 91: '国外'
    }
    // 检查号码是否符合规范，包括长度，类型
    function isCardNo(card) {
        // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
        var reg = /(^\d{15}$)|(^\d{17}(\d|X|x)$)/
        if (reg.test(card) === false) {
            return false
        }

        return true
    }
    // 取身份证前两位,校验省份
    function checkProvince(card) {
        var province = card.substr(0, 2)
        if (vcity[province] == undefined) {
            return false
        }
        return true
    }
    // 检查生日是否正确
    function checkBirthday(card) {
        var len = card.length
        // 身份证15位时，次序为省（3位）市（3位）年（2位）月（2位）日（2位）校验位（3位），皆为数字
        if (len == '15') {
            var re_fifteen = /^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/
            var arr_data = card.match(re_fifteen)
            var year = arr_data[2]
            var month = arr_data[3]
            var day = arr_data[4]
            var birthday = new Date('19' + year + '/' + month + '/' + day)
            return verifyBirthday('19' + year, month, day, birthday)
        }
        // 身份证18位时，次序为省（3位）市（3位）年（4位）月（2位）日（2位）校验位（4位），校验位末尾可能为X
        if (len == '18') {
            var re_eighteen = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X|x)$/
            var arr_data = card.match(re_eighteen)
            var year = arr_data[2]
            var month = arr_data[3]
            var day = arr_data[4]
            var birthday = new Date(year + '/' + month + '/' + day)
            return verifyBirthday(year, month, day, birthday)
        }
        return false
    }
    // 校验日期
    function verifyBirthday(year, month, day, birthday) {
        var now = new Date()
        var now_year = now.getFullYear()
        // 年月日是否合理
        if (birthday.getFullYear() == year && (birthday.getMonth() + 1) == month && birthday.getDate() == day) {
            // 判断年份的范围（0岁到130岁之间)
            var time = now_year - year
            if (time >= 0 && time <= 130) {
                return true
            }
            return false
        }
        return false
    }
    // 校验位的检测
    function checkParity(card) {
        // 15位转18位
        card = changeFivteenToEighteen(card)
        var len = card.length
        if (len == '18') {
            var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2)
            var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2')
            var cardTemp = 0, i, valnum
            for (i = 0; i < 17; i++) {
                cardTemp += card.substr(i, 1) * arrInt[i]
            }
            valnum = arrCh[cardTemp % 11]
            if (valnum == card.substr(17, 1).toUpperCase()) {
                return true
            }
            return false
        }
        return false
    }
    // 15位转18位身份证号
    function changeFivteenToEighteen(card) {
        if (card.length == '15') {
            var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2)
            var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2')
            var cardTemp = 0, i
            card = card.substr(0, 6) + '19' + card.substr(6, card.length - 6)
            for (i = 0; i < 17; i++) {
                cardTemp += card.substr(i, 1) * arrInt[i]
            }
            card += arrCh[cardTemp % 11]
            return card
        }
        return card
    }
    // 是否为空
    if (card === '') {
        // alert('请输入身份证号，身份证号不能为空')
        return false
    }
    // 校验长度，类型
    if (isCardNo(card) === false) {
        // alert('您输入的身份证号码不正确，请重新输入')
        return false
    }
    // 检查省份
    if (checkProvince(card) === false) {
        // alert('您输入的身份证号码不正确,请重新输入')
        return false
    }
    // 校验生日
    if (checkBirthday(card) === false) {
        // alert('您输入的身份证号码生日不正确,请重新输入')
        return false
    }
    // 检验位的检测
    if (checkParity(card) === false) {
        // alert('您的身份证校验位不正确,请重新输入')
        return false
    }
    return true
}

// 验证用户姓名
function validateUserName(userName) {
    let state = false
    if (userName !== '') {
        let uName = userName.replace(/\s*/g, '')
        var reg = /^(([a-zA-Z+\.?\·?a-zA-Z+]{1,15}$)|([\u4e00-\u9fa5+\·?\u4e00-\u9fa5+]{1,15}$))/
        if (!reg.test(uName)) {
            state = false
        } else {
            state = true
        }
    }

    return state
}
  
// 验证手机号
function validatePhone(phonenum) {
    let state = false
    if (phonenum !== '') {
        var reg = /^1[3456789]\d{9}$/
        if (!reg.test(phonenum)) {
            state = false
        } else {
            state = true
        }
    }
    return state
}

// 验证输入框
function validateInput($input) {

    var c_len = $input.attr("c_len");
    var c_validateempty = $input.attr("c_validateempty");
    var c_validate = $input.attr("c_validate");
    var c_name = $input.attr('c_name');
    var _value = $input.val();

    // 为空校验
    if (c_validateempty == 'yes' && _value == '') {
        $.dialog({
            type : 'tips',
            autoClose : 3000,
            infoText : c_name + '不能为空'
        });
        return false;
    }

    // 长度校验
    if (_value.length > c_len) {
        $.dialog({
            type : 'tips',
            autoClose : 3000,
            infoText :  c_name + '不能超过' + c_len + '个字'
        });
        return false;
    }

    // 规则校验 c_validate = phone,idcard,username三种类型
    if (c_validate !== ''){
        if(c_validate === 'phone' && !validatePhone(_value)) {// 手机校验
            $.dialog({
                type : 'tips',
                autoClose : 3000,
                infoText : '手机号格式错误'
            });
            return false;
        } else if(c_validate === 'idcard' && !validateIDNumber(_value)){// 身份证校验
            $.dialog({
                type : 'tips',
                autoClose : 3000,
                infoText : '身份证格式错误'
            });
            return false;
        } else if(c_validate === 'username' && !validateUserName(_value)){// 用户名称校验
            $.dialog({
                type : 'tips',
                autoClose : 3000,
                infoText : '用户名格式错误，请输入中文或者英文'
            });
            return false;
        }
    }
    return true;
}

// 验证表单输入框
function validateForm() {
   var inputs = $('.sign-form .form-input-group-inner input');
   var flag = true;
   for(var k =0 ;k < inputs.length; k++){
     flag = validateInput(inputs.eq(k));
     if(!flag){
        break;
     }
   }
   return flag
}

// blob转file
function blobTransferFile(_blob) {
    let _name = (new Date().getTime());
    const _type = _blob.type
    let file = new window.File([_blob], _name, { type: _type })
    if (_type === 'image/svg+xml') {
        _name += '.svg'
        file = new window.File([_blob], _name, { type: _type })
    } else if (_type === 'image/gif') {
        _name += '.gif'
        file = new window.File([_blob], _name, { type: _type })
    } else if (_type === 'image/jpeg') {
        _name += '.jpg'
        file = new window.File([_blob], _name, { type: _type })
    } else if (_type === 'image/png') {
        _name += '.png'
        file = new window.File([_blob], _name, { type: _type })
    } else {
        file = _blob
    }

    return file;
}

// 文件上传
function uploadFileFn(file) {

    showLoading('上传中...');
    var formData = new FormData();
    formData.append('file', file)
    selectFileImage(file)
    $.ajax({
        type: 'POST',
        url: manageUrl + '/system/components/upload',
        data: formData,
        contentType: false,
        processData: false,
        success: function (data) {
            var data = typeof data == 'string' ? JSON.parse(data) : data
            if(data.code == 200){
                uploadFile = data.records.fileUrl
                $("#uploadImage").parent().addClass('global-none-important')
                $("#act31419345204861").removeClass('global-none')
            }
            hideLoading();
        },
        error: function () {
            $.dialog({
                type : 'tips',
                autoClose : 3000,
                infoText : '上传失败！'
            }); 
            hideLoading();
        }
    })
}