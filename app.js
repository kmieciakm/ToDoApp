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

    //add client event  
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
                output += "<div class='task' name="+cursor.value.idStore+">"
                            + "<input class='task_checkbox div-inner' type='checkbox'>";
                if(cursor.value.isdone){
                    output += "<p class='task_content div-inner task_done' contenteditable='true'>"+cursor.value.content+"</p>";
                }else{
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
            tasks[i].addEventListener("click",function(event){
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
    }
       
});