/* MMM-AnimatedCountdowns
 * A MagicMirror² module for displaying animated countdown timers with celebration effects.
 *
 * By ElliAndDad
 * MIT Licensed.
 */

Module.register("MMM-AnimatedCountdowns", {

    defaults: {
        colorMode: true,                                // Set to false for MM-style inverted grayscale
        showPassedEventsForHours: 24,                   // Hours to show countdown after event passes
        updateInterval: 1000,                           // Update interval in ms
        defaultCelebrationEmojis: ["🎉", "🌟", "🍾"],   // Default celebration emojis (can be overridden per-event)
        celebrationParticleCount: 30,                   // Number of particles in celebration animation
        events: []                                      // Array of event objects (see README for configuration)
        /*
         * Event object properties:
         *   name: (required) Display name for the event
         *   date: (required) Target date "YYYY-MM-DD"
         *   time: Target time "HH:MM" or "HH:MM:SS" (alternative to time in date)
         *   icon: Emoji to display above the event name (null to hide)
         *   counterStyle: "digital", "rings", "flip", or "hourglass" (default: "flip")
         *   textColor: Hex color for the event name (default: "#ffd700")
         *   accentColor: Hex color for accent elements and arrival glow effect (default: "#ffd700")
         *   counterTextColor: Hex color for counter numbers/labels (default: "#ffffff")
         *   celebrateOnDay: Show celebration animation when event arrives (default: true)
         *   celebrationEmojis: Custom emojis array for this event's celebration
         */
    },

    getScripts: function () {
        return [];
    },

    getStyles: function () {
        return [
            this.file("MMM-AnimatedCountdowns.css")
        ];
    },

    // Initialize module
    start: function () {
        Log.info("Starting module: " + this.name);

        this.events = this.processEvents(this.config.events);

        Log.info(this.name + ": Processed " + this.events.length + " events");

        // Start the update timer
        this.scheduleUpdate();
    },

    // Process events - parse dates and filter old passed events
    processEvents: function (events) {
        const now = new Date(Date.now());
        const cutoffTime = this.config.showPassedEventsForHours * 60 * 60 * 1000; // Convert hours to ms

        return events
            .map(event => {
                const eventDate = this.parseEventDate(event.date, event.time);
                const timeSinceEvent = now - eventDate;
                return {
                    ...event,
                    dateObj: eventDate,
                    isExpired: timeSinceEvent > cutoffTime
                };
            })
            .filter(event => !event.isExpired)
            .sort((a, b) => a.dateObj - b.dateObj);
    },

    // Parse event date with optional time
    parseEventDate: function (dateStr, timeStr) {
        let eventDate;

        if (dateStr.includes("T")) {
            eventDate = new Date(dateStr);
        } else if (timeStr) {
            const timeParts = timeStr.split(":");
            const hours = timeParts[0] || "00";
            const minutes = timeParts[1] || "00";
            const seconds = timeParts[2] || "00";
            eventDate = new Date(`${dateStr}T${hours}:${minutes}:${seconds}`);
        } else {
            const parts = dateStr.split("-");
            eventDate = new Date(
                parseInt(parts[0]),
                parseInt(parts[1]) - 1,
                parseInt(parts[2]),
                0, 0, 0, 0
            );
        }

        return eventDate;
    },

    // Schedule countdown update
    scheduleUpdate: function () {
        const self = this;
        setInterval(function () {
            self.updateCountdownNumbers();
        }, this.config.updateInterval);
    },

    // Update just the countdown numbers, not the whole DOM
    updateCountdownNumbers: function () {
        if (this.events.length === 0) {
            return;
        }

        const wrapper = document.getElementById(this.identifier);
        if (!wrapper) {
            return;
        }

        const eventWrappers = wrapper.querySelectorAll(".event-wrapper");

        eventWrappers.forEach((eventWrapper, index) => {
            if (index < this.events.length) {
                const event = this.events[index];
                const timeRemaining = this.getTimeRemaining(event.dateObj);
                const counterStyle = event.counterStyle || "flip";

                if (timeRemaining.arrived) {
                    const isArrivedInDom = eventWrapper.getAttribute("data-arrived") === "true";
                    if (!isArrivedInDom) {
                        // Update display to show zeros (pass arrived: false to allow update)
                        const zeroTime = { days: 0, hours: 0, minutes: 0, seconds: 0, arrived: false };
                        this.updateEventDisplay(eventWrapper, zeroTime, counterStyle);
                        // Then mark as arrived and add celebration
                        this.markEventArrived(eventWrapper, event);
                    }
                    // Don't update display anymore once arrived
                    return;
                }

                this.updateEventDisplay(eventWrapper, timeRemaining, counterStyle);
            }
        });

        // Re-process events to remove any that have expired
        const newEvents = this.processEvents(this.config.events);
        if (newEvents.length !== this.events.length) {
            this.events = newEvents;
            this.updateDom(0);
        }
    },

    // Mark an event as arrived without rebuilding DOM
    markEventArrived: function(eventWrapper, event) {
        // Mark as arrived
        eventWrapper.setAttribute("data-arrived", "true");

        // Add arrived class to countdown container for glow effect
        const countdownContainer = eventWrapper.querySelector(".countdown-container");
        if (countdownContainer) {
            countdownContainer.classList.add("arrived");
        }

        // Add celebration animation if enabled
        const celebrateOnDay = event.celebrateOnDay !== false;
        if (celebrateOnDay) {
            const animationContainer = document.createElement("div");
            animationContainer.className = "animation-container";
            const emojis = event.celebrationEmojis || this.config.defaultCelebrationEmojis;
            animationContainer.innerHTML = this.generateCelebrationParticles(this.config.celebrationParticleCount, emojis);
            // Insert at beginning so it's behind content
            eventWrapper.insertBefore(animationContainer, eventWrapper.firstChild);
        }
    },

    // Update a single event's display
    updateEventDisplay: function (container, timeRemaining, counterStyle) {
        if (timeRemaining.arrived) {
            return;
        } // Don't update countdown if event has arrived

        if (counterStyle === "rings") {
            this.updateRingsDisplay(container, timeRemaining);
        } else if (counterStyle === "flip") {
            this.updateFlipDisplay(container, timeRemaining);
        } else if (counterStyle === "hourglass") {
            this.updateHourglassDisplay(container, timeRemaining);
        } else {
            this.updateDigitalDisplay(container, timeRemaining);
        }
    },

    // Update digital countdown display
    updateDigitalDisplay: function (wrapper, timeRemaining) {
        const segments = this.getVisibleSegments(timeRemaining);
        const timeUnits = wrapper.querySelectorAll(".countdown-digital .time-unit");
        let unitIndex = 0;

        if (segments.showDays && timeUnits[unitIndex]) {
            const valueEl = timeUnits[unitIndex].querySelector(".time-value");
            const labelEl = timeUnits[unitIndex].querySelector(".time-label");
            if (valueEl) {
                valueEl.textContent = timeRemaining.days;
            }
            if (labelEl) {
                labelEl.textContent = timeRemaining.days === 1 ? "day" : "days";
            }
            unitIndex++;
        }
        if (segments.showHours && timeUnits[unitIndex]) {
            const valueEl = timeUnits[unitIndex].querySelector(".time-value");
            const labelEl = timeUnits[unitIndex].querySelector(".time-label");
            if (valueEl) {
                valueEl.textContent = timeRemaining.hours;
            }
            if (labelEl) {
                labelEl.textContent = timeRemaining.hours === 1 ? "hour" : "hours";
            }
            unitIndex++;
        }
        if (segments.showMinutes && timeUnits[unitIndex]) {
            const valueEl = timeUnits[unitIndex].querySelector(".time-value");
            const labelEl = timeUnits[unitIndex].querySelector(".time-label");
            if (valueEl) {
                valueEl.textContent = timeRemaining.minutes;
            }
            if (labelEl) {
                labelEl.textContent = timeRemaining.minutes === 1 ? "min" : "mins";
            }
            unitIndex++;
        }
        if (segments.showSeconds && timeUnits[unitIndex]) {
            const valueEl = timeUnits[unitIndex].querySelector(".time-value");
            const labelEl = timeUnits[unitIndex].querySelector(".time-label");
            if (valueEl) {
                valueEl.textContent = timeRemaining.seconds;
            }
            if (labelEl) {
                labelEl.textContent = timeRemaining.seconds === 1 ? "sec" : "secs";
            }
            unitIndex++;
        }
    },

    // Update rings countdown display
    updateRingsDisplay: function (wrapper, timeRemaining) {
        const segments = this.getVisibleSegments(timeRemaining);
        const rings = wrapper.querySelectorAll(".countdown-rings .ring-container");
        let ringIndex = 0;
        const circumference = 2 * Math.PI * 45;

        if (segments.showDays && rings[ringIndex]) {
            const dayPercent = Math.min((timeRemaining.days / 365) * 100, 100);
            const offset = circumference - (dayPercent / 100) * circumference;
            const progress = rings[ringIndex].querySelector(".ring-progress");
            const valueEl = rings[ringIndex].querySelector(".ring-value");
            if (progress) {
                progress.style.strokeDashoffset = offset;
            }
            if (valueEl) {
                valueEl.textContent = timeRemaining.days;
            }
            ringIndex++;
        }
        if (segments.showHours && rings[ringIndex]) {
            const hourPercent = (timeRemaining.hours / 24) * 100;
            const offset = circumference - (hourPercent / 100) * circumference;
            const progress = rings[ringIndex].querySelector(".ring-progress");
            const valueEl = rings[ringIndex].querySelector(".ring-value");
            if (progress) {
                progress.style.strokeDashoffset = offset;
            }
            if (valueEl) {
                valueEl.textContent = timeRemaining.hours;
            }
            ringIndex++;
        }
        if (segments.showMinutes && rings[ringIndex]) {
            const minPercent = (timeRemaining.minutes / 60) * 100;
            const offset = circumference - (minPercent / 100) * circumference;
            const progress = rings[ringIndex].querySelector(".ring-progress");
            const valueEl = rings[ringIndex].querySelector(".ring-value");
            if (progress) {
                progress.style.strokeDashoffset = offset;
            }
            if (valueEl) {
                valueEl.textContent = timeRemaining.minutes;
            }
            ringIndex++;
        }
        if (segments.showSeconds && rings[ringIndex]) {
            const secPercent = (timeRemaining.seconds / 60) * 100;
            const offset = circumference - (secPercent / 100) * circumference;
            const progress = rings[ringIndex].querySelector(".ring-progress");
            const valueEl = rings[ringIndex].querySelector(".ring-value");
            if (progress) {
                progress.style.strokeDashoffset = offset;
            }
            if (valueEl) {
                valueEl.textContent = timeRemaining.seconds;
            }
            ringIndex++;
        }
    },

    // Update hourglass countdown display
    updateHourglassDisplay: function (wrapper, timeRemaining) {
        const hourglasses = wrapper.querySelectorAll(".countdown-hourglass .hourglass-container");
        let hgIndex = 0;

        const updateHourglass = (container, percent, value, maxValue) => {
            if (!container) {
                return;
            }

            const topFill = percent;
            const bottomFill = 100 - percent;

            const topSandMaxHeight = 34;
            const topSandHeight = (topFill / 100) * topSandMaxHeight;
            const topSandY = 50 - topSandHeight;

            const bottomSandMaxHeight = 34;
            const bottomSandHeight = (bottomFill / 100) * bottomSandMaxHeight;
            const bottomSandY = 84 - bottomSandHeight;

            const topSand = container.querySelector(".hourglass-sand-top");
            const bottomSand = container.querySelector(".hourglass-sand-bottom");
            const valueEl = container.querySelector(".hourglass-value");
            const stream = container.querySelector(".hourglass-stream");
            const flipper = container.querySelector(".hourglass-flipper");

            const lastValue = parseInt(container.getAttribute("data-last-value") || "0");
            const needsFlip = value > lastValue + (maxValue / 2);

            container.setAttribute("data-last-value", value);

            if (needsFlip && flipper) {
                container.setAttribute("data-flipping", "true");

                flipper.classList.remove("flip-animation");
                void flipper.offsetWidth;
                flipper.classList.add("flip-animation");

                if (valueEl) {
                    valueEl.textContent = value;
                }

                setTimeout(function () {
                    flipper.classList.remove("flip-animation");

                    if (topSand) {
                        topSand.style.transition = "none";
                    }
                    if (bottomSand) {
                        bottomSand.style.transition = "none";
                    }

                    if (topSand) {
                        topSand.setAttribute("y", 50 - topSandMaxHeight);
                        topSand.setAttribute("height", topSandMaxHeight);
                    }
                    if (bottomSand) {
                        bottomSand.setAttribute("y", 84);
                        bottomSand.setAttribute("height", 0);
                    }
                    if (stream) {
                        stream.style.opacity = "1";
                        stream.setAttribute("y2", 82);
                    }

                    void (topSand && topSand.getBBox());
                    if (topSand) {
                        topSand.style.transition = "";
                    }
                    if (bottomSand) {
                        bottomSand.style.transition = "";
                    }

                    setTimeout(function () {
                        container.setAttribute("data-flipping", "false");
                    }, 100);
                }, 500);

                return;
            }

            if (container.getAttribute("data-flipping") === "true") {
                return;
            }

            if (topSand) {
                topSand.setAttribute("y", topSandY);
                topSand.setAttribute("height", topSandHeight);
            }
            if (bottomSand) {
                bottomSand.setAttribute("y", bottomSandY);
                bottomSand.setAttribute("height", bottomSandHeight);
            }
            if (valueEl) {
                valueEl.textContent = value;
            }
            if (stream) {
                stream.setAttribute("y2", Math.min(Math.max(52, bottomSandY), 82));
                stream.style.opacity = (topFill > 2) ? "1" : "0";
            }
        };

        const segments = this.getVisibleSegments(timeRemaining);

        if (segments.showDays && hourglasses[hgIndex]) {
            const dayPercent = Math.min((timeRemaining.days / 365) * 100, 100);
            updateHourglass(hourglasses[hgIndex], dayPercent, timeRemaining.days, 365);
            hgIndex++;
        }
        if (segments.showHours && hourglasses[hgIndex]) {
            const hourPercent = (timeRemaining.hours / 24) * 100;
            updateHourglass(hourglasses[hgIndex], hourPercent, timeRemaining.hours, 24);
            hgIndex++;
        }
        if (segments.showMinutes && hourglasses[hgIndex]) {
            const minPercent = (timeRemaining.minutes / 60) * 100;
            updateHourglass(hourglasses[hgIndex], minPercent, timeRemaining.minutes, 60);
            hgIndex++;
        }
        if (segments.showSeconds && hourglasses[hgIndex]) {
            const secPercent = (timeRemaining.seconds / 60) * 100;
            updateHourglass(hourglasses[hgIndex], secPercent, timeRemaining.seconds, 60);
            hgIndex++;
        }
    },

    // Update flip countdown display
    updateFlipDisplay: function (wrapper, timeRemaining) {
        const segments = this.getVisibleSegments(timeRemaining);
        const flipGroups = wrapper.querySelectorAll(".countdown-flip .flip-group");
        let groupIndex = 0;

        const updateFlipGroup = (group, newValue, numDigits) => {
            if (!group) {
                return;
            }
            const padded = String(newValue).padStart(numDigits, "0");
            const digitUls = group.querySelectorAll(".flip-digit-ul");

            digitUls.forEach((ul, i) => {
                const newDigit = padded[i];
                const currentDigit = ul.getAttribute("data-value");

                if (currentDigit === newDigit) {
                    return;
                }

                const activeLi = ul.querySelector(".flip-clock-active");
                const beforeLi = ul.querySelector(".flip-clock-before");

                activeLi.querySelectorAll(".inn").forEach(inn => inn.textContent = newDigit);
                beforeLi.querySelectorAll(".inn").forEach(inn => inn.textContent = currentDigit);

                ul.classList.remove("play");
                void ul.offsetWidth;
                ul.classList.add("play");

                ul.setAttribute("data-value", newDigit);
            });
        };

        if (segments.showDays && flipGroups[groupIndex]) {
            updateFlipGroup(flipGroups[groupIndex], timeRemaining.days, 3);
            groupIndex++;
        }
        if (segments.showHours && flipGroups[groupIndex]) {
            updateFlipGroup(flipGroups[groupIndex], timeRemaining.hours, 2);
            groupIndex++;
        }
        if (segments.showMinutes && flipGroups[groupIndex]) {
            updateFlipGroup(flipGroups[groupIndex], timeRemaining.minutes, 2);
            groupIndex++;
        }
        if (segments.showSeconds && flipGroups[groupIndex]) {
            updateFlipGroup(flipGroups[groupIndex], timeRemaining.seconds, 2);
            groupIndex++;
        }
    },

    // Calculate time remaining
    getTimeRemaining: function (eventDate) {
        const now = new Date(Date.now());
        const total = eventDate - now;

        if (total <= 0) {
            return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, arrived: true };
        }

        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const days = Math.floor(total / (1000 * 60 * 60 * 24));

        return { total, days, hours, minutes, seconds, arrived: false };
    },

    // Build DOM element for a single event
    buildEventElement: function (event, index) {
        const eventWrapper = document.createElement("div");
        eventWrapper.className = "event-wrapper";
        eventWrapper.setAttribute("data-event-index", index);

        const timeRemaining = this.getTimeRemaining(event.dateObj);

        // Mark if event has arrived (used to detect state change)
        if (timeRemaining.arrived) {
            eventWrapper.setAttribute("data-arrived", "true");
        }

        // Set CSS custom properties for colors (use event colors or defaults)
        if (event.textColor) {
            eventWrapper.style.setProperty("--text-color", event.textColor);
        }
        if (event.accentColor) {
            eventWrapper.style.setProperty("--accent-color", event.accentColor);
        }
        if (event.counterTextColor) {
            eventWrapper.style.setProperty("--counter-text-color", event.counterTextColor);
        }

        // Create content container
        const contentContainer = document.createElement("div");
        contentContainer.className = "content-container";

        // Icon (optional)
        if (event.icon) {
            const iconEl = document.createElement("div");
            iconEl.className = "event-icon";
            iconEl.innerHTML = event.icon;
            contentContainer.appendChild(iconEl);
        }

        // Event name
        const nameEl = document.createElement("div");
        nameEl.className = "event-name";
        nameEl.innerHTML = event.name;
        contentContainer.appendChild(nameEl);

        // Show celebration animation when event arrives (if enabled)
        if (timeRemaining.arrived) {
            const celebrateOnDay = event.celebrateOnDay !== false; // Default true

            if (celebrateOnDay) {
                const animationContainer = document.createElement("div");
                animationContainer.className = "animation-container";

                const emojis = event.celebrationEmojis || this.config.defaultCelebrationEmojis;

                animationContainer.innerHTML = this.generateCelebrationParticles(this.config.celebrationParticleCount, emojis);
                eventWrapper.appendChild(animationContainer);
            }
        }

        // Always show countdown (displays zeros when arrived)
        const countdownEl = document.createElement("div");
        countdownEl.className = "countdown-container";
        if (timeRemaining.arrived) {
            countdownEl.classList.add("arrived");
        }
        const counterStyle = event.counterStyle || "flip";
        countdownEl.innerHTML = this.buildCountdownHTML(timeRemaining, counterStyle);
        contentContainer.appendChild(countdownEl);

        eventWrapper.appendChild(contentContainer);

        return eventWrapper;
    },

    // Generate DOM
    getDom: function () {
        const wrapper = document.createElement("div");
        wrapper.className = "mmm-animated-countdowns stacked-mode";
        wrapper.id = this.identifier;

        // Apply color mode
        if (!this.config.colorMode) {
            wrapper.classList.add("grayscale-mode");
        }

        // No events to display
        if (this.events.length === 0) {
            wrapper.innerHTML = "<div class='no-events'>No upcoming events</div>";
            return wrapper;
        }

        // Show all events stacked
        for (let i = 0; i < this.events.length; i++) {
            const eventEl = this.buildEventElement(this.events[i], i);
            wrapper.appendChild(eventEl);
        }

        return wrapper;
    },

    // Build countdown HTML
    buildCountdownHTML: function (time, counterStyle) {
        let html = "";

        if (counterStyle === "rings") {
            html += this.buildRingsCountdown(time);
        } else if (counterStyle === "flip") {
            html += this.buildFlipCountdown(time);
        } else if (counterStyle === "hourglass") {
            html += this.buildHourglassCountdown(time);
        } else {
            html += this.buildDigitalCountdown(time);
        }

        return html;
    },

    // Calculate which segments should be shown (always show all four)
    getVisibleSegments: function (_time) {
        return { showDays: true, showHours: true, showMinutes: true, showSeconds: true };
    },

    // Build digital countdown display
    buildDigitalCountdown: function (time) {
        const segments = this.getVisibleSegments(time);
        let html = '<div class="countdown-units countdown-digital">';

        if (segments.showDays) {
            html += this.buildTimeUnit(time.days, "day", "days");
        }
        if (segments.showHours) {
            html += this.buildTimeUnit(time.hours, "hour", "hours");
        }
        if (segments.showMinutes) {
            html += this.buildTimeUnit(time.minutes, "min", "mins");
        }
        if (segments.showSeconds) {
            html += this.buildTimeUnit(time.seconds, "sec", "secs");
        }

        html += "</div>";
        return html;
    },

    // Build flip clock countdown display
    buildFlipCountdown: function (time) {
        const segments = this.getVisibleSegments(time);
        let html = '<div class="countdown-flip">';

        if (segments.showDays) {
            html += this.buildFlipGroup(time.days, "days", 3);
        }
        if (segments.showHours) {
            html += this.buildFlipGroup(time.hours, "hours", 2);
        }
        if (segments.showMinutes) {
            html += this.buildFlipGroup(time.minutes, "mins", 2);
        }
        if (segments.showSeconds) {
            html += this.buildFlipGroup(time.seconds, "secs", 2);
        }

        html += "</div>";
        return html;
    },

    // Build a group of flip digits with a label
    buildFlipGroup: function (value, label, numDigits) {
        const padded = String(value).padStart(numDigits, "0");

        let html = `<div class="flip-group" data-label="${label}">`;
        html += '<div class="flip-digits">';

        for (let i = 0; i < numDigits; i++) {
            html += this.buildFlipDigit(padded[i]);
        }

        html += "</div>";
        html += `<span class="flip-label">${label}</span>`;
        html += "</div>";

        return html;
    },

    // Build individual flip digit
    buildFlipDigit: function (digit) {
        return `
            <ul class="flip-digit-ul" data-value="${digit}">
                <li class="flip-digit-li flip-clock-active">
                    <a href="#">
                        <div class="up">
                            <div class="shadow"></div>
                            <div class="inn">${digit}</div>
                        </div>
                        <div class="down">
                            <div class="shadow"></div>
                            <div class="inn">${digit}</div>
                        </div>
                    </a>
                </li>
                <li class="flip-digit-li flip-clock-before">
                    <a href="#">
                        <div class="up">
                            <div class="shadow"></div>
                            <div class="inn">${digit}</div>
                        </div>
                        <div class="down">
                            <div class="shadow"></div>
                            <div class="inn">${digit}</div>
                        </div>
                    </a>
                </li>
            </ul>
        `;
    },

    // Build rings countdown display
    buildRingsCountdown: function (time) {
        const segments = this.getVisibleSegments(time);
        let html = '<div class="countdown-rings">';

        if (segments.showDays) {
            const dayPercent = Math.min((time.days / 365) * 100, 100);
            html += this.buildRing(time.days, "days", dayPercent);
        }
        if (segments.showHours) {
            const hourPercent = (time.hours / 24) * 100;
            html += this.buildRing(time.hours, "hrs", hourPercent);
        }
        if (segments.showMinutes) {
            const minPercent = (time.minutes / 60) * 100;
            html += this.buildRing(time.minutes, "min", minPercent);
        }
        if (segments.showSeconds) {
            const secPercent = (time.seconds / 60) * 100;
            html += this.buildRing(time.seconds, "sec", secPercent);
        }

        html += "</div>";
        return html;
    },

    // Build individual ring
    buildRing: function (value, label, percent) {
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (percent / 100) * circumference;

        return `
            <div class="ring-container">
                <svg class="ring-svg" viewBox="0 0 100 100">
                    <circle class="ring-bg" cx="50" cy="50" r="45" />
                    <circle class="ring-progress" cx="50" cy="50" r="45" 
                        stroke-dasharray="${circumference}" 
                        stroke-dashoffset="${offset}"
                        transform="rotate(-90 50 50)" />
                </svg>
                <div class="ring-content">
                    <span class="ring-value">${value}</span>
                    <span class="ring-label">${label}</span>
                </div>
            </div>
        `;
    },

    // Build hourglass countdown display
    buildHourglassCountdown: function (time) {
        const segments = this.getVisibleSegments(time);
        let html = '<div class="countdown-hourglass">';

        if (segments.showDays) {
            const dayPercent = Math.min((time.days / 365) * 100, 100);
            html += this.buildHourglass(time.days, "days", dayPercent);
        }
        if (segments.showHours) {
            const hourPercent = (time.hours / 24) * 100;
            html += this.buildHourglass(time.hours, "hrs", hourPercent);
        }
        if (segments.showMinutes) {
            const minPercent = (time.minutes / 60) * 100;
            html += this.buildHourglass(time.minutes, "min", minPercent);
        }
        if (segments.showSeconds) {
            const secPercent = (time.seconds / 60) * 100;
            html += this.buildHourglass(time.seconds, "sec", secPercent);
        }

        html += "</div>";
        return html;
    },

    // Build individual hourglass
    buildHourglass: function (value, label, percent) {
        const topFill = percent;
        const bottomFill = 100 - percent;

        const topSandMaxHeight = 34;
        const topSandHeight = (topFill / 100) * topSandMaxHeight;
        const topSandY = 50 - topSandHeight;

        const bottomSandMaxHeight = 34;
        const bottomSandHeight = (bottomFill / 100) * bottomSandMaxHeight;
        const bottomSandY = 84 - bottomSandHeight;

        return `
            <div class="hourglass-container" data-label="${label}" data-last-value="${value}">
                <div class="hourglass-flipper">
                    <svg class="hourglass-svg" viewBox="0 0 100 100">
                        <defs>
                            <clipPath id="topBulbClip-${label}">
                                <path d="M18,16 L82,16 L82,20 C82,38 62,48 50,50 C38,48 18,38 18,20 Z" />
                            </clipPath>
                            <clipPath id="bottomBulbClip-${label}">
                                <path d="M50,50 C62,52 82,62 82,80 L82,84 L18,84 L18,80 C18,62 38,52 50,50 Z" />
                            </clipPath>
                        </defs>
                        
                        <rect class="hourglass-cap" x="10" y="4" width="80" height="10" rx="3" />
                        <rect class="hourglass-cap-highlight" x="12" y="5" width="76" height="4" rx="2" />
                        
                        <rect class="hourglass-cap" x="10" y="86" width="80" height="10" rx="3" />
                        <rect class="hourglass-cap-shadow" x="12" y="91" width="76" height="4" rx="2" />
                        
                        <path class="hourglass-glass-body" d="
                            M18,14 L82,14 L82,20 C82,40 58,50 50,50 C42,50 18,40 18,20 L18,14 Z
                            M18,86 L82,86 L82,80 C82,60 58,50 50,50 C42,50 18,60 18,80 L18,86 Z
                        " />
                        
                        <path class="hourglass-glass-inner" d="
                            M20,15 L80,15 L80,20 C80,39 57,49 50,49 C43,49 20,39 20,20 Z
                            M20,85 L80,85 L80,80 C80,61 57,51 50,51 C43,51 20,61 20,80 Z
                        " />
                        
                        <rect class="hourglass-sand hourglass-sand-top" 
                            x="10" y="${topSandY}" 
                            width="80" height="${topSandHeight}"
                            clip-path="url(#topBulbClip-${label})" />
                        
                        <rect class="hourglass-sand hourglass-sand-bottom" 
                            x="10" y="${bottomSandY}" 
                            width="80" height="${bottomSandHeight}"
                            clip-path="url(#bottomBulbClip-${label})" />
                        
                        <line class="hourglass-stream" 
                            x1="50" y1="50" x2="50" y2="${Math.min(Math.max(52, bottomSandY), 82)}"
                            style="opacity: ${topFill > 2 ? 1 : 0}" />
                        
                        <path class="hourglass-shine" d="
                            M22,18 C22,18 22,35 35,45 L32,43 C22,35 24,20 24,20 Z
                        " />
                    </svg>
                </div>
                <div class="hourglass-content">
                    <span class="hourglass-value">${value}</span>
                    <span class="hourglass-label">${label}</span>
                </div>
            </div>
        `;
    },

    // Build individual time unit
    buildTimeUnit: function (value, singular, plural) {
        const label = value === 1 ? singular : plural;
        return `
            <div class="time-unit">
                <span class="time-value">${value}</span>
                <span class="time-label">${label}</span>
            </div>
        `;
    },

    // Generate celebration particle HTML (snow-style falling animation)
    generateCelebrationParticles: function (count, emojis) {
        let html = "";

        for (let i = 0; i < count; i++) {
            const delay = Math.random() * 5;
            const duration = 3 + Math.random() * 4;
            const left = Math.random() * 100;
            const size = 0.5 + Math.random() * 1;
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];

            html += `<div class="particle celebration-particle" style="
                left: ${left}%;
                animation-delay: ${delay}s;
                animation-duration: ${duration}s;
                --particle-size: ${size};
            ">${emoji}</div>`;
        }

        return html;
    }

});
