// utils/achievementsReducer.js
import saveToLocalStorage from './saveToLocalStorage';
import getStreaks from './getStreaks';
import getDayGap from './getDayGap';
import getCompletionGaps from './getCompletionGaps';
import getFormattedDate from './getFormattedDate';
import checkHabitCompletion from './checkHabitCompletion';
import removeIncompleteFirstDay from './removeIncompleteFirstDay';

const todayDateStr = getFormattedDate(new Date());

function achievementsReducer(achievements, actions) {
  const { habits, mainDiary, onOpenDialog, isInitialRender } = actions;

  const handleUnlockAchievement = (achievement) => {
    achievement.isUnlocked = true;
    achievement.unlockDate = new Date();

    if (isInitialRender) {
      onOpenDialog({
        title: 'Achievement Unlocked!',
        text: 'It seems that new achievements have been unlocked!\nYou can check them in the achievements section.'
      });
    } else {
      onOpenDialog({
        title: 'Achievement Unlocked!',
        imgSrc: `${process.env.PUBLIC_URL}/img/achievements/${achievement.id}.svg`,
        text: `"${achievement.title}"\n${achievement.desc}`
      });
    }
  };

  achievements = achievements.map((a) => {
    if (a.isUnlocked) return a;
    const updatedA = { ...a };
    let shouldUnlock = false;

    switch (a.id) {
      case 0: case 1: case 2: case 3: case 4: case 5:
        shouldUnlock = habits.some(h => {
          const completedDays = Array.isArray(h.completedDays) ? h.completedDays : [];
          return getStreaks(completedDays, h.frequency).longestStreak >= a.criteria.streak;
        });
        break;

      case 6:
        shouldUnlock = habits.some(h => {
          const completedDays = Array.isArray(h.completedDays) ? h.completedDays : [];
          return Math.max(...getCompletionGaps(completedDays, h.frequency)) >= a.criteria.gap;
        });
        break;

      case 7:
        shouldUnlock = habits.some(h => {
          const completedDays = Array.isArray(h.completedDays) ? h.completedDays : [];
          return getCompletionGaps(completedDays, h.frequency).includes(a.criteria.gap);
        });
        break;

      case 8:
        shouldUnlock = habits.some(h => {
          const completedDays = Array.isArray(h.completedDays) ? h.completedDays : [];
          if (!h.creationDate || completedDays.length === 0) return false;
          const gap = getDayGap(new Date(getFormattedDate(new Date(h.creationDate))), new Date(todayDateStr));
          return gap >= a.criteria.gap;
        });
        break;

      case 9:
        shouldUnlock = habits.some(h => {
          const completedDays = Array.isArray(h.completedDays) ? h.completedDays : [];
          if (!h.creationDate || completedDays.length === 0) return false;
          const creationDate = new Date(h.creationDate);
          return creationDate.getDate() === 1 && creationDate.getMonth() === 0 &&
                 checkHabitCompletion(completedDays, h.frequency, creationDate);
        });
        break;

      case 10:
        shouldUnlock = habits.some(h => {
          const completedDays = Array.isArray(h.completedDays) ? h.completedDays : [];
          const count = completedDays.length;
          return count >= a.criteria.count && (count === a.criteria.count ? completedDays[0].completed : true);
        });
        break;

      case 11:
        shouldUnlock = habits.some(h => {
          const completedDays = Array.isArray(h.completedDays) ? h.completedDays : [];
          const { allStreaks } = getStreaks(completedDays, h.frequency);
          return allStreaks.some(s => {
            const startDate = new Date(s.start);
            const endDate = new Date(s.end);
            return startDate.getMonth() === 0 && startDate.getDate() === 1 && endDate >= new Date(`${startDate.getFullYear()}-12-31`);
          });
        });
        break;

      case 12: {
        if (habits.length < a.criteria.count) break;
        const datesMap = {};
        for (const h of habits) {
          const completedDays = removeIncompleteFirstDay(Array.isArray(h.completedDays) ? h.completedDays : [], h.frequency);
          completedDays.forEach(d => {
            const dateStr = getFormattedDate(new Date(d.date));
            datesMap[dateStr] = (datesMap[dateStr] || 0) + 1;
          });
        }
        const maxCount = Math.max(...Object.values(datesMap));
        shouldUnlock = maxCount === habits.length;
        break;
      }

      case 13:
        shouldUnlock = habits.some(h => {
          const completedDays = Array.isArray(h.completedDays) ? h.completedDays : [];
          const { allStreaks } = getStreaks(completedDays, h.frequency);
          return allStreaks.some(s => s.length === a.criteria.streak && getDayGap(new Date(todayDateStr), new Date(s.end)) > 1);
        });
        break;

      case 14:
        shouldUnlock = habits.filter(h => h.isArchived).length >= a.criteria.count;
        break;

      case 15:
        shouldUnlock = habits.some(h => {
          const completedDays = Array.isArray(h.completedDays) ? h.completedDays : [];
          const { allStreaks } = getStreaks(completedDays, h.frequency);
          for (let i = 0; i < allStreaks.length - 2; i++) {
            if (allStreaks[i].length === a.criteria.streak &&
                allStreaks[i + 1].length === a.criteria.streak &&
                allStreaks[i + 2].length === a.criteria.streak) {
              return getDayGap(new Date(todayDateStr), new Date(allStreaks[i].end)) > 1;
            }
          }
          return false;
        });
        break;

      case 16:
        shouldUnlock = habits.reduce((acc, h) => {
          const completedDays = Array.isArray(h.completedDays) ? h.completedDays : [];
          return acc + completedDays.filter(d => d.isCompYdayBtnUsed).length;
        }, 0) >= a.criteria.count;
        break;

      case 17:
      case 18: {
        if (habits.length < a.criteria.count) break;
        const datesMap = {};
        for (const h of habits) {
          const completedDays = removeIncompleteFirstDay(Array.isArray(h.completedDays) ? h.completedDays : [], h.frequency);
          completedDays.forEach(d => {
            const date = new Date(d.date);
            if ((a.id === 17 && date.getMonth() === 9 && date.getDate() === 31) ||
                (a.id === 18 && date.getMonth() === 11 && date.getDate() === 31)) {
              const key = getFormattedDate(date);
              datesMap[key] = (datesMap[key] || 0) + 1;
            }
          });
        }
        const maxCount = Math.max(...Object.values(datesMap));
        shouldUnlock = maxCount === habits.length;
        break;
      }

      case 19: {
        const creationDateMap = {};
        for (const h of habits) {
          if (!h.creationDate) continue;
          const cd = getFormattedDate(new Date(h.creationDate));
          creationDateMap[cd] = (creationDateMap[cd] || 0) + 1;
        }
        const maxCount = Math.max(...Object.values(creationDateMap));
        shouldUnlock = maxCount >= a.criteria.count;
        break;
      }

      case 20: {
        shouldUnlock = habits.some(h => {
          const completedDays = removeIncompleteFirstDay(Array.isArray(h.completedDays) ? h.completedDays : [], h.frequency)
            .filter(d => d.completed)
            .filter(d => {
              const day = new Date(d.date).getDay();
              return day === 0 || day === 6;
            });

          let streaks = [];
          let currWeekendStreak = 0;
          for (let i = 0; i < completedDays.length - 1; i++) {
            const currDate = new Date(completedDays[i].date);
            const nextDate = new Date(completedDays[i + 1].date);
            const gap = getDayGap(currDate, nextDate);

            if (currWeekendStreak === 0 && currDate.getDay() === 6) continue;

            if (currDate.getDay() === 0) {
              if (gap === 0) currWeekendStreak++;
              else {
                streaks.push(currWeekendStreak);
                currWeekendStreak = 0;
              }
            }

            if (currDate.getDay() === 6 && gap > 5) {
              streaks.push(currWeekendStreak);
              currWeekendStreak = 0;
            }

            if (i === completedDays.length - 2) streaks.push(currWeekendStreak);
          }

          const maxStreak = Math.max(...Object.values(streaks));
          return maxStreak >= a.criteria.streak;
        });
        break;
      }

      case 21:
      case 22:
      case 23:
      case 24:
      case 25: {
        const notes = [...habits.flatMap(h => Array.isArray(h.diary) ? h.diary : []), ...(Array.isArray(mainDiary) ? mainDiary : [])];

        if (a.id === 21) shouldUnlock = notes.length >= a.criteria.count;
        if (a.id === 22) shouldUnlock = notes.some(n => n.text.length >= a.criteria.length);
        if (a.id === 23) {
          const totalCharacterCount = notes.reduce((acc, n) => acc + n.text.length, 0);
          shouldUnlock = totalCharacterCount >= a.criteria.count;
        }
        if (a.id === 24) shouldUnlock = notes.some(n => {
          const length = n.text.length;
          const hours = new Date(n.date).getHours();
          return length >= a.criteria.length && hours >= a.criteria.hours;
        });
        if (a.id === 25) shouldUnlock = notes.some(n => {
          const hours = new Date(n.date).getHours();
          return hours >= 5 && hours < a.criteria.hours;
        });
        break;
      }

      default:
        break;
    }

    if (shouldUnlock) handleUnlockAchievement(updatedA);
    return updatedA;
  });

  // Save basic achievements info to localStorage
  const basicAchievementsInfo = achievements
    .filter(a => a.isUnlocked)
    .map(a => ({
      id: a.id,
      isUnlocked: a.isUnlocked,
      unlockDate: a.unlockDate
    }));

  saveToLocalStorage('achievements', basicAchievementsInfo);
  return achievements;
}

export default achievementsReducer;
