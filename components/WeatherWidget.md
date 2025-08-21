# Weather Widget Component

This is a standalone weather widget component that displays current weather and a 3-day forecast. When clicked, it opens a satellite weather view.

## Features

- Current temperature, weather condition, feels-like temperature, and humidity
- 3-day weather forecast
- Click to open Earth Nullschool satellite view
- Fully responsive design
- Loading states
- Customizable location and API settings

## Setup

### 1. Get an OpenWeatherMap API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Generate an API key from your account dashboard

### 2. Add API Key to Environment Variables

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
```

## Usage

### Basic Usage

```tsx
import WeatherWidget from '@/components/WeatherWidget'

export default function MyPage() {
  return (
    <div className="p-6">
      <WeatherWidget />
    </div>
  )
}
```

### Custom Location

```tsx
<WeatherWidget 
  city="Miami"
  lat={25.7617}
  lon={-80.1918}
/>
```

### Custom Satellite URL

```tsx
<WeatherWidget 
  satelliteUrl="https://www.windy.com/"
/>
```

### With Close Button

```tsx
<WeatherWidget 
  onClose={() => console.log('Widget closed')}
/>
```

### Full Example with All Props

```tsx
<WeatherWidget 
  city="New York"
  lat={40.7128}
  lon={-74.0060}
  apiKey="your_api_key" // Optional if using env variable
  satelliteUrl="https://earth.nullschool.net/"
  onClose={() => setShowWeather(false)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| city | string | "Fort Myers" | Display name of the city |
| lat | number | 26.6406 | Latitude for weather data |
| lon | number | -81.8723 | Longitude for weather data |
| apiKey | string | process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY | OpenWeatherMap API key |
| satelliteUrl | string | "https://earth.nullschool.net/" | URL to open when widget is clicked |
| onClose | function | undefined | Callback when close button is clicked |

## Styling

The widget uses Tailwind CSS classes and is designed to work well in both light and dark themes. The widget itself has a dark gray background with white text.

## Alternative Satellite View Options

- **Earth Nullschool**: https://earth.nullschool.net/ (default)
- **Windy**: https://www.windy.com/
- **Ventusky**: https://www.ventusky.com/
- **Weather Underground**: https://www.wunderground.com/wundermap

## Notes

- The free OpenWeatherMap API tier allows 1,000 calls per day
- Weather data is fetched on component mount and when location props change
- The widget shows a loading spinner while fetching data
- If no API key is provided, the widget will show default/mock data