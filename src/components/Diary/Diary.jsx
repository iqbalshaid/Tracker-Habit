import styles from "../../css/Diary.module.css";

// react
import { useEffect, useRef, useState } from "react";

// router
import { useLocation } from "react-router-dom";

// stores
import { useColorsStore } from "../../stores/colorsStore";

// components
import NoteList from "./NoteList";
import Placeholder from "../Placeholder";
import AddNoteForm from "./AddNoteForm";

// icons
import { ReactComponent as InfoSvg } from "../../img/information.svg";
import { MdStickyNote2 } from "react-icons/md";

function Diary() {
  const location = useLocation();
  const dbColors = useColorsStore((s) => s.colors);

  const [habitTitle] = useState(location.state?.habitTitle);
  const [accentColor] = useState(dbColors[location.state?.colorIndex]);
  const currentStreak = location.state?.currentStreak ?? 0;

  // 🗂 LocalStorage Key
  const storageKey = habitTitle ? `diary-${habitTitle}` : "diary-main";

  // 📝 Notes state
  const [diary, setDiary] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  const hasNotes = diary && diary.length > 0;

  // 📌 Save diary whenever it changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(diary));
  }, [diary, storageKey]);

  // ➕ Add Note
  const handleAddNote = (text) => {
    const newNote = {
      text,
      date: new Date(),
      streak: currentStreak || undefined,
    };
    setDiary([newNote, ...diary]);

    document.body
      .querySelector("#modalChildrenWrapper")
      ?.scrollTo({ top: 0, behavior: "smooth" });

    handleFormActivation(false);
  };

  // ✏️ Start Edit
  const handleStartEdit = (noteCreationDate, text) => {
    setIsEditing(noteCreationDate);
    setInput(text);
    formRef.current.focus();
  };

  // ✅ Edit Note
  const handleEditNote = (newText) => {
    setDiary(
      diary.map((n) =>
        n.date === isEditing ? { ...n, text: newText } : n
      )
    );
    setIsEditing(false);
    handleFormActivation(false);
  };

  // 🗑 Delete Note
  const handleDeleteNote = (noteCreationDate) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      setDiary(diary.filter((n) => n.date !== noteCreationDate));
    }
  };

  // form
  const [input, setInput] = useState("");
  const [isFormActive, setIsFormActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef(null);

  const handleFormActivation = (boolean) => setIsFormActive(boolean);

  useEffect(() => {
    if (isFormActive) formRef.current.focus();
  }, [isFormActive]);

  return (
    <div className={styles.diary}>
      {hasNotes ? (
        <NoteList
          diary={diary}
          onStartEditNote={handleStartEdit}
          onDeleteNote={handleDeleteNote}
        />
      ) : (
        <Placeholder
          image={<InfoSvg />}
          title={(habitTitle ? "This habit's" : "Main") + " diary is empty"}
          desc="Add your first note to start tracking your progress and thoughts."
          textOnButton="Add First Note"
          buttonIcon={<MdStickyNote2 />}
          onClick={() => handleFormActivation(true)}
          {...{ accentColor }}
        />
      )}

      {(hasNotes || isFormActive) && (
        <AddNoteForm
          ref={formRef}
          input={input}
          setInput={setInput}
          onFocus={() => handleFormActivation(true)}
          onSubmit={isEditing ? handleEditNote : handleAddNote}
          isSendBtnVisible={isFormActive}
        />
      )}

      {isFormActive && (
        <div
          className={styles.overlay}
          onClick={() => handleFormActivation(false)}
        />
      )}
    </div>
  );
}

export default Diary;
