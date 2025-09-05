import * as https from 'https';

// Types for our data structures
interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
}

interface NewsItem {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface NewsData {
  posts: NewsItem[];
  total: number;
}


const WEATHER_API_KEY = 'fb9bce8c66477a7ff08ebcc24bfd43f6';
const NEWS_URL = 'https://dummyjson.com/posts?limit=5';

// Get current location
function getCurrentLocation(callback: (error: Error | null, location?: string) => void): void {
  const locationUrl = 'https://ipapi.co/json/';
  //console.log('Fetching user location...\n');
  makeHttpRequest(locationUrl, (error, data) => {
    if (error) {
      console.warn('Location fetch failed, using default location');
      callback(null, 'Pretoria');
      return;
    }

    try {
      const locationData = JSON.parse(data!);
      const city = locationData.city || 'Pretoria';
      console.log(`Detected location: ${city}`);
      callback(null, city);
    } catch (parseError) {
      console.warn('Location parse failed, using default location');
      callback(null, 'Pretoria');
    }
  });
}

// Callback-based HTTP request function
function makeHttpRequest(url: string, callback: (error: Error | null, data?: string) => void): void {
  const request = https.get(url, (response) => {
    let data = '';
    
    response.on('data', (chunk) => {
      data += chunk;
    });
    
    response.on('end', () => {
      if (response.statusCode === 200) {
        callback(null, data);
      } else {
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
function fetchWeatherCallback(callback: (error: Error | null, weather?: WeatherData) => void): void {
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
        const weatherResponse = JSON.parse(data!);
        const weatherData: WeatherData = {
          location: weatherResponse.name,
          temperature: Math.round(weatherResponse.main.temp),
          description: weatherResponse.weather[0].description,
          humidity: weatherResponse.main.humidity
        };
        callback(null, weatherData);
      } catch (parseError) {
        callback(new Error(`Weather Data Parse Error: ${parseError}`));
      }
    });
  });
}

// Fetch news data
function fetchNewsCallback(callback: (error: Error | null, news?: NewsData) => void): void {
  console.log('Fetching news data...\n');
  
  makeHttpRequest(NEWS_URL, (error, data) => {
    if (error) {
      callback(new Error(`News API Error: ${error.message}`));
      return;
    }
    
    try {
      const newsResponse = JSON.parse(data!);
      callback(null, newsResponse);
    } catch (parseError) {
      callback(new Error(`News Data Parse Error: ${parseError}`));
    }
  });
}

// Display functions
function displayWeather(weather: WeatherData): void {
  console.log('\nWEATHER INFORMATION:');
  console.log('========================');
  console.log(`Location: ${weather.location}`);
  console.log(`Temperature: ${weather.temperature}°C`);
  console.log(`Description: ${weather.description}`);
  console.log(`Humidity: ${weather.humidity}%`);
}

function displayNews(news: NewsData): void {
  console.log('\nLATEST NEWS HEADLINES:');
  console.log('==========================');
  news.posts.slice(0, 3).forEach((post, index) => {
    console.log(`${index + 1}. ${post.title}`);
    console.log(`   ${post.body.substring(0, 100)}...`);
    console.log('');
  });
}

function displayError(context: string, error: Error): void {
console.error(`\n ERROR in ${context}:`);
  console.error(`   ${error.message}`);
}

function runSingleUpdate(): void {
  console.log('CALLBACK VERSION - Weather and News Update\n');
  console.log('====================================================\n');

  let weatherResult: WeatherData | null = null;
  let newsResult: NewsData | null = null;
  let weatherError: Error | null = null;
  let newsError: Error | null = null;
  let completedCalls = 0;

  const checkCompletion = () => {
    completedCalls++;
    if (completedCalls === 2) {
      if (weatherError && newsError) {
        console.log('\nBoth API calls failed!');
        displayError('Weather', weatherError);
        displayError('News', newsError);
      } else if (weatherError) {
        console.log('\n Weather failed but news succeeded');
        displayError('Weather', weatherError);
        displayNews(newsResult!);
      } else if (newsError) {
        console.log('\nNews failed but weather succeeded');
        displayWeather(weatherResult!);
        displayError('News', newsError);
      } else {
        console.log('\nBoth API calls completed successfully!');
        displayWeather(weatherResult!);
        displayNews(newsResult!);
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
    }, 3000)
}
