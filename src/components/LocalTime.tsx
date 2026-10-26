// The visitor's city, time and weather right now, e.g. "Paris · 14:32 · ☀️ 24°".
// No location permission is asked: the browser already knows the visitor's time zone
// (like "Europe/Paris"), and the city is read from its name. It's approximate: someone
// in Lyon shares Paris's time zone, so they see Paris.
// The weather comes from Open-Meteo (open-meteo.com): free, no account or API key needed.

import { useEffect, useState } from 'react'

interface Weather {
  city: string
  temperature: number
  icon: string
  label: string
}

// Open-Meteo describes the sky with a number (a "WMO weather code"). This turns it into an emoji.
// Night gets a moon instead of a sun.
function weatherIcon(code: number, isDay: boolean): { icon: string; label: string } {
  if (code === 0) return { icon: isDay ? '☀️' : '🌙', label: 'Clear' }
  if (code <= 2) return { icon: isDay ? '🌤️' : '☁️', label: 'Partly cloudy' }
  if (code === 3) return { icon: '☁️', label: 'Cloudy' }
  if (code <= 48) return { icon: '🌫️', label: 'Fog' }
  if (code <= 67 || (code >= 80 && code <= 82)) return { icon: '🌧️', label: 'Rain' }
  if (code <= 77 || code === 85 || code === 86) return { icon: '❄️', label: 'Snow' }
  return { icon: '⛈️', label: 'Thunderstorm' }
}

// The visitor's time zone, e.g. "America/New_York". Their time is shown in it.
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

// Some browsers still use a city's old name in the time zone ("Asia/Calcutta").
const renamedCities: Record<string, string> = {
  Calcutta: 'Kolkata',
  Saigon: 'Ho Chi Minh City',
  Kiev: 'Kyiv',
  Rangoon: 'Yangon',
  Katmandu: 'Kathmandu',
}

// "America/New_York" -> "New York". Zones like "UTC" or "Etc/GMT+2" aren't cities: then ''.
const zoneName = timeZone.includes('/') && !timeZone.startsWith('Etc/')
  ? timeZone.split('/').pop()!.replaceAll('_', ' ')
  : ''
const zoneCity = renamedCities[zoneName] ?? zoneName

const timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })

// How far a time zone is from UTC right now, e.g. "GMT+05:30".
function utcOffset(zone: string): string {
  return new Intl.DateTimeFormat('en', { timeZone: zone, timeZoneName: 'longOffset' })
    .formatToParts()
    .find((part) => part.type === 'timeZoneName')!.value
}

// City name -> coordinates -> current weather.
async function loadWeather(signal: AbortSignal): Promise<Weather | null> {
  if (!zoneCity) return null

  const search = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(zoneCity)}&count=10`,
    { signal },
  ).then((response) => response.json())
  // Many places share a name (there's a New York in the UK too), so keep the one in the visitor's time zone.
  // Some zones have an old name ("Asia/Calcutta" is now "Asia/Kolkata"): then any place whose
  // clock reads the same as the visitor's will do.
  const results: { timezone: string; name: string; latitude: number; longitude: number }[] =
    search.results ?? []
  const place =
    results.find((result) => result.timezone === timeZone) ??
    results.find((result) => utcOffset(result.timezone) === utcOffset(timeZone))
  if (!place) return null

  const forecast = await fetch(
    'https://api.open-meteo.com/v1/forecast' +
      `?latitude=${place.latitude}&longitude=${place.longitude}` +
      '&current=temperature_2m,weather_code,is_day',
    { signal },
  ).then((response) => response.json())
  const current = forecast.current

  return {
    city: place.name,
    temperature: Math.round(current.temperature_2m),
    ...weatherIcon(current.weather_code, current.is_day === 1),
  }
}

function LocalTime() {
  const [now, setNow] = useState(() => new Date())
  // Stays null until the weather arrives (or if it can't be found): then only the time shows.
  const [weather, setWeather] = useState<Weather | null>(null)

  // Update the clock every 15 seconds, so it's never more than a few seconds behind.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15_000)
    return () => clearInterval(timer)
  }, [])

  // Load the weather once when the page opens.
  useEffect(() => {
    const controller = new AbortController()
    loadWeather(controller.signal)
      .then(setWeather)
      .catch(() => {
        // ignore: offline or the service is down, the time still shows
      })
    // If the navbar disappears before the answer arrives, cancel the request.
    return () => controller.abort()
  }, [])

  const time = timeFormat.format(now)

  return (
    <span
      className="navbar__local"
      title={weather ? `${weather.city}: ${weather.label}, ${weather.temperature}°C` : 'Your time'}
    >
      {weather ? `${weather.city} · ${time} · ${weather.icon} ${weather.temperature}°` : time}
    </span>
  )
}

export default LocalTime
