document.addEventListener("DOMContentLoaded",function(){
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    let db, request;

    if (!window.indexedDB) {
        window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
    }

    request = window.indexedDB.open("tasksDB",1);   

    request.onupgradeneeded = function(event){
        db = event.target.result;
        if(!db.objectStoreNames.contains("tasksStore")){
            let objectStore = db.createObjectStore("tasksStore",{keyPath: 'idStore', autoIncrement: true});
            objectStore.createIndex("tasksIndex","content",{unique: false});
        }
    }

    request.onsuccess = function(){
        console.log("Success open batabase");
        db = event.target.result;
        showTasks();
    }

    request.onerror = function(event){
        window.alert("Cannot open database.");
        console.log("Cannot open database with error: ", event.target.errorCode);
    }

    //add task
    let btn = document.getElementById("btn_add");
    btn.addEventListener("click",addTask);

    function addTask(){        
        let taskContent = document.getElementById("input_task").value;
        if(taskContent === ""){
            alert("Wrong data!");
        }else{
            document.getElementById("input_task").value = "";
            let task = {
                "content": taskContent,
                "isdone": 0
            };

            let transaction = db.transaction(["tasksStore"], "readwrite");
            let store = transaction.objectStore("tasksStore");

            request = store.add(task);
            request.onsuccess = function(){
                showTasks();
            }
            request.onerror = function(event){
                console.log("Task was not added with error: ",event.target.errorCode);
                window.alert("Sorry, task was not added.");
            }
        }
    }

    function showTasks(){
        let transaction = db.transaction(["tasksStore"],"readonly");
        let store = transaction.objectStore("tasksStore");
        let index = store.index('tasksIndex');

        var output = "";
        index.openCursor().onsuccess = function(event){
            var cursor = event.target.result;
            if(cursor){
                if(cursor.value.isdone){
                    output += "<div class='task done' name="+cursor.value.idStore+">"
                            + "<input class='task_checkbox div-inner' type='checkbox' checked>";
                    output += "<p class='task_content div-inner task_done' contenteditable='true'>"+cursor.value.content+"</p>";
                }else{
                    output += "<div class='task' name="+cursor.value.idStore+">"
                            + "<input class='task_checkbox div-inner' type='checkbox'>";
                    output += "<p class='task_content div-inner' contenteditable='true'>"+cursor.value.content+"</p>";
                }
                output += "<button id='btn_remove' class='btn_remove div-inner'></button>"
                        + "</div>";
                cursor.continue();
            }        
            //send to DOM
            document.getElementsByClassName("taskbox")[0].innerHTML = output;
        }
        setTimeout(addDoneClick,300);
    }

    function addDoneClick(){
        //Preventing Child from firing parent's click event, every child inner 'task' div have 'div-inner' class
        let inner = document.getElementsByClassName("div-inner");
        for(var i=0; i<inner.length; i++){
            inner[i].addEventListener("click",function(event){
            event.stopPropagation();
            });
        }
        //click on task div
        let tasks = document.getElementsByClassName("task");
        for(var i=0; i<tasks.length; i++){
            tasks[i].addEventListener("click",function(event){
                let currentTask = event.target;
                let children = currentTask.children;
                if(children[0].checked){
                    children[0].checked = false;
                    children[1].classList.remove("task_done");
                    currentTask.classList.remove("done");
                }else{
                    children[0].checked = true;
                    children[1].classList.add("task_done");
                    currentTask.classList.add("done");
                }
                UpdateStatus(currentTask);
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
                    currentTask.parentElement.classList.add("done");
                }else{
                    children[0].checked = false;
                    children[1].classList.remove("task_done");
                    currentTask.parentElement.classList.remove("done");
                }
                UpdateStatus(currentTask.parentElement);
            });
        }
        //click on remove button
        let btn_remove = document.getElementsByClassName("btn_remove");
        for(var i=0; i<btn_remove.length; i++){
            btn_remove[i].addEventListener("click",function(){
                let currentTask = event.target.parentElement;
                removeTask(currentTask);
            })
        }
        //maxlength for contenteditable elements
        let editable = document.getElementsByClassName("task_content");
        for(var i=0; i<editable.length; i++){
            editable[i].addEventListener("keydown",function(event){
            if(event.target.innerText.length === 100 && event.keyCode != 8)
                event.preventDefault();
            });
        }   
    }

    function UpdateStatus(currentTask){
        var currentTaskId = currentTask.getAttribute("name");

        let transaction = db.transaction(["tasksStore"],"readwrite");
        let store = transaction.objectStore("tasksStore");

        request = store.get(Number(currentTaskId));
        request.onsuccess = function(){
            let taskToUpdate = event.target.result;
            if(taskToUpdate.isdone){
                taskToUpdate.isdone = 0;
                request = store.put(taskToUpdate);
                request.onsuccess = function(){
                    console.log("Updated task status");
                }
            }else{
                taskToUpdate.isdone = 1;
                request = store.put(taskToUpdate);
                request.onsuccess = function(){
                    console.log("Updated task status");
                }
            }
        }         
    }

    //remove all tasc   
    let btn_clear = document.getElementById("btn_clear");
    btn_clear.addEventListener("click",ClearAll);

    function ClearAll(){
        let verify = confirm("You are trying to remove the all tasks.\nAre you sure?");
        if(verify){
            indexedDB.deleteDatabase("tasksDB");
            location.reload();
        }else{
            alert("The tasks was not deleted");
        }   
    }

    //remove relevant task
    function removeTask(currentTask){
        var currentTaskId = currentTask.getAttribute("name");

        let transaction = db.transaction(["tasksStore"],"readwrite");
        let store = transaction.objectStore("tasksStore");

        let verify = confirm("You are trying to remove your task.\nAre you sure?");
        if(verify){
            request = store.delete(Number(currentTaskId));
            request.onsuccess = function(){
                console.log("removed task: "+currentTaskId);
            }
            request.onerror = function(event){
                alert("Sorry, the task was not deleted");
                console.log("Error: "+event.target.error.name);
            }
            showTasks();
        }else{
            alert("The client was not deleted");
        }
    }
       
});