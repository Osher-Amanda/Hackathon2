###########Interactive Quiz App

An interactive full-stack quiz game where users answer timed questions, get instant feedback, and see their score on a leaderboard.

###About the Project

Built as part of my 2nd Hackathon bootcamp to practice full-stack development with React (frontend), Node.js/Express (backend), and PostgreSQL (via Neon). The app includes a timer, progress bar, instant feedback, leaderboard, and quiz history.

###Features

-Enter your name to begin -10 random quiz questions per game -Countdown timer for each question -Progress bar showing quiz progress -Instant correct / wrong answer feedback -Final score display -Leaderboard with saved scores -Clear leaderboard button -Quiz history shown after finishing

###Demo video

Watch the project walkthrough here: 
https://www.loom.com/share/8dc66c36459d450eb44cad11c87e76ac

###Tech Used

Frontend: React, Vite, CSS Backend: Node.js, Express, CORS, dotenv Database: PostgreSQL via Neon

###Folder Structure

Hackathon2/

client
server
###How to Run Locally

##Backend

Open the server folder:

cd server npm install

Create a .env file in the server folder with your own database URL and port:

PORT=5000 DATABASE_URL=your_neon_database_url_here

Start the backend server:

npm run dev

The backend runs on: http://localhost:5000

##Frontend

Open a new terminal in the client folder:

cd client npm install npm run dev

The frontend runs on: http://localhost:5173

###Key Learnings / Challenges

-Figuring out the timer and progress logic for the quiz. -Connecting the frontend to the backend leaderboard. -Giving instant feedback for each answer

Author Osher Amanda Favel