import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();
AuthContext.displayName = "AuthContext";

const BASE_URL = process.env.REACT_APP_API_URL;
console.log(BASE_URL);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [error, setError] = useState(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const token = localStorage.getItem("token");

  // Bootstrap user on mount
  useEffect(() => {
    const bootstrapUser = async () => {
      if (!token) return setStatus("idle");

      setStatus("loading");
      try {
        const res = await axios.get(`http://localhost:5000/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = res.data.user || res.data;
        setUser(userData);
        setStatus("success");
        setShouldRedirect(true);
        await fetchUserData(userData._id);
      } catch (err) {
        console.error("Bootstrap error:", err);
        localStorage.removeItem("token");
        setUser(null);
        setStatus("error");
        setError(err);
      }
    };

    bootstrapUser();
  }, [token]);

  // Fetch detailed user data
  const fetchUserData = async (userId) => {
    if (!userId || !token) return null;
    try {
      const res = await axios.get(`http://localhost:5000/get/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) setUser(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch user data:", err.message);
      return null;
    }
  };

  // Signup
  const signup = async ({ email, password }) => {
    setStatus("loading");
    try {
      const res = await axios.post(`http://localhost:5000/signup`, { email, password });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      setShouldRedirect(true);
      await fetchUserData(res.data.user._id);
      setStatus("success");
      return res.data;
    } catch (err) {
      console.error("Signup error:", err);
      setError(err);
      setStatus("error");
      throw err;
    }
  };

  // Login
  const login = async ({ email, password }) => {
    setStatus("loading");
    try {
      const res = await axios.post(`http://localhost:5000/signin`, { email, password });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      setShouldRedirect(true);
      await fetchUserData(res.data.user._id);
      setStatus("success");
      return res.data;
    } catch (err) {
      console.error("Login error:", err);
      setError(err);
      setStatus("error");
      throw err;
    }
  };

  // Update account password
  const updateAccountPassword = async (password) => {
    if (!token) throw new Error("No token found");
    try {
      const res = await axios.put(
        `http://localhost:5000/update`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data.user);
      await fetchUserData(res.data.user._id);
      return res.data;
    } catch (err) {
      console.error("Update password error:", err);
      throw err;
    }
  };

  // Delete account
  const deleteAccount = async () => {
    if (!token) throw new Error("No token found");
    try {
      await axios.delete(`http://localhost:5000/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      setUser(null);
      setShouldRedirect(false);
    } catch (err) {
      console.error("Delete account error:", err);
      throw err;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setShouldRedirect(false);
  };

  // Reset redirect flag
  const resetRedirect = () => {
    setShouldRedirect(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        error,
        shouldRedirect,
        resetRedirect,
        signup,
        login,
        updateAccountPassword,
        deleteAccount,
        logout,
        fetchUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
