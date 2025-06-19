/**
 * Node.js Command Line Alarm Application with Custom Sound & System Notifications
 *
 * This script sets up a recurring alarm that triggers at a specified
 * interval (in minutes) provided as a command-line argument.
 *
 * Features:
 * - Real-time countdown display in the console.
 * - Plays a custom audio file for the alarm (intended for ~10 seconds).
 * - Triggers a system desktop notification.
 *
 * Requires the 'sound-play' and 'node-notifier' npm packages. Install them using:
 * npm install sound-play node-notifier
 *
 * IMPORTANT:
 * 1. You need to place an audio file (e.g., alarm.mp3) in the same directory
 * as this script. The script uses Node.js's 'path' module to locate it.
 * 2. For the alarm to ring for 10 seconds, ensure your audio file is approximately 10 seconds long.
 *
 * Usage: node alarm.js <minutes>
 * Example: node alarm.js 30 (will trigger an alarm every 30 minutes with custom sound, notification, and live timer)
 *
 * Press Ctrl+C to stop the alarm at any time.
 */

// Import Node.js built-in 'path' module for handling file paths reliably
const path = require("path");

// Import the 'sound-play' module for custom audio playback
let sound;
try {
  // Using require() as this is a CommonJS module (standard .js file)
  sound = require("sound-play");
} catch (error) {
  console.error("Error: 'sound-play' module not found.");
  console.error("Please install it by running: npm install sound-play");
  console.error("Without 'sound-play', custom audio will be disabled.");
  sound = null;
}

// Import the 'node-notifier' module for system desktop notifications
let notifier;
try {
  // Using require() as this is a CommonJS module
  notifier = require("node-notifier");
} catch (error) {
  console.error("Error: 'node-notifier' module not found.");
  console.error("Please install it by running: npm install node-notifier");
  console.error(
    "Without 'node-notifier', desktop notifications will be disabled."
  );
  notifier = null;
}

// Define constants
const MINUTES_TO_MILLISECONDS = 60 * 1000;
const COUNTDOWN_UPDATE_INTERVAL_MS = 1000; // Update countdown every 1 second
// Construct a robust, absolute path to the alarm sound file
// __dirname refers to the directory name of the current module
const ALARM_SOUND_FILE = path.join(__dirname, "alarm.mp3"); // <--- IMPORTANT: Ensure 'alarm.mp3' is in the same directory!
// Note: sound-play plays the entire file. For a 10-second alarm, ensure your file is ~10s long.

// Global variables to manage timer states
let countdownIntervalId; // Stores the ID for the real-time countdown display
let nextAlarmTimestamp; // Stores the timestamp when the next alarm is due
let alarmIntervalId; // Stores the ID for the recurring alarm trigger

/**
 * Main function to start the alarm application.
 * It parses command-line arguments, validates the input, and sets up the timers.
 */
function startAlarmApp() {
  const args = process.argv.slice(2);

  if (args.length !== 1) {
    console.error("Usage: node alarm.js <minutes>");
    console.error("Example: node alarm.js 30 (for an alarm every 30 minutes)");
    process.exit(1);
  }

  const minutes = parseInt(args[0], 10);

  if (isNaN(minutes) || minutes <= 0) {
    console.error(
      "Error: Please provide a positive number for the alarm interval in minutes."
    );
    process.error("Invalid input. Please try again.");
    process.exit(1);
  }

  const intervalMs = minutes * MINUTES_TO_MILLISECONDS;

  console.log(`\n✨ Alarm Application Started ✨`);
  console.log(`Setting up alarm to sound every ${minutes} minutes.`);
  if (sound) {
    console.log(
      `Custom alarm sound enabled. Ensure '${ALARM_SOUND_FILE}' exists and is about 10 seconds long.`
    );
  } else {
    console.log(`Custom alarm sound disabled.`);
  }
  if (notifier) {
    console.log(`Desktop notifications enabled.`);
  } else {
    console.log(`Desktop notifications disabled.`);
  }
  console.log(`Press Ctrl+C to stop the alarm at any time.`);
  console.log("------------------------------------------"); // Separator for clarity

  /**
   * Function to update and display the remaining time until the next alarm.
   * It clears the current console line and rewrites it with the updated time.
   */
  function displayRemainingTime() {
    const now = new Date().getTime();
    const timeLeftMs = nextAlarmTimestamp - now;

    if (timeLeftMs <= 0) {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(`Next alarm in: 0m 00s`);
      return;
    }

    const totalSeconds = Math.floor(timeLeftMs / 1000);
    const minutesLeft = Math.floor(totalSeconds / 60);
    const secondsLeft = totalSeconds % 60;

    // Pad seconds with a leading zero if less than 10 for consistent display
    const formattedSeconds = String(secondsLeft).padStart(2, "0");

    // Clear the current line and move the cursor to the beginning
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`Next alarm in: ${minutesLeft}m ${formattedSeconds}s`);
  }

  /**
   * Function to trigger the alarm action.
   * This function will be called when the alarm "goes off".
   * It plays the sound, prints a message, and resets the next alarm time.
   */
  function triggerAlarm() {
    // Clear the countdown display while the alarm message is printed
    clearInterval(countdownIntervalId);
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);

    const now = new Date();
    const alarmTime = now.toLocaleTimeString();

    console.log(`\n========================================`);
    console.log(`||             !!! ALARM !!!          ||`);
    console.log(`||  It's ${alarmTime}   ||`);
    console.log(`========================================\n`);

    // Play the custom alarm sound if the module is loaded
    if (sound) {
      try {
        // Explicitly pass volume (e.g., 1 for full volume) as the second argument,
        // and the callback as the third argument to avoid PowerShell parsing errors.
        // sound-play plays the entire file. For 10s alarm, ensure your file is ~10s long.
        sound.play(ALARM_SOUND_FILE, 1, (err) => {
          // Volume set to 1 (full)
          if (err) {
            console.error("Error playing custom sound:", err.message);
            console.error(
              "Please check if the file exists and is accessible: " +
                ALARM_SOUND_FILE
            );
          }
        });
      } catch (audioError) {
        console.error(
          "Error initiating custom sound playback (possible path issue):",
          audioError.message
        );
      }
    }

    // Trigger a desktop notification if the notifier module was successfully loaded
    if (notifier) {
      notifier.notify(
        {
          title: "Node.js Alarm!",
          message: `It's ${alarmTime} - Time for your alarm!`,
          icon: "https://placehold.co/64x64/FF0000/FFFFFF?text=ALARM", // Optional: an icon for the notification
          sound: true, // Play system default notification sound (in addition to custom sound)
          wait: false, // Do not wait for user interaction to close the notification
        },
        function (err, response) {
          if (err) {
            console.error("Error showing desktop notification:", err);
          }
        }
      );
    }

    // Set the timestamp for the *next* alarm, and restart the countdown display
    nextAlarmTimestamp = now.getTime() + intervalMs;
    countdownIntervalId = setInterval(
      displayRemainingTime,
      COUNTDOWN_UPDATE_INTERVAL_MS
    );
    // After the alarm, print the separator again to keep things tidy
    console.log("------------------------------------------");
  }

  // Initialize the timestamp for the first alarm
  nextAlarmTimestamp = new Date().getTime() + intervalMs;

  // Start the real-time countdown display immediately
  countdownIntervalId = setInterval(
    displayRemainingTime,
    COUNTDOWN_UPDATE_INTERVAL_MS
  );

  // Set the initial timeout for the first alarm.
  // Subsequent alarms will be managed by the setInterval inside triggerAlarm.
  alarmIntervalId = setTimeout(() => {
    triggerAlarm(); // Trigger the first alarm
    // Set up recurring alarms after the first one has fired
    alarmIntervalId = setInterval(triggerAlarm, intervalMs);
  }, intervalMs); // The first alarm waits for the full 'minutes' duration

  // Handle Ctrl+C (SIGINT) to gracefully stop the application and clean up console
  process.on("SIGINT", () => {
    clearInterval(countdownIntervalId); // Stop the countdown display
    clearInterval(alarmIntervalId); // Stop the main alarm interval
    process.stdout.clearLine(0); // Clear the line showing time
    process.stdout.cursorTo(0); // Move cursor to start of line
    console.log("\nAlarm application stopped.");
    process.exit(); // Exit the process
  });
}

// Call the main function to start the application
startAlarmApp();
