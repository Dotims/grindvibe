<div align="center">
  <h1>💪 GrindVibe</h1>
  <p>Your personal platform for workout management and routine planning! 🚀</p>

  <div>
    <img src="https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="TailwindCSS" />
    <img src="https://img.shields.io/badge/.NET-9.0-512BD4?style=for-the-badge&logo=dotnet" alt=".NET 9" />
    <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite" alt="SQLite" />
  </div>
</div>

---

## 📖 About the Project

**GrindVibe** is a modern Full-Stack web application designed for people who want full control over their workouts. The platform allows you to plan training routines, track workout sessions, and discover new activities using integration with an external exercise API.

The project is built with high performance, responsiveness, and a great user experience in mind, combining the power of the latest **React 19**, the powerful **Tailwind CSS v4** framework, and a solid, efficient backend created in **.NET 9 C#**.

> 🚧 **Work in Progress:** Please note that GrindVibe is currently in active development. There are still many possibilities and features that will be implemented in the future! The goal is to provide a complete workout environment where users can execute training sessions, share progress, and browse workouts from other members.

## 🚀 Key Features

* 🛡️ **Authentication & Authorization:** Secure login via Google OAuth and authorization system using JWT Bearer Tokens. Powered by .NET Identity.
* 🏋️ **Workout & Routine Management:** Create and manage complete workout sessions and routines.
* 🔍 **Exercise Exploration:** Integrated with [ExerciseDB API](https://www.exercisedb.dev/) allowing you to explore and import thousands of exercises.
* 🗃️ **Global State Management:** Uses React Redux (RTK) for seamless client-side logic management.
* 🎨 **Modern User Interface:** Elegant design utilizing Radix UI and framer-motion for smooth animations and full accessibility (a11y). Dark/Light theme support via `next-themes`.

---

## 🗺️ Roadmap / Future Features

As the project is continually expanding, here's a glimpse of what's coming next:
- **Active Workout Execution:** A dedicated mode for tracking live exercises, sets, reps, and rest timers.
- **Social Features:** Browse and import workout plans created by other users from the community.
- **Progress Tracking & Analytics:** Visual charts and statistics of your workout progress over time.
- **Advanced Filtering:** Better search mechanisms for exercises and routines.

---

## 🛠️ Architecture and Technologies

The application's architecture is divided into two main modules:

### Frontend (`grindvibe-frontend`)
* **Core:** React 19, TypeScript, React Router DOM v7
* **Build Tool:** Vite
* **Styling & UI:** Tailwind CSS v4, Radix UI Primitives, Lucide Icons
* **Animations:** Framer Motion
* **State Management & HTTP:** Redux Toolkit, Axios
* **Data Validation:** Zod
* **Client-side Auth:** `@react-oauth/google`

### Backend (`grindvibe-backend`)
* **Core:** .NET 9.0 Web API (C#)
* **Database & ORM:** SQLite + Entity Framework Core 9.0
* **Auth & Identity:** ASP.NET Core Identity, JWT (JSON Web Tokens), Google APIs Auth
* **API Documentation:** Swagger / OpenAPI
* **Security & Config:** DotNetEnv for environment variables management, CORS policies configuration.

---

## ⚙️ Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS recommended)
- [.NET SDK 9.0](https://dotnet.microsoft.com/download/dotnet/9.0)
- NPM package manager

### Step 1: Clone the repository
```bash
git clone https://github.com/YourUsername/grindvibe.git
cd grindvibe
```

### Step 2: Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd grindvibe-backend
   ```
2. Configure environment variables:
   Create a `.env` file and/or adjust `appsettings.json`, making sure keys like `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience`, and `GoogleAuth:ClientId` are provided.
3. Apply database migrations:
   ```bash
   dotnet ef database update
   ```
4. Run the application:
   ```bash
   dotnet run
   ```
   *Swagger UI will be available at e.g., `http://localhost:5000/swagger`.*

### Step 3: Frontend Setup
1. Open a new terminal, return to the root directory, and navigate to the frontend:
   ```bash
   cd grindvibe-frontend
   ```
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will be available at the address shown in the console (usually `http://localhost:5173`).*

---

## 📸 Screenshots

Here are some glimpses of the application:

![Homepage](./docs/images/home.png)
<br/>
![Exercises View](./docs/images/exercises.png)
<br/>
![New Routine View](./docs/images/new_routine.png)

*(Note: Create a `docs/images` folder in your repository root and place the above screenshots there with matching filenames: `home.png`, `exercises.png`, and `new_routine.png`.)*


