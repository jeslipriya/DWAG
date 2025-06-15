from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Goal, Task, Progress
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dwag.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()

# Routes
@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        # Check if user exists
        if User.query.filter_by(email=email).first():
            flash('Email already registered', 'error')
            return redirect(url_for('register'))
        
        # Create new user - FIXED: Using default pbkdf2:sha256 method
        hashed_password = generate_password_hash(password)
        new_user = User(username=username, email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        user = User.query.filter_by(email=email).first()
        
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        
        flash('Invalid email or password', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('You have been logged out', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    goals = Goal.query.filter_by(user_id=user_id).all()
    
    # Get today's tasks
    today = datetime.now().date()
    tasks = Task.query.filter(Task.user_id == user_id, Task.date == today).all()
    
    # Pass current datetime to template
    return render_template('dashboard.html', goals=goals, tasks=tasks, now=datetime.now())

@app.route('/add_goal', methods=['GET', 'POST'])
def add_goal():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        title = request.form['title']
        category = request.form['category']
        target_date = datetime.strptime(request.form['target_date'], '%Y-%m-%d').date()
        description = request.form['description']
        
        new_goal = Goal(
            title=title,
            category=category,
            target_date=target_date,
            description=description,
            user_id=session['user_id']
        )
        
        db.session.add(new_goal)
        db.session.commit()
        
        flash('Goal added successfully!', 'success')
        return redirect(url_for('dashboard'))
    
    return render_template('add_goal.html')

@app.route('/add_task', methods=['POST'])
def add_task():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    goal_id = request.form['goal_id']
    description = request.form['description']
    date = datetime.strptime(request.form['date'], '%Y-%m-%d').date()
    
    new_task = Task(
        description=description,
        date=date,
        goal_id=goal_id,
        user_id=session['user_id'],
        completed=False
    )
    
    db.session.add(new_task)
    db.session.commit()
    
    flash('Task added successfully!', 'success')
    return redirect(url_for('dashboard'))

@app.route('/complete_task/<int:task_id>')
def complete_task(task_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    task = Task.query.get(task_id)
    if task and task.user_id == session['user_id']:
        task.completed = True
        db.session.commit()
        
        # Update progress
        goal = task.goal
        today = datetime.now().date()
        progress = Progress.query.filter_by(goal_id=goal.id, date=today).first()
        
        if not progress:
            progress = Progress(goal_id=goal.id, date=today, value=1)
            db.session.add(progress)
        else:
            progress.value += 1
        
        db.session.commit()
    
    return redirect(url_for('dashboard'))

@app.route('/progress/<int:goal_id>')
def progress(goal_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    goal = Goal.query.get(goal_id)
    if not goal or goal.user_id != session['user_id']:
        return redirect(url_for('dashboard'))
    
    # Calculate progress data for spider chart
    categories = ['PHYSICAL', 'AMBITION', 'SOCIAL', 'INTELLECT', 'DISCIPLINE', 'MENTAL']
    progress_data = {}
    
    for category in categories:
        category_goals = Goal.query.filter_by(user_id=session['user_id'], category=category).all()
        total_tasks = 0
        completed_tasks = 0
        
        for g in category_goals:
            tasks = Task.query.filter_by(goal_id=g.id).all()
            total_tasks += len(tasks)
            completed_tasks += len([t for t in tasks if t.completed])
        
        progress_data[category] = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    return render_template('progress.html', goal=goal, progress_data=json.dumps(progress_data))

if __name__ == '__main__':
    app.run(debug=True)