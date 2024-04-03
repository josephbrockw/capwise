import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Link, Navigate } from 'react-router-dom';
import * as Yup from 'yup';


function LogIn (props) {
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  if (isSubmitted) {
    return <Navigate to='/dashboard' />;
  }
  // Initial form values
  const initialValues = {
    username: '',
    password: '',
  };

  // Form validation schema using Yup
  const validationSchema = Yup.object({
    username: Yup.string()
      .required('Required'),
    password: Yup.string()
      .min(8, 'Must be 8 characters or more')
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
      <h1>Log in</h1>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {formik => (
          <Form>
            <div>
              <label htmlFor="username">Username</label>
              <Field name="username" type="text" />
              <ErrorMessage name="username" component="div" />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <Field name="password" type="password" />
              <ErrorMessage name="password" component="div" />
            </div>
            <button type="submit" disabled={formik.isSubmitting}>
              Submit
            </button>
          </Form>
        )}
      </Formik>
      <p>
        Don't have an account? <Link to='/sign-up'>Sign up!</Link>
      </p>
    </>
  );
}

export default LogIn;