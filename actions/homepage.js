// js for homepage.html
import data from '/sample.json' assert {type: 'json'};

let db = null;

//problem: when going to next page the embedded html does not save because it was dynamically injected SOLVED
//solution: generate_new function runs every time homepage opens 

//problem: timer is not running in background jellycat is not changing on homepage SOLVED
//solution : instead of using setInterval just use timestamp in local storage and check if the time has passed yet! 

//problem: collection is sorted by alphebetical order rather than last added 
//solution: add a field in db with the date and time then order db 

// dialog boxes are really ugly 
// fix the font add a bit of space between text



  
function open_database() {
    let dbShouldInit = false;
    const request = window.indexedDB.open('MyTestDB');

    request.onerror = function() {
        console.log("Problem opening database");
    }

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        dbShouldInit = true;
        let objectStore = db.createObjectStore('collection', {keyPath: 'product_links'
        });

        objectStore.createIndex('name', 'name', { unique: true });
        objectStore.createIndex('description', 'description', { unique: true });
        objectStore.createIndex('img_link', 'img_link', { unique: true});
        objectStore.createIndex('product_links', 'product_links', { unique: true });
        objectStore.createIndex('order', 'order', {unique: true});

        objectStore.transaction.oncomplete = function(event) {
            console.log("object stored");
        }

        let objectStore2 = db.createObjectStore('jellycatDB', {keyPath: 'name'});

        objectStore2.createIndex('name', 'name', { unique: true });
        objectStore2.createIndex('description', 'description', { unique: true});
        objectStore2.createIndex('img_link', 'img_link', { unique: true});
        objectStore2.createIndex('product_links', 'product_links', { unique: true });

        objectStore2.transaction.oncomplete = function(event) {
            console.log('database imported');
        }

    }

    request.onsuccess = function(event) {
        db = event.target.result;
        console.log("db opened");
        add_profile();
        checkIfMidnight();
        if (dbShouldInit) {
            insert_records(data);
            resetAtMidnight();
        }
    }
}


function add_profile() {
    const one_transaction= db.transaction('jellycatDB', 'readonly');
    const objectStor = one_transaction.objectStore('jellycatDB');

    const offsetList = localStorage.getItem('sortedList').split(',');
    if (offsetList.length == 0) {
        console.log('user went through whole database!!!!');
    }
    var forward = false; 
    objectStor.openCursor().onsuccess = function(event) {
        const cursor = event.target.result;
        if (!cursor) {
            console.log('null');
            return;
        }

        if (!forward) {
            var jump = offsetList[offsetList.length - 1];
            console.log(jump);
                if (jump > 0) {
                    cursor.advance(jump);
                    console.log("we jumped");
                    forward = true;

                } else {
                    console.log('we didnt move');
                    forward = true;

                } 
        }
        var names = cursor.value.name;
        var description = cursor.value.description;
        var linktoimage = cursor.value.img_link;
        var linktoshop = cursor.value.product_links;
        var frame = document.getElementsByClassName('squarecontainer')[0];
        
        var item = `  
        <div id="pluscontainer">
        <img id = 'plusimg' src="images/plus%20sign.png" alt="plus sign">
            <a id="jellylink" href= "${linktoshop}" target="_blank"><img id = 'plusimg' src="images/link.png" alt="link sign"></a>
        </div>
        <div class="mainitemcontainer">
                <img id="jellyimg" class="itemimg1" src="${linktoimage}">
                <p id="jellyname" class="textitem">${names}</p>
                <p id="jellydesc" class="italics">${description}</p>
        </div>
        `;
        
        
        frame.innerHTML = item;
        document.getElementById('plusimg').addEventListener('click', addjelly);
        //frame.querySelector('#plusimg').addEventListener('click', addjelly);
        }
      }

    //add to database by clicking plus button in homepage  
    function addjelly (){

       // var addbutton = event.currentTarget;
        var name = document.getElementById('jellyname').textContent;

        if (db) {
            const get_transaction = db.transaction('jellycatDB', 'readonly');
            const objectStor = get_transaction.objectStore("jellycatDB");

            get_transaction.oncomplete = function() {
                console.log("all get transactions completed");
            }

            get_transaction.onerror = function() {
                console.log("get transactions error");
                
            }
            let r = objectStor.get(name);
            r.onsuccess = function() {
                const get_transaction2 = db.transaction('collection', 'readwrite');
                const objectstorr = get_transaction2.objectStore('collection');

                get_transaction2.oncomplete = function() {
                    console.log("all insert transactions completed");
                }
        
                get_transaction2.onerror = function(){
                    console.log("insertion error");
                    alertUser('Already in collection!');
                    
                }
                let req = objectstorr.add(r.result);
                req.onsuccess = function() {
                    const updateData = r.result;
                    updateData.order = new Date();
                    //const req1 = r.result.update(updateData);
                    const req1 = objectstorr.put(updateData);
                    req1.onsuccess = function(){
                        console.log('updated');
                    }
                    console.log("Added", req.result);
                    alertUser('Added to collection!');
                    //alert('added to collection!!!');
                //dialog box added to your collection!
             var text =  document.getElementsByClassName('textitem')[0];
             text.innerText = 'Added to your collection!';
             text.style.opacity = 1;

            }   

            }

            // var name = document.getElementById('jellyname').textContent;
            // var description = document.getElementById('jellydesc').textContent;
            // var img_link = document.getElementById('jellyimg').src;
            // var product_links = document.getElementById('jellylink').href;
            // var obj = {name, description, img_link, product_links}; 
        
        }
    }

    function alertUser(message) {
        var nameContainer =  document.getElementsByClassName('textitem')[0];
        var descContainer = document.getElementsByClassName('italics')[0];
        descContainer.className = 'hiddenitalics';
        var savedName = nameContainer.innerText;
        nameContainer.innerText = message;
        nameContainer.className = 'alert1';

        setTimeout(function() {
        nameContainer.innerText = savedName;
        nameContainer.className = 'textitem';
        descContainer.className = 'italics';
        }, 2100)
    }

    function checkIfMidnight(){
        let midnight = parseInt(localStorage.getItem('savedTimestamp'));

        if (midnight != null ){
            if (Date.now() >= midnight){
                resetAtMidnight();
            } 
        } else {
            console.log('Timer has restarted');
            resetAtMidnight();
        }
    }

  
    //set a new time limit and we change database row 
    function resetAtMidnight() {
        var now = new Date(); //current date and time 
        var night = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours(),
            now.getMinutes() + 1  //currently set at every minute should be midnight
            ///0, 0, 0 // ...at 00:00:00 hours
        );
        localStorage.setItem('savedTimestamp', night.getTime());

        var list = localStorage.getItem('sortedList').split(',');
        list.pop();
        localStorage.setItem('sortedList', list);
        add_profile();
    }


    function checkTimestamp() {
        let midnight = parseInt(localStorage.getItem('savedTimestamp'));
        if (midnight != null) {
            if (Date.now() >= midnight) {
                resetAtMidnight();
            }
        
        } else {
            // First time running
            console.log('timer has started');
            resetAtMidnight();
            
        }
    }
    
    



function insert_records(records) {
    if (db) {
        const insert_transaction = db.transaction('jellycatDB', 'readwrite');
        const objectStore = insert_transaction.objectStore('jellycatDB');

        insert_transaction.oncomplete = function(){
            console.log("all insert transactions completed");
        }

        insert_transaction.onerror = function(){
            console.log("already there!");
        }

        records.forEach(jellycat => {
            let request = objectStore.add(jellycat);
            request.onsuccess = function() {
                
            }
        console.log("Imported Database");
         });

        let countRequest = objectStore.count();
        countRequest.onsuccess = function() {
           var maxidx = countRequest.result;
           const list =  Array.from(Array(maxidx).keys());

           for(var idx = 0; idx < list.length; idx++) {
              var newidx = Math.floor(Math.random() * (list.length - idx)) + idx;
              var tmp = list[idx];
              list[idx] = list[newidx];
              list[newidx] = tmp;
           }
           localStorage.setItem('sortedList', list);
        }
    }
}

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function get_record(name){
    if (db) {
        const get_transaction = db.transaction('collection', 'readonly');
        const objectStore = get_transaction.objectStore("collection");

        get_transaction.oncomplete = function(){
            console.log("all get transactions completed");
        }

        get_transaction.onerror = function(){
            console.log("get transactions error");
        }

        let request = objectStore.get(name);

        request.onsuccess = function(event) {
        console.log(event.target.results);
    
        }      
    }
}

function update_record(record){
    if (db) {
        const put_transaction = db.transaction('collection', 'readwrite');
        const objectStore = put_transaction.objectStore("collection");

        put_transaction.oncomplete = function(){
            console.log("all put transactions completed");
        }

        put_transaction.onerror = function(){
            console.log("put transactions error");
        }

        let request = objectStore.put(record);
     
    }
}

function delete_record(name){
    if (db) {
        const delete_transaction = db.transaction('collection', 'readwrite');
        const objectStore = delete_transaction.objectStore("collection");

        delete_transaction.oncomplete = function(){
            console.log("all delete transactions completed");
        }

        delete_transaction.onerror = function(){
            console.log("delete transactions error");
        }

        let request = objectStore.put(record);
     
    }

}

function delete_database(){
    const request = window.indexedDB.deleteDatabase("MyTestDB");

    request.onerror = function(event){
        console.log("Problem deleting DB");
    }
    
    request.onsuccess = function(event) {
        console.log("db deleted");
    }

}
//delete_database();
open_database();
//setInterval(checkTimestamp, 30000);