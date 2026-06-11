# 🎓 Student Grievance System (SGS)

A modern, full-stack web application designed for educational institutions to efficiently manage, track, and resolve student grievances in a transparent manner.

---

## 🌟 Key Features

- **🧑‍🎓 Student Portal:** Secure login/registration for students.
- **📝 Easy Submission:** Smart forms with auto-filled student details to prevent errors.
- **📊 Real-time Tracking:** Dedicated dashboard for students to track the live status of their complaints (Pending, Under Review, Resolved, Rejected).
- **🛡️ Secure Admin Panel:** A separate, password-protected portal for administrators.
- **📈 Admin Analytics:** Visual charts and statistics showing grievance distribution by category.
- **📱 Responsive Design:** A beautiful, glassmorphic UI with dark mode support that works flawlessly on desktop and mobile.

---

## 🛠️ Technology Stack

### Frontend (User Interface)
- **HTML5 & CSS3:** Custom styling with modern UI/UX principles (Glassmorphism, Dark Theme).
- **Vanilla JavaScript (ES6+):** For DOM manipulation, API fetching, and dynamic rendering.
- **No heavy frameworks:** Ensuring lightning-fast load times.

### Backend (Server & API)
- **Python 3:** Core backend programming language.
- **FastAPI:** A highly performant, modern web framework for building APIs.
- **Uvicorn:** Lightning-fast ASGI server.
- **RESTful API Architecture.**

### Database & Security
- **PostgreSQL:** Cloud-hosted database via Neon.tech.
- **SQLAlchemy ORM:** For secure, object-oriented database interactions.
- **Bcrypt:** State-of-the-art cryptographic hashing for student passwords.
- **Pydantic:** Strict data validation for incoming requests.

---

## 📁 Project Structure

```
web project/
│
├── .env                # Secret configurations (Database URL, Admin Password)
├── requirements.txt    # Python dependencies
│
├── backend/            # Backend API Source Code
│   ├── main.py         # FastAPI application and route definitions
│   └── database/
│       └── connection.py # PostgreSQL connection setup
│
└── frontend/           # User Interface Source Code
    ├── index.html      # Landing page
    ├── student-login.html
    ├── student-dashboard.html
    ├── admin.html      # Admin portal
    ├── styles.css      # Core styling
    └── app.js          # Shared frontend logic
```

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.8+
- Visual Studio Code (with "Live Server" extension recommended)

### 1. Backend Setup
1. Open the terminal and navigate to the project directory.
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the root directory and add your PostgreSQL credentials:
   ```env
   DATABASE_URL=postgresql://username:password@host/dbname?sslmode=require
   ADMIN_PASSWORD=your_secure_password
   ```
4. Run the FastAPI server:
   ```bash
   python -m uvicorn backend.main:app --reload --port 8000
   ```
   *The backend will now run at http://localhost:8000*

### 2. Frontend Setup
1. Open Visual Studio Code.
2. Expand the `frontend` folder.
3. Right-click on `index.html` and select **"Open with Live Server"**.
4. The application will launch in your default browser.

---

## 👤 Default Credentials
- **Admin Password:** Configured in your `.env` file (Default fallback: `admin123`)
- **Student Account:** Please register a new student account via the Student Portal to test submissions.

---
*Built with ❤️ for a transparent educational ecosystem.*
