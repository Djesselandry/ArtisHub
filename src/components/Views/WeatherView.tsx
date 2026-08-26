import React, { useState, useEffect, useCallback } from 'react';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  ChevronDown,
  RefreshCw,
  MapPin,
} from 'lucide-react';

interface City {
  name: string;
  lat: number;
  lon: number;
}

const BURUNDI_CITIES: City[] = [
  { name: 'Bujumbura', lat: -3.3731, lon: 29.3644 },
  { name: 'Gitega', lat: -3.4271, lon: 29.9246 },
  { name: 'Muyinga', lat: -2.8459, lon: 30.3413 },
  { name: 'Ngozi', lat: -2.9075, lon: 29.8307 },
  { name: 'Ruyigi', lat: -3.4764, lon: 30.2486 },
  { name: 'Kayanza', lat: -2.9222, lon: 29.6292 },
  { name: 'Muramvya', lat: -3.2614, lon: 29.6083 },
  { name: 'Rutana', lat: -3.8733, lon: 30.0933 },
  { name: 'Bururi', lat: -3.9487, lon: 29.6244 },
  { name: 'Makamba', lat: -4.1348, lon: 29.8039 },
  { name: 'Cibitoke', lat: -2.8868, lon: 29.1248 },
  { name: 'Kirundo', lat: -2.5847, lon: 30.0958 },
  { name: 'Mwaro', lat: -3.5161, lon: 29.7125 },
  { name: 'Bubanza', lat: -2.9394, lon: 29.3756 },
  { name: 'Cankuzo', lat: -3.2189, lon: 30.5483 },
];

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  visibility: number;
  isDay: boolean;
  hourly: {
    time: string[];
    temperature: number[];
    weatherCode: number[];
    precipitation: number[];
  };
  daily: {
    time: string[];
    tempMax: number[];
    tempMin: number[];
    weatherCode: number[];
    precipitationSum: number[];
  };
}

const getWeatherIcon = (code: number, isDay: boolean = true, size: string = 'w-6 h-6') => {
  if (code <= 1) return <Sun className={`${size} ${isDay ? 'text-yellow-400' : 'text-blue-300'}`} />;
  if (code <= 3) return <Cloud className={`${size} text-gray-400`} />;
  if (code <= 49) return <CloudFog className={`${size} text-gray-400`} />;
  if (code <= 59) return <CloudDrizzle className={`${size} text-blue-400`} />;
  if (code <= 69) return <CloudRain className={`${size} text-blue-500`} />;
  if (code <= 79) return <CloudSnow className={`${size} text-white`} />;
  if (code <= 82) return <CloudRain className={`${size} text-blue-600`} />;
  if (code <= 99) return <CloudLightning className={`${size} text-yellow-500`} />;
  return <Cloud className={`${size} text-gray-400`} />;
};

const getWeatherLabel = (code: number): string => {
  if (code === 0) return 'Ciel dégagé';
  if (code <= 3) return 'Partiellement nuageux';
  if (code <= 49) return 'Brouillard';
  if (code <= 59) return 'Bruine';
  if (code <= 69) return 'Pluie';
  if (code <= 79) return 'Neige';
  if (code <= 82) return 'Averses';
  if (code <= 99) return 'Orage';
  return 'Inconnu';
};

const getDayName = (dateStr: string, index: number): string => {
  if (index === 0) return "Aujourd'hui";
  if (index === 1) return 'Demain';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { weekday: 'short' });
};

export const WeatherView: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<City>(BURUNDI_CITIES[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeather = useCallback(async (city: City) => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day,visibility&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Africa/Bujumbura&forecast_days=7`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erreur lors de la récupération des données météo.');
      const data = await res.json();

      setWeather({
        temperature: data.current.temperature_2m,
        feelsLike: data.current.apparent_temperature,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        weatherCode: data.current.weather_code,
        visibility: data.current.visibility,
        isDay: data.current.is_day === 1,
        hourly: {
          time: data.hourly.time.slice(0, 24),
          temperature: data.hourly.temperature_2m.slice(0, 24),
          weatherCode: data.hourly.weather_code.slice(0, 24),
          precipitation: data.hourly.precipitation_probability.slice(0, 24),
        },
        daily: {
          time: data.daily.time,
          tempMax: data.daily.temperature_2m_max,
          tempMin: data.daily.temperature_2m_min,
          weatherCode: data.daily.weather_code,
          precipitationSum: data.daily.precipitation_sum,
        },
      });
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Impossible de charger la météo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(selectedCity);
  }, [selectedCity, fetchWeather]);

  const now = new Date();
  const currentHourIndex = now.getHours();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#e5e1e4] flex items-center gap-2">
            <Cloud className="w-7 h-7 text-[#5de6ff]" />
            Météo temps réel
          </h1>
          <p className="text-sm text-[#cfc2d6]/60 mt-1">Burundi — données en direct via Open-Meteo</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchWeather(selectedCity)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#cfc2d6] hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* City Selector */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#1b1b1d] border border-white/10 hover:border-[#5de6ff]/50 transition-all w-full sm:w-auto"
        >
          <MapPin className="w-4 h-4 text-[#5de6ff]" />
          <span className="text-sm font-bold text-[#e5e1e4]">{selectedCity.name}</span>
          <ChevronDown className={`w-4 h-4 text-[#cfc2d6]/60 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-[#1b1b1d] border border-white/10 rounded-2xl shadow-2xl p-2 z-30 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {BURUNDI_CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => {
                  setSelectedCity(city);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                  selectedCity.name === city.name
                    ? 'bg-[#5de6ff]/15 text-[#5de6ff] font-medium'
                    : 'text-[#cfc2d6] hover:bg-white/5'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 opacity-50" />
                {city.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && !weather && (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-[#5de6ff] animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-950/50 border border-red-500/40 text-red-300 text-sm text-center">
          {error}
        </div>
      )}

      {/* Weather Content */}
      {weather && !loading && (
        <>
          {/* Main Current Weather Card */}
          <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-white/10 ${
            weather.isDay
              ? 'bg-gradient-to-br from-[#1a2a4a] to-[#0d1b2a]'
              : 'bg-gradient-to-br from-[#0e0e18] to-[#1a1a2e]'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-[#5de6ff]" />
                  <span className="text-sm text-[#cfc2d6]/70">{selectedCity.name}, Burundi</span>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-6xl sm:text-7xl font-bold text-[#e5e1e4] leading-none">
                    {Math.round(weather.temperature)}°
                  </span>
                  <div className="pb-2">
                    {getWeatherIcon(weather.weatherCode, weather.isDay, 'w-12 h-12')}
                  </div>
                </div>
                <p className="text-sm text-[#cfc2d6]/80 mt-2">{getWeatherLabel(weather.weatherCode)}</p>
                <p className="text-xs text-[#cfc2d6]/50 mt-1">
                  Ressenti {Math.round(weather.feelsLike)}°
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center">
                  <Droplets className="w-5 h-5 text-[#5de6ff] mx-auto mb-1" />
                  <div className="text-lg font-bold text-[#e5e1e4]">{weather.humidity}%</div>
                  <div className="text-[10px] text-[#cfc2d6]/50 uppercase tracking-wider">Humidité</div>
                </div>
                <div className="text-center">
                  <Wind className="w-5 h-5 text-[#5de6ff] mx-auto mb-1" />
                  <div className="text-lg font-bold text-[#e5e1e4]">{Math.round(weather.windSpeed)}</div>
                  <div className="text-[10px] text-[#cfc2d6]/50 uppercase tracking-wider">km/h</div>
                </div>
                <div className="text-center">
                  <Eye className="w-5 h-5 text-[#5de6ff] mx-auto mb-1" />
                  <div className="text-lg font-bold text-[#e5e1e4]">{(weather.visibility / 1000).toFixed(1)}</div>
                  <div className="text-[10px] text-[#cfc2d6]/50 uppercase tracking-wider">km visibilité</div>
                </div>
              </div>
            </div>
            {lastUpdated && (
              <div className="text-[10px] text-[#cfc2d6]/40 mt-4">
                Mis à jour à {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>

          {/* Hourly Forecast */}
          <div className="rounded-3xl bg-[#1b1b1d] border border-white/10 p-5 sm:p-6">
            <h3 className="text-sm font-bold text-[#e5e1e4] mb-4 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-[#5de6ff]" />
              Prévisions horaires (24h)
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {weather.hourly.time.map((time, i) => {
                const hour = new Date(time).getHours();
                const isNow = i === 0;
                return (
                  <div
                    key={time}
                    className={`flex-shrink-0 flex flex-col items-center gap-2 px-3 py-3 rounded-2xl min-w-[60px] transition-all ${
                      isNow
                        ? 'bg-[#5de6ff]/15 border border-[#5de6ff]/30'
                        : 'bg-white/[0.03] border border-white/5'
                    }`}
                  >
                    <span className={`text-[10px] font-mono ${isNow ? 'text-[#5de6ff] font-bold' : 'text-[#cfc2d6]/60'}`}>
                      {isNow ? 'Maint.' : `${hour}h`}
                    </span>
                    {getWeatherIcon(weather.hourly.weatherCode[i], hour >= 6 && hour < 18, 'w-5 h-5')}
                    <span className="text-sm font-bold text-[#e5e1e4]">{Math.round(weather.hourly.temperature[i])}°</span>
                    {weather.hourly.precipitation[i] > 0 && (
                      <span className="text-[9px] text-blue-400">{weather.hourly.precipitation[i]}%</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className="rounded-3xl bg-[#1b1b1d] border border-white/10 p-5 sm:p-6">
            <h3 className="text-sm font-bold text-[#e5e1e4] mb-4 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-[#5de6ff]" />
              Prévisions 7 jours
            </h3>
            <div className="space-y-2">
              {weather.daily.time.map((date, i) => (
                <div
                  key={date}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl ${
                    i === 0 ? 'bg-[#5de6ff]/10 border border-[#5de6ff]/20' : 'bg-white/[0.02]'
                  }`}
                >
                  <span className="text-sm text-[#cfc2d6] w-20 flex-shrink-0">{getDayName(date, i)}</span>
                  <div className="flex-shrink-0">{getWeatherIcon(weather.daily.weatherCode[i], true, 'w-5 h-5')}</div>
                  <span className="text-xs text-[#cfc2d6]/60 w-24 flex-shrink-0 hidden sm:block">
                    {getWeatherLabel(weather.daily.weatherCode[i])}
                  </span>
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm font-bold text-[#e5e1e4]">{Math.round(weather.daily.tempMax[i])}°</span>
                    <span className="text-sm text-[#cfc2d6]/50">{Math.round(weather.daily.tempMin[i])}°</span>
                  </div>
                  {weather.daily.precipitationSum[i] > 0 && (
                    <span className="text-[10px] text-blue-400 flex-shrink-0">{weather.daily.precipitationSum[i]}mm</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-[10px] text-[#cfc2d6]/30 pb-4">
            Données météo fournies par Open-Meteo — Creative Commons BY 4.0
          </div>
        </>
      )}
    </div>
  );
};
