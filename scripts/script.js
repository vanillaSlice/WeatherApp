$(document).ready(function () {
  
  "use strict";
  
  var geolocation = navigator.geolocation,
    container = $("#container"),
    defaultUnit = $("input[name='unit']:checked").val(),
    unit = defaultUnit,
    weather,
    daysForecast = 5;
  
  if (!geolocation) {
    handleUnsupportedGeolocation();
  } else {
    handleSupportedGeolocation();
  }
  
  function handleUnsupportedGeolocation() {
    container.html("Geolocation is not supported by this browser");
  }
  
  function handleSupportedGeolocation() {
    geolocation.getCurrentPosition(handleGetCurrentPositionSuccess,
                                   handleGetCurrentPositionError,
                                  {enableHighAccuracy: true});
  }
  
  function handleGetCurrentPositionSuccess(position) {
    var coords = position.coords;
    $.simpleWeather({
      location: coords.latitude + "," + coords.longitude,
      unit: unit,
      success: handleSimpleWeatherSuccess,
      error: handleSimpleWeatherError
    });
  }
  
  function handleSimpleWeatherSuccess(data) {
    weather = data;
    // change current day name
    weather.forecast[0].day = "Today";
    $("#temperature-container").css("background-image",
                                    "url(" + weather.image + ")");
    setCurrentTemperature();
    $("#city").html(weather.city);
    $("#country").html(weather.country);
    $("#current-condition").html(weather.currently);
    setForecast();
    $("#loader").addClass("hidden");
    $("#weather-container").addClass("fade-in").removeClass("hidden");
  }
  
  function setCurrentTemperature() {
    var currentTemperature = (unit === defaultUnit) ? weather.temp :
                                                      weather.alt.temp;
    $("#temperature").html(currentTemperature + "&deg;");
  }
  
  function setForecast() {
    for (var i = 0; i <= daysForecast; i++) {
      var forecast = (unit === defaultUnit) ? weather.forecast[i] :
                                              weather.forecast[i].alt;
      var dayId = "#day-" + i;
      $(dayId + " .day").html(forecast.day);
      $(dayId + " .forecast-thumbnail").attr({title: forecast.text,
                                              src: forecast.thumbnail});
      $(dayId + " .high").html(forecast.high + "&deg;");
      $(dayId + " .low").html(forecast.low + "&deg;");
    }
  }
  
  function handleSimpleWeatherError(error) {
    container.html(error);
  }
  
  function handleGetCurrentPositionError(error) {
    container.html("Could not get current position: " + error.message);
  }
  
  $("input[name='unit']").click(function () {
    // only update temperatures if unit is different
    if (unit !== this.value) {
      unit = this.value;
      setCurrentTemperature();
      setForecast();
    }
  });
  
});