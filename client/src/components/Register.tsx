import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import aoLogo from '../assets/ao-logo.png';

const RegisterForm = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const res = await axios.post('http://localhost:5288/api/auth/register', {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        role: values.role, // include selected role
      });

      alert(res.data.message);
      navigate('/login');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="vh-100 vw-100 d-flex justify-content-center align-items-center bg-light">
      <div className="bg-white p-4 rounded shadow-sm" style={{ width: '100%', maxWidth: 400 }}>
        <div className="text-center mb-4">
          <img src={aoLogo} alt="Logo" style={{ height: 40 }} />
        </div>

        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'User',
          }}
          validationSchema={Yup.object({
            firstName: Yup.string().required('First name is required.'),
            lastName: Yup.string().required('Last name is required.'),
            email: Yup.string().email('Invalid email').required('Email is required.'),
            password: Yup.string()
              .required('Password is required.')
              .min(8, 'Must be at least 8 characters.')
              .matches(/[A-Z]/, 'Must contain an uppercase letter.')
              .matches(/[a-z]/, 'Must contain a lowercase letter.')
              .matches(/[0-9]/, 'Must contain a number.')
              .matches(/[^a-zA-Z0-9]/, 'Must contain a special character.'),
            role: Yup.string().oneOf(['Admin', 'User'], 'Invalid role').required(),
          })}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="mb-3">
                <label className="form-label">First Name</label>
                <Field name="firstName" className="form-control" />
                <ErrorMessage name="firstName" component="div" className="text-danger small" />
              </div>

              <div className="mb-3">
                <label className="form-label">Last Name</label>
                <Field name="lastName" className="form-control" />
                <ErrorMessage name="lastName" component="div" className="text-danger small" />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <Field name="email" type="email" className="form-control" />
                <ErrorMessage name="email" component="div" className="text-danger small" />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <Field name="password" type="password" className="form-control" />
                <ErrorMessage name="password" component="div" className="text-danger small" />
              </div>

              <div className="mb-3">
                <label className="form-label">Role</label>
                <Field as="select" name="role" className="form-select">
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </Field>
                <ErrorMessage name="role" component="div" className="text-danger small" />
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>

              <div className="text-center mt-3">
                <Link to="/login" className="text-decoration-none small">
                  Already have an account? Login
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default RegisterForm;
