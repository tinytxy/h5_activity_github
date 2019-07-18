function createUuid() {
    var tags = document.body.getElementsByTagName('*'); 
    var mydate = new Date()
    for(var i=0;i<tags.length;i++) {
        var uuid = "act"+mydate.getDay()+ mydate.getHours()+ mydate.getMinutes()+mydate.getSeconds()+mydate.getMilliseconds()+ Math.round(Math.random() * 10000);
        tags[i].setAttribute('id',uuid)
    }
}