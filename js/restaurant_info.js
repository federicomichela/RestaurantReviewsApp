let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoibWljaGVsYWZlZGVyaWNvIiwiYSI6ImNrMjc5dGpxNDE1Zm8zbnA5MGViZTgycTQifQ.3bYwT67DrexNFXPbNhKfhA',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}

/* window.initMap = () => {
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
    }
  });
} */

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
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  const address = document.getElementById('restaurant-address');
  const image = document.getElementById('restaurant-img');
  const cuisine = document.getElementById('restaurant-cuisine');
  const openingTimes = document.getElementById('restaurant-hours');

  const figure = document.createElement('figure');
  const picture = document.createElement('picture');
  const figcaption = document.createElement('figcaption');
  const source = document.createElement('source');

  // binding dom elements
  figcaption.append(cuisine);
  figcaption.append(address);
  figcaption.append(openingTimes);
  picture.append(source);
  picture.append(image);
  figure.append(picture);
  figure.append(figcaption);
  name.parentNode.insertBefore(figure, name.nextSibling);

  // accessibility
  let ariaLabel =
    restaurant.name + ", " +
    restaurant.address + ", Opening Times: " +
    Object.entries(restaurant.operating_hours).map(item=>item[0]+item[1]).join();
  figure.setAttribute('aria-label', ariaLabel);
  figure.setAttribute('tabindex', 0);

  // filling dom elements
  let sourceset = [
      `${DBHelper.imageUrlForRestaurant(restaurant, '2x')} 2x`,
      `${DBHelper.imageUrlForRestaurant(restaurant, '1x')}`
  ];
  source.setAttribute('media', '(min-width: 768px)');
  source.setAttribute('srcset', sourceset);
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute('alt', `${name} - ${cuisine} cuisine`);
  name.innerHTML = restaurant.name;
  address.innerHTML = restaurant.address;
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML(openingTimes);
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (container, operatingHours = self.restaurant.operating_hours) => {
    for (let key in operatingHours) {
        const row = document.createElement('div');
        const day = document.createElement('div');
        const time = document.createElement('div');

        // binding dom elements
        row.append(day);
        row.append(time);
        container.append(row);

        // filling dom elements
        row.classList.add('grid-row');
        day.innerHTML = key;
        time.innerHTML = operatingHours[key];
    }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');

  title.innerHTML = 'Reviews';
  title.setAttribute('tabindex', 0);
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
  const heading = document.createElement('div');
  const main = document.createElement('div');
  const name = document.createElement('p');
  const date = document.createElement('p');
  const rating = document.createElement('p');
  const comments = document.createElement('p');

  main.append(rating);
  main.append(comments);
  heading.append(name);
  heading.append(date);
  li.append(heading);
  li.append(main);

  li.classList.add('container');
  heading.classList.add('review-heading');
  main.classList.add('review-main');
  rating.classList.add('review-rating');
  comments.classList.add('review-comments');

  name.innerHTML = review.name;
  date.innerHTML = review.date;
  rating.innerHTML = `Rating: ${review.rating}`;
  comments.innerHTML = review.comments;

  // accessibility
  name.setAttribute('tabindex', 0);
  date.setAttribute('tabindex', 0);
  rating.setAttribute('tabindex', 0);
  comments.setAttribute('tabindex', 0);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
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
