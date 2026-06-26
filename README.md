# cash-flow-expense-tracker

![Cash-Flow Screenshot](assets/screenshot.png)
A modern Salary & Expense Tracker built using HTML, CSS, and Vanilla JavaScript.

## Overview

Cash-Flow helps users manage their monthly salary and expenses while providing real-time balance tracking, data visualization, and financial reporting.

## Features

### Salary Management

* Set monthly salary
* Real-time salary display

### Expense Tracking

* Add expenses with name and amount
* Delete individual expenses
* Clear all expenses

### Balance Calculation

* Automatic calculation of:

  * Total Salary
  * Total Expenses
  * Remaining Balance

### Data Persistence

* LocalStorage integration
* Data remains available after page refresh

### Data Visualization

* Interactive Doughnut Chart using Chart.js
* Displays Expenses vs Remaining Balance

### Currency Conversion

* Supports:

  * INR
  * USD
  * EUR
  * GBP
  * AED

### PDF Report Generation

* Export expense report using jsPDF

### Smart Alerts

* Warning notification when remaining balance drops below 10% of salary

## Technologies Used

* HTML5
* CSS3
* Vanilla JavaScript (ES6)
* Chart.js
* jsPDF
* LocalStorage API
* Frankfurter Exchange Rate API

## Project Structure

```text
cash-flow-expense-tracker/
│
├── index.html
├── style.css
├── script.js
├── Prompts.md
└── README.md
```

## Live Demo

Website:
https://cash-flow-expense-tracker-it44hxe9m-rajkashyap97s-projects.vercel.app/

## GitHub Repository

https://github.com/Rajkashyap97/cash-flow-expense-tracker

## Development Note

This project was developed as part of Sprint 02. The application logic, feature integration, testing, and implementation were completed by me. AI tools and documentation were used as learning and debugging resources during development, similar to standard industry practices.
