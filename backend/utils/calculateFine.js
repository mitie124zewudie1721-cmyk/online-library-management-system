// backend/utils/calculateFine.js

/**
 * Calculate overdue fine based on days late
 * @param {Date|string|number} dueDate - Book due date (Date object, ISO string, or timestamp)
 * @param {Date|string|number} [returnDate=new Date()] - Actual return date (defaults to today)
 * @returns {number} Fine amount in ETB (0 if not overdue or invalid input)
 */
const calculateFine = (dueDate, returnDate = new Date()) => {
    // Convert inputs to Date objects safely
    const due = new Date(dueDate);
    const returned = new Date(returnDate);

    // Invalid date → no fine, log warning in dev only
    if (isNaN(due.getTime()) || isNaN(returned.getTime())) {
        if (process.env.NODE_ENV === 'development') {
            console.warn(
                '[calculateFine] Invalid date provided:',
                { dueDate, returnDate, dueValid: !isNaN(due.getTime()), returnedValid: !isNaN(returned.getTime()) }
            );
        }
        return 0;
    }

    // Normalize to start of day (timezone-safe)
    due.setHours(0, 0, 0, 0);
    returned.setHours(0, 0, 0, 0);

    // Not overdue → no fine
    if (returned <= due) {
        return 0;
    }

    // Calculate days late (whole days)
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLate = Math.floor((returned - due) / msPerDay);

    // ─── Configurable fine rules ─────────────────────────────────────
    const FINE_PER_DAY_BASE = 5;       // ETB per day for first 7 days
    const FINE_PER_DAY_HIGH = 10;      // ETB per day after 7 days
    const HIGH_FINE_THRESHOLD = 7;     // days after which rate increases
    const MAX_FINE = 500;              // maximum fine cap (0 = no cap)
    const MIN_FINE = 0;                // minimum fine (can be 0)

    // Progressive fine calculation
    let fine = 0;
    if (daysLate <= HIGH_FINE_THRESHOLD) {
        fine = daysLate * FINE_PER_DAY_BASE;
    } else {
        fine = HIGH_FINE_THRESHOLD * FINE_PER_DAY_BASE +
            (daysLate - HIGH_FINE_THRESHOLD) * FINE_PER_DAY_HIGH;
    }

    // Apply cap and minimum
    if (MAX_FINE > 0 && fine > MAX_FINE) {
        fine = MAX_FINE;
    }
    if (fine < MIN_FINE) {
        fine = MIN_FINE;
    }

    return fine;
};

// Optional: named export (modern style)
module.exports = {
    calculateFine,
};

// If you prefer default export (old style):
// module.exports = calculateFine;