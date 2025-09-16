import styles from '../../css/HabitEditor.module.css';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHabitsStore } from '../../stores/habitsStore';
import TitleBlock from './TitleBlock';
import FrequencyBlock from './FrequencyBlock';
import OrderBlock from './OrderBlock';
import ColorBlock from './ColorBlock';
import IconBlock from './IconBlock';
import Button from '../Button';
import checkHabitTitleExistence from '../../utils/checkHabitTitleExistence';
import { MdAddToPhotos, MdDeleteForever } from 'react-icons/md';
import { HiArchiveBoxArrowDown } from 'react-icons/hi2';
import NameBlock from './NameBlock';

function HabitEditor() {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token"); // auth token

  const habits = useHabitsStore((s) => s.habits);
  const addHabit = useHabitsStore((s) => s.addHabit);
  const updateHabit = useHabitsStore((s) => s.updateHabit);
  const deleteHabit = useHabitsStore((s) => s.deleteHabit);
  const isLoading = useHabitsStore((s) => s.isLoading);
  const archiveHabit = useHabitsStore((s)=>s.archiveHabit);
  const habitTitle = location.state?.habitTitle;
  const isEditMode = Boolean(habitTitle);
  const filteredHabits = isEditMode ? habits.filter(h => !h.isArchived) : [];
  const habit = isEditMode ? habits.find(h => h.title === habitTitle) : null;

  const [inputTitle, setInputTitle] = useState(isEditMode ? habit?.title : '');
  const [inputName,setInputName] = useState(isEditMode ? habit?.name : '')
  const [alreadyExist, setAlreadyExist] = useState(false);
  const [currOrder, setCurrOrder] = useState(() => (isEditMode ? filteredHabits.indexOf(habit) + 1 : -1));

  useEffect(() => {
    setAlreadyExist(
      checkHabitTitleExistence(habits, habit, inputTitle)
    );
  }, [habit, habits, inputTitle,inputName]);
  const handlePressEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!inputTitle.length) {
      setAlreadyExist(true);
      return;
    }

    const formData = new FormData(e.target);
    const habitData = {
      title: inputTitle,
      name:inputName,
      frequency: parseInt(formData.get('frequency') || '1'),
      colorIndex: parseInt(formData.get('colorIndex') || '0'),
      iconTitle: formData.get('iconTitle') || 'default',
      order: currOrder,
    };

    try {
      if (isEditMode && habit) {
        await updateHabit({ ...habit, ...habitData }, token);
      } else {
        await addHabit(habitData, token);
      }
      navigate(-1);
    } catch (error) {
      console.error('Error saving habit:', error);
    }
  };
const handleArchiveHabit = async () => {
  if (!habit) return;
  const confirmArchive = window.confirm(
    'Are you sure you want to archive this habit?'
  );
  if (!confirmArchive) return;

  try {
    await archiveHabit(habit._id, token, true); // true = archive
    navigate(-1) // go back after archiving
  } catch (error) {
    console.error('Error archiving habit:', error);
  }
};
  const handleDeleteHabit = async () => {
    if (!habit) return;
    if (!window.confirm('Are you sure you want to delete this habit?')) return;

    try {
      await deleteHabit(habit._id, token);
      navigate(-1);
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

 

  if (isLoading) return <div className={styles.wrapper}>Loading...</div>;

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmitForm} onKeyDown={handlePressEnter}>
        <TitleBlock input={inputTitle} onChange={setInputTitle} alreadyExist={alreadyExist} />
        <NameBlock input={inputName} onChange={setInputName} alreadyExist={alreadyExist} />
        <FrequencyBlock currentFrequency={habit?.frequency} />
        {isEditMode && <OrderBlock habitsCount={filteredHabits.length} currOrder={currOrder} setCurrOrder={setCurrOrder} />}
        <ColorBlock habits={habits} currentColorIndex={habit?.colorIndex} />
        <IconBlock habits={habits} currentIconTitle={habit?.iconTitle} />
        <small className={styles.info}>
          'Color' and 'Icon' icons in reduced size indicate previous usage.
        </small>

        <div className={styles.btnsWrapper}>
          {isEditMode && (
            <div className={styles.extraBtnsWrapper}>
              <Button icon={<MdDeleteForever />} text="Delete Habit" color="IndianRed" bgColor="var(--bg-color-primary)" onClick={handleDeleteHabit} disabled={isLoading} />
              <Button icon={<HiArchiveBoxArrowDown />} text="Archive Habit" bgColor="var(--bg-color-primary)" onClick={handleArchiveHabit} disabled={isLoading} />
            </div>
          )}
          <Button type="submit" icon={<MdAddToPhotos />} text={isEditMode ? 'Save Changes' : 'Create Habit'} color="#e6e6e6" disabled={alreadyExist || isLoading} />
        </div>
      </form>
    </div>
  );
}

export default HabitEditor;
