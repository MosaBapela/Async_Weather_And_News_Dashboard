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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const https = __importStar(require("https"));
const WEATHER_API_KEY = 'fb9bce8c66477a7ff08ebcc24bfd43f6';
const NEWS_URL = 'https://dummyjson.com/posts?limit=5';
// Get current location 
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        const locationUrl = 'https://ipapi.co/json/';
        console.log('Fetching user location...');
        makeHttpRequest(locationUrl)
            .then((data) => {
            try {
                const locationData = JSON.parse(data);
                const city = locationData.city || 'Pretoria';
                console.log(`Detected location: ${city}`);
                resolve(city);
            }
            catch (parseError) {
                console.warn('Location parse failed, using default location');
                resolve('Pretoria');
            }
        })
            .catch((error) => {
            console.warn('Location fetch failed, using default location');
            resolve('Pretoria');
        });
    });
}
function makeHttpRequest(url) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                if (response.statusCode === 200) {
                    resolve(data);
                }
                else {
                    reject(new Error(`HTTP Error: ${response.statusCode}`));
                }
            });
        });
        request.on('error', (error) => {
            reject(error);
        });
        request.setTimeout(5000, () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
}
// Fetch weather data
function fetchWeatherPromise() {
    console.log('Fetching weather data...');
    return getCurrentLocation()
        .then((location) => {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${WEATHER_API_KEY}&units=metric`;
        return makeHttpRequest(weatherUrl);
    })
        .then((data) => {
        const weatherResponse = JSON.parse(data);
        const weatherData = {
            location: weatherResponse.name,
            temperature: Math.round(weatherResponse.main.temp),
            description: weatherResponse.weather[0].description,
            humidity: weatherResponse.main.humidity
        };
        return weatherData;
    })
        .catch((error) => {
        throw new Error(`Weather API Error: ${error.message}`);
    });
}
// Fetch news data 
function fetchNewsPromise() {
    console.log('Fetching news data...');
    return makeHttpRequest(NEWS_URL)
        .then((data) => {
        const newsResponse = JSON.parse(data);
        return newsResponse;
    })
        .catch((error) => {
        throw new Error(`News API Error: ${error.message}`);
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
    console.error(`\nERROR in ${context}:`);
    console.error(`   ${error.message}`);
}
// Single update function
function runSingleUpdate() {
    console.log('PROMISE VERSION - Single Weather and News Update\n');
    console.log('===================================================\n');
    const weatherPromise = fetchWeatherPromise();
    const newsPromise = fetchNewsPromise();
    return Promise.all([weatherPromise, newsPromise])
        .then(([weatherData, newsData]) => {
        console.log('Both API calls completed successfully!');
        displayWeather(weatherData);
        displayNews(newsData);
        console.log('Single update completed successfully!');
    })
        .catch((error) => {
        displayError('Single Update', error);
        console.log('Single update failed!');
    });
}
// Main promise implementation runner
function runPromiseVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting Promise Version Implementation\n');
        console.log('==========================================\n');
        try {
            yield runSingleUpdate();
            yield runRaceUpdate();
        }
        catch (error) {
            console.error('Unexpected error in promise version:', error);
        }
    });
}
// New function implemnting Promise.race()
function runRaceUpdate() {
    console.log('\nPROMISE VERSION - Promise.race() method\n');
    console.log('==========================================\n');
    const weatherPromise = fetchWeatherPromise();
    const newsPromise = fetchNewsPromise();
    return Promise.race([weatherPromise, newsPromise])
        .then((result) => {
        console.log('Promise.race() resolved with the first completed promise:');
        if ('location' in result) {
            displayWeather(result);
        }
        else if ('posts' in result) {
            displayNews(result);
        }
        else {
            console.log('Unknown result:', result);
        }
        console.log('Promise.race() example completed successfully!');
    })
        .catch((error) => {
        displayError('Promise.race()', error);
        console.log('Promise.race() example failed!');
    });
}
// Run the promise version
if (require.main === module) {
    runPromiseVersion()
        .then(() => {
        console.log('\nPromise version implemntation completed!');
    })
        .catch((error) => {
        console.error('Fatal error in promise version:', error);
    });
}
