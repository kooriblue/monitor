export function changeTimeFormat(timestamp) {
    if (timestamp == null) {
        return "";
    }
    //由时间戳转换时间格式
    var date = new Date(timestamp);
    var hour = (date.getHours() < 10) ? ('0'+date.getHours()) : date.getHours();
    var min = (date.getMinutes() < 10) ? ('0'+date.getMinutes()) : date.getMinutes();
    var sec = (date.getSeconds() < 10) ? ('0'+date.getSeconds()) : date.getSeconds();
    var dateString = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + ' ' + hour + ':' + min + ':' + sec;
    return dateString;
}