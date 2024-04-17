import React from 'react';
import axios from 'axios';
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
  const onSubmit = async (values, actions) => {
      console.log(JSON.stringify(values, null, 2));
      const url = `${process.env.REACT_APP_API_BASE_URL}/api/sign-up`;
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('email', values.email);
      formData.append('first_name', values.firstName);
      formData.append('last_name', values.lastName);
      formData.append('password1', values.password);
      formData.append('password2', values.password);
      try {
        await axios.post(url, formData);
        setIsSubmitted(true);
      } catch (response) {
        const data = response.response.data;
        for (const value in data) {
          actions.setFieldError(value, data[value].join(' '));
        }
        console.error(data);
      }
  };

  const CustomError = ({ children }) => <div data-cy="invalid-feedback" className="invalid-feedback">{children}</div>;

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
              <ErrorMessage name="username" component={CustomError} />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <Field name="email" type="text" />
              <ErrorMessage name="email" component={CustomError} />
            </div>
            <div>
              <label htmlFor="firstName">First Name</label>
              <Field name="firstName" type="text" />
              <ErrorMessage name="firstName" component={CustomError} />
            </div>
            <div>
              <label htmlFor="lastName">Last Name</label>
              <Field name="lastName" type="text" />
              <ErrorMessage name="lastName" component={CustomError} />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <Field name="password" type="password" />
              <ErrorMessage name="password" component={CustomError} />
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <Field name="confirmPassword" type="password" />
              <ErrorMessage name="confirmPassword" component={CustomError} />
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