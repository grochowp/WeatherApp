class App {
  _parentElement = document.querySelector('.weathers');
  searchBar = document.querySelector('.search__bar');
  searchIcon = document.querySelector('.searchIcon');
  #map;
  #mapZoomLevel = 13;
  #mapEvent;

  constructor() {
    // get user position
    this._getPosition();
    this.searchIcon.addEventListener('click', this._findCity.bind(this));
  }

  _generateMarkup(data) {
    console.log(data);
  }

  _findCity() {
    const city = this.searchBar.value;
    const getCity = async function (city) {
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
    getCity(city).then(data => {
      const curData = data.current;
      console.log(data);
      const { lat, lon } = data.location;
      // const { longitude } = position.coords;

      const coords = [lat, lon];
      console.log(coords);
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
          `Location: ${data.location.name} Temp C: ${curData.temp_c} Wind kph: ${curData.wind_kph}`
        )
        .openPopup();

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
    });
  }
  _getPosition() {
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
    // console.log(map);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker(coords)
      .addTo(this.#map)
      .bindPopup('Your current location')
      .openPopup();

    this.#map.on('click', this._showWeather.bind(this));
  }

  _searchCity(input) {}

  _showWeather(mapE) {
    this.#mapEvent = mapE;
    const { lat, lng } = mapE.latlng;
    const coords = [lat, lng];

    const getCity = async function (lat, lng) {
      try {
        const response = await fetch(
          `http://api.weatherapi.com/v1/current.json?key=0d28c2c2e0c840429fb100110231408&q=${lat},${lng}`
        );
        const data = await response.json();
        console.log(data);
        return data;
      } catch (err) {
        console.log(err);
      }
    };

    getCity(lat, lng).then(data => {
      const curData = data.current;

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
          `Location: ${data.location.name} Temp C: ${curData.temp_c} Wind kph: ${curData.wind_kph}`
        )
        .openPopup();

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
    });
  }
}

const app = new App();

// 0d28c2c2e0c840429fb100110231408
