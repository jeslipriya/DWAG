# DWAG (Do With A Goal) 

DWAG is a full-stack productivity tracker that helps users build better habits through categorized tasks, daily repetition, visual progress, and personal accountability. It’s a life-transforming planner built with Flask, SQLAlchemy, and Chart.js!

## Features

- User Registration & Login
- Add tasks by category (PHYSICAL, AMBITION, etc.)
- Set task repeat duration (daily streak system)
- Mark tasks as completed
- Visual progress graphs (Radar chart)
- Track your habit streaks and completion history
- Category-wise analytics and daily trends
- SQLite database with SQLAlchemy ORM

## Tech Stack

- **Backend:** Flask, Werkzeug
- **Frontend:** HTML5, CSS3, JavaScript
- **Database:** SQLAlchemy
- **Authentication:** Flask Sessions

## Project Structure

```
        /DWAG/  
        │  
        ├── /static/              # Static files (CSS, JS, images)  
        │   ├── css/  
        │   │   └── style.css     # Custom styles  (dark theme) 
        │   └── js/  
        │       ├── chart.js      # Chart rendering & dynamic interactions  
        │       ├── script.js     # For smooth animation
        │       └── progress.js   # For progress bar
        │  
        ├── /templates/           # HTML templates    
        │   ├── base.html         # Base template (navbar, footer)  
        │   ├── dashboard.html    # Homepage (goal dashboard)  
        │   ├── register.html     # For register page
        │   ├── login.html        # For Login page
        │   ├── add_task.html     # Form to add a new goal  
        │   └── progress.j2       # Progress visualization (spider graph)  
        │  
        ├── app.py                # Flask backend (routes & logic)  
        ├── models.py             # Database models (SQLAlchemy)  
        ├── requirements.txt      # Python dependencies  
        └── README.md             # Project documentation  

```


## Installation

1. **Clone this repo:**
    ```bash
    git clone https://github.com/your-username/dwag.git
    cd dwag
    ```

2. **Navigate to the Project Directory:**
    ```
    cd DWAG
    ```

3. **Create virtual environment & activate:**
    ```
    python -m venv venv
    source venv/bin/activate   # On Windows: venv\Scripts\activate
    ```

4. **Install dependencies:**
    ```
    pip install -r requirements.txt
    ```

5. **Run the app:**
    ```
    python app.py
    ```
6. **Visit:**
    ```
    http://127.0.0.1:5000/
    ```

## Future Improvements

- Add notifications/reminders
- Make mobile responsive
- Calendar view for task tracking
- Premium features (gamification, insights)
- API integration for external habits (e.g., Fitbit)



> “Discipline is doing what needs to be done, even when you don’t feel like doing it.” - DWAG Philosophy 


---

Open to collaboration - contributions to improve this project are always welcome!