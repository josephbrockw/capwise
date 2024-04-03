import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import {Link, Navigate} from 'react-router-dom';
import * as Yup from 'yup';

function SignUp (props) {
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  if (isSubmitted) {
    return <Navigate to='/dashboard' />;
  }

  if (props.isAuthenticated) {
    return <Navigate to='/dashboard' />;
  }

  // Initial form values
  const initialValues = {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  };

  // Form validation schema using Yup
  const validationSchema = Yup.object({
    username: Yup.string()
      .required('Required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Required'),
    password: Yup.string()
      .min(8, 'Must be 8 characters or more')
      .required('Required'),
    confirmPassword: Yup.string()
      .min(8, 'Must be 8 characters or more')
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Required'),
  });

  // Handle form submission
  const onSubmit = (values, { setSubmitting }) => {
    setTimeout(() => {
      console.log(JSON.stringify(values, null, 2));
      setSubmitting(false);
      setIsSubmitted(true);
    }, 400);
  };
  return (
    <>
      <Link to='/'>Home</Link>
      <h1>Sign up</h1>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {formik => (
          <Form>
            <div>
              <label htmlFor="username">Username</label>
              <Field name="username" type="text" />
              <ErrorMessage name="username" component="div" />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <Field name="email" type="text" />
              <ErrorMessage name="email" component="div" />
            </div>
            <div>
              <label htmlFor="firstName">First Name</label>
              <Field name="firstName" type="text" />
              <ErrorMessage name="firstName" component="div" />
            </div>
            <div>
              <label htmlFor="lastName">Last Name</label>
              <Field name="lastName" type="text" />
              <ErrorMessage name="lastName" component="div" />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <Field name="password" type="password" />
              <ErrorMessage name="password" component="div" />
            </div>
            <div>
              <label htmlFor="confirmPassword">Password</label>
              <Field name="confirmPassword" type="password" />
              <ErrorMessage name="confirmPassword" component="div" />
            </div>
            <button type="submit" disabled={formik.isSubmitting}>
              Submit
            </button>
          </Form>
        )}
      </Formik>
      <p>
        Already have an account? <Link to='/log-in'>Log in!</Link>
      </p>
    </>
  );
}

export default SignUp;