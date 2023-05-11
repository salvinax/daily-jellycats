// js for homepage.html
import data from '/database.json' assert {type: 'json'};

//problem: when going to next page the embedded html does not save because it was dynamically injected SOLVED
//solution: generate_new function runs every time homepage opens 

//problem: timer is not running in background jellycat is not changing on homepage SOLVED
//solution : instead of using setInterval just use timestamp in local storage and check if the time has passed yet

//problem: collection is sorted by alphebetical order rather than last added SOLVED
//solution: add a field in db with the date and time then order db 

let db = null;
  
function open_database() {
    let dbShouldInit = false;
    const request = window.indexedDB.open('jddatabase');

    request.onerror = function() {
        console.log("Problem opening database");
    }

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        dbShouldInit = true;
        let objectStore = db.createObjectStore('collection', {keyPath: 'img_link'
        });
        
        //database for user's collection
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('description', 'description', { unique: false });
        objectStore.createIndex('img_link', 'img_link', { unique: true});
        objectStore.createIndex('product_links', 'product_links', { unique: false });
        objectStore.createIndex('order', 'order', {unique: true});

        objectStore.transaction.oncomplete = function(event) {
            console.log("object stored");
        }

        let objectStore2 = db.createObjectStore('jellycats', {keyPath: 'img_link'});
        //database for all items
        objectStore2.createIndex('name', 'name', { unique: false });
        objectStore2.createIndex('description', 'description', { unique: false});
        objectStore2.createIndex('img_link', 'img_link', { unique: true});
        objectStore2.createIndex('product_links', 'product_links', { unique: false });

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
            console.log('heheheh');
            resetAtMidnight();
        }
    }
}


function add_profile() {
    const one_transaction= db.transaction('jellycats', 'readonly');
    const objectStor = one_transaction.objectStore('jellycats');

    const offsetList = localStorage.getItem('sortedList').split(',');

    if (offsetList.length == 0) {
        console.log('User went through whole database.');
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
                    forward = true;

                } else {
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
        var linktoimg = document.getElementById('jellyimg').src;

        if (db) {
            const get_transaction = db.transaction('jellycats', 'readonly');
            const objectStor = get_transaction.objectStore("jellycats");

            get_transaction.oncomplete = function() {
                console.log("all get transactions completed");
            }

            get_transaction.onerror = function() {
                console.log("get transactions error");
                
            }
            let r = objectStor.get(linktoimg);
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
            }   

            }

        
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

    function checkIfMidnight() {
        let midnight = parseInt(localStorage.getItem('savedTimestamp'));

        if (midnight != null){
            if (Date.now() >= midnight){
                resetAtMidnight();
            } 
        } 
    }

  
    //set a new time limit and we change database row 
    function resetAtMidnight() {
        var now = new Date(); //current date and time 
        var night = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1, // next day
            0, 0, 0 //at 00:00:00 hours
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
        const insert_transaction = db.transaction('jellycats', 'readwrite');
        const objectStore = insert_transaction.objectStore('jellycats');

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
    const request = window.indexedDB.deleteDatabase("jddatabase");

    request.onerror = function(event){
        console.log("Problem deleting DB");
    }
    
    request.onsuccess = function(event) {
        console.log("db deleted");
    }

}
open_database();