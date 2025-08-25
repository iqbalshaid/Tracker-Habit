import styles from '../css/HabitList.module.css';

// react
import { useState } from 'react';

// framer
import { AnimatePresence } from 'framer-motion';

// stores
import { useColorsStore } from '../stores/colorsStore';

// components
import Habit from "./Habit/Habit";

// db
import dbIcons from '../db/dbIcons';


function HabitList({ habits, isArchive }) {
  const dbColors = useColorsStore((s) => s.colors);
  const [visibleMenuIndex, setVisibleMenuIndex] = useState(-1);

  const handleToggleMenu = (i) => {
    document.body.classList.toggle('no-scroll');
    setVisibleMenuIndex(i === visibleMenuIndex ? -1 : i);
  };
console.log(isArchive)
  const habitList = habits.map((h, index) => {
    const icon = dbIcons.find(([iconTitle]) => iconTitle === h.iconTitle)?.[1] ?? "❓";
    const color = dbColors?.[h.colorIndex] ?? "#ccc";
habits.forEach(h => console.log(h.completedDays));

    return (
      <Habit
        key={h._id || h.title || index}
        {...h}
        index={index}
        isArchive={isArchive}
        icon={icon}
        color={color}
        isMenuVisible={visibleMenuIndex === index}
        onShowMenu={(i) => handleToggleMenu(i)}
      />
    );
  });

  return (
    <div className={styles.habitList}>
      <AnimatePresence initial={false}>
        {habitList.length > 0 ? habitList : <p>No habits found</p>}
      </AnimatePresence>
    </div>
  );
}


export default HabitList;
