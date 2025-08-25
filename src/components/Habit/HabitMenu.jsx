import styles from '../../css/HabitMenu.module.css';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useHabitsStore } from '../../stores/habitsStore';
import Button from '../Button';
import { MdEditSquare, MdLibraryBooks } from 'react-icons/md';
import { FaShareAltSquare, FaCalendarCheck, FaCalendarTimes } from 'react-icons/fa';
import { FaChartSimple } from 'react-icons/fa6';

// --- Variants ---
const bgVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 100 },
  exit: { opacity: 0 },
  transition: { duration: 0.2, ease: 'easeOut' }
};
const contentVariants = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
  transition: { duration: 0.2, ease: 'easeOut' }
};

function HabitMenu(props) {
  const {
    title, completedDays, colorIndex, colorPalette,
    isTodayCompleted, isYesterdayCompleted, todayProgress, frequency, currentStreak,
    onShowMenu, onShare
  } = props;

  const { darkenedColor } = colorPalette;
  console.log(currentStreak,"lop");
  const handleDragEnd = (_, info) => {
    if (info.offset.y >= 100) {
      onShowMenu(-1);
      navigator.vibrate?.(10);
    }
  };

  const handleCompleteYesterday = () => {
    // Use the toggleCompleteDay store function to mark yesterday complete
    // Adjust the date to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
  };

  const buttons = [
    [
      isYesterdayCompleted ? <FaCalendarTimes /> : <FaCalendarCheck />,
      (isYesterdayCompleted ? 'Uncomp.' : 'Comp.') + " Y'day",
      isYesterdayCompleted ? 'IndianRed' : darkenedColor,
      null,
      null,
      handleCompleteYesterday
    ],
    [
      <MdEditSquare />,
      'Edit Habit',
      darkenedColor,
      '/modal/habitEditor',
      { habitTitle: title, modalTitle: 'Edit habit' },
      null,
      true
    ],
    [
      <FaShareAltSquare />,
      'Share Habit',
      darkenedColor,
      null,
      null,
      () => onShare()
    ],
    [
      <FaChartSimple />,
      'Statistics',
      darkenedColor,
      '/modal/statistics',
      { completedDays, colorPalette, colorIndex, frequency, modalTitle: title },
      null,
      true
    ],
    [
      <MdLibraryBooks />,
      'Diary',
      darkenedColor,
      '/modal/diary',
      { currentStreak, habitTitle: title, colorIndex, modalTitle: title },
      null,
      true
    ]
  ].map(([icon, text, bgColor, to, state, onClick, arrow]) => (
    <li key={text}>
      <Link to={to ? (process.env.PUBLIC_URL + to) : null} state={state}>
        <Button {...{ icon, text, bgColor, onClick, arrow }} />
      </Link>
    </li>
  ));

  return (
    <motion.div className={styles.menu} {...bgVariants}>
      <motion.div
        className={styles.content}
        {...contentVariants}
        drag='y'
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.1, bottom: 1 }}
        onDragEnd={handleDragEnd}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handle} />
        <h3 className={styles.title}>{title}</h3>
        <ul className={styles.list} onClick={() => onShowMenu(-1)}>
          {buttons}
        </ul>
      </motion.div>
    </motion.div>
  );
}

export default HabitMenu;
