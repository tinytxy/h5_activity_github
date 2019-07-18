function removeAttr() {
  var list = document.querySelectorAll('[c_remove]');
  list.forEach(function(item){
    const key = item.getAttribute('c_remove');

    const removeArray = key.split(' ')
    removeArray.forEach(function(ele){
      item.removeAttribute(ele)
    })
  })
}