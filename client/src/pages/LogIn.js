import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Link, Navigate } from 'react-router-dom';
import * as Yup from 'yup';


function LogIn ({ isAuthenticated, logIn }) {
  const [isSubmitted, setIsSubmitted] = React.useState(false);


  if (isAuthenticated || isSubmitted) {
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
  const onSubmit = async (values, actions) => {
    try {
      const { response, isError } = await logIn(
        values.username,
        values.password
      );
      if (isError) {
        const data = response.response.data;
        for (const value in data) {
          actions.setFieldError(value, data[value].join(' '));
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

  return (
    <>
      <Link to='/'>Home</Link>
      <h1>Log in</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {formik => (
          <>
            {
              '__all__' in formik.errors && (
                <div className="alert">{formik.errors['__all__']}</div>
              )
            }
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
          </>
        )}
      </Formik>
      <p>
        Don't have an account? <Link to='/sign-up'>Sign up!</Link>
      </p>
    </>
  );
}

export default LogIn;