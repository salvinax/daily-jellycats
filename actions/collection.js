
        let db = null; 
        const request = window.indexedDB.open('MyTestDB');

        request.onerror = function() {
            console.log("Problem opening database");
        }

        request.onsuccess = function(event) {
            db = event.target.result;
            const one_transaction= db.transaction('collection', 'readonly');
            const objectStor = one_transaction.objectStore('collection');

            objectStor.openCursor().onsuccess = function(event) {
                const cursor = event.target.result;
                if (cursor) {
                    linktoimage = cursor.value.img_link;
                    linktoshop = cursor.value.product_links;

                    var newjelly = document.createElement("div");
                    newjelly.classList.add("itemcontainer");
                    var jellycats = document.getElementsByClassName("squarev2")[0];
        
                    var item = `  
                        <div class="imgcontainer">
                            <img class = "delimg" src="images/delete.png" alt="plus sign">
                            <a href="${linktoshop}" target="_blank"><img class="itemimage" src="${linktoimage}" ></a>
                        </div>
                    `;
            
                    newjelly.innerHTML = item;
                    jellycats.append(newjelly);
                    newjelly.getElementsByClassName('delimg')[0].addEventListener('click', removejelly);
                    cursor.continue();
                } else {
                console.log("No more entries!");
                }
            };
        }

    function removejelly(event) {
        var buttonClicked = event.currentTarget;
        //extract image link of jellycat that was deleted
        let jlink = buttonClicked.nextElementSibling.href;
        let jimage = buttonClicked.nextElementSibling.childNodes[0].src;
        buttonClicked.parentNode.parentNode.remove();

        if (db) {
            const delete_transaction = db.transaction('collection', 'readwrite');
            const delstore = delete_transaction.objectStore("collection");
    
            delete_transaction.oncomplete = function(){
                console.log("item was deleted");
            }
    
            delete_transaction.onerror = function() {
                console.log("error has occured during deletion")
            }
    
            //check if jellycat is in collection 
            let request = delstore.get(jlink);
            //if yes then delete it
                request.onsuccess = function(){
                    delstore.delete(jlink);
                }
        }
    }



