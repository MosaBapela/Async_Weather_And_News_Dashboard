# Async Weather and News Dashboard

A TypeScript project demonstrating different asynchronous programming patterns (callbacks, promises, and async/await) for fetching weather and news data from external APIs.

## Features

- Fetches current weather data based on user's location
- Retrieves latest news headlines
- Demonstrates three async patterns: callbacks, promises, and async/await
- Error handling for API failures
- Console-based output with formatted display


## Tech Stack

- TypeScript
- Node.js
- OpenWeatherMap API
- DummyJSON API for news

## How to use

### Clone the repo
```bash
git clone https://github.com/MosaBapela/Async_Weather_And_News_Dashboard.git
```

### Install dependencies
```bash
npm install
npm init -y
npm i typescript ts-node @types/node
npm i -D nodemon
npx tsc --init
```


### Start the dev server
Build the project first:
```bash
npm run build
```

Then run one of the versions:
- Async/Await version: `npm run async`
- Promise version: `npm run promise`
- Callback version: `npm run callback`




