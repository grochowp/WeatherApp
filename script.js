class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;

  constructor() {
    // get user position
    this._getPosition();
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
          `Location: ${data.location.name} Temp C: ${data.current.temp_c} Wind kph: ${data.current.wind_kph}`
        )
        .openPopup();
      console.log();
    });
    // console.log(result);
  }
}

const app = new App();

// 0d28c2c2e0c840429fb100110231408
