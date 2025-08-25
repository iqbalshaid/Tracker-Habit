import styles from '../../css/Archive.module.css';
import { useHabitsStore } from '../../stores/habitsStore';
 // token ke liye agar aap store me rakhe ho

// components
import Placeholder from '../Placeholder';

// icons
import { ReactComponent as Table } from '../../img/table-of-contents.svg';

function Archive() {
  const habits = useHabitsStore((s) => s.habits);
  const archiveHabit = useHabitsStore((s) => s.archiveHabit);
  const token = localStorage.getItem("token");
  // token agar aapke store me ho
  

  // Filter only archived habits
  const archivedHabits = habits.filter(h => h.isArchived);

  const handleRestore = async (habitId) => {
    try {
      await archiveHabit(habitId, token, false); // false = restore
      console.log('Habit restored:', habitId);
    } catch (err) {
      console.error('Failed to restore habit:', err);
    }
  };

  return (
    <div className={styles.archive}>
      {archivedHabits.length > 0 ? (
        <div className={styles.habitListWrapper}>
          {archivedHabits.map((habit) => (
            <div key={habit._id} className={styles.habitItem} style={{display:"flex",justifyContent:"space-between",gap:"20px"}}>
              <div style={{display:"flex",gap:"20px"}}>
                <div>{habit.iconTitle}</div>
              <div className={styles.habitTitle}>{habit.title}</div>
              </div>
              <button
                className={styles.restoreBtn}
                onClick={() => handleRestore(habit._id)}
              >
                Restore
              </button>
            </div>
          ))}
        </div>
      ) : (
        <Placeholder
          image={<Table />}
          title="No archived habits found"
          desc="You can archive a habit by editing it."
        />
      )}
    </div>
  );
}

export default Archive;
