class App {
  _parentElement = document.querySelector('.weathers');
  searchBar = document.querySelector('.search__bar');
  searchIcon = document.querySelector('.searchIcon');
  deleteBtn = document.querySelector('.delete__btn');
  weatherCity = document.querySelector('.weathers');
  #map;
  #mapZoomLevel = 13;
  #cities = [];

  constructor() {
    this._getCurrentPosition();
    console.log(this.#cities);
    this._getLocalStorage();

    this.searchIcon.addEventListener('click', this._addCityBySearch.bind(this));

    this.searchBar.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        this._addCityBySearch();
      }
    });

    //prettier-ignore
    this.deleteBtn.addEventListener('click', this._clearLocalStorage.bind(this));

    //prettier-ignore
    this.weatherCity.addEventListener('click', this._moveToPopup.bind(this));
  }

  _getCurrentPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    ///// Display current position
    // L.marker(coords)
    //   .addTo(this.#map)
    //   .bindPopup('Your current location')
    //   .openPopup();

    this.#map.on('click', this._addCityByClick.bind(this));

    this.#cities.forEach(city => {
      this._renderWeatherMarker(city);
    });
  }

  _moveToPopup(e) {
    const clickedWeatherCard = e.target.closest('.weatherCard');
    if (!clickedWeatherCard) return;
    const locationElement = clickedWeatherCard.querySelector('.location');
    if (!locationElement) return;

    const locationText = locationElement.textContent;
    const cityData = this.#cities
      .filter(city => city.location.name === locationText)
      .map(city => city.location);

    const coords = [cityData[0].lat, cityData[0].lon];
    this.#map.flyTo(coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 3,
      },
    });
  }

  _renderWeatherMarker(data) {
    if (data === null) return;
    const curData = data.current;
    const locData = data.location;
    const coords = [locData.lat, locData.lon];
    L.marker(coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          minWidth: 100,
          minHeight: 200,
          autoClose: false,
          closeOnClick: false,
        })
      )
      .setPopupContent(
        `Location: ${locData.name} Temp C: ${curData.temp_c} Wind kph: ${curData.wind_kph}`
      );

    this.#map.flyTo(coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 3,
      },
    });
  }

  _renderWeather(data) {
    if (data === null) return '';
    const curData = data.current;
    let image;

    if (curData.temp_c > 25) {
      image = 'clear';
    } else if (
      curData.cloud > 10 &&
      curData.temp_c > 15 &&
      curData.temp_c < 25
    ) {
      image = 'clouds';
    } else {
      image = 'mist';
    }
    const markup = `<div id="weather_wrapper">
          <div class="weatherCard">
          <div class="currentTemp">
          <span class="temp">${curData.temp_c}&deg;</span>
          <span class="location">${data.location.name}</span>
          </div>
          <div class="currentWeather">
          <span class="conditions"
          ><img class="weather__temp" src="images/${image}.png"
          /></span>
          <div class="info">
          <span class="rain">${curData.humidity}  MM</span>
          <span class="wind">${curData.wind_kph} MPH</span>
          </div>
          </div>
          </div>
          </div>`;
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // Funciton to find city in API by search bar
  _addCityBySearch() {
    const city = this.searchBar.value;

    if (!city) return;

    const findCityFromAPI = async function (city) {
      try {
        const response = await fetch(
          `http://api.weatherapi.com/v1/current.json?key=0d28c2c2e0c840429fb100110231408&q=${city}&aqi=no
          `
        );
        const data = await response.json();
        return data;
      } catch (err) {
        console.log(err);
      }
    };

    // Display markup to city found by search or click on map
    findCityFromAPI(city).then(data => {
      const isDuplicate = this.#cities.some(
        cityObj => cityObj.location.name === data.location.name
      );

      if (isDuplicate || this.#cities.length === 4) return;

      this._renderWeather(data);
      this._renderWeatherMarker(data);
      this.#cities.push(data);
      this._setLocalStorage();
      this.searchBar.value = '';
    });
  }

  _addCityByClick(mapE) {
    const { lat, lng } = mapE.latlng;

    // || city === this.#cities.location.name.includes(city)
    const findCityFromAPI = async function (lat, lng) {
      try {
        const response = await fetch(
          `http://api.weatherapi.com/v1/current.json?key=0d28c2c2e0c840429fb100110231408&q=${lat},${lng}`
        );
        const data = await response.json();
        return data;
      } catch (err) {
        console.log(err);
      }
    };

    findCityFromAPI(lat, lng).then(data => {
      const isDuplicate = this.#cities.some(
        cityObj => cityObj.location.name === data.location.name
      );

      if (isDuplicate || this.#cities.length === 4) return;

      this._renderWeather(data);
      this._renderWeatherMarker(data);
      this.#cities.push(data);
      this._setLocalStorage();
    });
  }

  //////// TO DO
  _setLocalStorage() {
    localStorage.setItem('weather', JSON.stringify(this.#cities));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('weather'));
    if (!data) return;

    this.#cities = data;
    this.#cities.forEach(city => {
      this._renderWeather(city);
    });
  }

  _clearLocalStorage() {
    localStorage.removeItem('weather');
    location.reload();
  }
}

const app = new App();

// 0d28c2c2e0c840429fb100110231408
