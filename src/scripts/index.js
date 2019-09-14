import { version } from '../../package.json';

/*
 * Constants
 */

const darkSkyUrl = 'https://api.darksky.net/forecast/63b249ea29dd4b09ae0118ebe17b4499';
const darkSkyExclusions = 'minutely,hourly,alerts,flags';
const darkSkyUnits = 'si';
const { geolocation } = navigator;
const defaultUnit = 'c';
const daysToForecast = 7;
const dayNames = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

/*
 * Variables
 */

let currentUnit = defaultUnit;
let currentWeather;

/*
 * DOM Elements
 */

const bodyElement = $('.js-body');
const loaderElement = $('.js-loader');
const weatherPanelElement = $('.js-weather-panel');
const temperatureElement = $('.js-temperature');
const unitElements = $('.js-unit');
const cityElement = $('.js-city');
const countryElement = $('.js-country');
const currentConditionElement = $('.js-current-condition');
const versionElement = $('.js-version');

/*
 * Skycons setup.
 */

const skycons = new window.Skycons({
  monochrome: false,
  resizeClear: true,
});
skycons.play();

/*
 * Functions
 */

function getDayName(date) {
  return dayNames[new Date(date * 1000).getDay()];
}

function displayErrorMessage(message) {
  bodyElement.html(`<p class="error-message js-error-message">${message}</p>`);
}

function handleUnsupportedGeolocation() {
  displayErrorMessage('Geolocation is not supported by this browser');
}

function celsiusToFahrenheit(temp) {
  return (temp * 9 / 5) + 32;
}

function updateCurrentTemperature() {
  const tempInCelsius = currentWeather.currently.temperature;
  const temp = (currentUnit === 'c') ? tempInCelsius : celsiusToFahrenheit(tempInCelsius);
  const tempRounded = Math.round(temp);
  temperatureElement.html(`${tempRounded}&deg;`);
}

function updateForecast(updateIcons) {
  for (let i = 0; i < daysToForecast; i += 1) {
    const forecast = currentWeather.daily.data[i + 1];
    const day = (i === 0) ? 'Today' : getDayName(forecast.time);
    const highInCelsius = forecast.temperatureHigh;
    const high = (currentUnit === 'c') ? highInCelsius : celsiusToFahrenheit(highInCelsius);
    const highRounded = Math.round(high);
    const lowInCelsius = forecast.temperatureLow;
    const low = (currentUnit === 'c') ? lowInCelsius : celsiusToFahrenheit(lowInCelsius);
    const lowRounded = Math.round(low);
    $(`.js-day-${i} .js-day`).html(day);
    if (updateIcons) {
      skycons.add(`js-skycon-${i}`, forecast.icon);
    }
    $(`.js-day-${i} .js-high`).html(`${highRounded}&deg;`);
    $(`.js-day-${i} .js-low`).html(`${lowRounded}&deg;`);
  }
}

function handleGetWeatherSuccess(res) {
  currentWeather = res;

  skycons.add('js-skycon-current', res.currently.icon);

  updateCurrentTemperature();

  // cityElement.html(res.location.name);
  // countryElement.html(res.location.country);
  cityElement.html('TODO');
  countryElement.html('TODO');
  currentConditionElement.html(res.currently.summary);

  updateForecast(true);

  loaderElement.addClass('hidden');

  weatherPanelElement.addClass('fade-in').removeClass('hidden');
}

function handleGetWeatherError(err) {
  displayErrorMessage(err.responseJSON.error.message);
}

function handleGetCurrentPositionSuccess(position) {
  const { coords } = position;
  const url = `${darkSkyUrl}/${coords.latitude},${coords.longitude}?exclude=${darkSkyExclusions}&units=${darkSkyUnits}`;

  $.ajax({ url, dataType: 'jsonp' })
    .done(handleGetWeatherSuccess)
    .fail(handleGetWeatherError);
}

function handleGetCurrentPositionError(err) {
  displayErrorMessage(`Could not get current position: ${err.message}`);
}

function handleSupportedGeolocation() {
  geolocation.getCurrentPosition(
    handleGetCurrentPositionSuccess,
    handleGetCurrentPositionError,
    {
      enableHighAccuracy: true,
      timeout: 5000,
    },
  );
}

function handleUnitChange(e) {
  currentUnit = e.target.value;
  updateCurrentTemperature();
  updateForecast(false);
}

/*
 * Initialise
 */

if (!geolocation) {
  handleUnsupportedGeolocation();
} else {
  handleSupportedGeolocation();
}

unitElements.click(handleUnitChange);
versionElement.text(`v${version}`);
