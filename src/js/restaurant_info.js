let restaurant;
var map;
let reviews;

/**
 * Initialize Google map, called from HTML.
 */

window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
      google.maps.event.addDomListener(window, 'resize', function () {
      map.setCenter(restaurant.latlng);
      });
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      fillFloatingAction();
      callback(null, restaurant)
    });
  }
}


/**
 * Get current reviews from page.
 */
fetchReviewsFromURL = (callback) => {
    if (self.reviews) { // reviews already fetched!
        //callback(null, self.reviews)
    return;
  }
    const id = getParameterByName('id');
    
    if (!id) { // no id found in URL
        error = 'No restaurant id in URL'
        //callback(error, null);
  }
    else {
        DBHelper.fetchReviewsById(id, (error, reviews) => {
            self.reviews = reviews;
            if(!reviews) {
                console.error(error);
                return;
            }else {
                fillReviewsHTML();
            }
        
        });
    }
       
}



/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img js-lazy-image';
  imgSrc = DBHelper.imageUrlForRestaurant(restaurant);
  //image.src = imgSrc + '.jpg';
  image.alt = restaurant.name + ' Restaurant Profile Image';

  image.setAttribute('data-src', imgSrc +'_thumb.webp');
  image.onload =  lazyLoad();
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fetchReviewsFromURL();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  tabindex = 1;
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
      row.setAttribute('tabindex', 0);
    row.appendChild(time);

    hours.appendChild(row);
    console.log();
    hours.tabIndex = tabindex;
    tabindex++;
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
  // console.log("FillReview", reviews);

  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}


/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
    li.setAttribute('role','listitem');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = getDateFromTimestamp(review.createdAt);
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  li.tabIndex = 0;
  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
    
    li.setAttribute('aria-current', 'page');
  breadcrumb.appendChild(li);
}


fillFloatingAction = (restaurant=self.restaurant) => {

  var floatingAction = document.querySelector('#floating-action');



  const favIcon = document.createElement('span');
  favIcon.className = 'fav-icon';
  favIcon.setAttribute('data-id', restaurant.id);
  const favImg = document.createElement('img');


  if (restaurant.is_favorite === 'true') {
    favImg.alt = 'restaurant is favourite';
    favImg.src = 'img/icons/ic_favorite_black_24px.svg';
    favImg.className = 'fav-img fav-fill';
  } else {
    favImg.alt = 'restaurant is not favourite';
    favImg.src = 'img/icons/ic_favorite_border_black.svg';
    favImg.className = 'fav-img';
  }

  // Adds EventListner to change favourite options
  favImg.addEventListener('click', (e) => {

    if (e.target === e.currentTarget) {

      var classAttr = e.target.className;

      if (classAttr === 'fav-img') {
        DBHelper.restaurantFavouriteHandler(restaurant.id, true, (error, response) => {
          if (response) {
            favImg.alt = 'restaurant is favourite';
            favImg.src = 'img/icons/ic_favorite_black_24px.svg';
            e.target.className = 'fav-img fav-fill';
          }
          else {
            alert("Something Went Wrong");
            console.log(error);
          }
        })

      } else {
        DBHelper.restaurantFavouriteHandler(restaurant.id, false, (error, response) => {
          if (response) {
            favImg.alt = 'restaurant is not favourite';
            favImg.src = 'img/icons/ic_favorite_border_black.svg';
            e.target.className = 'fav-img';
          }
          else {
            alert("Something Went Wrong");
            console.log(error);
          }
        })
      }
    }
  });

  favIcon.append(favImg);
  floatingAction.append(favIcon);

}

// GET DATE FROM TIMESTAMP

getDateFromTimestamp = (timeStamp) => {
  var date = new Date(timeStamp);

  return date.getDate() +'/' + (date.getMonth() + 1) + '/' + date.getFullYear();
}


/**
 * Get a parameter by name from page URL.
 */
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
