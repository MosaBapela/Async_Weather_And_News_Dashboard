"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const https = __importStar(require("https"));
const WEATHER_API_KEY = 'fb9bce8c66477a7ff08ebcc24bfd43f6';
const NEWS_URL = 'https://dummyjson.com/posts?limit=5';
// Get current location
function getCurrentLocation(callback) {
    const locationUrl = 'https://ipapi.co/json/';
    //console.log('Fetching user location...\n');
    makeHttpRequest(locationUrl, (error, data) => {
        if (error) {
            console.warn('Location fetch failed, using default location');
            callback(null, 'Pretoria');
            return;
        }
        try {
            const locationData = JSON.parse(data);
            const city = locationData.city || 'Pretoria';
            console.log(`Detected location: ${city}`);
            callback(null, city);
        }
        catch (parseError) {
            console.warn('Location parse failed, using default location');
            callback(null, 'Pretoria');
        }
    });
}
// Callback-based HTTP request function
function makeHttpRequest(url, callback) {
    const request = https.get(url, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            if (response.statusCode === 200) {
                callback(null, data);
            }
            else {
                callback(new Error(`HTTP Error: ${response.statusCode}`));
            }
        });
    });
    request.on('error', (error) => {
        callback(error);
    });
    request.setTimeout(5000, () => {
        request.destroy();
        callback(new Error('Request timeout'));
    });
}
// Fetch weather data
function fetchWeatherCallback(callback) {
    console.log('Fetching weather data...\n');
    getCurrentLocation((locationError, location) => {
        if (locationError) {
            callback(new Error(`Location Error: ${locationError.message}`));
            return;
        }
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${WEATHER_API_KEY}&units=metric`;
        makeHttpRequest(weatherUrl, (error, data) => {
            if (error) {
                callback(new Error(`Weather API Error: ${error.message}`));
                return;
            }
            try {
                const weatherResponse = JSON.parse(data);
                const weatherData = {
                    location: weatherResponse.name,
                    temperature: Math.round(weatherResponse.main.temp),
                    description: weatherResponse.weather[0].description,
                    humidity: weatherResponse.main.humidity
                };
                callback(null, weatherData);
            }
            catch (parseError) {
                callback(new Error(`Weather Data Parse Error: ${parseError}`));
            }
        });
    });
}
// Fetch news data
function fetchNewsCallback(callback) {
    console.log('Fetching news data...\n');
    makeHttpRequest(NEWS_URL, (error, data) => {
        if (error) {
            callback(new Error(`News API Error: ${error.message}`));
            return;
        }
        try {
            const newsResponse = JSON.parse(data);
            callback(null, newsResponse);
        }
        catch (parseError) {
            callback(new Error(`News Data Parse Error: ${parseError}`));
        }
    });
}
// Display functions
function displayWeather(weather) {
    console.log('\nWEATHER INFORMATION:');
    console.log('========================');
    console.log(`Location: ${weather.location}`);
    console.log(`Temperature: ${weather.temperature}°C`);
    console.log(`Description: ${weather.description}`);
    console.log(`Humidity: ${weather.humidity}%`);
}
function displayNews(news) {
    console.log('\nLATEST NEWS HEADLINES:');
    console.log('==========================');
    news.posts.slice(0, 3).forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   ${post.body.substring(0, 100)}...`);
        console.log('');
    });
}
function displayError(context, error) {
    console.error(`\n ERROR in ${context}:`);
    console.error(`   ${error.message}`);
}
function runSingleUpdate() {
    console.log('CALLBACK VERSION - Weather and News Update\n');
    console.log('====================================================\n');
    let weatherResult = null;
    let newsResult = null;
    let weatherError = null;
    let newsError = null;
    let completedCalls = 0;
    const checkCompletion = () => {
        completedCalls++;
        if (completedCalls === 2) {
            if (weatherError && newsError) {
                console.log('\nBoth API calls failed!');
                displayError('Weather', weatherError);
                displayError('News', newsError);
            }
            else if (weatherError) {
                console.log('\n Weather failed but news succeeded');
                displayError('Weather', weatherError);
                displayNews(newsResult);
            }
            else if (newsError) {
                console.log('\nNews failed but weather succeeded');
                displayWeather(weatherResult);
                displayError('News', newsError);
            }
            else {
                console.log('\nBoth API calls completed successfully!');
                displayWeather(weatherResult);
                displayNews(newsResult);
            }
        }
    };
    fetchWeatherCallback((error, data) => {
        weatherError = error;
        weatherResult = data || null;
        checkCompletion();
    });
    fetchNewsCallback((error, data) => {
        newsError = error;
        newsResult = data || null;
        checkCompletion();
    });
    console.log('Callback requests initiated...\n');
}
if (require.main === module) {
    setTimeout(() => {
        runSingleUpdate();
    }, 3000);
}
