# MMM-AnimatedCountdowns

A MagicMirror² module for displaying animated countdown timers with celebration effects when your events arrive!

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![MagicMirror²](https://img.shields.io/badge/MagicMirror²-v2.20.0+-brightgreen.svg)

## Features

- **Four Counter Styles** - Flip clock, progress rings, animated hourglass & digital clock
- **Celebration Animation** - Customizable falling emoji particles when your event arrives
- **Arrival Glow Effect** - Counter boxes pulse with a glowing effect when countdown reaches zero
- **Responsive Scaling** - Automatically scales to fit any MagicMirror region width
- **Grayscale Mode** - Inverted grayscale option for classic MagicMirror aesthetic

## Screenshots

### All Four Counter Styles
`flip` *(with celebration animation),* `rings`*,* `hourglass` *and* `digital`, *each with its own personality.*

![All Counter Styles](screenshots/hero-all-styles-clean.gif)

## Installation

1. Navigate to your MagicMirror modules folder:
```bash
cd ~/MagicMirror/modules
```

2. Clone this repository:
```bash
git clone https://github.com/ElliAndDad/MMM-AnimatedCountdowns.git
```

3. Install emoji font (required for icons and celebration emojis):
```bash
sudo apt install fonts-noto-color-emoji
```

## Update

To update the module to the latest version:

```bash
cd ~/MagicMirror/modules/MMM-AnimatedCountdowns
git pull
```

Then restart MagicMirror to apply changes.

## Configuration

Add the module to your `config/config.js` file. Copy the config below and customize it to your needs:

```javascript
{
    module: "MMM-AnimatedCountdowns",
    position: "top_left",
    config: {
        // Global settings
        colorMode: true,                                // false = grayscale (inverted for MagicMirror)
        showPassedEventsForHours: 24,                   // Hours to show event after it passes

        // Add your events here
        events: [
            {
                name: "Christmas!",                     // Event display name (required)
                date: "2026-12-25",                     // Target date YYYY-MM-DD (required)
                time: null,                             // Target time HH:MM or HH:MM:SS
                icon: "🎄",                             // Emoji icon (null to hide)
                counterStyle: "flip",                   // "digital", "rings", "flip", or "hourglass"
                textColor: "#ff0000",                   // Event name color
                accentColor: "#00ff00",                 // Ring/glow accent color
                counterTextColor: "#ffffff",            // Counter numbers color
                celebrateOnDay: true,                   // Show celebration animation
                celebrationEmojis: ["🎄", "🎅", "⭐"]   // Custom emojis for this event
            },
            {
                name: "New Year!",
                date: "2027-01-01",
                time: "00:00",
                icon: "🥂",
                counterStyle: "flip",
                textColor: "#ffd700",
                accentColor: "#ffd700"
            }
        ]
    }
},
```

## Configuration Options

### Global Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `colorMode` | Boolean | `true` | `true` = full color, `false` = grayscale (inverted for MagicMirror display) |
| `showPassedEventsForHours` | Integer | `24` | Hours to continue showing event after countdown reaches zero |
| `updateInterval` | Integer | `1000` | Countdown update frequency in milliseconds |
| `defaultCelebrationEmojis` | Array | `["🎉", "🌟", "🾓"]` | Default celebration emojis (when not specified per-event) |
| `celebrationParticleCount` | Integer | `30` | Number of particles in celebration animation |
| `events` | Array | *required* | Array of event objects (see below) |

### Event Object Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | String | Yes | Display name for the event |
| `date` | String | Yes | Target date: `YYYY-MM-DD` |
| `time` | String | No | Target time: `HH:MM` or `HH:MM:SS` |
| `icon` | String | No | Emoji to display above the event name (omit or set to `null` to hide) |
| `counterStyle` | String | No | Counter style: `"digital"`, `"rings"`, `"flip"` (default), or `"hourglass"` |
| `textColor` | String | No | Text color (hex) for the event name. Default: `#ffd700` (gold) |
| `accentColor` | String | No | Accent color (hex) for ring progress indicators and arrival glow effect. Default: `#ffd700` (gold) |
| `counterTextColor` | String | No | Color (hex) for counter numbers and labels. Default: `#ffffff` (white) |
| `celebrateOnDay` | Boolean | No | Show celebration animation when event arrives (default: `true`) |
| `celebrationEmojis` | Array | No | Custom emojis for this event's celebration |

### Counter Styles

| Value | Description |
|-------|-------------|
| `"flip"` | Classic flip clock with animated digits **(default)** |
| `"digital"` | Numeric boxes |
| `"rings"` | Circular progress rings |
| `"hourglass"` | Draining hourglass with flip animation |

## How It Works

1. **Before the event**: Shows a countdown with your chosen counter style
2. **When event arrives**: Countdown shows all zeros with a pulsing glow effect, celebration animation begins with falling emojis
3. **After 24 hours**: Event automatically hides (configurable with `showPassedEventsForHours`)

## Customization

### Responsive Scaling

The module automatically scales to fit the width of your MagicMirror region. Place it in a narrow column and it stays compact; place it in a wider region and everything scales up proportionally - icons, text, counters, and spacing all adjust automatically.

### Custom Celebration Emojis

You can customize the falling emojis for each event:

```javascript
{
    name: "Halloween Party",
    date: "2026-10-31",
    icon: "🎃",
    textColor: "#ff6600",
    accentColor: "#ff6600",
    celebrationEmojis: ["🎃", "👻", "🦇", "🕷️", "💀"]
}
```

### Disabling Celebration Animation

If you prefer a simple display without the celebration animation:

```javascript
{
    name: "Quiet Event",
    date: "2026-08-01",
    celebrateOnDay: false
}
```

## Troubleshooting

### Emojis showing as blank squares
Make sure you completed installation step 3 (installing the emoji font):
```bash
sudo apt install fonts-noto-color-emoji
```
Then restart MagicMirror.

### Module not appearing
- Check that the module name in `config.js` matches exactly: `"MMM-AnimatedCountdowns"`
- Verify the position is valid (e.g., `"top_left"`)
- Check the browser console for JavaScript errors

### Events not showing
- Verify your date format is correct (`YYYY-MM-DD`)
- Check that event dates are in the future
- Events automatically hide 24 hours after they pass

### Celebration not showing
- Make sure `celebrateOnDay` is set to `true`
- Check that the event date/time has actually passed

### Glow effect not visible
- The glow uses the `accentColor` property - make sure it's set to a visible color
- The glow only appears when the countdown reaches zero

### Module displays incorrectly on older systems
- This module uses CSS Container Queries which require a modern browser. 
- Make sure your MagicMirror is running on Electron 105+ or a current Chromium-based browser.

## License

MIT License - see [LICENSE](LICENSE.md) file for details.