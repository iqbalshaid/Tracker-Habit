// stores/habitsStore.js
import { create } from "zustand";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL;

export const useHabitsStore = create((set, get) => ({
  habits: [],
  isLoading: false,
  isError: null,

  fetchHabits: async (token) => {
    try {
      set({ isLoading: true, isError: null });
      const res = await axios.get(`http://localhost:5000/getHabit`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ habits: res.data, isLoading: false });
    } catch (err) {
      set({ isError: err, isLoading: false });
      console.error("Fetch habits error:", err);
    }
  },

  addHabit: async (habit, token) => {
    try {
      const res = await axios.post(`http://localhost:5000/postHabit`, habit, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({ habits: [...state.habits, res.data] }));
    } catch (err) {
      console.error("Add habit error:", err);
      set({ isError: err });
    }
  },

  updateHabit: async (habit, token) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/updateHabit/${habit._id}`,
        habit,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        habits: state.habits.map((h) => (h._id === habit._id ? res.data : h)),
      }));
    } catch (err) {
      console.error("Update habit error:", err);
      set({ isError: err });
    }
  },

  deleteHabit: async (id, token) => {
    try {
      await axios.delete(`http://localhost:5000/deleteHabit/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({ habits: state.habits.filter((h) => h._id !== id) }));
    } catch (err) {
      console.error("Delete habit error:", err);
      set({ isError: err });
    }
  },

  clearAllHabits: async (token) => {
    try {
      await axios.delete(`http://localhost:5000/alldelete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ habits: [] });
    } catch (err) {
      console.error("Clear all habits error:", err);
      set({ isError: err });
    }
  },

  toggleCompleteDay: (habitId, date = new Date()) => {
    set((state) => ({
      habits: state.habits.map((h) =>
        h._id === habitId
          ? { ...h, completedDays: [...h.completedDays, date] }
          : h
      ),
    }));
  },

  archiveHabit: async (habitId, token, archive = true) => {
    try {
      const res = await fetch(`http://localhost:5000/archieve/${habitId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ archive }),
      });

      const data = await res.json();
      set((state) => ({
        habits: state.habits.map((h) => (h._id === habitId ? data : h)),
      }));
    } catch (err) {
      console.error("Failed to archive habit", err);
      set({ isError: err });
    }
  },
}));
