/* MONTHLY READING GOAL TRACKER */

const MONTHLY_GOAL_KEY = 'imybook_monthly_goals';

const monthlyGoalForm =
    document.getElementById('monthlyGoalForm');

const monthlyGoalMonth =
    document.getElementById('monthlyGoalMonth');

const monthlyGoalTarget =
    document.getElementById('monthlyGoalTarget');

const monthlyGoalCompleted =
    document.getElementById('monthlyGoalCompleted');

const monthlyGoalError =
    document.getElementById('monthlyGoalError');

const monthlyGoalResult =
    document.getElementById('monthlyGoalResult');


// READ SAVED MONTHLY GOALS
function getMonthlyGoals() {

    const data = JSON.parse(
        localStorage.getItem(MONTHLY_GOAL_KEY) || '{}'
    );

    if (!data || typeof data !== 'object' ||
        Array.isArray(data)) {
        throw new Error('Invalid monthly goal data');
    }

    return data;
}


// VALIDATE USER INPUT
function getMonthlyGoalInput() {

    const month = monthlyGoalMonth.value;
    const goalText = monthlyGoalTarget.value.trim();
    const completedText = monthlyGoalCompleted.value.trim();

    const goal = Number(goalText);
    const completed = Number(completedText);

    const valid =
        /^\d{4}-(0[1-9]|1[0-2])$/.test(month) &&
        goalText !== '' &&
        completedText !== '' &&
        Number.isSafeInteger(goal) &&
        goal > 0 &&
        Number.isSafeInteger(completed) &&
        completed >= 0;

    return { month, goal, completed, valid };
}


// CALCULATE AND DISPLAY ACHIEVEMENT
function displayMonthlyGoal(goal, completed) {

    const percentage = (completed / goal) * 100;

    const remaining = Math.max(0, goal - completed);

    document.getElementById('monthlyGoalPercentage')
        .textContent = percentage.toFixed(1) + '%';

    document.getElementById('monthlyGoalFill')
        .style.width = Math.min(100, percentage) + '%';

    document.getElementById('monthlyGoalRemaining')
        .textContent = remaining + ' books remaining';

    const status =
        document.getElementById('monthlyGoalStatus');

    // Student-written control statements
    if (completed > goal) {

        status.textContent =
            'Amazing! You exceeded your goal by ' +
            (completed - goal) + ' books!';

    } else if (completed === goal) {

        status.textContent =
            'Congratulations! Monthly goal achieved!';

    } else {

        status.textContent =
            'Keep reading! You can reach your goal!';
    }

    monthlyGoalResult.hidden = false;
}


// LIVE CALCULATION PREVIEW
function previewMonthlyGoal() {

    const data = getMonthlyGoalInput();

    monthlyGoalError.hidden = true;

    if (data.valid) {
        displayMonthlyGoal(data.goal, data.completed);
    } else {
        monthlyGoalResult.hidden = true;
    }
}

monthlyGoalTarget.addEventListener(
    'input', previewMonthlyGoal
);

monthlyGoalCompleted.addEventListener(
    'input', previewMonthlyGoal
);


// CREATE / UPDATE - SAVE MONTHLY GOAL
monthlyGoalForm.addEventListener('submit', function (event) {

    event.preventDefault();

    const data = getMonthlyGoalInput();

    if (!data.valid) {

        monthlyGoalError.textContent =
            'Please enter a valid month, a goal greater than 0, and a non-negative completed count.';

        monthlyGoalError.hidden = false;
        return;
    }

    try {

        const goals = getMonthlyGoals();

        // Save values under selected month
        goals[data.month] = {
            goal: data.goal,
            completed: data.completed
        };

        localStorage.setItem(
            MONTHLY_GOAL_KEY,
            JSON.stringify(goals)
        );

        displayMonthlyGoal(data.goal, data.completed);

        monthlyGoalError.hidden = true;

        document.getElementById('monthlyGoalMessage')
            .textContent =
            'Monthly reading goal saved successfully!';

    } catch (error) {

        console.error('Monthly goal save error:', error);

        monthlyGoalError.textContent =
            'Unable to save monthly goal. Please try again.';

        monthlyGoalError.hidden = false;
    }
});


// READ - LOAD GOAL FOR SELECTED MONTH
function loadMonthlyGoal() {

    monthlyGoalError.hidden = true;

    document.getElementById('monthlyGoalMessage')
        .textContent = '';

    try {

        const goals = getMonthlyGoals();
        const saved = goals[monthlyGoalMonth.value];

        if (saved &&
            Number.isSafeInteger(saved.goal) &&
            saved.goal > 0 &&
            Number.isSafeInteger(saved.completed) &&
            saved.completed >= 0) {

            monthlyGoalTarget.value = saved.goal;
            monthlyGoalCompleted.value = saved.completed;

            displayMonthlyGoal(saved.goal, saved.completed);

        } else {

            monthlyGoalTarget.value = '';
            monthlyGoalCompleted.value = 0;
            monthlyGoalResult.hidden = true;
        }

    } catch (error) {

        console.error('Monthly goal load error:', error);

        monthlyGoalError.textContent =
            'Unable to load saved monthly goals.';

        monthlyGoalError.hidden = false;
        monthlyGoalResult.hidden = true;
    }
}


// LOAD WHEN USER CHANGES MONTH
monthlyGoalMonth.addEventListener(
    'change', loadMonthlyGoal
);


// SELECT CURRENT MONTH AUTOMATICALLY
const today = new Date();

monthlyGoalMonth.value =
    today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0');

loadMonthlyGoal();
