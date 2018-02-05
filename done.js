document.addEventListener("DOMContentLoaded",function(){
  //Preventing Child from firing parent's click event, every child inner 'task' div have 'inner' class
  let inner = document.getElementsByClassName("div-inner");
  for(var i=0; i<inner.length; i++){
    inner[i].addEventListener("click",function(event){
      event.stopPropagation();
    });
  }
  //click on task div
  let tasks = document.getElementsByClassName("task");
  for(var i=0; i<tasks.length; i++){
    tasks[i].addEventListener("click",function(){
      let currentTask = event.target;
      let children = currentTask.children;
      if(children[0].checked){
        children[0].checked = false;
        children[1].classList.remove("task_done");
      }else{
        children[0].checked = true;
        children[1].classList.add("task_done");
      }
    });
  }
  //click on checkbox element
  let checkboxs = document.getElementsByClassName("task_checkbox");
  for(var i=0; i<checkboxs.length; i++){
    checkboxs[i].addEventListener("click",function(){
      let currentTask = event.target;
      let children = currentTask.parentElement.children;
      if(children[0].checked){
        children[0].checked = true;
        children[1].classList.add("task_done");
      }else{
        children[0].checked = false;
        children[1].classList.remove("task_done");
      }
    });
  }
  //maxlength for contenteditable elements
  let editable = document.getElementsByClassName("task_content");
  for(var i=0; i<editable.length; i++){
    editable[i].addEventListener("keydown",function(event){
      if(event.target.innerText.length === 100 && event.keyCode != 8)
          event.preventDefault();
    });
  }
});
