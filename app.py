from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from models import db, User, Task, Completion
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dwag.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# Authentication routes
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        if User.query.filter_by(username=username).first():
            flash('Username already exists', 'error')
            return redirect(url_for('register'))
        
        if User.query.filter_by(email=email).first():
            flash('Email already exists', 'error')
            return redirect(url_for('register'))
            
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            session['user_id'] = user.id
            session['username'] = user.username
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))

# Main application routes
@app.route('/')
def index():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return redirect(url_for('dashboard'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    today = datetime.utcnow().date()
    
    # Get all tasks for the user
    all_tasks = Task.query.filter(Task.user_id == user_id).all()
    
    # Filter tasks that are active today (start_date <= today <= start_date + repeat_days)
    active_tasks = []
    for task in all_tasks:
        end_date = task.start_date + timedelta(days=task.repeat_days)
        if task.start_date.date() <= today <= end_date.date():
            active_tasks.append(task)
    
    # Check completion status for today
    today_completions = {}
    for task in active_tasks:
        completion = Completion.query.filter(
            Completion.task_id == task.id,
            Completion.user_id == user_id,
            db.func.date(Completion.date) == today
        ).first()
        
        today_completions[task.id] = completion.completed if completion else False
    
    # Get current date for display
    now = datetime.utcnow()
    
    return render_template('dashboard.html', tasks=active_tasks, today_completions=today_completions, now=now)

@app.route('/add_task', methods=['GET', 'POST'])
def add_task():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        title = request.form['title']
        category = request.form['category']
        repeat_days = int(request.form['repeat_days'])
        
        task = Task(
            title=title,
            category=category,
            repeat_days=repeat_days,
            user_id=session['user_id']
        )
        
        db.session.add(task)
        db.session.commit()
        
        flash('Task added successfully!', 'success')
        return redirect(url_for('dashboard'))
    
    return render_template('add_task.html')

@app.route('/complete_task/<int:task_id>', methods=['POST'])
def complete_task(task_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    task = Task.query.get_or_404(task_id)
    if task.user_id != session['user_id']:
        flash('Unauthorized action', 'error')
        return redirect(url_for('dashboard'))
    
    today = datetime.utcnow().date()
    
    # Check if completion record already exists for today
    completion = Completion.query.filter(
        Completion.task_id == task.id,
        Completion.user_id == session['user_id'],
        db.func.date(Completion.date) == today
    ).first()
    
    if completion:
        completion.completed = not completion.completed
    else:
        completion = Completion(
            task_id=task.id,
            user_id=session['user_id'],
            completed=True
        )
        db.session.add(completion)
    
    db.session.commit()
    
    return redirect(url_for('dashboard'))

@app.route('/progress')
def progress():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    categories = ['PHYSICAL', 'AMBITION', 'SOCIAL', 'INTELLECT', 'DISCIPLINE', 'MENTAL']
    
    # Calculate current progress for each category
    category_stats = {}
    for category in categories:
        # Total tasks in this category
        total_tasks = Task.query.filter(
            Task.user_id == user_id,
            Task.category == category
        ).count()
        
        # Completed tasks in this category
        completed_tasks = db.session.query(Completion).join(Task).filter(
            Task.user_id == user_id,
            Task.category == category,
            Completion.completed == True
        ).count()
        
        # Calculate current streak for this category
        streak = calculate_streak(user_id, category)
        
        percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        category_stats[category] = {
            'percentage': round(percentage),
            'completed': completed_tasks,
            'total': total_tasks,
            'streak': streak
        }
    
    # Get trend data for line chart
    trend_data = get_trend_data(user_id)
    
    # Get recent task history
    task_history = get_task_history(user_id)
    
    return render_template(
        'progress.html',
        category_stats=jsonify(category_stats).get_json(),
        trend_data=jsonify(trend_data).get_json(),
        task_history=jsonify(task_history).get_json()
    )

def calculate_streak(user_id, category):
    # Get all completions for this category ordered by date
    completions = db.session.query(Completion.date, Completion.completed)\
        .join(Task)\
        .filter(
            Task.user_id == user_id,
            Task.category == category
        )\
        .order_by(Completion.date.desc())\
        .all()
    
    streak = 0
    today = datetime.utcnow().date()
    
    for i, (date, completed) in enumerate(completions):
        if date.date() == today - timedelta(days=i):
            if completed:
                streak += 1
            else:
                break
        else:
            break
    
    return streak

def get_trend_data(user_id):
    # Get data for last 14 days
    dates = []
    for i in range(14):
        date = (datetime.utcnow() - timedelta(days=13 - i)).date()
        dates.append(date.strftime('%b %d'))
    
    categories = ['PHYSICAL', 'AMBITION', 'SOCIAL', 'INTELLECT', 'DISCIPLINE', 'MENTAL']
    trend_data = {
        'dates': dates,
        'PHYSICAL': {'values': []},
        'AMBITION': {'values': []},
        'SOCIAL': {'values': []},
        'INTELLECT': {'values': []},
        'DISCIPLINE': {'values': []},
        'MENTAL': {'values': []}
    }
    
    for category in categories:
        for i in range(14):
            date = datetime.utcnow() - timedelta(days=13 - i)
            
            # Total tasks in this category
            total_tasks = Task.query.filter(
                Task.user_id == user_id,
                Task.category == category,
                Task.start_date <= date,
                Task.start_date + db.func.cast(Task.repeat_days, db.Integer) >= date
            ).count()
            
            # Completed tasks on this date
            completed_tasks = db.session.query(Completion)\
                .join(Task)\
                .filter(
                    Task.user_id == user_id,
                    Task.category == category,
                    db.func.date(Completion.date) == date.date(),
                    Completion.completed == True
                )\
                .count()
            
            percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
            trend_data[category]['values'].append(round(percentage))
    
    return trend_data

def get_task_history(user_id, limit=10):
    # Get recent task completions/misses
    history = []
    
    completions = db.session.query(Task.title, Completion.date, Completion.completed)\
        .join(Task)\
        .filter(Task.user_id == user_id)\
        .order_by(Completion.date.desc())\
        .limit(limit)\
        .all()
    
    for title, date, completed in completions:
        history.append({
            'task_name': title,
            'date': date.strftime('%b %d, %Y'),
            'completed': completed
        })
    
    return history

if __name__ == '__main__':
    app.run(debug=True)   