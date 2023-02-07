
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


                let request = objectStor.count();

                request.onsuccess = function() {
                    let totalnum = request.result;
                    let productsinlastpage = totalnum % 9;
                    let numberOfpages = (totalnum - productsinlastpage)/9;

                    //check if it's last page
                    if (totalnum < pageitems){
                        event.preventDefault();
                         console.log('last page');
                        page--;
                        pageitems = page*9;
                    }

                    if (page == numberOfpages) {
                        limit = productsinlastpage;
                        console.log('last page');
                        console.log(productsinlastpage);
                    } else {
                        limit = normalLimit;
                        console.log('not last page');
                    }
                    //console.log(totalnum);
                    //console.log(productsinlastpage);
                    //console.log(numberOfpages);

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
                            console.log(cursor);
                            console.log('#ofpage');
                            console.log(pageitems);
                            jump = true;
                            return;
                        }
                    }

                        if (temp < limit) {
                            console.log(temp);
                            console.log("^^^temp");
                            console.log(cursor.value.img_link);
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
                            console.log('end of page');

                        } else {
                            temp++;
                            cursor.continue();
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
                }
        }
    }

    function clickUp() {
        if (page === 0){
            console.log('dont do anything');
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


    function ready(){
        document.getElementsByClassName('upimg')[0].addEventListener('click', clickUp);
        document.getElementsByClassName("downimg")[0].addEventListener('click', clickDown);
    }

    ready();
    print_collection();
