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

// API Configuration
const WEATHER_API_KEY = 'fb9bce8c66477a7ff08ebcc24bfd43f6';
const NEWS_URL = 'https://dummyjson.com/posts?limit=5';
const GEOLOCATION_URL = 'https://ipapi.co/json/';

function makeHttpRequest(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        if (response.statusCode === 200) {
          resolve(data);
        } else {
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

// Fetch user's location 
async function fetchUserLocation(): Promise<string> {
  console.log('Fetching user location...');

  try {
    const data = await makeHttpRequest(GEOLOCATION_URL);
    const locationResponse = JSON.parse(data);
    const city = locationResponse.city || 'Pretoria'; 
    console.log(`Detected location: ${city}`);
    return city;
  } catch (error) {
    console.log('Location fetch failed, using default location: Pretoria');
    return 'Pretoria'; 
  }
}

// Fetch weather data
async function fetchWeatherAsync(location: string): Promise<WeatherData> {
  console.log('Fetching weather data...');
  
  try {
    const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${WEATHER_API_KEY}&units=metric`;
    const data = await makeHttpRequest(WEATHER_URL);
    const weatherResponse = JSON.parse(data);
    
    const weatherData: WeatherData = {
      location: weatherResponse.name,
      temperature: Math.round(weatherResponse.main.temp),
      description: weatherResponse.weather[0].description,
      humidity: weatherResponse.main.humidity
    };
    
    return weatherData;
  } catch (error) {
    throw new Error(`Weather API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Fetch news data 
async function fetchNewsAsync(): Promise<NewsData> {
  console.log('Fetching news data...');
  
  try {
    const data = await makeHttpRequest(NEWS_URL);
    const newsResponse = JSON.parse(data);
    return newsResponse;
  } catch (error) {
    throw new Error(`News API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
  console.error(`\nERROR in ${context}:`);
  console.error(`   ${error.message}`);
}



// Single fetch and display function
async function fetchAndDisplayOnce(): Promise<void> {
  console.log('Fetching Weather and News Data\n');
  console.log('=========================================\n');

  try {
    const userLocation = await fetchUserLocation();

    const [weatherData, newsData] = await Promise.all([
      fetchWeatherAsync(userLocation),
      fetchNewsAsync()
    ]);

    console.log('Data fetched successfully!');
    displayWeather(weatherData);
    displayNews(newsData);

  } catch (error) {
    displayError('Single Fetch', error as Error);
    console.log('Failed to fetch data!');
  }
}

// Main async/await runner
async function runAsyncAwaitVersion(): Promise<void> {
  console.log('Starting Async/Await Version Implementation\n');
  console.log('==============================================\n');

  try {
    // Single fetch and display
    await fetchAndDisplayOnce();

  } catch (error) {
    console.error('Unexpected error in async/await version:', error);
  }
}

// Run the async/await version
if (require.main === module) {
  runAsyncAwaitVersion()
    .then(() => {
      console.log('\nAsync/Await version implementation completed!');
    })
    .catch((error) => {
      console.error('Fatal error in async/await version:', error);
    });
}