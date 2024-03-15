import dotenv from 'dotenv';
import mustache from 'mustache';
import fetch from 'node-fetch';
import { readFile, writeFileSync } from 'fs';
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
  }),
};

async function setWeatherInformation() {
  await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${MAP_LAT}&lon=${MAP_LON}&appid=${OPEN_WEATHER_MAP_KEY}&units=metric`
  )
    .then(r => r.json())
    .then(r => {
      DATA.city_temperature = Math.round(r.main.temp);
      DATA.city_weather = r.weather[0].description;
      DATA.city_weather_icon = r.weather[0].icon;
      DATA.sun_rise = new Date(r.sys.sunrise * 1000).toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Costa_Rica',
      });
      DATA.sun_set = new Date(r.sys.sunset * 1000).toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Costa_Rica',
      });
    });
}

async function generateReadMe() {
  await readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = mustache.render(data.toString(), DATA);
    writeFileSync('README.md', output);
  });
}

async function action() {
  /**
   * Fetch Weather
   */
  await setWeatherInformation();

  /**
   * Generate README
   */
  await generateReadMe();

  /**
   * Fermeture de la boutique 👋
   */
  await puppeteerService.close();
}

action();
