import React, { useState, useEffect, useCallback } from 'react';
import { Dumbbell, Calendar, Heart, Sparkles, Trash2, X, Trophy, User, Target, Zap, Wind, LogOut, Settings, Plus, Edit3, Clock, ChevronDown, Search, Filter } from 'lucide-react';

const EXERCISE_TYPES = ['strength', 'cardio', 'stretch'];
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EXERCISES = {
  strength: { 'Bench Press': 'Chest', 'Squat': 'Legs', 'Deadlift': 'Back', 'Overhead Press': 'Shoulders', 'Rows': 'Back', 'Bicep Curls': 'Arms' },
  cardio: { 'Running': 'Cardio', 'Stair Climbing': 'Cardio', 'Cycling': 'Cardio', 'Swimming': 'Cardio', 'Walking': 'Cardio', 'HIIT': 'Cardio', 'Sport-Based': 'Cardio' },
  stretch: { 'Yoga': 'Flexibility', 'Calisthenics': 'Flexibility', 'Pilates': 'Flexibility', 'Tai Chi': 'Flexibility' }
};

const WORKOUT_CONFIGS = {
  strength: {
    fields: ['sets', 'reps', 'weight'],
    labels: { sets: 'SETS', reps: 'REPS', weight: 'KG' },
    placeholders: { sets: 'Sets', reps: 'Reps', weight: 'Weight (kg)' }
  },
  cardio: {
    fields: ['minutes', 'distance'],
    labels: { minutes: 'MINUTES', distance: 'DISTANCE' },
    placeholders: { minutes: 'Minutes', distance: 'Distance (km)' }
  },
  stretch: {
    fields: ['minutes'],
    labels: { minutes: 'MINUTES' },
    placeholders: { minutes: 'Minutes' }
  }
};

// Darebee-inspired workout database
const WORKOUT_IDEAS = [
  {
    id: 1,
    name: "Cardio Shock",
    type: "cardio",
    difficulty: "intermediate",
    duration: "20-30 min",
    description: "High-intensity cardio workout to boost endurance",
    exercises: [
      "20 jumping jacks",
      "20 basic burpees", 
      "20 jumping jacks",
      "20 high knees",
      "20 jumping jacks",
      "20 mountain climbers"
    ],
    sets: "3-5 sets",
    rest: "2 minutes rest between sets"
  },
  {
    id: 2,
    name: "Strength Titan",
    type: "strength",
    difficulty: "advanced",
    duration: "45-60 min",
    description: "Full body strength training for muscle building",
    exercises: [
      "10 push-ups",
      "15 squats",
      "10 pull-ups",
      "15 lunges each leg",
      "10 dips",
      "20 calf raises"
    ],
    sets: "4-6 sets",
    rest: "90 seconds rest between sets"
  },
  {
    id: 3,
    name: "Flexibility Flow",
    type: "stretch",
    difficulty: "beginner",
    duration: "15-25 min",
    description: "Gentle stretching routine for flexibility",
    exercises: [
      "30 seconds forward bend",
      "30 seconds butterfly stretch",
      "30 seconds quad stretch each leg",
      "30 seconds shoulder stretch",
      "30 seconds neck rolls",
      "30 seconds spinal twist"
    ],
    sets: "Hold each stretch",
    rest: "No rest between stretches"
  },
  {
    id: 4,
    name: "HIIT Burner",
    type: "cardio",
    difficulty: "advanced",
    duration: "25-35 min",
    description: "High-intensity interval training for fat loss",
    exercises: [
      "30 seconds burpees",
      "30 seconds jumping jacks",
      "30 seconds mountain climbers",
      "30 seconds high knees",
      "30 seconds plank jacks",
      "30 seconds rest"
    ],
    sets: "5-7 rounds",
    rest: "30 seconds rest between exercises"
  },
  {
    id: 5,
    name: "Core Crusher",
    type: "strength",
    difficulty: "intermediate",
    duration: "20-30 min",
    description: "Targeted core workout for abs and stability",
    exercises: [
      "20 crunches",
      "20 leg raises",
      "30 seconds plank",
      "20 Russian twists",
      "15 bicycle crunches",
      "20 mountain climbers"
    ],
    sets: "3-4 sets",
    rest: "60 seconds rest between sets"
  },
  {
    id: 6,
    name: "Yoga Sunrise",
    type: "stretch",
    difficulty: "beginner",
    duration: "20-40 min",
    description: "Morning yoga flow to start your day",
    exercises: [
      "Sun salutation A (5 rounds)",
      "Warrior I pose (30 seconds each side)",
      "Tree pose (30 seconds each side)",
      "Child's pose (1 minute)",
      "Cat-cow stretch (10 rounds)",
      "Corpse pose (5 minutes)"
    ],
    sets: "Hold poses as indicated",
    rest: "Flow between poses"
  },
  {
    id: 7,
    name: "Boxer Blast",
    type: "cardio",
    difficulty: "intermediate",
    duration: "30-40 min",
    description: "Boxing-inspired cardio workout",
    exercises: [
      "60 jab-cross combinations",
      "20 knee strikes each leg",
      "40 speed bag punches",
      "20 hooks each arm",
      "40 high knees",
      "20 uppercuts each arm"
    ],
    sets: "3-5 sets",
    rest: "90 seconds rest between sets"
  },
  {
    id: 8,
    name: "Power Lifter",
    type: "strength",
    difficulty: "advanced",
    duration: "60-75 min",
    description: "Heavy strength training for serious gains",
    exercises: [
      "Deadlifts (8 reps)",
      "Bench press (8 reps)",
      "Squats (10 reps)",
      "Overhead press (8 reps)",
      "Bent-over rows (10 reps)",
      "Pull-ups (max reps)"
    ],
    sets: "4-5 sets",
    rest: "2-3 minutes rest between sets"
  }
];

const WorkoutIdeas = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const filteredWorkouts = WORKOUT_IDEAS.filter(workout => {
    const typeMatch = selectedType === 'all' || workout.type === selectedType;
    const difficultyMatch = selectedDifficulty === 'all' || workout.difficulty === selectedDifficulty;
    const searchMatch = searchTerm === '' || 
      workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return typeMatch && difficultyMatch && searchMatch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#fbbf24';
      case 'advanced': return '#ef4444';
      default: return '#6366f1';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'strength': return <Dumbbell size={16} />;
      case 'cardio': return <Heart size={16} />;
      case 'stretch': return <Wind size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  return (
    <div style={styles.ideasContainer}>
      <div style={styles.ideasHeader}>
        <h2>Workout Ideas</h2>
        <p style={styles.ideasSubtitle}>Discover new workouts to challenge yourself</p>
      </div>

      {/* Filters and Search */}
      <div style={styles.filtersContainer}>
        <div style={styles.searchBar}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search workouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <div style={styles.filterGroup}>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Types</option>
            <option value="strength">Strength</option>
            <option value="cardio">Cardio</option>
            <option value="stretch">Stretch</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Workout Grid */}
      <div style={styles.workoutGrid}>
        {filteredWorkouts.map(workout => (
          <div key={workout.id} style={styles.workoutCard}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>
                {getTypeIcon(workout.type)}
                <h3>{workout.name}</h3>
              </div>
              <div style={{
                ...styles.difficultyBadge,
                backgroundColor: getDifficultyColor(workout.difficulty),
                color: '#fff'
              }}>
                {workout.difficulty}
              </div>
            </div>

            <p style={styles.workoutDescription}>{workout.description}</p>
            
            <div style={styles.workoutMeta}>
              <div style={styles.metaItem}>
                <Clock size={14} color="#94a3b8" />
                <span>{workout.duration}</span>
              </div>
              <div style={styles.metaItem}>
                <Target size={14} color="#94a3b8" />
                <span>{workout.sets}</span>
              </div>
            </div>

            <button
              style={styles.viewDetailsBtn}
              onClick={() => setSelectedWorkout(workout)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <div style={styles.modalOverlay} onClick={() => setSelectedWorkout(null)}>
          <div style={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.detailHeader}>
              <div style={styles.detailTitle}>
                {getTypeIcon(selectedWorkout.type)}
                <h2>{selectedWorkout.name}</h2>
              </div>
              <X onClick={() => setSelectedWorkout(null)} style={{cursor: 'pointer'}} />
            </div>

            <div style={styles.detailContent}>
              <p style={styles.detailDescription}>{selectedWorkout.description}</p>
              
              <div style={styles.detailMeta}>
                <div style={styles.metaBadge} className="difficulty">
                  <span>Level:</span>
                  <span style={{color: getDifficultyColor(selectedWorkout.difficulty)}}>
                    {selectedWorkout.difficulty}
                  </span>
                </div>
                <div style={styles.metaBadge}>
                  <Clock size={14} />
                  <span>{selectedWorkout.duration}</span>
                </div>
                <div style={styles.metaBadge}>
                  <Target size={14} />
                  <span>{selectedWorkout.sets}</span>
                </div>
              </div>

              <div style={styles.exercisesSection}>
                <h4 style={styles.sectionTitle}>Exercises:</h4>
                <div style={styles.exercisesList}>
                  {selectedWorkout.exercises.map((exercise, index) => (
                    <div key={index} style={styles.exerciseItem}>
                      <span style={styles.exerciseNumber}>{index + 1}.</span>
                      <span>{exercise}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedWorkout.rest && (
                <div style={styles.restInfo}>
                  <Wind size={16} color="#94a3b8" />
                  <span>{selectedWorkout.rest}</span>
                </div>
              )}
            </div>

            <button
              style={styles.closeModalBtn}
              onClick={() => setSelectedWorkout(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const WorkoutPlanner = ({ userEmail, workoutLogs = [], weekPlan, setWeekPlan }) => {
  const [availableExercises, setAvailableExercises] = useState({
    strength: [],
    cardio: [],
    stretch: []
  });

  const [selectedDay, setSelectedDay] = useState(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [exerciseDetails, setExerciseDetails] = useState({
    sets: '',
    reps: '',
    weight: '',
    minutes: '',
    distance: ''
  });

  // Extract unique exercises from workout history
  useEffect(() => {
    console.log('WorkoutPlanner received workoutLogs:', workoutLogs);
    console.log('WorkoutPlanner received workoutLogs length:', workoutLogs?.length);

    const exercises = {
      strength: new Set(),
      cardio: new Set(),
      stretch: new Set()
    };

    if (workoutLogs && workoutLogs.length > 0) {
      workoutLogs.forEach(log => {
        if (log.exercise_name) {
          const type = log.workout_type || 'strength';
          if (exercises[type]) {
            exercises[type].add(log.exercise_name);
          }
        }
      });
    }

    // Also add default exercises
    Object.keys(EXERCISES).forEach(type => {
      Object.keys(EXERCISES[type]).forEach(exercise => {
        exercises[type].add(exercise);
      });
    });

    setAvailableExercises({
      strength: Array.from(exercises.strength).sort(),
      cardio: Array.from(exercises.cardio).sort(),
      stretch: Array.from(exercises.stretch).sort()
    });

    console.log('Available exercises:', exercises);
  }, [workoutLogs]);

  const toggleWorkoutDay = (day) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        workout: !prev[day].workout,
        exercises: prev[day].workout ? [] : prev[day].exercises
      }
    }));
  };

  const addExerciseToDay = (day) => {
    if (!selectedExercise) return;

    const newExercise = {
      name: selectedExercise,
      type: weekPlan[day].type,
      ...exerciseDetails
    };

    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        exercises: [...prev[day].exercises, newExercise]
      }
    }));

    // Reset form
    resetModal();
  };

  const editExercise = (day, exerciseIndex) => {
    const exercise = weekPlan[day].exercises[exerciseIndex];
    setEditingExercise({ day, index: exerciseIndex, exercise });
    setSelectedExercise(exercise.name);
    setExerciseDetails({
      sets: exercise.sets || '',
      reps: exercise.reps || '',
      weight: exercise.weight || '',
      minutes: exercise.minutes || '',
      distance: exercise.distance || ''
    });
    setSelectedDay(day);
    setShowExerciseModal(true);
  };

  const updateExercise = () => {
    if (!selectedExercise || !editingExercise) return;

    const updatedExercise = {
      name: selectedExercise,
      type: weekPlan[editingExercise.day].type,
      ...exerciseDetails
    };

    setWeekPlan(prev => ({
      ...prev,
      [editingExercise.day]: {
        ...prev[editingExercise.day],
        exercises: prev[editingExercise.day].exercises.map((ex, index) => 
          index === editingExercise.index ? updatedExercise : ex
        )
      }
    }));

    resetModal();
  };

  const removeExercise = (day, exerciseIndex) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        exercises: prev[day].exercises.filter((_, index) => index !== exerciseIndex)
      }
    }));
  };

  const resetModal = () => {
    setSelectedExercise('');
    setExerciseDetails({
      sets: '',
      reps: '',
      weight: '',
      minutes: '',
      distance: ''
    });
    setEditingExercise(null);
    setShowExerciseModal(false);
    setSelectedDay(null);
  };

  const saveWeekPlan = async () => {
    console.log('Saving week plan:', weekPlan);
    localStorage.setItem('weekPlan', JSON.stringify(weekPlan));
    alert('Week plan saved successfully!');
  };

  console.log('WorkoutPlanner rendering with availableExercises:', availableExercises);

  return (
    <div style={styles.plannerContainer}>
      <div style={styles.plannerHeader}>
        <h2>Weekly Workout Planner</h2>
        <button style={styles.savePlanBtn} onClick={saveWeekPlan}>
          <Calendar size={16} /> Save Week Plan
        </button>
      </div>

      <div style={styles.weekGrid}>
        {DAYS_OF_WEEK.map(day => (
          <div key={day} style={styles.dayCard}>
            <div style={styles.dayHeader}>
              <h3>{day}</h3>
              <button 
                style={{
                  ...styles.workoutToggle,
                  background: weekPlan[day].workout ? '#6366f1' : '#1e293b'
                }}
                onClick={() => toggleWorkoutDay(day)}
              >
                {weekPlan[day].workout ? 'Workout Day' : 'Rest Day'}
              </button>
            </div>

            {weekPlan[day].workout && (
              <div style={styles.workoutContent}>
                <select 
                  style={styles.typeSelect}
                  value={weekPlan[day].type}
                  onChange={(e) => setWeekPlan(prev => ({
                    ...prev,
                    [day]: { ...prev[day], type: e.target.value }
                  }))}
                >
                  {EXERCISE_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>

                <div style={styles.exercisesList}>
                  {weekPlan[day].exercises.map((exercise, index) => (
                    <div key={index} style={styles.exerciseItem}>
                      <div style={styles.exerciseInfo}>
                        <span style={styles.exerciseName}>{exercise.name}</span>
                        <div style={styles.exerciseDetails}>
                          {exercise.type === 'strength' ? (
                            <>
                              {exercise.sets && <span>{exercise.sets} sets</span>}
                              {exercise.reps && <span>{exercise.reps} reps</span>}
                              {exercise.weight && <span>{exercise.weight}kg</span>}
                            </>
                          ) : exercise.type === 'cardio' ? (
                            <>
                              {exercise.minutes && <span>{exercise.minutes} min</span>}
                              {exercise.distance && <span>{exercise.distance} km</span>}
                            </>
                          ) : (
                            exercise.minutes && <span>{exercise.minutes} min</span>
                          )}
                        </div>
                      </div>
                      <div style={styles.exerciseActions}>
                        <button 
                          style={styles.editExerciseBtn}
                          onClick={() => editExercise(day, index)}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          style={styles.removeExerciseBtn}
                          onClick={() => removeExercise(day, index)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  style={styles.addExerciseBtn}
                  onClick={() => {
                    setSelectedDay(day);
                    setShowExerciseModal(true);
                  }}
                >
                  <Plus size={14} /> Add Exercise
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showExerciseModal && selectedDay && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>{editingExercise ? `Edit Exercise for ${selectedDay}` : `Add Exercise to ${selectedDay}`}</h3>
              <X onClick={resetModal} style={{cursor:'pointer'}}/>
            </div>

            <label style={styles.label}>Select Exercise</label>
            <select 
              style={styles.input}
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
            >
              <option value="">Choose an exercise...</option>
              {availableExercises[weekPlan[selectedDay].type]?.map(exercise => (
                <option key={exercise} value={exercise}>
                  {exercise}
                </option>
              ))}
            </select>

            {weekPlan[selectedDay].type === 'strength' && (
              <div style={styles.inputGrid}>
                <div>
                  <label style={styles.label}>Sets</label>
                  <input 
                    style={styles.input}
                    type="number"
                    value={exerciseDetails.sets}
                    onChange={(e) => setExerciseDetails(prev => ({...prev, sets: e.target.value}))}
                    placeholder="3"
                  />
                </div>
                <div>
                  <label style={styles.label}>Reps</label>
                  <input 
                    style={styles.input}
                    type="number"
                    value={exerciseDetails.reps}
                    onChange={(e) => setExerciseDetails(prev => ({...prev, reps: e.target.value}))}
                    placeholder="10"
                  />
                </div>
                <div>
                  <label style={styles.label}>Weight (kg)</label>
                  <input 
                    style={styles.input}
                    type="number"
                    value={exerciseDetails.weight}
                    onChange={(e) => setExerciseDetails(prev => ({...prev, weight: e.target.value}))}
                    placeholder="20"
                  />
                </div>
              </div>
            )}

            {weekPlan[selectedDay].type === 'cardio' && (
              <>
                <label style={styles.label}>Minutes</label>
                <input 
                  style={styles.input}
                  type="number"
                  value={exerciseDetails.minutes}
                  onChange={(e) => setExerciseDetails(prev => ({...prev, minutes: e.target.value}))}
                  placeholder="30"
                />
                <label style={styles.label}>Distance (km)</label>
                <input 
                  style={styles.input}
                  type="number"
                  value={exerciseDetails.distance}
                  onChange={(e) => setExerciseDetails(prev => ({...prev, distance: e.target.value}))}
                  placeholder="5"
                />
              </>
            )}

            {weekPlan[selectedDay].type === 'stretch' && (
              <>
                <label style={styles.label}>Minutes</label>
                <input 
                  style={styles.input}
                  type="number"
                  value={exerciseDetails.minutes}
                  onChange={(e) => setExerciseDetails(prev => ({...prev, minutes: e.target.value}))}
                  placeholder="15"
                />
              </>
            )}

            <button 
              style={styles.mainBtn}
              onClick={editingExercise ? updateExercise : () => addExerciseToDay(selectedDay)}
              disabled={!selectedExercise}
            >
              {editingExercise ? 'Update Exercise' : 'Add Exercise'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [allData, setAllData] = useState({ workouts: [], workoutLogs: [], users: [] });
  const [isLogging, setIsLogging] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [workoutType, setWorkoutType] = useState('strength');
  const [selectedEx, setSelectedEx] = useState('Bench Press');
  const [formData, setFormData] = useState({ sets: '', reps: '', weight: '', minutes: '', distance: '' });
  const [profileForm, setProfileForm] = useState({ displayName: '', profilePic: '' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [weekPlan, setWeekPlan] = useState({
    Monday: { workout: false, exercises: [], type: 'strength' },
    Tuesday: { workout: false, exercises: [], type: 'strength' },
    Wednesday: { workout: false, exercises: [], type: 'strength' },
    Thursday: { workout: false, exercises: [], type: 'strength' },
    Friday: { workout: false, exercises: [], type: 'strength' },
    Saturday: { workout: false, exercises: [], type: 'strength' },
    Sunday: { workout: false, exercises: [], type: 'strength' }
  });
  const [coins, setCoins] = useState(0);

  const loadData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('=== DASHBOARD LOAD DATA START ===');
      console.log('Fetching data for user:', user.email);
      
      const res = await fetch(`/.netlify/functions/database`);
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Raw data received:', data);
      console.log('WorkoutLogs received:', data.workoutLogs);
      console.log('WorkoutLogs length:', data.workoutLogs?.length);
      console.log('First workout log:', data.workoutLogs?.[0]);
      
      setAllData({
        workouts: data.workouts || [],
        workoutLogs: data.workoutLogs || [],
        users: data.users || []
      });
      
      console.log('=== DASHBOARD LOAD DATA END ===');
    } catch (e) {
      console.error('Load data error:', e);
      setError('Failed to load workout data: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem('fitnessUser');
    if (saved) {
      const userData = JSON.parse(saved);
      console.log('Loaded user from localStorage:', userData);
      setUser(userData);
      setProfileForm({
        displayName: userData.display_name || userData.email.split('@')[0],
        profilePic: userData.profile_pic || ''
      });
    }

    // Load week plan from localStorage
    const savedPlan = localStorage.getItem('weekPlan');
    if (savedPlan) {
      setWeekPlan(JSON.parse(savedPlan));
    }

    // Load coins from localStorage
    const savedCoins = localStorage.getItem('fitnessCoins');
    if (savedCoins) {
      setCoins(parseInt(savedCoins));
    }
  }, []);

  useEffect(() => { 
    if (user) loadData(); 
  }, [user, loadData]);

  useEffect(() => {
    setFormData({ sets: '', reps: '', weight: '', minutes: '', distance: '' });
    const firstExercise = Object.keys(EXERCISES[workoutType])[0];
    setSelectedEx(firstExercise);
  }, [workoutType]);

  const finishWorkout = async () => {
    const config = WORKOUT_CONFIGS[workoutType];
    const requiredFields = config.fields;
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      alert(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let exerciseData = {
        exercise_name: selectedEx,
        muscle_group: EXERCISES[workoutType][selectedEx] || 'Other',
        workout_type: workoutType
      };

      if (workoutType === 'strength') {
        exerciseData.sets = Number(formData.sets);
        exerciseData.reps = Number(formData.reps);
        exerciseData.weight = Number(formData.weight);
      } else if (workoutType === 'cardio') {
        exerciseData.sets = 1;
        exerciseData.reps = Number(formData.minutes);
        exerciseData.weight = Number(formData.distance) || 0;
      } else if (workoutType === 'stretch') {
        exerciseData.sets = 1;
        exerciseData.reps = Number(formData.minutes);
        exerciseData.weight = 0;
      }

      console.log('Sending exercise data:', exerciseData);
      const payload = [exerciseData];
      
      const res = await fetch('/.netlify/functions/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email, exercises: payload })
      });
      
      if (!res.ok) throw new Error('Failed to save workout');
      
      setIsLogging(false);
      setFormData({ sets: '', reps: '', weight: '', minutes: '', distance: '' });
      
      // Award coins for completing workout
      const newCoins = coins + 10;
      setCoins(newCoins);
      localStorage.setItem('fitnessCoins', newCoins.toString());
      
      await loadData();
      
    } catch (e) {
      console.error('Save workout error', e);
      setError('Failed to save workout');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/.netlify/functions/database', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auth', email, password }) 
      });
      
      if (!res.ok) throw new Error('Authentication failed');
      
      const data = await res.json();
      const userData = { 
        email: data.email,
        display_name: data.display_name || email.split('@')[0],
        profile_pic: data.profile_pic || ''
      };
      
      setUser(userData);
      localStorage.setItem('fitnessUser', JSON.stringify(userData));
      setProfileForm({
        displayName: userData.display_name,
        profilePic: userData.profile_pic
      });
      
    } catch (e) {
      console.error('Auth error', e);
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/.netlify/functions/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'updateProfile',
          email: user.email,
          displayName: profileForm.displayName,
          profilePic: profileForm.profilePic
        })
      });
      
      if (!res.ok) throw new Error('Failed to update profile');
      
      const updatedUser = {
        ...user,
        display_name: profileForm.displayName,
        profile_pic: profileForm.profilePic
      };
      setUser(updatedUser);
      localStorage.setItem('fitnessUser', JSON.stringify(updatedUser));
      setShowProfile(false);
      await loadData();
      
    } catch (e) {
      console.error('Update profile error', e);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkout = async (workoutId) => {
    if (!confirm('Delete this workout?')) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/.netlify/functions/database?workoutId=${workoutId}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) throw new Error('Failed to delete workout');
      
      await loadData();
      
    } catch (e) {
      console.error('Delete error', e);
      setError('Failed to delete workout');
    } finally {
      setLoading(false);
    }
  };

  const stats = (() => {
    if (!user || !allData?.workoutLogs) {
      return { myLogs: [], muscleSplit: {}, pbs: {}, league: [], profile: { totalWorkouts: 0, thisWeek: 0, favoriteExercise: {}, totalWeight: 0 } };
    }

    const myLogs = allData.workoutLogs.filter(log => log.user_email === user.email) || [];
    const muscleSplit = { Chest: 0, Legs: 0, Back: 0, Shoulders: 0, Arms: 0, Cardio: 0, Flexibility: 0 };
    const pbs = {};

    myLogs.forEach(log => {
      const exerciseName = log.exercise_name || 'Unknown';
      const muscleGroup = log.muscle_group || 'Other';
      
      if (muscleGroup && muscleSplit.hasOwnProperty(muscleGroup)) {
        muscleSplit[muscleGroup] = (muscleSplit[muscleGroup] || 0) + 1;
      }
      
      const weight = log.weight || 0;
      if (weight > 0 && muscleGroup !== 'Cardio' && muscleGroup !== 'Flexibility') {
        if (weight > (pbs[exerciseName] || 0)) {
          pbs[exerciseName] = weight;
        }
      }
    });

    const league = Object.entries((allData.workoutLogs || []).reduce((acc, log) => {
      acc[log.user_email] = (acc[log.user_email] || 0) + 1;
      return acc;
    }, {})).map(([email, count]) => {
      const u = allData.users?.find(usr => usr.email === email);
      return { name: u?.display_name || email.split('@')[0], count };
    }).sort((a,b) => b.count - a.count);

    const profile = {
      totalWorkouts: myLogs.length,
      thisWeek: myLogs.filter(log => {
        const logDate = new Date(log.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return logDate >= weekAgo;
      }).length,
      favoriteExercise: myLogs.reduce((acc, log) => {
        const exercise = log.exercise_name || 'Unknown';
        acc[exercise] = (acc[exercise] || 0) + 1;
        return acc;
      }, {}),
      totalWeight: myLogs.reduce((sum, log) => sum + (log.weight || 0), 0)
    };

    return { myLogs, muscleSplit, pbs, league, profile };
  })();

  // Get today's workout plan
  const getTodaysWorkout = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return weekPlan[today];
  };

  const todaysWorkout = getTodaysWorkout();

  if (!user) return (
    <div style={styles.container}>
      <div style={styles.authCard}>
        <Sparkles size={40} color="#6366f1" />
        <h2 style={{margin:'20px 0'}}>Fit as a Fiddle</h2>
        {error && <div style={styles.error}>{error}</div>}
        <input 
          style={styles.input} 
          placeholder="Email" 
          value={email}
          onChange={e => setEmail(e.target.value)} 
          disabled={loading}
          onKeyPress={e => e.key === 'Enter' && handleAuth()}
        />
        <input 
          style={styles.input} 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={e => setPassword(e.target.value)} 
          disabled={loading}
          onKeyPress={e => e.key === 'Enter' && handleAuth()}
        />
        <button 
          style={styles.mainBtn} 
          onClick={handleAuth}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Sign In / Register'}
        </button>
        <p style={{marginTop:'20px', color:'#94a3b8', fontSize:'13px'}}>
          Don't have an account? Just enter your email and password to create one!
        </p>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.brandTitle}>Fit as a Fiddle</h1>
        <div style={styles.tabContainer}>
          <button 
            onClick={() => setActiveTab('dashboard')} 
            style={{
              ...styles.tabButton,
              ...(activeTab === 'dashboard' ? styles.activeTab : {})
            }}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('planner')} 
            style={{
              ...styles.tabButton,
              ...(activeTab === 'planner' ? styles.activeTab : {})
            }}
          >
            Weekly Planner
          </button>
          <button 
            onClick={() => setActiveTab('ideas')} 
            style={{
              ...styles.tabButton,
              ...(activeTab === 'ideas' ? styles.activeTab : {})
            }}
          >
            Workout Ideas
          </button>
        </div>
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
          {user.profile_pic && (
            <img 
              src={user.profile_pic} 
              alt="Profile" 
              style={{width:'32px', height:'32px', borderRadius:'50%', objectFit:'cover'}}
            />
          )}
          <button 
            onClick={() => setShowProfile(true)} 
            style={styles.profileBtn}
            disabled={loading}
          >
            <Settings size={16} /> Profile
          </button>
          <button 
            onClick={() => {setUser(null); localStorage.removeItem('fitnessUser');}} 
            style={styles.logoutBtn}
            disabled={loading}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      {activeTab === 'dashboard' ? (
        <>
          <div style={styles.profileSection}>
            <div style={styles.profileCardContainer}>
              <div style={styles.profileCard}>
                <div style={styles.profileHeader}>
                  <User size={24} color="#6366f1" />
                  <h2>Profile Details</h2>
                </div>
                <div style={styles.profileStats}>
                  <div style={styles.statItem}>
                    <div style={styles.statValue}>{stats.profile.totalWorkouts}</div>
                    <div style={styles.statLabel}>Total Workouts</div>
                  </div>
                  <div style={styles.statItem}>
                    <div style={styles.statValue}>{stats.profile.thisWeek}</div>
                    <div style={styles.statLabel}>This Week</div>
                  </div>
                  <div style={styles.statItem}>
                    <div style={styles.statValue}>{Object.keys(stats.profile.favoriteExercise).length}</div>
                    <div style={styles.statLabel}>Exercises</div>
                  </div>
                  <div style={styles.statItem}>
                    <div style={styles.statValue}>{Math.round(stats.profile.totalWeight)}kg</div>
                    <div style={styles.statLabel}>Total Weight</div>
                  </div>
                </div>
                {Object.keys(stats.profile.favoriteExercise).length > 0 && (
                  <div style={styles.favoriteExercise}>
                    <strong>Favorite:</strong> {Object.entries(stats.profile.favoriteExercise).sort((a,b) => b[1] - a[1])[0][0]}
                  </div>
                )}
              </div>

              <div style={styles.todayCard}>
                <div style={styles.profileHeader}>
                  <Calendar size={24} color="#10b981" />
                  <h2>Today's Plan</h2>
                </div>
                {todaysWorkout.workout ? (
                  <div>
                    <div style={styles.workoutTypeIndicator}>
                      {todaysWorkout.type === 'strength' && <Dumbbell size={20} color="#6366f1" />}
                      {todaysWorkout.type === 'cardio' && <Heart size={20} color="#ec4899" />}
                      {todaysWorkout.type === 'stretch' && <Wind size={20} color="#10b981" />}
                      <span style={{textTransform:'capitalize', fontWeight:'bold'}}>{todaysWorkout.type}</span>
                    </div>
                    {todaysWorkout.exercises.length > 0 ? (
                      <div style={styles.todayExercisesList}>
                        {todaysWorkout.exercises.map((ex, i) => (
                          <div key={i} style={styles.todayExerciseItem}>
                            • {ex.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={styles.emptyState}>No exercises planned</div>
                    )}
                  </div>
                ) : (
                  <div style={styles.restDayIndicator}>
                    <div style={{fontSize:'40px', marginBottom:'10px'}}>😴</div>
                    <div>Rest Day</div>
                  </div>
                )}

                <div style={styles.coinsSection}>
                  <div style={styles.coinsHeader}>
                    <Sparkles size={20} color="#fbbf24" />
                    <span style={{fontWeight:'bold'}}>Fitness Coins</span>
                  </div>
                  <div style={styles.coinsValue}>{coins}</div>
                  <div style={styles.coinsNote}>+10 coins per workout</div>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.gridTop}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Target size={18} color="#6366f1" />
                <h3>Personal Bests</h3>
              </div>
              {Object.entries(stats.pbs).length === 0 ? (
                <div style={styles.emptyState}>No personal bests yet</div>
              ) : (
                Object.entries(stats.pbs).map(([name, val]) => (
                  <div key={name} style={styles.row}>
                    <span>{name}</span>
                    <span style={{color:'#6366f1', fontWeight:'bold'}}>{val}kg</span>
                  </div>
                ))
              )}
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Zap size={18} color="#fbbf24" />
                <h3>Muscle Balance</h3>
              </div>
              {Object.entries(stats.muscleSplit).map(([group, count]) => (
                <div key={group} style={styles.balanceRow}>
                  <span style={styles.groupLabel}>{group}</span>
                  <div style={styles.barBg}>
                    <div style={{...styles.barFill, width: `${Math.min(100, count * 20)}%`}} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.gridBottom}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Calendar size={18} color="#6366f1" />
                <h3>Workout History</h3>
              </div>
              <div style={styles.scrollArea}>
                {stats.myLogs.length === 0 ? (
                  <div style={styles.emptyState}>No workouts logged yet</div>
                ) : (
                  stats.myLogs.map((log, i) => {
                    const exerciseName = log.exercise_name || 'Unknown Exercise';
                    const muscleGroup = log.muscle_group || 'Other';
                    const weight = log.weight || 0;
                    const sets = log.sets || 0;
                    const reps = log.reps || 0;
                    
                    return (
                      <div key={i} style={styles.historyItem}>
                        <span style={styles.dateText}>
                          {new Date(log.created_at).toLocaleDateString(undefined, {day:'numeric', month:'short'})}
                        </span>
                        <span style={{flex:1, fontWeight:'600'}}>
                          {exerciseName}
                        </span>
                        <div style={{textAlign:'right', marginRight:'15px'}}>
                          {muscleGroup === 'Cardio' ? (
                            <>
                              <div style={{fontWeight:'bold', color:'#ec4899'}}>{reps} min</div>
                              {weight > 0 && <div style={{fontSize:'10px', color:'#94a3b8'}}>{weight} km</div>}
                            </>
                          ) : muscleGroup === 'Flexibility' ? (
                            <div style={{fontWeight:'bold', color:'#10b981'}}>{reps} min</div>
                          ) : (
                            <>
                              <div style={{fontWeight:'bold', color:'#6366f1'}}>{weight}kg</div>
                              <div style={{fontSize:'10px', color:'#94a3b8'}}>{sets} x {reps}</div>
                            </>
                          )}
                        </div>
                        <Trash2 
                          size={16} 
                          color="#ef4444" 
                          style={{cursor:'pointer', opacity: loading ? 0.5 : 1}} 
                          onClick={() => deleteWorkout(log.id)}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Trophy size={18} color="#fbbf24" />
                <h3>League Standings</h3>
              </div>
              <div style={styles.scrollArea}>
                {stats.league.length === 0 ? (
                  <div style={styles.emptyState}>No league data available</div>
                ) : (
                  stats.league.map((entry, i) => {
                    const userInfo = allData.users?.find(u => 
                      (u.display_name === entry.name || u.email.split('@')[0] === entry.name)
                    );
                    return (
                      <div key={i} style={styles.leagueItem}>
                        <div style={styles.rankCircle}>{i+1}</div>
                        {userInfo?.profile_pic ? (
                          <img 
                            src={userInfo.profile_pic} 
                            alt={entry.name}
                            style={styles.leagueAvatar}
                          />
                        ) : (
                          <div style={styles.leagueAvatarPlaceholder}>
                            <User size={16} color="#6366f1" />
                          </div>
                        )}
                        <div style={{flex:1}}>{entry.name}</div>
                        <div style={{fontSize:'12px', fontWeight:'bold', color:'#fbbf24'}}>{entry.count} sessions</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div style={styles.fabContainer}>
            <button 
              onClick={() => {setWorkoutType('strength'); setIsLogging(true);}} 
              style={{...styles.fab, background:'#6366f1'}}
              disabled={loading}
            >
              <Dumbbell size={18}/> Strength
            </button>
            <button 
              onClick={() => {setWorkoutType('cardio'); setIsLogging(true);}} 
              style={{...styles.fab, background:'#ec4899'}}
              disabled={loading}
            >
              <Heart size={18}/> Cardio
            </button>
            <button 
              onClick={() => {setWorkoutType('stretch'); setIsLogging(true);}} 
              style={{...styles.fab, background:'#10b981'}}
              disabled={loading}
            >
              <Wind size={18}/> Stretch
            </button>
          </div>
        </>
      ) : activeTab === 'planner' ? (
        <WorkoutPlanner 
          userEmail={user?.email} 
          workoutLogs={allData.workoutLogs}
          weekPlan={weekPlan}
          setWeekPlan={setWeekPlan}
        />
      ) : (
        <WorkoutIdeas />
      )}

      {isLogging && (
         <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
               <div style={styles.modalHeader}>
                 <h3>Log {workoutType}</h3>
                 <X onClick={()=>setIsLogging(false)} style={{cursor:'pointer'}}/>
               </div>
               <select 
                 style={styles.input} 
                 value={selectedEx} 
                 onChange={e=>setSelectedEx(e.target.value)}
                 disabled={loading}
               >
                  {Object.keys(EXERCISES[workoutType]).map(ex => 
                    <option key={ex} value={ex}>{ex}</option>
                  )}
               </select>
               <div style={styles.inputGrid}>
                  {WORKOUT_CONFIGS[workoutType].fields.map(field => (
                    <div key={field}>
                      <label style={styles.label}>
                        {WORKOUT_CONFIGS[workoutType].labels[field]}
                      </label>
                      <input 
                        style={styles.input} 
                        type="number" 
                        value={formData[field]} 
                        onChange={e => setFormData(prev => ({ ...prev, [field]: e.target.value }))} 
                        placeholder={WORKOUT_CONFIGS[workoutType].placeholders[field]}
                        disabled={loading}
                      />
                    </div>
                  ))}
               </div>
               <button 
                 style={styles.mainBtn} 
                 onClick={finishWorkout}
                 disabled={loading}
               >
                 {loading ? 'Saving...' : 'Save Workout'}
               </button>
            </div>
         </div>
      )}

      {showProfile && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>Edit Profile</h3>
              <X onClick={() => setShowProfile(false)} style={{cursor:'pointer'}}/>
            </div>
            <div style={{textAlign:'center', marginBottom:'20px'}}>
              <div style={styles.avatarCircle}>
                {profileForm.profilePic ? (
                  <img src={profileForm.profilePic} alt="Profile" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                ) : (
                  <User size={40} color="#6366f1" />
                )}
              </div>
            </div>
            <label style={styles.label}>Display Name</label>
            <input 
              style={styles.input}
              value={profileForm.displayName}
              onChange={e => setProfileForm(prev => ({...prev, displayName: e.target.value}))}
              placeholder="Display Name"
              disabled={loading}
            />
            <label style={styles.label}>Profile Picture URL</label>
            <input 
              style={styles.input}
              value={profileForm.profilePic}
              onChange={e => setProfileForm(prev => ({...prev, profilePic: e.target.value}))}
              placeholder="https://example.com/avatar.jpg "
              disabled={loading}
            />
            <button 
              style={styles.mainBtn}
              onClick={updateProfile}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#0a0f1d', color: '#f8fafc', padding: '40px', fontFamily: 'sans-serif' },
  header: { display:'flex', justifyContent:'space-between', marginBottom:'40px', alignItems:'center' },
  brandTitle: { color:'#6366f1', margin:0, fontWeight:'900', fontSize:'28px' },
  tabContainer: { display:'flex', gap:'10px' },
  tabButton: { padding:'10px 20px', background:'transparent', color:'#94a3b8', border:'none', borderRadius:'12px', cursor:'pointer', fontWeight:'bold', fontSize:'14px' },
  activeTab: { background:'rgba(99, 102, 241, 0.1)', color:'#6366f1' },
  profileSection: { marginBottom: '25px' },
  profileCardContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' },
  profileCard: { background:'#161d2f', padding:'30px', borderRadius:'24px', border:'1px solid rgba(255,255,255,0.05)' },
  todayCard: { background:'#161d2f', padding:'30px', borderRadius:'24px', border:'1px solid rgba(255,255,255,0.05)' },
  profileHeader: { display:'flex', gap:'15px', alignItems:'center', marginBottom:'25px' },
  profileStats: { display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'20px', marginBottom:'20px' },
  statItem: { textAlign:'center', padding:'15px', background:'rgba(255,255,255,0.03)', borderRadius:'12px' },
  statValue: { fontSize:'24px', fontWeight:'bold', color:'#6366f1', marginBottom:'5px' },
  statLabel: { fontSize:'11px', color:'#94a3b8', textTransform:'uppercase' },
  favoriteExercise: { textAlign:'center', color:'#94a3b8', fontSize:'14px', marginTop:'10px' },
  gridTop: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'25px', marginBottom:'25px' },
  gridBottom: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'25px', paddingBottom:'100px' },
  card: { background:'#161d2f', padding:'25px', borderRadius:'24px', border:'1px solid rgba(255,255,255,0.05)' },
  cardHeader: { display:'flex', gap:'10px', alignItems:'center', marginBottom:'20px' },
  row: { display:'flex', justifyContent:'space-between', padding:'12px', background:'rgba(255,255,255,0.02)', borderRadius:'12px', marginBottom:'8px' },
  balanceRow: { display:'flex', alignItems:'center', gap:'15px', marginBottom:'12px' },
  groupLabel: { width:'80px', fontSize:'11px', color:'#94a3b8' },
  barBg: { flex:1, height:'8px', background:'#0a0f1d', borderRadius:'10px' },
  barFill: { height:'100%', background:'#6366f1', borderRadius:'10px' },
  scrollArea: { maxHeight:'400px', overflowY:'auto' },
  historyItem: { display:'flex', padding:'18px', background:'rgba(255,255,255,0.03)', borderRadius:'18px', marginBottom:'12px', alignItems:'center' },
  dateText: { color:'#6366f1', fontWeight:'bold', width:'65px', fontSize:'12px' },
  leagueItem: { display:'flex', alignItems:'center', gap:'15px', padding:'14px', background:'rgba(255,255,255,0.02)', borderRadius:'14px', marginBottom:'10px' },
  leagueAvatar: { width:'32px', height:'32px', borderRadius:'50%', objectFit:'cover', border:'2px solid #6366f1' },
  leagueAvatarPlaceholder: { width:'32px', height:'32px', borderRadius:'50%', background:'rgba(99, 102, 241, 0.1)', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #6366f1' },
  rankCircle: { width:'24px', height:'24px', background:'#0a0f1d', borderRadius:'50%', textAlign:'center', fontSize:'11px', lineHeight:'24px' },
  fabContainer: { position:'fixed', bottom:'30px', left:'50%', transform:'translateX(-50%)', display:'flex', gap:'15px', zIndex: 100 },
  fab: { padding:'16px 28px', borderRadius:'22px', color:'#fff', border:'none', cursor:'pointer', display:'flex', gap:'10px', fontWeight:'bold' },
  modalOverlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(5px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 },
  modalContent: { background:'#161d2f', padding:'35px', borderRadius:'32px', width:'90%', maxWidth:'420px' },
  modalHeader: { display:'flex', justifyContent:'space-between', marginBottom:'25px', alignItems:'center' },
  label: { fontSize:'10px', color:'#94a3b8', marginBottom:'5px', display:'block' },
  inputGrid: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'15px' },
  input: { width:'100%', padding:'16px', borderRadius:'16px', background:'#0a0f1d', color:'#fff', border:'1px solid #1e293b', marginBottom:'20px', boxSizing:'border-box' },
  mainBtn: { width:'100%', padding:'18px', background:'#6366f1', color:'#fff', border:'none', borderRadius:'18px', fontWeight:'bold', cursor:'pointer' },
  profileBtn: { background:'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)', cursor: 'pointer', display:'flex', alignItems:'center', gap:'8px', fontSize:'14px', fontWeight:'bold' },
  logoutBtn: { background:'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', display:'flex', alignItems:'center', gap:'8px', fontSize:'14px', fontWeight:'bold' },
  authCard: { maxWidth:'400px', margin:'100px auto', background:'#161d2f', padding:'50px', borderRadius:'40px', textAlign:'center' },
  avatarCircle: { width:'100px', height:'100px', borderRadius:'50%', background:'rgba(99, 102, 241, 0.1)', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', border:'3px solid #6366f1' },
  error: { color: '#ef4444', fontSize: '14px', marginBottom: '15px', textAlign: 'center' },
  errorBanner: { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' },
  workoutTypeIndicator: { display:'flex', alignItems:'center', gap:'10px', padding:'15px', background:'rgba(99, 102, 241, 0.1)', borderRadius:'12px', marginBottom:'15px', fontSize:'16px' },
  todayExercisesList: { marginBottom:'20px' },
  todayExerciseItem: { padding:'10px', background:'rgba(255,255,255,0.03)', borderRadius:'8px', marginBottom:'8px', fontSize:'14px' },
  restDayIndicator: { textAlign:'center', padding:'40px 20px', color:'#94a3b8', fontSize:'18px' },
  coinsSection: { marginTop:'25px', padding:'20px', background:'rgba(251, 191, 36, 0.05)', borderRadius:'12px', border:'1px solid rgba(251, 191, 36, 0.2)' },
  coinsHeader: { display:'flex', alignItems:'center', gap:'10px', marginBottom:'15px', color:'#fbbf24' },
  coinsValue: { fontSize:'48px', fontWeight:'bold', color:'#fbbf24', textAlign:'center', marginBottom:'5px' },
  coinsNote: { fontSize:'12px', color:'#94a3b8', textAlign:'center' },
  emptyState: { textAlign:'center', color:'#94a3b8', padding:'20px' },
  
  // Workout Ideas Styles
  ideasContainer: { padding: '20px 0' },
  ideasHeader: { marginBottom: '30px', textAlign: 'center' },
  ideasSubtitle: { color: '#94a3b8', fontSize: '16px', marginTop: '10px' },
  
  filtersContainer: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '30px',
    gap: '20px',
    flexWrap: 'wrap'
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#161d2f',
    padding: '12px 20px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)',
    flex: 1,
    minWidth: '250px'
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    outline: 'none',
    fontSize: '14px'
  },
  filterGroup: {
    display: 'flex',
    gap: '10px'
  },
  filterSelect: {
    padding: '12px 16px',
    background: '#161d2f',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '12px',
    cursor: 'pointer'
  },
  
  workoutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  workoutCard: {
    background: '#161d2f',
    padding: '25px',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.05)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 30px rgba(99, 102, 241, 0.1)'
    }
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  difficultyBadge: {
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  workoutDescription: {
    color: '#94a3b8',
    fontSize: '14px',
    marginBottom: '15px',
    lineHeight: '1.5'
  },
  workoutMeta: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#94a3b8'
  },
  viewDetailsBtn: {
    width: '100%',
    padding: '12px',
    background: 'rgba(99, 102, 241, 0.1)',
    color: '#6366f1',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(99, 102, 241, 0.2)'
    }
  },
  
  // Detail Modal Styles
  detailModal: {
    background: '#161d2f',
    padding: '40px',
    borderRadius: '32px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflowY: 'auto'
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px'
  },
  detailTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  detailContent: {
    marginBottom: '25px'
  },
  detailDescription: {
    color: '#94a3b8',
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '20px'
  },
  detailMeta: {
    display: 'flex',
    gap: '15px',
    marginBottom: '25px',
    flexWrap: 'wrap'
  },
  metaBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    fontSize: '14px',
    '&.difficulty': {
      background: 'transparent',
      padding: '0'
    }
  },
  exercisesSection: {
    marginBottom: '25px'
  },
  sectionTitle: {
    marginBottom: '15px',
    color: '#6366f1',
    fontSize: '18px'
  },
  exercisesList: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    padding: '20px'
  },
  exerciseItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
    padding: '8px 0',
    '&:last-child': {
      marginBottom: 0
    }
  },
  exerciseNumber: {
    color: '#6366f1',
    fontWeight: 'bold',
    minWidth: '20px'
  },
  restInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#94a3b8',
    fontSize: '14px',
    padding: '15px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px'
  },
  closeModalBtn: {
    width: '100%',
    padding: '16px',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  
  // Existing styles...
  plannerContainer: { padding: '20px 0' },
  plannerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  savePlanBtn: {
    background: '#6366f1',
    color: '#fff',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 'bold'
  },
  weekGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  dayCard: {
    background: '#161d2f',
    padding: '25px',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.05)',
    minHeight: '200px'
  },
  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  workoutToggle: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    transition: 'all 0.2s ease'
  },
  workoutContent: {
    marginTop: '15px'
  },
  typeSelect: {
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    background: '#0a0f1d',
    color: '#fff',
    border: '1px solid #1e293b',
    marginBottom: '15px'
  },
  exercisesList: {
    marginBottom: '15px'
  },
  exerciseItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    marginBottom: '8px'
  },
  exerciseInfo: {
    flex: 1
  },
  exerciseName: {
    fontWeight: '600',
    marginBottom: '4px'
  },
  exerciseDetails: {
    display: 'flex',
    gap: '10px',
    fontSize: '12px',
    color: '#94a3b8'
  },
  exerciseActions: {
    display: 'flex',
    gap: '8px'
  },
  editExerciseBtn: {
    background: 'transparent',
    border: 'none',
    color: '#6366f1',
    cursor: 'pointer',
    padding: '4px',
    fontSize: '14px'
  },
  removeExerciseBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '4px',
    fontSize: '14px'
  },
  addExerciseBtn: {
    width: '100%',
    padding: '12px',
    background: 'rgba(99, 102, 241, 0.1)',
    color: '#6366f1',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px'
  }
};

export default Dashboard;
