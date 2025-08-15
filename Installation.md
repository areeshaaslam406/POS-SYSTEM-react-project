
# Installation & Setup

## Prerequisites
- .NET 8 SDK or later installed
- SQL Server instance running
- Node.js and npm installed (for React frontend)

## Backend Setup
1. Clone the repository:
git clone <your-repo-url>
cd your-project-backend-folder


2. Update `appsettings.json` with your SQL Server connection string.

3. Restore .NET packages and build the project:
dotnet restore
dotnet build


4. Run database migrations or execute the provided SQL scripts to create necessary tables and stored procedures.
5. Start the backend API:
dotnet run



## Frontend Setup
1. Navigate to the frontend folder:
cd your-frontend-folder


2. Install dependencies:
npm install


3. Start the React app:
npm start



The React app will run by default at `http://localhost:5173` and connect to the backend API at `http://localhost:5000` (adjust if necessary).
