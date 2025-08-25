import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../Context/Auth-context";
import { Navigate } from "react-router";

// ✅ Validation schema
const resetPasswordSchema = yup.object().shape({
  email: yup.string().email("Enter a valid email").required("Email is required"),
});

function ResetPasswordScreen() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  });
const {updateAccountPassword} = useAuth();
  const onSubmit = (data) => {
    console.log("Reset Password Request:", data);
    // 👉 yahan aap backend API call karoge jo reset email bhejega
    const {password} = data;
    updateAccountPassword({password});
    alert("If this email exists, a reset link has been sent.");
    <Navigate to = "/signin" replace />
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Reset Password</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        <div style={{ marginBottom: "15px" }}>
          <label>Email</label>
          <input
            type="text"
            {...register("email")}
            placeholder="john@doe.com"
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
          <p style={{ color: "red", fontSize: "14px" }}>{errors.email?.message}</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "blue",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Send Reset Link
        </button>
      </form>

      <p style={{ marginTop: "15px", textAlign: "center" }}>
        Remembered your password? <a href="/signin">Sign In</a>
      </p>
    </div>
  );
}

export default ResetPasswordScreen;
