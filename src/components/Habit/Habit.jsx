import styles from '../../css/Habit.module.css';

// react
import { useMemo, useRef } from 'react';

// framer
import { AnimatePresence, motion } from 'framer-motion';

// stores
import { useSettingsStore } from '../../stores/settingsStore';

// components
import HabitHeader from './HabitHeader';
import Calendar from './Calendar';
import CompactCalendar from './CompactCalendar';
import HabitMenu from './HabitMenu';

// utils
import getColorPalette from '../../utils/getColorPalette';
import getTodayProgress from '../../utils//getTodayProgress';
import getStreaks from '../../utils/getStreaks';
import checkHabitCompletion from '../../utils/checkHabitCompletion';
import shareHabit from '../../utils/shareHabit';
import getListAnimationVariants from '../../utils/getListAnimationVariants';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

function Habit(props) {
	const {
		index, color, completedDays, frequency,
		isMenuVisible, isArchive,
		onShowMenu
	} = props;
  console.log("kio",completedDays);
	const settings = useSettingsStore((s) => s.settings);
	const habitRef = useRef(null);
	const colorPalette = useMemo(() => getColorPalette(color), [color]);
	const safeCompletedDays = Array.isArray(completedDays) ? completedDays : [];
const todayProgress = getTodayProgress(safeCompletedDays);
const { currentStreak } = getStreaks(safeCompletedDays, frequency);

	const [
		isTodayCompleted,
		isYesterdayCompleted
	] = useMemo(
		() => checkHabitCompletion(safeCompletedDays, frequency, today, yesterday),
		[safeCompletedDays, frequency]
	);

	const handleShare = () => shareHabit(habitRef.current);

	const calendar = useMemo(
		() => {
			const props = { colorPalette, completedDays:safeCompletedDays, frequency };

			return settings.calendarView === 'compact' ? (
				<CompactCalendar {...props} />
			) : (
				<Calendar {...props} />
			);
		},
		[colorPalette, safeCompletedDays, frequency, settings.calendarView]
	);
 console.log(calendar,"lop");
	const habitVariants = getListAnimationVariants(0.3);

	return (
		<motion.div
			ref={habitRef}
			className={styles.habit}
			{...habitVariants}
			layout
			onClick={() => onShowMenu(index)}
		>
			<HabitHeader
				{...{ ...props, colorPalette }}
				{...{ isTodayCompleted, todayProgress, currentStreak }}
			/>

			{!isArchive && (
				<div className={styles.content}>
					{calendar}
				</div>
			)}

			<AnimatePresence>
				{(isMenuVisible && !isArchive) && (
					<HabitMenu
						key="habitMenu"
						{...props}
						{...{ colorPalette, isTodayCompleted, isYesterdayCompleted, todayProgress, currentStreak }}
						onShowMenu={onShowMenu}
						onShare={handleShare}
					/>
				)}
			</AnimatePresence>
		</motion.div>
	);
}

export default Habit;