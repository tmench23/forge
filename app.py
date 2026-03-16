"""
ForgeFit - Home Workout Companion
A comprehensive workout tracking app with strength training, mobility, and cardio.
"""

import os
import json
from datetime import datetime, timedelta
from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Database configuration - separate databases for different concerns
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_DIR = os.path.join(BASE_DIR, 'databases')
os.makedirs(DB_DIR, exist_ok=True)

app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(DB_DIR, "workout_core.db")}'
app.config['SQLALCHEMY_BINDS'] = {
    'progress': f'sqlite:///{os.path.join(DB_DIR, "progress_tracking.db")}',
    'exercises': f'sqlite:///{os.path.join(DB_DIR, "exercise_library.db")}',
    'motivation': f'sqlite:///{os.path.join(DB_DIR, "motivation.db")}',
}
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'forgefit-home-workout-2026'

db = SQLAlchemy(app)


# ──────────────────────────────────────────────────
# MODELS - Core Database (workout_core.db)
# ──────────────────────────────────────────────────

class WorkoutSchedule(db.Model):
    """Weekly workout schedule"""
    __tablename__ = 'workout_schedule'
    id = db.Column(db.Integer, primary_key=True)
    day_of_week = db.Column(db.Integer, nullable=False)  # 0=Monday ... 6=Sunday
    workout_type = db.Column(db.String(50), nullable=False)  # strength, mobility, cardio, rest
    workout_name = db.Column(db.String(100), nullable=False)
    template_id = db.Column(db.Integer, nullable=True)  # FK to workout_templates (nullable for rest days)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'day_of_week': self.day_of_week,
            'workout_type': self.workout_type,
            'workout_name': self.workout_name,
            'template_id': self.template_id,
            'description': self.description,
            'is_active': self.is_active,
        }


class WorkoutSession(db.Model):
    """Individual workout sessions completed by the user"""
    __tablename__ = 'workout_sessions'
    id = db.Column(db.Integer, primary_key=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('workout_schedule.id'), nullable=True)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    workout_type = db.Column(db.String(50), nullable=False)
    workout_name = db.Column(db.String(100), nullable=False)
    duration_minutes = db.Column(db.Integer)
    notes = db.Column(db.Text)
    rating = db.Column(db.Integer)  # 1-5 how the workout felt
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'schedule_id': self.schedule_id,
            'date': self.date.isoformat() if self.date else None,
            'workout_type': self.workout_type,
            'workout_name': self.workout_name,
            'duration_minutes': self.duration_minutes,
            'notes': self.notes,
            'rating': self.rating,
            'completed': self.completed,
        }


# ──────────────────────────────────────────────────
# MODELS - Progress Database (progress_tracking.db)
# ──────────────────────────────────────────────────

class ExerciseLog(db.Model):
    """Individual exercise sets logged during workouts"""
    __bind_key__ = 'progress'
    __tablename__ = 'exercise_logs'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, nullable=False)
    exercise_id = db.Column(db.Integer, nullable=False)
    exercise_name = db.Column(db.String(100), nullable=False)
    set_number = db.Column(db.Integer, nullable=False)
    target_reps = db.Column(db.Integer)
    actual_reps = db.Column(db.Integer)
    weight_lbs = db.Column(db.Float, default=0)
    duration_seconds = db.Column(db.Integer)  # for timed exercises
    completed = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'exercise_id': self.exercise_id,
            'exercise_name': self.exercise_name,
            'set_number': self.set_number,
            'target_reps': self.target_reps,
            'actual_reps': self.actual_reps,
            'weight_lbs': self.weight_lbs,
            'duration_seconds': self.duration_seconds,
            'completed': self.completed,
            'notes': self.notes,
        }


class PersonalRecord(db.Model):
    """Track personal records for each exercise"""
    __bind_key__ = 'progress'
    __tablename__ = 'personal_records'
    id = db.Column(db.Integer, primary_key=True)
    exercise_id = db.Column(db.Integer, nullable=False)
    exercise_name = db.Column(db.String(100), nullable=False)
    record_type = db.Column(db.String(30), nullable=False)  # max_weight, max_reps, max_duration
    value = db.Column(db.Float, nullable=False)
    achieved_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'exercise_id': self.exercise_id,
            'exercise_name': self.exercise_name,
            'record_type': self.record_type,
            'value': self.value,
            'achieved_date': self.achieved_date.isoformat() if self.achieved_date else None,
        }


class BodyMetrics(db.Model):
    """Track body measurements over time"""
    __bind_key__ = 'progress'
    __tablename__ = 'body_metrics'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    weight_lbs = db.Column(db.Float)
    body_fat_pct = db.Column(db.Float)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat() if self.date else None,
            'weight_lbs': self.weight_lbs,
            'body_fat_pct': self.body_fat_pct,
            'notes': self.notes,
        }


# ──────────────────────────────────────────────────
# MODELS - Exercise Library (exercise_library.db)
# ──────────────────────────────────────────────────

class Exercise(db.Model):
    """Exercise definitions with form guides"""
    __bind_key__ = 'exercises'
    __tablename__ = 'exercises'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # strength, mobility, cardio
    muscle_group = db.Column(db.String(50), nullable=False)  # chest, back, legs, etc.
    equipment = db.Column(db.String(100))  # dumbbells, bands, bench, bodyweight
    difficulty = db.Column(db.String(20), default='intermediate')  # beginner, intermediate, advanced
    description = db.Column(db.Text)
    form_cues = db.Column(db.Text)  # JSON array of form tips
    animation_url = db.Column(db.String(500))  # URL to demonstration GIF/video
    target_sets = db.Column(db.Integer, default=3)
    target_reps = db.Column(db.Integer, default=12)
    target_duration_seconds = db.Column(db.Integer)  # for timed exercises
    is_timed = db.Column(db.Boolean, default=False)
    back_hip_focus = db.Column(db.Boolean, default=False)  # special flag for back/hip exercises

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'muscle_group': self.muscle_group,
            'equipment': self.equipment,
            'difficulty': self.difficulty,
            'description': self.description,
            'form_cues': json.loads(self.form_cues) if self.form_cues else [],
            'animation_url': self.animation_url,
            'target_sets': self.target_sets,
            'target_reps': self.target_reps,
            'target_duration_seconds': self.target_duration_seconds,
            'is_timed': self.is_timed,
            'back_hip_focus': self.back_hip_focus,
        }


class WorkoutTemplate(db.Model):
    """Pre-built workout templates"""
    __bind_key__ = 'exercises'
    __tablename__ = 'workout_templates'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    workout_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    exercise_ids = db.Column(db.Text)  # JSON array of exercise IDs
    order_index = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'workout_type': self.workout_type,
            'description': self.description,
            'exercise_ids': json.loads(self.exercise_ids) if self.exercise_ids else [],
        }


# ──────────────────────────────────────────────────
# MODELS - Motivation Database (motivation.db)
# ──────────────────────────────────────────────────

class Achievement(db.Model):
    """User achievements/badges"""
    __bind_key__ = 'motivation'
    __tablename__ = 'achievements'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    icon = db.Column(db.String(10))  # emoji icon
    requirement_type = db.Column(db.String(50))  # workouts_completed, streak, weight_lifted
    requirement_value = db.Column(db.Integer)
    unlocked = db.Column(db.Boolean, default=False)
    unlocked_date = db.Column(db.Date)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'requirement_type': self.requirement_type,
            'requirement_value': self.requirement_value,
            'unlocked': self.unlocked,
            'unlocked_date': self.unlocked_date.isoformat() if self.unlocked_date else None,
        }


class MotivationalQuote(db.Model):
    """Motivational quotes displayed on dashboard"""
    __bind_key__ = 'motivation'
    __tablename__ = 'motivational_quotes'
    id = db.Column(db.Integer, primary_key=True)
    quote = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(100))

    def to_dict(self):
        return {'id': self.id, 'quote': self.quote, 'author': self.author}


class Streak(db.Model):
    """Track workout streaks"""
    __bind_key__ = 'motivation'
    __tablename__ = 'streaks'
    id = db.Column(db.Integer, primary_key=True)
    current_streak = db.Column(db.Integer, default=0)
    longest_streak = db.Column(db.Integer, default=0)
    last_workout_date = db.Column(db.Date)
    total_workouts = db.Column(db.Integer, default=0)
    total_minutes = db.Column(db.Integer, default=0)
    total_weight_lifted = db.Column(db.Float, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'current_streak': self.current_streak,
            'longest_streak': self.longest_streak,
            'last_workout_date': self.last_workout_date.isoformat() if self.last_workout_date else None,
            'total_workouts': self.total_workouts,
            'total_minutes': self.total_minutes,
            'total_weight_lifted': self.total_weight_lifted,
        }


# ──────────────────────────────────────────────────
# PAGE ROUTES
# ──────────────────────────────────────────────────

@app.route('/')
def dashboard():
    return render_template('dashboard.html')


@app.route('/schedule')
def schedule():
    return render_template('schedule.html')


@app.route('/workout/<int:template_id>')
def workout(template_id):
    return render_template('workout.html', template_id=template_id)


@app.route('/exercises')
def exercise_library():
    return render_template('exercises.html')


@app.route('/exercise/<int:exercise_id>')
def exercise_detail(exercise_id):
    return render_template('exercise_detail.html', exercise_id=exercise_id)


@app.route('/progress')
def progress():
    return render_template('progress.html')


@app.route('/achievements')
def achievements():
    return render_template('achievements.html')


# ──────────────────────────────────────────────────
# API ROUTES - Schedule
# ──────────────────────────────────────────────────

@app.route('/api/schedule', methods=['GET'])
def get_schedule():
    schedules = WorkoutSchedule.query.filter_by(is_active=True).order_by(WorkoutSchedule.day_of_week).all()
    return jsonify([s.to_dict() for s in schedules])


@app.route('/api/schedule', methods=['POST'])
def update_schedule():
    data = request.json
    # Clear existing schedule
    WorkoutSchedule.query.delete()
    for item in data:
        schedule = WorkoutSchedule(
            day_of_week=item['day_of_week'],
            workout_type=item['workout_type'],
            workout_name=item['workout_name'],
            template_id=item.get('template_id'),
            description=item.get('description', ''),
        )
        db.session.add(schedule)
    db.session.commit()
    return jsonify({'status': 'ok'})


@app.route('/api/today', methods=['GET'])
def get_today():
    today = datetime.now()
    dow = today.weekday()
    schedule = WorkoutSchedule.query.filter_by(day_of_week=dow, is_active=True).first()

    # Check if already completed today
    session = WorkoutSession.query.filter_by(date=today.date(), completed=True).first()

    result = {
        'day_of_week': dow,
        'day_name': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dow],
        'schedule': schedule.to_dict() if schedule else None,
        'completed_today': session is not None,
    }
    return jsonify(result)


# ──────────────────────────────────────────────────
# API ROUTES - Exercises
# ──────────────────────────────────────────────────

@app.route('/api/exercises', methods=['GET'])
def get_exercises():
    category = request.args.get('category')
    muscle = request.args.get('muscle_group')
    query = Exercise.query
    if category:
        query = query.filter_by(category=category)
    if muscle:
        query = query.filter_by(muscle_group=muscle)
    exercises = query.order_by(Exercise.muscle_group, Exercise.name).all()
    return jsonify([e.to_dict() for e in exercises])


@app.route('/api/exercises/<int:exercise_id>', methods=['GET'])
def get_exercise(exercise_id):
    exercise = Exercise.query.get_or_404(exercise_id)
    return jsonify(exercise.to_dict())


# ──────────────────────────────────────────────────
# API ROUTES - Workout Templates
# ──────────────────────────────────────────────────

@app.route('/api/templates', methods=['GET'])
def get_templates():
    templates = WorkoutTemplate.query.order_by(WorkoutTemplate.order_index).all()
    result = []
    for t in templates:
        td = t.to_dict()
        exercise_ids = td['exercise_ids']
        exercises = Exercise.query.filter(Exercise.id.in_(exercise_ids)).all()
        # Preserve order
        ex_map = {e.id: e.to_dict() for e in exercises}
        td['exercises'] = [ex_map[eid] for eid in exercise_ids if eid in ex_map]
        result.append(td)
    return jsonify(result)


@app.route('/api/templates/<int:template_id>', methods=['GET'])
def get_template(template_id):
    template = WorkoutTemplate.query.get_or_404(template_id)
    td = template.to_dict()
    exercise_ids = td['exercise_ids']
    exercises = Exercise.query.filter(Exercise.id.in_(exercise_ids)).all()
    ex_map = {e.id: e.to_dict() for e in exercises}
    td['exercises'] = [ex_map[eid] for eid in exercise_ids if eid in ex_map]
    return jsonify(td)


# ──────────────────────────────────────────────────
# API ROUTES - Workout Sessions & Logging
# ──────────────────────────────────────────────────

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    limit = request.args.get('limit', 30, type=int)
    sessions = WorkoutSession.query.order_by(WorkoutSession.date.desc()).limit(limit).all()
    return jsonify([s.to_dict() for s in sessions])


@app.route('/api/sessions', methods=['POST'])
def create_session():
    data = request.json
    session = WorkoutSession(
        schedule_id=data.get('schedule_id'),
        date=datetime.strptime(data['date'], '%Y-%m-%d').date() if 'date' in data else datetime.utcnow().date(),
        workout_type=data['workout_type'],
        workout_name=data['workout_name'],
        duration_minutes=data.get('duration_minutes', 0),
        notes=data.get('notes', ''),
        rating=data.get('rating'),
        completed=data.get('completed', False),
    )
    db.session.add(session)
    db.session.commit()
    return jsonify(session.to_dict()), 201


@app.route('/api/sessions/<int:session_id>', methods=['PUT'])
def update_session(session_id):
    session = WorkoutSession.query.get_or_404(session_id)
    data = request.json
    if 'completed' in data:
        session.completed = data['completed']
    if 'duration_minutes' in data:
        session.duration_minutes = data['duration_minutes']
    if 'rating' in data:
        session.rating = data['rating']
    if 'notes' in data:
        session.notes = data['notes']
    db.session.commit()

    # Update streak if completing workout
    if session.completed:
        _update_streak(session)

    return jsonify(session.to_dict())


@app.route('/api/logs', methods=['POST'])
def create_log():
    data = request.json
    log = ExerciseLog(
        session_id=data['session_id'],
        exercise_id=data['exercise_id'],
        exercise_name=data['exercise_name'],
        set_number=data['set_number'],
        target_reps=data.get('target_reps'),
        actual_reps=data.get('actual_reps'),
        weight_lbs=data.get('weight_lbs', 0),
        duration_seconds=data.get('duration_seconds'),
        completed=data.get('completed', False),
        notes=data.get('notes', ''),
    )
    db.session.add(log)
    db.session.commit()

    # Check for personal records
    if log.completed:
        _check_personal_record(log)

    return jsonify(log.to_dict()), 201


@app.route('/api/logs/<int:log_id>', methods=['PUT'])
def update_log(log_id):
    log = ExerciseLog.query.get_or_404(log_id)
    data = request.json
    if 'actual_reps' in data:
        log.actual_reps = data['actual_reps']
    if 'weight_lbs' in data:
        log.weight_lbs = data['weight_lbs']
    if 'duration_seconds' in data:
        log.duration_seconds = data['duration_seconds']
    if 'completed' in data:
        log.completed = data['completed']
    if 'notes' in data:
        log.notes = data['notes']
    db.session.commit()

    if log.completed:
        _check_personal_record(log)

    return jsonify(log.to_dict())


@app.route('/api/logs/session/<int:session_id>', methods=['GET'])
def get_session_logs(session_id):
    logs = ExerciseLog.query.filter_by(session_id=session_id).order_by(ExerciseLog.exercise_id, ExerciseLog.set_number).all()
    return jsonify([l.to_dict() for l in logs])


@app.route('/api/logs/exercise/<int:exercise_id>/history', methods=['GET'])
def get_exercise_history(exercise_id):
    logs = ExerciseLog.query.filter_by(exercise_id=exercise_id, completed=True).order_by(ExerciseLog.created_at.desc()).limit(50).all()
    return jsonify([l.to_dict() for l in logs])


# ──────────────────────────────────────────────────
# API ROUTES - Progress & Metrics
# ──────────────────────────────────────────────────

@app.route('/api/progress/summary', methods=['GET'])
def get_progress_summary():
    # Get all completed sessions
    sessions = WorkoutSession.query.filter_by(completed=True).all()
    total_workouts = len(sessions)
    total_minutes = sum(s.duration_minutes or 0 for s in sessions)

    # Weekly breakdown
    week_start = datetime.now().date() - timedelta(days=datetime.now().weekday())
    this_week = [s for s in sessions if s.date and s.date >= week_start]

    # Get streak info
    streak = Streak.query.first()

    # Recent PRs
    prs = PersonalRecord.query.order_by(PersonalRecord.achieved_date.desc()).limit(5).all()

    return jsonify({
        'total_workouts': total_workouts,
        'total_minutes': total_minutes,
        'this_week_count': len(this_week),
        'streak': streak.to_dict() if streak else {'current_streak': 0, 'longest_streak': 0, 'total_workouts': 0},
        'recent_prs': [p.to_dict() for p in prs],
    })


@app.route('/api/progress/exercise/<int:exercise_id>', methods=['GET'])
def get_exercise_progress(exercise_id):
    logs = ExerciseLog.query.filter_by(exercise_id=exercise_id, completed=True).order_by(ExerciseLog.created_at).all()
    return jsonify([l.to_dict() for l in logs])


@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    metrics = BodyMetrics.query.order_by(BodyMetrics.date.desc()).limit(90).all()
    return jsonify([m.to_dict() for m in metrics])


@app.route('/api/metrics', methods=['POST'])
def add_metric():
    data = request.json
    metric = BodyMetrics(
        date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
        weight_lbs=data.get('weight_lbs'),
        body_fat_pct=data.get('body_fat_pct'),
        notes=data.get('notes', ''),
    )
    db.session.add(metric)
    db.session.commit()
    return jsonify(metric.to_dict()), 201


@app.route('/api/personal-records', methods=['GET'])
def get_personal_records():
    prs = PersonalRecord.query.order_by(PersonalRecord.achieved_date.desc()).all()
    return jsonify([p.to_dict() for p in prs])


# ──────────────────────────────────────────────────
# API ROUTES - Motivation
# ──────────────────────────────────────────────────

@app.route('/api/streak', methods=['GET'])
def get_streak():
    streak = Streak.query.first()
    if not streak:
        streak = Streak(current_streak=0, longest_streak=0, total_workouts=0, total_minutes=0)
        db.session.add(streak)
        db.session.commit()
    return jsonify(streak.to_dict())


@app.route('/api/achievements', methods=['GET'])
def get_achievements():
    achievements = Achievement.query.all()
    return jsonify([a.to_dict() for a in achievements])


@app.route('/api/quote', methods=['GET'])
def get_random_quote():
    import random
    quotes = MotivationalQuote.query.all()
    if quotes:
        q = random.choice(quotes)
        return jsonify(q.to_dict())
    return jsonify({'quote': 'The only bad workout is the one that didn\'t happen.', 'author': 'Unknown'})


# ──────────────────────────────────────────────────
# API ROUTES - Weekly Calendar Heatmap
# ──────────────────────────────────────────────────

@app.route('/api/calendar', methods=['GET'])
def get_calendar():
    """Get workout completion data for the last 12 weeks"""
    end_date = datetime.now().date()
    start_date = end_date - timedelta(weeks=12)
    sessions = WorkoutSession.query.filter(
        WorkoutSession.date >= start_date,
        WorkoutSession.completed == True
    ).all()
    date_map = {}
    for s in sessions:
        key = s.date.isoformat()
        if key not in date_map:
            date_map[key] = {'count': 0, 'types': []}
        date_map[key]['count'] += 1
        date_map[key]['types'].append(s.workout_type)
    return jsonify(date_map)


# ──────────────────────────────────────────────────
# HELPER FUNCTIONS
# ──────────────────────────────────────────────────

def _update_streak(session):
    """Update workout streak after completing a session"""
    streak = Streak.query.first()
    if not streak:
        streak = Streak()
        db.session.add(streak)

    today = session.date or datetime.utcnow().date()
    streak.total_workouts = (streak.total_workouts or 0) + 1
    streak.total_minutes = (streak.total_minutes or 0) + (session.duration_minutes or 0)

    if streak.last_workout_date:
        days_diff = (today - streak.last_workout_date).days
        if days_diff <= 1:
            streak.current_streak = (streak.current_streak or 0) + 1
        elif days_diff > 2:
            streak.current_streak = 1
    else:
        streak.current_streak = 1

    if (streak.current_streak or 0) > (streak.longest_streak or 0):
        streak.longest_streak = streak.current_streak

    streak.last_workout_date = today
    db.session.commit()

    # Check achievements
    _check_achievements(streak)


def _check_personal_record(log):
    """Check if a new personal record was set"""
    if log.weight_lbs and log.weight_lbs > 0:
        existing = PersonalRecord.query.filter_by(
            exercise_id=log.exercise_id, record_type='max_weight'
        ).first()
        if not existing or log.weight_lbs > existing.value:
            if existing:
                existing.value = log.weight_lbs
                existing.achieved_date = datetime.utcnow().date()
            else:
                pr = PersonalRecord(
                    exercise_id=log.exercise_id,
                    exercise_name=log.exercise_name,
                    record_type='max_weight',
                    value=log.weight_lbs,
                    achieved_date=datetime.utcnow().date(),
                )
                db.session.add(pr)
            db.session.commit()


def _check_achievements(streak):
    """Check and unlock achievements based on current stats"""
    achievements = Achievement.query.filter_by(unlocked=False).all()
    for ach in achievements:
        unlocked = False
        if ach.requirement_type == 'workouts_completed' and streak.total_workouts >= ach.requirement_value:
            unlocked = True
        elif ach.requirement_type == 'streak' and streak.current_streak >= ach.requirement_value:
            unlocked = True
        elif ach.requirement_type == 'total_minutes' and streak.total_minutes >= ach.requirement_value:
            unlocked = True

        if unlocked:
            ach.unlocked = True
            ach.unlocked_date = datetime.utcnow().date()

    db.session.commit()


# ──────────────────────────────────────────────────
# DATABASE SEEDING
# ──────────────────────────────────────────────────

def seed_database():
    """Seed all databases with initial data"""
    _seed_exercises()
    _seed_templates()
    _seed_schedule()
    _seed_achievements()
    _seed_quotes()
    # Initialize streak
    if not Streak.query.first():
        db.session.add(Streak(current_streak=0, longest_streak=0, total_workouts=0, total_minutes=0))
        db.session.commit()


def _seed_exercises():
    """Seed the exercise library"""
    if Exercise.query.first():
        return

    exercises = [
        # ── STRENGTH: CHEST ──
        Exercise(
            name='Dumbbell Bench Press', category='strength', muscle_group='chest',
            equipment='dumbbells, bench', difficulty='intermediate',
            description='Classic chest builder using dumbbells on a flat bench.',
            form_cues=json.dumps([
                'Lie flat on bench with feet firmly on the floor',
                'Hold dumbbells at chest level, palms facing forward',
                'Press up until arms are extended but not locked',
                'Lower slowly with control, feeling the chest stretch',
                'Keep shoulder blades squeezed together throughout'
            ]),
            animation_url='',
            target_sets=4, target_reps=10,
        ),
        Exercise(
            name='Dumbbell Fly', category='strength', muscle_group='chest',
            equipment='dumbbells, bench', difficulty='intermediate',
            description='Isolation exercise for chest with a wide arc motion.',
            form_cues=json.dumps([
                'Lie on flat bench, dumbbells above chest with slight bend in elbows',
                'Lower arms in wide arc until you feel a stretch in the chest',
                'Keep the slight elbow bend constant throughout',
                'Squeeze chest to bring dumbbells back together',
                'Do not go too deep - stop when arms are level with torso'
            ]),
            animation_url='',
            target_sets=3, target_reps=12,
        ),
        Exercise(
            name='Incline Dumbbell Press', category='strength', muscle_group='chest',
            equipment='dumbbells, bench', difficulty='intermediate',
            description='Upper chest focused press on an inclined bench.',
            form_cues=json.dumps([
                'Set bench to 30-45 degree incline',
                'Hold dumbbells at upper chest level',
                'Press up and slightly inward',
                'Lower with control to upper chest',
                'Keep core braced and back pressed into bench'
            ]),
            animation_url='',
            target_sets=3, target_reps=10,
        ),
        Exercise(
            name='Push-Ups', category='strength', muscle_group='chest',
            equipment='bodyweight', difficulty='beginner',
            description='Fundamental bodyweight chest exercise.',
            form_cues=json.dumps([
                'Hands slightly wider than shoulder-width',
                'Body in straight line from head to heels',
                'Lower chest to floor with elbows at 45 degrees',
                'Push back up to full arm extension',
                'Keep core tight - no sagging hips'
            ]),
            animation_url='',
            target_sets=3, target_reps=15,
        ),

        # ── STRENGTH: BACK ──
        Exercise(
            name='Dumbbell Row', category='strength', muscle_group='back',
            equipment='dumbbells, bench', difficulty='intermediate',
            description='Single-arm row for building a strong back. Great for back tightness.',
            form_cues=json.dumps([
                'Place one knee and hand on bench for support',
                'Keep back flat and parallel to the floor',
                'Pull dumbbell up toward hip, driving elbow back',
                'Squeeze shoulder blade at the top',
                'Lower slowly with full control'
            ]),
            animation_url='',
            target_sets=4, target_reps=10, back_hip_focus=True,
        ),
        Exercise(
            name='Bent Over Dumbbell Row', category='strength', muscle_group='back',
            equipment='dumbbells', difficulty='intermediate',
            description='Two-arm row for thick back development.',
            form_cues=json.dumps([
                'Hinge at hips with slight knee bend',
                'Keep back flat at 45-degree angle',
                'Pull both dumbbells toward lower ribs',
                'Squeeze shoulder blades together at top',
                'Lower with control, feeling the stretch'
            ]),
            animation_url='',
            target_sets=4, target_reps=10, back_hip_focus=True,
        ),
        Exercise(
            name='Band Pull-Apart', category='strength', muscle_group='back',
            equipment='bands', difficulty='beginner',
            description='Excellent for posture and upper back health.',
            form_cues=json.dumps([
                'Hold band at shoulder height with arms extended',
                'Pull band apart by squeezing shoulder blades',
                'Arms should end up in a T position',
                'Slowly return to start with control',
                'Keep shoulders down, away from ears'
            ]),
            animation_url='',
            target_sets=3, target_reps=15, back_hip_focus=True,
        ),
        Exercise(
            name='Band Lat Pulldown', category='strength', muscle_group='back',
            equipment='bands', difficulty='beginner',
            description='Lat pulldown using door-anchored resistance band.',
            form_cues=json.dumps([
                'Anchor band at top of door',
                'Kneel or stand facing the door',
                'Pull handles down to shoulder level',
                'Squeeze lats at the bottom of movement',
                'Return slowly with full stretch at the top'
            ]),
            animation_url='',
            target_sets=3, target_reps=12, back_hip_focus=True,
        ),
        Exercise(
            name='Reverse Fly', category='strength', muscle_group='back',
            equipment='dumbbells', difficulty='intermediate',
            description='Targets rear delts and upper back for improved posture.',
            form_cues=json.dumps([
                'Hinge forward at hips, slight knee bend',
                'Start with dumbbells hanging below chest',
                'Raise arms out to sides, leading with elbows',
                'Squeeze shoulder blades at the top',
                'Use light weight and focus on the squeeze'
            ]),
            animation_url='',
            target_sets=3, target_reps=12, back_hip_focus=True,
        ),

        # ── STRENGTH: SHOULDERS ──
        Exercise(
            name='Dumbbell Shoulder Press', category='strength', muscle_group='shoulders',
            equipment='dumbbells, bench', difficulty='intermediate',
            description='Overhead press for strong, stable shoulders.',
            form_cues=json.dumps([
                'Sit on bench with back support or stand tall',
                'Start with dumbbells at shoulder height, palms forward',
                'Press up until arms are fully extended overhead',
                'Lower slowly to shoulder height',
                'Keep core braced throughout the movement'
            ]),
            animation_url='',
            target_sets=3, target_reps=10,
        ),
        Exercise(
            name='Lateral Raise', category='strength', muscle_group='shoulders',
            equipment='dumbbells', difficulty='beginner',
            description='Isolation exercise for the side deltoids.',
            form_cues=json.dumps([
                'Stand with dumbbells at your sides',
                'Raise arms out to sides until parallel to floor',
                'Lead with your elbows, slight bend throughout',
                'Lower slowly with control',
                'Use lighter weight - this is an isolation move'
            ]),
            animation_url='',
            target_sets=3, target_reps=12,
        ),
        Exercise(
            name='Front Raise', category='strength', muscle_group='shoulders',
            equipment='dumbbells', difficulty='beginner',
            description='Targets the front deltoids.',
            form_cues=json.dumps([
                'Stand tall, dumbbells in front of thighs',
                'Raise one or both arms to shoulder height',
                'Keep a slight bend in the elbows',
                'Lower with control, do not swing',
                'Alternate arms or raise both together'
            ]),
            animation_url='',
            target_sets=3, target_reps=12,
        ),

        # ── STRENGTH: ARMS ──
        Exercise(
            name='Dumbbell Bicep Curl', category='strength', muscle_group='arms',
            equipment='dumbbells', difficulty='beginner',
            description='Classic arm builder targeting the biceps.',
            form_cues=json.dumps([
                'Stand tall with dumbbells at sides, palms forward',
                'Curl dumbbells up toward shoulders',
                'Keep elbows pinned to your sides',
                'Squeeze at the top, then lower slowly',
                'Do not swing or use momentum'
            ]),
            animation_url='',
            target_sets=3, target_reps=12,
        ),
        Exercise(
            name='Hammer Curl', category='strength', muscle_group='arms',
            equipment='dumbbells', difficulty='beginner',
            description='Curl variation that targets the brachialis and forearms.',
            form_cues=json.dumps([
                'Hold dumbbells with palms facing each other (neutral grip)',
                'Curl up keeping palms facing inward',
                'Keep elbows at your sides',
                'Squeeze at top and lower slowly',
                'Maintain upright posture throughout'
            ]),
            animation_url='',
            target_sets=3, target_reps=12,
        ),
        Exercise(
            name='Tricep Overhead Extension', category='strength', muscle_group='arms',
            equipment='dumbbells', difficulty='intermediate',
            description='Overhead tricep exercise for arm definition.',
            form_cues=json.dumps([
                'Hold one dumbbell with both hands overhead',
                'Lower behind your head by bending at the elbows',
                'Keep upper arms vertical and close to ears',
                'Extend back to the top, squeezing triceps',
                'Control the weight - do not let it drop'
            ]),
            animation_url='',
            target_sets=3, target_reps=12,
        ),
        Exercise(
            name='Tricep Kickback', category='strength', muscle_group='arms',
            equipment='dumbbells', difficulty='beginner',
            description='Isolation exercise for the triceps.',
            form_cues=json.dumps([
                'Hinge at hips with flat back, one arm on bench',
                'Start with elbow bent at 90 degrees',
                'Extend arm straight back, squeezing tricep',
                'Hold at top for a beat, then lower slowly',
                'Keep upper arm stationary throughout'
            ]),
            animation_url='',
            target_sets=3, target_reps=12,
        ),
        Exercise(
            name='Band Bicep Curl', category='strength', muscle_group='arms',
            equipment='bands', difficulty='beginner',
            description='Bicep curl using resistance band for constant tension.',
            form_cues=json.dumps([
                'Stand on center of band with feet hip-width',
                'Hold handles with palms facing forward',
                'Curl up against band resistance',
                'Squeeze at top and lower slowly',
                'Keep elbows pinned at your sides'
            ]),
            animation_url='',
            target_sets=3, target_reps=15,
        ),

        # ── STRENGTH: LEGS ──
        Exercise(
            name='Goblet Squat', category='strength', muscle_group='legs',
            equipment='dumbbells', difficulty='beginner',
            description='Squat variation holding dumbbell at chest. Great for hip mobility.',
            form_cues=json.dumps([
                'Hold one dumbbell at chest with both hands',
                'Feet shoulder-width apart, toes slightly out',
                'Squat down keeping chest tall and knees tracking over toes',
                'Go as deep as comfortable - aim for thighs parallel',
                'Drive through heels to stand back up'
            ]),
            animation_url='',
            target_sets=4, target_reps=12, back_hip_focus=True,
        ),
        Exercise(
            name='Dumbbell Romanian Deadlift', category='strength', muscle_group='legs',
            equipment='dumbbells', difficulty='intermediate',
            description='Hip hinge movement targeting hamstrings and glutes. Essential for back and hip health.',
            form_cues=json.dumps([
                'Stand with feet hip-width, dumbbells in front of thighs',
                'Hinge at hips pushing butt back, slight knee bend',
                'Lower dumbbells along legs until you feel hamstring stretch',
                'Keep back flat and chest up throughout',
                'Squeeze glutes to return to standing'
            ]),
            animation_url='',
            target_sets=4, target_reps=10, back_hip_focus=True,
        ),
        Exercise(
            name='Dumbbell Lunge', category='strength', muscle_group='legs',
            equipment='dumbbells', difficulty='intermediate',
            description='Unilateral leg exercise for strength and balance.',
            form_cues=json.dumps([
                'Hold dumbbells at sides, stand tall',
                'Step forward into a lunge, both knees at 90 degrees',
                'Keep front knee over ankle, not past toes',
                'Push through front heel to return to start',
                'Alternate legs or do all reps on one side'
            ]),
            animation_url='',
            target_sets=3, target_reps=10,
        ),
        Exercise(
            name='Bulgarian Split Squat', category='strength', muscle_group='legs',
            equipment='dumbbells, bench', difficulty='advanced',
            description='Advanced single-leg squat for leg strength and hip flexibility.',
            form_cues=json.dumps([
                'Place rear foot on bench behind you',
                'Hold dumbbells at sides',
                'Lower until front thigh is parallel to floor',
                'Keep front knee tracking over toes',
                'Drive through front heel to stand back up'
            ]),
            animation_url='',
            target_sets=3, target_reps=10, back_hip_focus=True,
        ),
        Exercise(
            name='Dumbbell Step-Up', category='strength', muscle_group='legs',
            equipment='dumbbells, bench', difficulty='intermediate',
            description='Functional leg exercise using the bench as a platform.',
            form_cues=json.dumps([
                'Hold dumbbells at sides, face the bench',
                'Step up with one foot, driving through the heel',
                'Stand fully on the bench, then step down with control',
                'Keep torso upright throughout',
                'Do all reps on one side, then switch'
            ]),
            animation_url='',
            target_sets=3, target_reps=10,
        ),
        Exercise(
            name='Dumbbell Calf Raise', category='strength', muscle_group='legs',
            equipment='dumbbells', difficulty='beginner',
            description='Isolate the calves for lower leg strength.',
            form_cues=json.dumps([
                'Stand on edge of step or flat ground',
                'Hold dumbbells at sides',
                'Rise up onto toes as high as possible',
                'Hold at top for a moment, squeeze calves',
                'Lower slowly below starting position for full stretch'
            ]),
            animation_url='',
            target_sets=3, target_reps=15,
        ),

        # ── STRENGTH: CORE ──
        Exercise(
            name='Plank', category='strength', muscle_group='core',
            equipment='bodyweight', difficulty='beginner',
            description='Isometric core exercise for total core stability.',
            form_cues=json.dumps([
                'Forearms on floor, elbows under shoulders',
                'Body in straight line from head to heels',
                'Squeeze glutes and brace core',
                'Do not let hips sag or pike up',
                'Breathe steadily throughout the hold'
            ]),
            animation_url='',
            target_sets=3, target_reps=1, target_duration_seconds=45, is_timed=True,
            back_hip_focus=True,
        ),
        Exercise(
            name='Dead Bug', category='strength', muscle_group='core',
            equipment='bodyweight', difficulty='beginner',
            description='Core stability exercise that protects the lower back.',
            form_cues=json.dumps([
                'Lie on back, arms pointing to ceiling, knees at 90 degrees',
                'Press lower back firmly into the floor',
                'Slowly extend opposite arm and leg toward floor',
                'Return to start and repeat on other side',
                'Keep lower back pressed to floor throughout'
            ]),
            animation_url='',
            target_sets=3, target_reps=10, back_hip_focus=True,
        ),
        Exercise(
            name='Bird Dog', category='strength', muscle_group='core',
            equipment='bodyweight', difficulty='beginner',
            description='Core and back stabilization exercise. Excellent for back pain prevention.',
            form_cues=json.dumps([
                'Start on hands and knees, wrists under shoulders',
                'Extend opposite arm and leg simultaneously',
                'Keep hips level - do not rotate',
                'Hold extended position briefly, then return',
                'Focus on stability over speed'
            ]),
            animation_url='',
            target_sets=3, target_reps=10, back_hip_focus=True,
        ),
        Exercise(
            name='Russian Twist', category='strength', muscle_group='core',
            equipment='dumbbells', difficulty='intermediate',
            description='Rotational core exercise with a dumbbell.',
            form_cues=json.dumps([
                'Sit with knees bent, feet off floor or grounded',
                'Lean back slightly, holding dumbbell at chest',
                'Rotate torso to tap dumbbell on each side',
                'Keep core engaged and back straight',
                'Control the rotation - do not use momentum'
            ]),
            animation_url='',
            target_sets=3, target_reps=20,
        ),
        Exercise(
            name='Dumbbell Side Bend', category='strength', muscle_group='core',
            equipment='dumbbells', difficulty='beginner',
            description='Targets obliques for lateral core strength.',
            form_cues=json.dumps([
                'Stand tall holding dumbbell in one hand',
                'Slowly bend to the weighted side',
                'Return to upright using oblique strength',
                'Keep movement strictly in the side-to-side plane',
                'Do all reps on one side, then switch'
            ]),
            animation_url='',
            target_sets=3, target_reps=15,
        ),

        # ── MOBILITY / FLEXIBILITY ──
        Exercise(
            name='Cat-Cow Stretch', category='mobility', muscle_group='back',
            equipment='bodyweight', difficulty='beginner',
            description='Spinal mobility exercise that warms up the entire back.',
            form_cues=json.dumps([
                'Start on hands and knees',
                'Cow: Drop belly, lift chest and tailbone, look up',
                'Cat: Round spine up, tuck chin and tailbone',
                'Flow smoothly between positions with breath',
                'Inhale for cow, exhale for cat'
            ]),
            animation_url='',
            target_sets=2, target_reps=10, back_hip_focus=True,
        ),
        Exercise(
            name='Hip Flexor Stretch', category='mobility', muscle_group='hips',
            equipment='bodyweight', difficulty='beginner',
            description='Essential stretch for tight hip flexors from sitting.',
            form_cues=json.dumps([
                'Kneel on one knee in a lunge position',
                'Front knee at 90 degrees over ankle',
                'Push hips forward gently until you feel a stretch',
                'Keep torso upright and core engaged',
                'Hold for 30 seconds each side'
            ]),
            animation_url='',
            target_sets=2, target_reps=1, target_duration_seconds=30, is_timed=True,
            back_hip_focus=True,
        ),
        Exercise(
            name='Pigeon Pose', category='mobility', muscle_group='hips',
            equipment='bodyweight', difficulty='intermediate',
            description='Deep hip opener targeting the piriformis and glutes.',
            form_cues=json.dumps([
                'From hands and knees, bring one knee forward behind same wrist',
                'Extend the other leg straight behind you',
                'Lower hips toward the floor',
                'Keep hips square to the front',
                'Hold for 30-60 seconds, breathe deeply'
            ]),
            animation_url='',
            target_sets=2, target_reps=1, target_duration_seconds=45, is_timed=True,
            back_hip_focus=True,
        ),
        Exercise(
            name='World\'s Greatest Stretch', category='mobility', muscle_group='full body',
            equipment='bodyweight', difficulty='intermediate',
            description='Dynamic stretch hitting hips, thoracic spine, and hamstrings.',
            form_cues=json.dumps([
                'Step into a deep lunge position',
                'Place same-side hand on floor inside front foot',
                'Rotate and reach opposite arm to ceiling',
                'Hold rotation briefly, then switch sides',
                'Move through each position with control'
            ]),
            animation_url='',
            target_sets=2, target_reps=5, back_hip_focus=True,
        ),
        Exercise(
            name='Thoracic Spine Rotation', category='mobility', muscle_group='back',
            equipment='bodyweight', difficulty='beginner',
            description='Opens up the mid-back for better posture and reduced tightness.',
            form_cues=json.dumps([
                'Lie on side with knees stacked and bent at 90 degrees',
                'Extend both arms out in front, palms together',
                'Rotate top arm open toward the ceiling',
                'Follow your hand with your eyes',
                'Hold the open position, then return slowly'
            ]),
            animation_url='',
            target_sets=2, target_reps=8, back_hip_focus=True,
        ),
        Exercise(
            name='Figure Four Stretch', category='mobility', muscle_group='hips',
            equipment='bodyweight', difficulty='beginner',
            description='Targets the piriformis and external hip rotators.',
            form_cues=json.dumps([
                'Lie on back, cross one ankle over opposite knee',
                'Pull the uncrossed leg toward your chest',
                'Feel the stretch in the crossed leg hip/glute',
                'Keep head and shoulders on the floor',
                'Hold 30 seconds each side, breathe deeply'
            ]),
            animation_url='',
            target_sets=2, target_reps=1, target_duration_seconds=30, is_timed=True,
            back_hip_focus=True,
        ),
        Exercise(
            name='Child\'s Pose', category='mobility', muscle_group='back',
            equipment='bodyweight', difficulty='beginner',
            description='Gentle stretch for the lower back, hips, and shoulders.',
            form_cues=json.dumps([
                'Kneel with big toes touching, knees apart',
                'Sit back onto heels',
                'Extend arms forward on the floor',
                'Let forehead rest on the floor',
                'Breathe deeply into your lower back'
            ]),
            animation_url='',
            target_sets=2, target_reps=1, target_duration_seconds=45, is_timed=True,
            back_hip_focus=True,
        ),
        Exercise(
            name='Band Shoulder Dislocate', category='mobility', muscle_group='shoulders',
            equipment='bands', difficulty='beginner',
            description='Improves shoulder mobility using a resistance band.',
            form_cues=json.dumps([
                'Hold band with wide overhand grip in front',
                'Slowly raise the band overhead',
                'Continue behind your back as far as comfortable',
                'Return along the same path',
                'Use a wide grip - narrow as flexibility improves'
            ]),
            animation_url='',
            target_sets=2, target_reps=10,
        ),
        Exercise(
            name='90/90 Hip Stretch', category='mobility', muscle_group='hips',
            equipment='bodyweight', difficulty='intermediate',
            description='Advanced hip mobility exercise targeting internal and external rotation.',
            form_cues=json.dumps([
                'Sit with one leg bent 90 degrees in front, one behind',
                'Both knees at 90-degree angles',
                'Sit tall and lean forward over front shin',
                'Feel the stretch in both hips',
                'Hold 30 seconds then switch sides'
            ]),
            animation_url='',
            target_sets=2, target_reps=1, target_duration_seconds=30, is_timed=True,
            back_hip_focus=True,
        ),
        Exercise(
            name='Standing Hamstring Stretch', category='mobility', muscle_group='legs',
            equipment='bodyweight', difficulty='beginner',
            description='Stretches hamstrings which contribute to back and hip tightness.',
            form_cues=json.dumps([
                'Stand and place one heel on a low surface',
                'Keep both legs straight',
                'Hinge forward at hips with flat back',
                'Reach toward toes until you feel the stretch',
                'Hold for 30 seconds each side'
            ]),
            animation_url='',
            target_sets=2, target_reps=1, target_duration_seconds=30, is_timed=True,
            back_hip_focus=True,
        ),

        # ── CARDIO ──
        Exercise(
            name='Jumping Jacks', category='cardio', muscle_group='full body',
            equipment='bodyweight', difficulty='beginner',
            description='Classic full-body cardio exercise.',
            form_cues=json.dumps([
                'Start with feet together, arms at sides',
                'Jump feet wide while raising arms overhead',
                'Jump back to starting position',
                'Keep a steady, rhythmic pace',
                'Land softly on the balls of your feet'
            ]),
            animation_url='',
            target_sets=3, target_reps=1, target_duration_seconds=45, is_timed=True,
        ),
        Exercise(
            name='Mountain Climbers', category='cardio', muscle_group='full body',
            equipment='bodyweight', difficulty='intermediate',
            description='High-intensity cardio that also works core.',
            form_cues=json.dumps([
                'Start in push-up position',
                'Drive one knee toward chest',
                'Quickly switch legs in a running motion',
                'Keep hips low and core engaged',
                'Maintain a steady, fast pace'
            ]),
            animation_url='',
            target_sets=3, target_reps=1, target_duration_seconds=30, is_timed=True,
        ),
        Exercise(
            name='High Knees', category='cardio', muscle_group='full body',
            equipment='bodyweight', difficulty='beginner',
            description='Running in place with high knee drive.',
            form_cues=json.dumps([
                'Stand tall and run in place',
                'Drive knees up to hip height',
                'Pump arms in running motion',
                'Stay on balls of feet',
                'Keep core tight and posture upright'
            ]),
            animation_url='',
            target_sets=3, target_reps=1, target_duration_seconds=30, is_timed=True,
        ),
        Exercise(
            name='Burpees', category='cardio', muscle_group='full body',
            equipment='bodyweight', difficulty='advanced',
            description='Ultimate full-body cardio and strength exercise.',
            form_cues=json.dumps([
                'Stand, then squat down and place hands on floor',
                'Jump feet back to push-up position',
                'Perform a push-up (optional)',
                'Jump feet back to squat position',
                'Explode up into a jump with arms overhead'
            ]),
            animation_url='',
            target_sets=3, target_reps=10,
        ),
        Exercise(
            name='Band Squat Jumps', category='cardio', muscle_group='legs',
            equipment='bands', difficulty='intermediate',
            description='Explosive squat jumps with band resistance.',
            form_cues=json.dumps([
                'Stand on band with feet shoulder width, hold handles',
                'Squat down with good form',
                'Explode upward into a jump',
                'Land softly and immediately squat for next rep',
                'Keep chest up throughout'
            ]),
            animation_url='',
            target_sets=3, target_reps=12,
        ),
        Exercise(
            name='Skater Jumps', category='cardio', muscle_group='legs',
            equipment='bodyweight', difficulty='intermediate',
            description='Lateral cardio exercise for agility and leg power.',
            form_cues=json.dumps([
                'Stand on one leg, slight bend in knee',
                'Jump laterally to the other foot',
                'Land softly and balance briefly',
                'Jump back to the other side',
                'Swing arms for momentum and balance'
            ]),
            animation_url='',
            target_sets=3, target_reps=1, target_duration_seconds=30, is_timed=True,
        ),
    ]

    for ex in exercises:
        db.session.add(ex)
    db.session.commit()


def _seed_templates():
    """Seed workout templates"""
    if WorkoutTemplate.query.first():
        return

    templates = [
        WorkoutTemplate(
            name='Upper Body Strength',
            workout_type='strength',
            description='Build upper body strength with dumbbells and bands. Focus on chest, back, shoulders, and arms.',
            exercise_ids=json.dumps([1, 3, 5, 7, 9, 11, 12, 14, 15, 16]),  # chest, back, shoulders, arms
            order_index=0,
        ),
        WorkoutTemplate(
            name='Lower Body Strength',
            workout_type='strength',
            description='Build powerful legs and glutes. Includes exercises that help with hip mobility.',
            exercise_ids=json.dumps([19, 20, 21, 22, 23, 24, 25, 26]),  # legs + core
            order_index=1,
        ),
        WorkoutTemplate(
            name='Full Body Strength',
            workout_type='strength',
            description='Hit every muscle group in one session. Great for busy days.',
            exercise_ids=json.dumps([1, 5, 11, 14, 19, 20, 21, 25, 26]),
            order_index=2,
        ),
        WorkoutTemplate(
            name='Back & Hip Mobility',
            workout_type='mobility',
            description='Targeted mobility session for back tightness and hip flexibility. Essential for desk workers.',
            exercise_ids=json.dumps([29, 30, 31, 32, 33, 34, 35, 37, 38]),
            order_index=3,
        ),
        WorkoutTemplate(
            name='Full Body Mobility',
            workout_type='mobility',
            description='Complete mobility routine covering all major joints and muscle groups.',
            exercise_ids=json.dumps([29, 30, 31, 32, 33, 34, 35, 36, 37, 38]),
            order_index=4,
        ),
        WorkoutTemplate(
            name='HIIT Cardio Blast',
            workout_type='cardio',
            description='High-intensity interval training for maximum calorie burn.',
            exercise_ids=json.dumps([39, 40, 41, 42, 43, 44]),
            order_index=5,
        ),
        WorkoutTemplate(
            name='Strength & Mobility Combo',
            workout_type='strength',
            description='Balanced workout combining strength exercises with mobility work. Perfect for addressing back and hip tightness.',
            exercise_ids=json.dumps([5, 20, 19, 26, 29, 30, 31, 33, 34]),
            order_index=6,
        ),
    ]

    for t in templates:
        db.session.add(t)
    db.session.commit()


def _seed_schedule():
    """Seed the default weekly schedule"""
    if WorkoutSchedule.query.first():
        return

    schedule = [
        WorkoutSchedule(day_of_week=0, workout_type='strength', workout_name='Upper Body Strength',
                         template_id=1, description='Chest, back, shoulders, and arms with dumbbells and bands'),
        WorkoutSchedule(day_of_week=1, workout_type='mobility', workout_name='Back & Hip Mobility',
                         template_id=4, description='Mobility and flexibility focus on back and hips'),
        WorkoutSchedule(day_of_week=2, workout_type='strength', workout_name='Lower Body Strength',
                         template_id=2, description='Legs, glutes, and core strength training'),
        WorkoutSchedule(day_of_week=3, workout_type='cardio', workout_name='HIIT Cardio Blast',
                         template_id=6, description='High-intensity cardio for heart health and endurance'),
        WorkoutSchedule(day_of_week=4, workout_type='strength', workout_name='Full Body Strength',
                         template_id=3, description='Complete full-body strength session'),
        WorkoutSchedule(day_of_week=5, workout_type='mobility', workout_name='Full Body Mobility',
                         template_id=5, description='Full body stretching and mobility work'),
        WorkoutSchedule(day_of_week=6, workout_type='rest', workout_name='Active Recovery',
                         template_id=None, description='Rest day - light walking, stretching, or yoga recommended'),
    ]

    for s in schedule:
        db.session.add(s)
    db.session.commit()


def _seed_achievements():
    """Seed achievements"""
    if Achievement.query.first():
        return

    achievements = [
        Achievement(name='First Steps', description='Complete your first workout',
                     icon='\U0001f3c3', requirement_type='workouts_completed', requirement_value=1),
        Achievement(name='Getting Started', description='Complete 5 workouts',
                     icon='\U0001f4aa', requirement_type='workouts_completed', requirement_value=5),
        Achievement(name='Dedicated', description='Complete 10 workouts',
                     icon='\U0001f525', requirement_type='workouts_completed', requirement_value=10),
        Achievement(name='Committed', description='Complete 25 workouts',
                     icon='\U0001f3c6', requirement_type='workouts_completed', requirement_value=25),
        Achievement(name='Warrior', description='Complete 50 workouts',
                     icon='\U00002694\U0000fe0f', requirement_type='workouts_completed', requirement_value=50),
        Achievement(name='Legend', description='Complete 100 workouts',
                     icon='\U0001f451', requirement_type='workouts_completed', requirement_value=100),
        Achievement(name='Streak Starter', description='Maintain a 3-day streak',
                     icon='\U0001f31f', requirement_type='streak', requirement_value=3),
        Achievement(name='On Fire', description='Maintain a 7-day streak',
                     icon='\U0001f525', requirement_type='streak', requirement_value=7),
        Achievement(name='Unstoppable', description='Maintain a 14-day streak',
                     icon='\U000026a1', requirement_type='streak', requirement_value=14),
        Achievement(name='Iron Will', description='Maintain a 30-day streak',
                     icon='\U0001f9be', requirement_type='streak', requirement_value=30),
        Achievement(name='Hour Power', description='Log 60 minutes of exercise',
                     icon='\U0000231b', requirement_type='total_minutes', requirement_value=60),
        Achievement(name='Marathon Mind', description='Log 600 minutes of exercise',
                     icon='\U0001f3c5', requirement_type='total_minutes', requirement_value=600),
    ]

    for a in achievements:
        db.session.add(a)
    db.session.commit()


def _seed_quotes():
    """Seed motivational quotes"""
    if MotivationalQuote.query.first():
        return

    quotes = [
        MotivationalQuote(quote='The only bad workout is the one that didn\'t happen.', author='Unknown'),
        MotivationalQuote(quote='Strength does not come from physical capacity. It comes from an indomitable will.', author='Mahatma Gandhi'),
        MotivationalQuote(quote='The pain you feel today will be the strength you feel tomorrow.', author='Arnold Schwarzenegger'),
        MotivationalQuote(quote='Take care of your body. It\'s the only place you have to live.', author='Jim Rohn'),
        MotivationalQuote(quote='The last three or four reps is what makes the muscle grow.', author='Arnold Schwarzenegger'),
        MotivationalQuote(quote='Success isn\'t always about greatness. It\'s about consistency.', author='Dwayne Johnson'),
        MotivationalQuote(quote='Your body can stand almost anything. It\'s your mind that you have to convince.', author='Unknown'),
        MotivationalQuote(quote='The only person you are destined to become is the person you decide to be.', author='Ralph Waldo Emerson'),
        MotivationalQuote(quote='Don\'t limit your challenges. Challenge your limits.', author='Unknown'),
        MotivationalQuote(quote='Motivation is what gets you started. Habit is what keeps you going.', author='Jim Ryun'),
        MotivationalQuote(quote='The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack in will.', author='Vince Lombardi'),
        MotivationalQuote(quote='When you feel like quitting, think about why you started.', author='Unknown'),
        MotivationalQuote(quote='Flexibility is the key to stability.', author='John Wooden'),
        MotivationalQuote(quote='A healthy outside starts from the inside.', author='Robert Urich'),
        MotivationalQuote(quote='No matter how slow you go, you\'re still lapping everybody on the couch.', author='Unknown'),
    ]

    for q in quotes:
        db.session.add(q)
    db.session.commit()


# ──────────────────────────────────────────────────
# APP INITIALIZATION
# ──────────────────────────────────────────────────

with app.app_context():
    db.create_all()
    # Migrate: add template_id column if missing (existing DBs created before this column)
    with db.engine.connect() as conn:
        columns = [row[1] for row in conn.execute(db.text("PRAGMA table_info(workout_schedule)"))]
        if 'template_id' not in columns:
            conn.execute(db.text("ALTER TABLE workout_schedule ADD COLUMN template_id INTEGER"))
            conn.commit()
    seed_database()


if __name__ == '__main__':
    app.run(debug=True, port=5000)
