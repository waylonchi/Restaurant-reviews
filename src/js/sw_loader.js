if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service_worker.min.js')
    .then(function (reg) {
      if ('sync' in reg) {
        // do stuff here


        if (window.location.pathname === '/restaurant.html') {

          var form = document.querySelector('#review-form');
          var name = form.querySelector('#name');
          var rating = form.querySelector('#rating');
          var comment = form.querySelector('#comment');
          var restaurantId = getParameterByName('id');
            var storeNam = 'reviews-' + restaurantId;
            console.log("store is " + storeNam);
          form.addEventListener('submit', (e) => {
            e.preventDefault();

            var review = {
              restaurant_id: restaurantId,
              name: name.value,
              rating: rating.value,
              comments: comment.value
            };
              
              var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth()+1; //January is 0!
                var yyyy = today.getFullYear();
                today = dd + '/' + mm + '/' + yyyy;
              
              var today2 = new Date();
              var review2 = {
                  restaurant_id: restaurantId,
              name: name.value,
              rating: rating.value,
              comments: comment.value, 
                  createdAt: today2,
                  updatedAt: today2,
              }
              
              // update app's view
              const ul = document.getElementById('reviews-list');
              
              const li = document.createElement('li');
              li.setAttribute('role','listitem');
              const name2 = document.createElement('p');
              name2.innerHTML = review.name;
              li.appendChild(name2);

              const date = document.createElement('p');
              date.innerHTML = today;
              li.appendChild(date);

              const rating2 = document.createElement('p');
              rating2.innerHTML = `Rating: ${review.rating}`;
              li.appendChild(rating2);

              const comments2 = document.createElement('p');
              comments2.innerHTML = review.comments;
              li.appendChild(comments2);

              li.tabIndex = 0;
              
              ul.appendChild(li);
              

              //add data to new store
            idb.open('review', 1, function (upgradeDb) {
              upgradeDb.createObjectStore('outbox', {autoIncrement: true, keyPath: 'id'});
            }).then(function (db) {
              var trans = db.transaction('outbox', 'readwrite');
              return trans.objectStore('outbox').put(review);
            }).then(function () {
        
              // register for sync and clean up the form
              return reg.sync.register('outbox').then(() => {
                console.log('Sync registered');
              });
            });
              // add data to old store.
              idb.open('restaurants-reviews', 1).then(function (db) {
  
              var tr = db.transaction(storeNam, 'readwrite');
              return tr.objectStore(storeNam).put(review2);
              }).then(function () {
              name.value = '';
              comment.value = '';
              rating.selectedIndex = 0;
              // register for sync and clean up the form
              return reg.sync.register(storeNam).then(() => {
                console.log('Sync registered');
              });
            });
              
          });
        }
      }
    }).catch(function (err) {
    console.log("please check this error: ", err); // the Service Worker didn't install correctly
  });
} else {
    console.log("Error with the service provider. Rerun your client app");
}

getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

