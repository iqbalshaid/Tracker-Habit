import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { TextField, Button, Box, Typography, Paper } from "@mui/material";
import * as yup from "yup";
import { useAuth } from "../Context/Auth-context";
import { Link, Navigate } from "react-router-dom";

// ✅ Yup validation schema
const signUpSchema = yup.object().shape({
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  passwordConfirmation: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm your password"),
});

function SignUpScreen() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(signUpSchema),
  });
const {signup} = useAuth();
  const onSubmit = async (data) => {
    const {email,password} = data;
    signup({email,password});
    <Navigate to = "/signin" replace/>
    reset();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        bgcolor: "#f9f9f9",
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
          Sign Up
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email */}
          <TextField
            {...register("email")}
            label="Email"
            placeholder="john@doe.com"
            fullWidth
            margin="normal"
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          {/* Password */}
          <TextField
            {...register("password")}
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          {/* Confirm Password */}
          <TextField
            {...register("passwordConfirmation")}
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            error={!!errors.passwordConfirmation}
            helperText={errors.passwordConfirmation?.message}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </Button>
        </form>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <Link to="/signin" style={{ color: "#1976d2", textDecoration: "none" }}>
            Sign In
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default SignUpScreen;
