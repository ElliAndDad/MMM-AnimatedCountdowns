# MMM-AnimatedCountdowns

A MagicMirror² module for displaying animated countdown timers with celebration effects when your events arrive!

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![MagicMirror²](https://img.shields.io/badge/MagicMirror²-v2.20.0+-brightgreen.svg)

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Update](#update)
- [Configuration](#configuration)
- [Configuration Options](#configuration-options)
  - [Global Options](#global-options)
  - [Event Object Properties](#event-object-properties)
  - [Recurring Event Properties](#recurring-event-properties)
  - [Counter Styles](#counter-styles)
- [How It Works](#how-it-works)
- [Customization](#customization)
  - [Recurring Countdowns](#recurring-countdowns)
  - [Responsive Scaling](#responsive-scaling)
  - [Custom Celebration Emojis](#custom-celebration-emojis)
  - [Disabling Arrival Effects](#disabling-arrival-effects)
  - [Hiding the Icon](#hiding-the-icon)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Four Counter Styles** - Flip clock, progress rings, animated hourglass & digital clock
- **Recurring Countdowns** - Weekly, monthly, or yearly countdowns that automatically reset
- **Optional Celebration Animation** - Customizable falling emoji particles when your event arrives
- **Optional Arrival Glow Effect** - Counter boxes pulse with a glowing effect when countdown reaches zero
- **Optional Bouncing Icon** - Add a bouncing emoji above your event name, or hide it for a minimal look
- **Responsive Scaling** - Automatically scales to fit any MagicMirror region width
- **Column Alignment** - Multiple countdown modules in the same column automatically align their centers
- **Grayscale Mode** - Inverted grayscale option for classic MagicMirror aesthetic

## Screenshots

### Module in Action

All four counter styles showing custom colors, grayscale mode, celebration effects, and a recurring countdown.

![MMM-AnimatedCountdowns Demo](screenshots/hero-all-styles-clean.gif)

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
| `defaultCelebrationEmojis` | Array | `["🎉", "🌟", "🍾"]` | Default celebration emojis (when not specified per-event) |
| `celebrationParticleCount` | Integer | `30` | Number of particles in celebration animation |
| `events` | Array | *required* | Array of event objects (see below) |

### Event Object Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | String | Yes | Display name for the event |
| `date` | String | One-time only | Target date: `YYYY-MM-DD` (required for one-time events) |
| `time` | String | No | Target time: `HH:MM` or `HH:MM:SS` |
| `icon` | String | No | Emoji to display above the event name (omit or set to `null` to hide) |
| `counterStyle` | String | No | Counter style: `"digital"`, `"rings"`, `"flip"` (default), or `"hourglass"` |
| `textColor` | String | No | Text color (hex) for the event name. Default: `#ffd700` (gold) |
| `accentColor` | String | No | Accent color (hex) for ring progress indicators and arrival glow effect. Default: `#ffd700` (gold) |
| `counterTextColor` | String | No | Color (hex) for counter numbers and labels. Default: `#ffffff` (white) |
| `sandColor` | String | No | Color (hex) for hourglass sand. Default: `#e2ca76` (tan) |
| `celebrateOnDay` | Boolean | No | Show celebration animation when event arrives (default: `true`) |
| `celebrationEmojis` | Array | No | Custom emojis for this event's celebration |

### Recurring Event Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `recurrence` | String | Yes | Recurrence type: `"weekly"`, `"monthly"`, or `"yearly"` |
| `targetDay` | Integer | Yes | Day of week (0-6, Sun-Sat) for weekly, or day of month (1-31) for monthly/yearly |
| `targetMonth` | Integer | Yearly only | Month of year (1-12) for yearly recurrence |
| `showFromDay` | Integer | No | (Weekly only) Day of week to start showing countdown (0-6). If omitted, always shows. |
| `showDaysBefore` | Integer | No | (Monthly/Yearly) Number of days before event to start showing countdown. If omitted, always shows. |

### Counter Styles

| Value | Description |
|-------|-------------|
| `"flip"` | Classic flip clock with animated digits **(default)** |
| `"digital"` | Numeric boxes |
| `"rings"` | Circular progress rings |
| `"hourglass"` | Draining hourglass with flip animation |

## How It Works

**One-time events:**
1. **Before the event**: Shows a countdown with your chosen counter style
2. **When event arrives**: Countdown shows all zeros with a pulsing glow effect, celebration animation begins with falling emojis
3. **After 24 hours**: Event automatically hides (configurable with `showPassedEventsForHours`)

**Recurring events:**
1. **Before the event**: Shows a countdown (respects `showFromDay` or `showDaysBefore` if set)
2. **When event arrives**: Celebration plays for the configured duration
3. **After celebration**: Countdown automatically resets to the next occurrence
4. **Between occurrences**: Hides if outside the show period, otherwise counts down to the next occurrence

## Customization

### Recurring Countdowns

Create countdowns that automatically reset after each occurrence:

**Weekly countdown** (e.g., countdown to the weekend):
```javascript
{
    name: "Weekend!",
    icon: "🎉",
    recurrence: "weekly",
    targetDay: 5,           // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    time: "17:00",          // Friday at 5pm
    showFromDay: 1          // Only show Monday through Friday
}
```

**Monthly countdown** (e.g., countdown to payday):
```javascript
{
    name: "Payday!",
    icon: "💰",
    recurrence: "monthly",
    targetDay: 15,          // 15th of each month
    time: "09:00",
    showDaysBefore: 7       // Only show 7 days before
}
```

**Yearly countdown** (e.g., recurring birthday):
```javascript
{
    name: "Mom's Birthday!",
    icon: "🎂",
    recurrence: "yearly",
    targetMonth: 3,         // March
    targetDay: 15,
    showDaysBefore: 14      // Show starting 2 weeks before
}
```

When a recurring countdown reaches zero, the celebration plays for the configured `showPassedEventsForHours`, then the countdown resets to the next occurrence. If `showFromDay` or `showDaysBefore` is set, the countdown hides until the next show period begins.

All event styling options (`celebrateOnDay`, `celebrationEmojis`, `counterStyle`, colors, etc.) work with recurring events just like one-time events.

### Responsive Scaling

The module automatically scales to fit the width of your MagicMirror region. Place it in a narrow column and it stays compact; place it in a wider region and everything scales up proportionally — icons, text, counters, and spacing all adjust automatically.

**Column Alignment:** When you have multiple countdown module instances in the same column (e.g., one in `top_left` and another in `bottom_left`), they automatically match the width of the widest non-countdown module in that column. This ensures all countdown modules in a column are centered and aligned with each other, regardless of their counter style or content width.

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

### Disabling Arrival Effects

The celebration particles and arrival glow can be controlled separately:

**Disable celebration particles only** (glow still shows briefly):
```javascript
{
    name: "Quiet Event",
    date: "2026-08-01",
    celebrateOnDay: false
}
```

**Disable both celebration and glow** by hiding the event immediately when it arrives:
```javascript
{
    module: "MMM-AnimatedCountdowns",
    position: "top_left",
    config: {
        showPassedEventsForHours: 0,  // Event disappears immediately
        events: [...]
    }
}
```

### Hiding the Icon

If you prefer a cleaner look without the bouncing emoji icon:
```javascript
{
    name: "Minimal Event",
    date: "2026-05-01",
    icon: null
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

### Recurring event not showing
- Make sure `recurrence` is set to `"weekly"`, `"monthly"`, or `"yearly"`
- Check that `targetDay` is set correctly (0-6 for weekly, 1-31 for monthly/yearly)
- For yearly events, verify `targetMonth` is set (1-12)
- If using `showFromDay` or `showDaysBefore`, the event may be hidden until the show period begins

### Module displays incorrectly on older systems
- This module uses CSS Container Queries which require a modern browser. 
- Make sure your MagicMirror is running on Electron 105+ or a current Chromium-based browser.

## Contributing

1. Fork and clone the repository
2. Install dev dependencies:
```bash
   npm install
```
3. Make your changes
4. Run the linter before committing:
```bash
   npm run lint:fix
```
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE.md) file for details.