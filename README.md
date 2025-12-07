# MERN Expense Tracker

I built this full-stack application to help track personal finances easily. It's a classic Expense Tracker but with some extra polish and modern features I wanted to try out. It's built using the **MERN Stack** (MongoDB, Express, React, Node.js) and styled with Tailwind CSS.

## What it does

It's not just a simple list of numbers. I added a few cool things to make it actually useful:

*   **Visual Dashboard:** You get a clear overview of your money right away. I specifically worked on the charts (Income vs Expense, History, etc.) to make sure they look smooth and don't feel "static".
*   **Income & Expense Tracking:** Obviously, you can add, edit, and delete your transactions.
*   **Excel Export:** If you need to do deeper analysis, there's a button to download your data directly to an Excel file.
*   **Smart Features:**
    *   **Chatbot Integration:** I added a little AI helper in the settings that you can toggle on/off.
    *   **Customization:** You can upload your own profile picture and set your preferred currency.
*   **Secure:** Uses JWT for authentication, so your data stays private.

## The Tech Stack

I kept things modern and fast:

*   **Frontend:** React (created with Vite for speed), Tailwind CSS for styling, and Recharts for the analytics.
*   **Backend:** Node.js with Express.
*   **Database:** MongoDB (using Mongoose).
*   **Authentication:** JWT (JSON Web Tokens).

That's pretty much it! Feel free to check out the code logic, especially how I handled the chart animations and the dashboard data aggregation.
