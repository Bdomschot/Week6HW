const citiesEl = $('#cities');
const btnCities = $('#btn-search');
const cityListEL = $('#cities-list');
const cityInfoEl = $('#city-info');
const forecastEl = $('#forecast');
const APIKey = "326465b7678dc0e5adf9892d585c4060";

var lastCityDisplay;

 searchCity = e =>{
    e.preventDefault();
    var city = citiesEl.val().toLowerCase();
    getWeather(city);
}

getWeather = (city) =>{
  
    const queryURL = "https://api.openweathermap.org/data/2.5/forecast?q="+ city +"&appid=" + APIKey;
    
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response){
        console.log(response);
        findUvIndex(response.city.coord.lat, response.city.coord.lon, response);
    });
}

findUvIndex = (lat, lon, object) => {
    
    var queryURL = "https://api.openweathermap.org/data/2.5/uvi?lat="+ lat +"&lon="+lon +"&appid=" + APIKey;
    
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response){
        console.log(response);
        var value = response.value;
        console.log("UVINDEX: "+value);
        firstResponse(object,value);
    });
    
}
firstResponse = (object,value) =>{
    let cityName = object.city.name;
    let cityHum = [];
    let cityTemp = [];
    let cityIcon = [];
    let citySpeed = [];
    let cityDate = [];
    console.log(object)
    
    for(let i = 0; i < 5; i++){
        cityHum.push(object.list[i].main.humidity);
        cityTemp.push(toFahrenheit(object.list[i].main.temp));
        cityIcon.push("http://openweathermap.org/img/w/" + object.list[i].weather[0].icon + ".png");
        citySpeed.push(object.list[i].wind.speed);
        cityDate.push(date(i));
    }

    setToLocalStorage(cityName);

    lastCityDisplay = cityName;
    localStorage.setItem('lastCityDisplay', JSON.stringify(lastCityDisplay));

    displayCityList();
    displayCityInfo(cityName, cityHum, cityTemp, cityIcon, citySpeed,cityDate, value);
    displayForecast(cityHum, cityTemp, cityIcon, cityDate);

    lastCityDisplay = cityName;
    localStorage.setItem('lastCityDisplay', JSON.stringify(lastCityDisplay));
}

displayCityList = () => {
    cityListEL.empty();

    let jsonCitiesArray = getDataFromLocalStorage();
    if(jsonCitiesArray == null){return};
    for( let i = 0; i < jsonCitiesArray.length; i++){
        let cityTitle = $('<li>').addClass('list-group-item')
                                 .attr('data-city', jsonCitiesArray[i])
                                 .attr('data-index', i)
                                 .text(jsonCitiesArray[i]);
        cityListEL.prepend(cityTitle);
    } 
}

cityHistory = event =>{
    event.preventDefault();
    let city = $(event.target).data('city').toLowerCase()
    getWeather(city);
   
    lastCityDisplay = $(event.target).data('city');

    localStorage.setItem('lastCityDisplay', JSON.stringify(lastCityDisplay));
}

displayCityInfo = (cityName, cityHum, cityTemp, cityIcon, citySpeed,cityDate, uvIndex) =>{
   
        cityInfoEl.empty();
            const title = $("<h3>").text(cityName + " " +"(" +cityDate[0]+")");
            const temp = $("<p>").text("Temperature: "+cityTemp[0] + " F");
            const hum = $("<p>").text("Humidity: "+ cityHum[0] + "%");
            const windSpeed = $('<p>').text("Wind Speed: " + citySpeed[0] + " MPH");
            const icon = $('<img>').attr('src', cityIcon[0]);  
            const uv = $('<p>').text("UV Index: "+ uvIndex).addClass(checkUVIndexValue(uvIndex));        
            cityInfoEl.append(title,temp,hum, windSpeed, icon, uv);

}

displayForecast = (cityHum, cityTemp, cityIcon, cityDate) =>{
    forecastEl.empty();
    for( let j = 0; j < 5; j++){
        const forecastDiv = $('<div>').addClass('col-12 col-md-2  bg-primary rounded ml-3 mb-3');
        const dateEl = $('<h6>').text(cityDate[j]);
        const iconEl = $('<img>').attr('src',cityIcon[j]);
        const tempEl = $('<p>').text("Temp: "+cityTemp[j]+ "F");
        const humEl = $('<p>').text("Humidity: "+cityHum[j]+"%");

        forecastDiv.append(dateEl,iconEl,tempEl,humEl);
        forecastEl.append(forecastDiv);
        }


}

function setToLocalStorage(cityName){
    let cities  = [];

    if(getDataFromLocalStorage() !== null){
        cities = getDataFromLocalStorage();
        console.log(cities);
    }
    if(checkDoubleSearchCity(cityName)){return};
    cities.push(cityName);

    localStorage.setItem('allTheCitiesSearchedFor', JSON.stringify(cities));
}

toFahrenheit = temp => Math.round((parseInt(temp) - 273.15) * 1.8 + 32);

date = num => moment().add(num,'days').format("MM/DD/YYYY");

getDataFromLocalStorage = () => JSON.parse(localStorage.getItem('allTheCitiesSearchedFor'));

checkDoubleSearchCity = city =>{
    let jsonCitiesArray = getDataFromLocalStorage();
    if(jsonCitiesArray == null){return};
    if(jsonCitiesArray.includes(city)){
        return  true
    }
    else{
        return false;
    }
}



 checkUVIndexValue = index =>{
    index = parseInt(index);
    if(index < 3){
        return " styleUV-index green";
    }
    else if(index >=3 && index <= 5)
    {
        return "styleUV-index yellow";
    }
    else if(index >=6 && index <= 7)
    {
        return "styleUV-index orange";
    }
    else 
    {
        return "styleUV-index red";
    }
}

displayLastCity = () =>{
    if (JSON.parse(localStorage.getItem('lastCityDisplay')) !== null){
    var get = getDataFromLocalStorage();
    lastCityDisplay = JSON.parse(localStorage.getItem('lastCityDisplay'));
    getWeather(lastCityDisplay.toLowerCase());
    }
}

displayCityList();
displayLastCity();


citiesEl.on('submit', searchCity);
btnCities.on('click', searchCity);
cityListEL.on('click', cityHistory);