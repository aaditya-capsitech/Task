import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import aoLogo from '../assets/ao-logo.png';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();

const handleSubmit = async (values: any, { setSubmitting }: any) => {
  try {
    const res = await axios.post('http://localhost:5288/api/auth/login', {
      email: values.email,
      password: values.password,
    });

    const { token, user, message } = res.data;

    //    Sanity check
    console.log("Token received from server:", token);
    if (!token || typeof token !== 'string' || !token.includes('.')) {
      throw new Error('Received malformed or empty token');
    }

    // Use appropriate storage
    const storage = values.rememberMe ? localStorage : sessionStorage;

    // Save token and user to storage
    storage.setItem('token', token);
    storage.setItem('user', JSON.stringify(user));

    //    Globally set the token for Axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    

    //alert(message || 'Login successful');

    // Navigate user based on role
    if (user.role === 'Admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/user/dashboard');
    }
  } catch (err: any) {
    console.error('Login error:', err);

    const message = err?.response?.data?.message || err.message || 'Login failed';
    alert(`Login failed: ${message}`);
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div
      className="vh-100 vw-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: '#f3f6f9' }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '30px',
        }}
      >
        <div className="text-center mb-4">
          <img src={aoLogo} alt="Logo" style={{ height: 40 }} />
        </div>

        <Formik
          initialValues={{ email: '', password: '', rememberMe: false }}
          validationSchema={Yup.object({
            email: Yup.string().email('Invalid email').required('Email is required.'),
            password: Yup.string().required('Password is required.'),
          })}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
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

              <div className="mb-3 d-flex justify-content-between align-items-center">
                <div className="form-check">
                  <Field type="checkbox" name="rememberMe" className="form-check-input" />
                  <label className="form-check-label ms-1">Remember me?</label>
                </div>
                <a href="#" className="text-decoration-none small">
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="btn btn-primary w-100 mb-3" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Log in'}
              </button>

              <div className="text-center mt-2">
                <span className="small text-muted">Don't have an account?</span>
                <a href="/register" className="ms-1">
                  Sign up
                </a>
              </div>

              <div className="text-center mb-2">
                <hr className="my-3" />
                <small className="text-muted">OR</small>
              </div>

              <div className="d-flex justify-content-between">
                <button type="button" className="btn btn-light border w-100 me-2">
                  <img
                    src="https://img.icons8.com/color/16/000000/google-logo.png"
                    alt="Google"
                    className="me-2"
                  />
                  Google
                </button>
                <button type="button" className="btn btn-light border w-100 ms-2">
                  <img
                    src="https://img.icons8.com/color/16/000000/microsoft.png"
                    alt="Microsoft"
                    className="me-2"
                  />
                  Microsoft
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginForm;