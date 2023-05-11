
       let db = null;
       let page = 0;

        function print_collection() {

            const request = window.indexedDB.open('jddatabase');

            request.onerror = function() {
                console.log("Problem opening database");
            }

            request.onsuccess = function(event) {
                db = event.target.result;

                const one_transaction= db.transaction('collection', 'readonly');
                const objectStor = one_transaction.objectStore('collection');

                var changePage = false;
                var pageitems = page * 9;
                var temp = 0;
                var jump = false;
                var normalLimit = 9;
                var limit = 0; 

                var upbutton = document.getElementsByClassName("upimg")[0];
                if (page != 0){
                    upbutton.style.opacity = 1
                    upbutton.addEventListener('click', clickUp);
                    upbutton.style.cursor = 'pointer';
                } else {
                    upbutton.style.opacity = 0
                    upbutton.removeEventListener('click', clickUp);
                    upbutton.style.cursor = 'auto';  
                }


                let request = objectStor.count();

                request.onsuccess = function() { 
                    let totalnum = request.result; //total number of items in collection database
                    let productsinlastpage = totalnum % 9; //find remainder
                    let numberOfpages = (totalnum - productsinlastpage)/9;
                    var downbutton = document.getElementsByClassName("downimg")[0];

                   
                    //check if it's last page
                    if (totalnum > pageitems + 9) {
                        event.preventDefault();   
                        downbutton.style.opacity = 1;
                        downbutton.addEventListener('click', clickDown);
                        downbutton.style.cursor = 'pointer';
                    }

                    if (page == numberOfpages) {
                        limit = productsinlastpage;
                        downbutton.style.opacity = 0;   
                        downbutton.removeEventListener('click', clickDown);    
                        downbutton.style.cursor = 'auto';                 
                        //set item limit for last page
                    } else {
                        limit = normalLimit;
                        // not the last page 
                    }


                objectStor.index('order').openCursor(null, 'prev').onerror = function(){
                    console.log('failure');
                }

                objectStor.index('order').openCursor(null, 'prev').onsuccess = function(e) {
                    var cursor = e.target.result;
                    if (!cursor){
                        console.log('null');
                        return;
                    }

                    if (!changePage) {
                        
                      if (jump == false) {
                        if (pageitems > 0) {
                            cursor.advance(pageitems);
                            jump = true;
                            return;
                        }
                    }

                        if (temp < limit) {
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
                        }

                        if (temp == limit - 1)
                        {
                            changePage = true;
                            //end of page
                        } else {
                            temp++;
                            cursor.continue();
                            //continue to print
                        }

                        }
                    }
                };
            }
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
                console.log("error has occured during deletion");
            }

            //check if jellycat is in collection
            let request = delstore.get(jlink);
            //if yes then delete it
                request.onsuccess = function(){
                    delstore.delete(jlink);
                    //now refresh page after delete
                    window.location.reload();
                }
        }
    }

    function clickUp() {
        if (page === 0){
            console.log('No action');
        } else {
            page--;
            document.getElementsByClassName('squarev2')[0].innerHTML = '';
            print_collection();
        }
    }


    function clickDown() {
        page++;
        document.getElementsByClassName('squarev2')[0].innerHTML = '';
        print_collection();
    }

    print_collection();
