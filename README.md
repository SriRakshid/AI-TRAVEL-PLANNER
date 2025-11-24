# AI Travel Planner (Single-Page Demo)

A lightweight, front-end only **AI-style travel planner** built with plain HTML, CSS, and JavaScript.

You type a **city**, **budget**, **trip length**, and **start date**. The page generates:

- A **trip summary** with chips
- An approximate **cost breakdown**
- A **day-by-day itinerary** with Google Maps links
- A dynamic **city hero image** from Unsplash

Designed to look good in screenshots (e.g. for LinkedIn posts).

## Files

- `index.html` – main page and structure
- `style.css` – layout, theme, animations
- `script.js` – itinerary logic, cost estimation, interactivity
- `README.md` – this file

No build tools or dependencies are required.

## How to run

1. Open the project folder:
   - `C:\Users\srira\Desktop\ai-travel-planner` (Desktop copy)
   - or `C:\Users\srira\CascadeProjects\ai-travel-planner` (source copy)
2. Double-click `index.html` to open it in your browser.

> Tip: for the nicest layout and animations, use a desktop browser.

## Features

- **Quick templates**: Paris / Tokyo / Bangkok example chips above the form.
- **Date picker**: calendar-style start date, used to label each day.
- **Dynamic hero image**: uses Unsplash (`source.unsplash.com/featured`) based on the city.
- **Animated timeline**: each day card animates in with a staggered motion.
- **Cost estimation**: very rough, based on city cost index and travel style.

This is a **demo**, not a real booking tool.

## Customization ideas

- Add more template chips for your favourite cities.
- Tweak colors and animations in `style.css` to match your personal brand.
- Replace the Unsplash URL with your own curated city images.

## Notes

- Internet is required for the hero city image (Unsplash).
- All logic runs in the browser; no backend or database is used.
