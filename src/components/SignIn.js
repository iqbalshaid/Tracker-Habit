import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../Context/Auth-context";
import { Link, Navigate } from "react-router-dom";

// ✅ Validation schema
const signInSchema = yup.object().shape({
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

function SignInScreen() {
   console.log("pol");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signInSchema),
  });
  const {login} = useAuth();

  const onSubmit = (data) => {
    console.log("SignIn Data:", data);
    const {email,password} = data;
    // 👉 yahan aap login API call kar sakte ho
    login({email,password});
    <Navigate to = "/" replace />
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Sign In</h2>

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

        {/* Password */}
        <div style={{ marginBottom: "15px" }}>
          <label>Password</label>
          <input
            type="password"
            {...register("password")}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
          <p style={{ color: "red", fontSize: "14px" }}>{errors.password?.message}</p>
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
          Sign In
        </button>
      </form>

      <p
  style={{
    marginTop: "15px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
  }}
>
  <span>
    Don’t have an account?{" "}
    <Link to="/signup" style={{ color: "blue", textDecoration: "none" }}>
      Sign Up
    </Link>
  </span>
"
  <span>
    <Link to="/resert" style={{ color: "blue", textDecoration: "none" }}>
      Forgot Password?
    </Link>
  </span>
</p>

    </div>
  );
}

export default SignInScreen;
