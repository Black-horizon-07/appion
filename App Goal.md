# AI Productivity Score Web App – Product Design Requirements (PDR)

## 1. Product Vision

A web application that evaluates whether a user's real-time activity matches their planned schedule from Google Calendar and assigns a productivity score between 0–100 using AI.

Goal: Help users stay aligned with their planned tasks and become more disciplined with time.

Core Idea: If the user planned to do one activity but is doing something else, the AI evaluates the mismatch and reduces the score.

Example:
Planned Activity: Reading a book (8:00 AM)
Actual Activity: Scrolling Instagram
AI Productivity Score: 30/100

---

## 2. Target Users

* Students
* Professionals
* Productivity enthusiasts
* People who plan their day using Google Calendar

---

## 3. Core Features (MVP)

### 3.1 Authentication

* User Signup
* User Login
* Secure session management

### 3.2 Google Calendar Integration

* Connect Google account
* Read user's calendar events
* Detect current scheduled activity

### 3.3 Activity Input

User enters what they are currently doing.

Example:
"Watching YouTube"
"Studying Physics"
"Scrolling Instagram"

### 3.4 AI Evaluation

The system compares:

* Scheduled activity from Google Calendar
* User's current activity

AI Model Used:
OpenRouter API
Model: qwen/qwen3-next-80b-a3b-instruct:free

Output:
AI returns a productivity score between 0–100.

### 3.5 Score Display

* Circular score indicator
* Shows real-time productivity score

---

## 4. Home Page

### Layout

Top Section:

* Circular productivity score

Middle Section:

* Activity input field

Bottom Section:
Pomodoro Study Timer

Timer Shortcuts:

* 5 minutes
* 25 minutes
* 45 minutes
* 1 hour

Custom Timer:

* User can enter custom time

Timer Behavior:

* Countdown timer
* Notification when timer finishes

---

## 5. Profile Page

### Settings

Calendar Integration

* Connect Google Calendar
* Disconnect option

Theme Settings

* Light Mode
* Dark Mode

Color Customization

* User can change app accent color

---

## 6. Pages / Screens

1. Landing Page
2. Signup Page
3. Login Page
4. Home Page
5. Profile Page

---

## 7. AI Evaluation Logic

Input to AI:

* Scheduled task from Google Calendar
* User's current activity

Example Prompt:
"The user planned to: Study Mathematics.
The user is currently: Watching Instagram Reels.
Give a productivity score between 0–100 based on alignment with the planned task."

Output:
Numeric score

---

## 8. Tech Stack

Frontend:

* Web application

Backend:

* API server

Integrations:

* Google Calendar API
* OpenRouter API

AI Model:
qwen/qwen3-next-80b-a3b-instruct:free

---

## 9. Future Features (Planned)

* Productivity history
* Daily productivity average
* Weekly reports
* AI suggestions for improving schedule

---

## 10. Summary

This web application helps users stay accountable to their schedules by comparing planned tasks with real activities and scoring productivity using AI.
