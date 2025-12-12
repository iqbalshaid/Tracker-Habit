import styles from '../css/MainPage.module.css';
import { motion } from 'framer-motion';
import Header from './Header';
import HabitList from './HabitList';
import Placeholder from './Placeholder';
import { useState, useEffect } from 'react';
import { ReactComponent as Calendar } from '../img/calendar.svg';
import { MdAddToPhotos, MdArrowForward, MdArrowBack } from "react-icons/md";
import { useHabitsStore } from '../stores/habitsStore';
import Menu from './Menu/Menu';
import { useAuth } from '../Context/Auth-context';
import { Link, Navigate } from 'react-router';
import RobotImg from "../img/robot-chatbot-icon-sign-free-vector.jpg";
const mainVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

function MainPage() {
  const { user } = useAuth();
  const token = localStorage.getItem("token"); // auth token

  const [selectedHabitTitle, setSelectedHabitTitle] = useState(null);
  const [isWide, setIsWide] = useState(window.innerWidth >= 1200);

  // Store hooks
  const habits = useHabitsStore((s) => s.habits);
  const fetchHabits = useHabitsStore((s) => s.fetchHabits);
  const isLoading = useHabitsStore((s) => s.isLoading);

  // Fetch habits for current user on mount
  useEffect(() => {
    if (user && token) fetchHabits(token);
  }, [user, token, fetchHabits]);

  useEffect(() => {
    const handleResize = () => setIsWide(window.innerWidth >= 1200);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredHabits = habits.filter(h => !h.isArchived);

  if (!user) return <Navigate to="/signin" replace />;

  return (
    <motion.div className={styles.mainPage} {...mainVariants}>
      <Header />
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        {isWide && <Menu />}

        {/* Habit selection list */}
        {!selectedHabitTitle && filteredHabits.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "1rem", margin: "1.5rem" }}>
            {filteredHabits.map((habit) => (
              <div
                key={habit._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "8px",
                  cursor: "pointer"
                }}
                onClick={() => setSelectedHabitTitle(habit.title)}
              >
                <span style={{ fontSize: "20px" }}>{habit.iconTitle}</span>
                <span style={{ fontWeight: "500" }}>{habit.title}</span>
                <MdArrowForward size={24} color="#555" />
              </div>
            ))}
          </div>
        )}

        {/* HabitList for selected habit */}
        {selectedHabitTitle && (
          <>
            <div style={{ padding: "1rem", display: "flex", alignItems: "center" }}>
              <button
                onClick={() => setSelectedHabitTitle(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: "#555"
                }}
              >
                <MdArrowBack size={20} />
                Back to all habits
              </button>
            </div>
          

<HabitList
  habits={filteredHabits.filter(h => h.title === selectedHabitTitle)}
/>

          </>
        )}
      </div>

      {/* Placeholder for no habits */}
      {!isLoading && filteredHabits.length === 0 && (
        <Placeholder
          image={<Calendar />}
          title="No active habits found"
          desc="Why not create one now?"
          textOnButton="Create First Habit"
          buttonIcon={<MdAddToPhotos />}
          to="/modal/habitEditor"
          state={{ modalTitle: 'Create new habit' }}
        />
      )}
      {/* Bottom Fixed Image */}
      <Link to="/chatboat">
<img
  src={RobotImg}
  alt="fixed"
  style={{
    position: "fixed",
    bottom: "50px",
    right: "40px",
    width: "80px",
    zIndex: 1000,
    borderRadius: "50%",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    cursor: "pointer"
  }}
/>
</Link>
    </motion.div>
  );
}

export default MainPage;
