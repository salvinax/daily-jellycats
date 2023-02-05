// js for homepage.html
import data from '/sample.json' assert {type: 'json'};

let db = null;
  
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

        objectStore.transaction.oncomplete = function(event) {
            console.log("object stored");
        }

        let objectStore2 = db.createObjectStore('jellycatDB', {keyPath: 'name'});

        objectStore2.createIndex('name', 'name', { unique: true });
        objectStore2.createIndex('description', 'description', { unique: true});
        objectStore2.createIndex('img_link', 'img_link', { unique: true});
        objectStore2.createIndex('product_links', 'product_links', { unique: true });

        objectStore2.transaction.oncomplete = function(event){
            console.log('database imported');
        }

    }

    request.onsuccess = function(event) {
        db = event.target.result;
        console.log("db opened");
        resetAtMidnight();  //for testing purposes
        if (dbShouldInit) {
            insert_records(data);
            resetAtMidnight();
        }
    }
}



function generate_new() {
    const one_transaction= db.transaction('jellycatDB', 'readonly');
    const objectStor = one_transaction.objectStore('jellycatDB');

    const countRequest = objectStor.count();

    countRequest.onsuccess = function() {
        var maxidx = countRequest.result; 
    

    //figure out how to randomize pls pls pls 
    //add to timer 
    //then basically done!!!!
    var jump = getRandomInt(0, maxidx-1);
    //console.log(jump);
    var forward = false; 
    objectStor.openCursor().onsuccess = function(event) {
        const cursor = event.target.result;
        if (!cursor){
            console.log('null');
            return;
        }

        if (!forward) {
            if (jump > 0) {
                cursor.advance(jump);
                console.log(jump);
                console.log("we jumped");
                forward = true;
                return;
            } else if (jump == 0) {
                forward= true;
                console.log('we didnt move');
                return;
            } else {
                jump = getRandomInt(0, maxidx-1);
                console.log('new rand generated');
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
    }  

    //add to database by clicking plus button in homepage  
    function addjelly (event){

        var addbutton = event.currentTarget;
        var name = document.getElementById('jellyname').textContent;
        console.log(name);

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
                    //dialog it's already there
                }
                let req = objectstorr.add(r.result);
                req.onsuccess = function() {
                    console.log("Added", req.result);
                //dialog box added to your collection!

            }   

            }

            // var name = document.getElementById('jellyname').textContent;
            // var description = document.getElementById('jellydesc').textContent;
            // var img_link = document.getElementById('jellyimg').src;
            // var product_links = document.getElementById('jellylink').href;
            // var obj = {name, description, img_link, product_links}; 
        
        }
    }



    function getRandomInt (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

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
        localStorage.setItem('savedTimestamp', parseInt(night.getTime()));
        generate_new();
    }


    function checkTimestamp() {
        let midnight = localStorage.getItem('savedTimestamp')
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
    }
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

open_database();
setInterval(checkTimestamp, 30000);