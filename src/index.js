import dotenv from 'dotenv';
import mustache from 'mustache';
import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import puppeteerService from '../services/puppeteer.service.js';

dotenv.config();

const { OPEN_WEATHER_MAP_KEY, MAP_LAT, MAP_LON, MAP_PART_EXCLUDE } = process.env;
const MUSTACHE_MAIN_DIR = './main.mustache';

let DATA = {
  refresh_date: new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    timeZone: 'America/Costa_Rica',
    hour12: false,
  }),
};

async function setWeatherInformation() {
  try {
    const OPEN_WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${ MAP_LAT }&lon=${ MAP_LON }&exclude=${ MAP_PART_EXCLUDE }&appid=${ OPEN_WEATHER_MAP_KEY }&units=metric`;
    const response = await fetch(OPEN_WEATHER_URL);
    const weatherData = await response.json();

    DATA.city_temperature = Math.round(weatherData.main.temp);
    DATA.city_weather = weatherData.weather[0].description;
    DATA.city_weather_icon = weatherData.weather[0].icon;
    DATA.sun_rise = new Date(weatherData.sys.sunrise * 1000).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Costa_Rica',
      hour12: false,
    });
    DATA.sun_set = new Date(weatherData.sys.sunset * 1000).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Costa_Rica',
      hour12: false,
    });
  } catch (error) {
    console.error('Error fetching weather information:', error);
  }
}

async function generateReadMe() {
  try {
    const template = await fs.readFile(MUSTACHE_MAIN_DIR, 'utf-8');
    const output = mustache.render(template, DATA);
    await fs.writeFile('README.md', output);
  } catch (error) {
    console.error('Error generating README:', error);
  }
}

async function action() {
  try {
    // Fetch Weather
    await setWeatherInformation();

    // Generate README
    await generateReadMe();
  } catch (error) {
    console.error('Error in action function:', error);
  } finally {
    // Close Puppeteer instance
    await puppeteerService.close();
  }
}

void action();
