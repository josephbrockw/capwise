import React, { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import { Link as RouterLink, Navigate } from "react-router-dom";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import UnauthenticatedAppBar from "../components/elements/UnauthenticatedAppBar";
import { SiteTheme } from "../services/ThemeService";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href={import.meta.env.VITE_URL}>
        {import.meta.env.VITE_NAME}
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

export default function SignIn({ isAuthenticated, logIn }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      setRedirectPath("/dashboard");
    }
  }, [isAuthenticated, redirectPath]);

  if (redirectPath) {
    return <Navigate to={redirectPath} />;
  }

  // Handle form submission
  const onSubmit = async (values, actions) => {
    try {
      const { response, isError } = await logIn(
        values.username,
        values.password,
      );
      if (isError) {
        const data = response.response.data;
        for (const value in data) {
          actions.setFieldError(value, data[value].join(" "));
        }
        // actions.setFieldError('__all__', data['__all__']);
        console.error(data);
        return;
      } else {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignUpClick = (event) => {
    event.preventDefault();
    setRedirectPath("/sign-up");
  };

  // Form validation schema using Yup
  const validationSchema = Yup.object({
    username: Yup.string().required("Required"),
    password: Yup.string()
      .min(8, "Must be 8 characters or more")
      .required("Required"),
  });

  return (
    <SiteTheme>
      <UnauthenticatedAppBar />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Formik
            initialValues={{ username: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form noValidate sx={{ mt: 1 }}>
                <Field
                  as={TextField}
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  error={touched.username && Boolean(errors.username)}
                  helperText={(touched.username && errors.username) || " "}
                />
                {/*<ErrorMessage name="username" component="div" />*/}
                <Field
                  as={TextField}
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  error={touched.password && Boolean(errors.password)}
                  helperText={(touched.password && errors.password) || " "}
                />
                {/*<ErrorMessage name="password" component="div" />*/}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isSubmitting}
                >
                  Sign In
                </Button>
              </Form>
            )}
          </Formik>
          <Grid container>
            <Grid item>
              <Link component={RouterLink} to="/sign-up" variant="body2">
                {"Don't have an account? Sign up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </SiteTheme>
  );
}
