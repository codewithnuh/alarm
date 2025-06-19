# Node.js Command Line Alarm Application

A professional, customizable command-line alarm application built with Node.js. This tool allows you to set recurring alarms at user-defined intervals, complete with custom sound playback and system desktop notifications.

## Features

- Real-time countdown timer displayed in the console
- Plays a custom audio file for the alarm (user-provided, ~10 seconds recommended)
- Triggers a system desktop notification at each alarm
- Simple command-line interface
- Cross-platform support (Windows, macOS, Linux)

## Requirements

- [Node.js](https://nodejs.org/) (v12 or higher recommended)
- npm or pnpm (for dependency management)
- An audio file (e.g., `alarm.mp3`) placed in the project directory

## Installation

1. **Clone the repository or download the source code.**
2. **Navigate to the project directory in your terminal.**
3. **Install dependencies:**

   ```bash
   npm install
   # or
   pnpm install
   ```

4. **Add your custom alarm sound:**
   - Place an audio file named `alarm.mp3` (about 10 seconds long) in the same directory as `app.js`.

## Usage

Run the application from the command line, specifying the alarm interval in minutes:

```bash
node app.js <minutes>
```

**Example:**

```bash
node app.js 30
```

This will trigger an alarm every 30 minutes, playing your custom sound and showing a desktop notification. The console will display a live countdown timer.

**To stop the alarm:** Press `Ctrl+C` in the terminal.

## Dependencies

- [sound-play](https://www.npmjs.com/package/sound-play) — For playing custom audio files
- [node-notifier](https://www.npmjs.com/package/node-notifier) — For system desktop notifications
- [speaker](https://www.npmjs.com/package/speaker) — (Listed as a dependency, but not directly used in the main script)

## Notes

- Ensure your audio file is accessible and named `alarm.mp3`.
- If you encounter errors about missing modules, install them using:

  ```bash
  npm install sound-play node-notifier
  ```

- The application is designed for use in a terminal/command prompt environment.

## License

This project is licensed under the ISC License.

---

**Author:**

- Noor ul hassan
