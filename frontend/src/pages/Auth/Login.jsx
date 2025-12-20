import React, { useState, useContext } from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import Input from '../../components/Inputs/input';
import { Link, useNavigate } from 'react-router-dom';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/UserContext';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isLocked, setIsLocked] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { updateUser } = useContext(UserContext);

  const navigate = useNavigate();


  // handle login form submit
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please Enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter the password");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });

      const { token, user } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        // Clear security alert seen flag so it shows again on new login
        sessionStorage.removeItem("securityAlertSeen");

        try {
          await axiosInstance.delete(API_PATHS.CHAT);
        } catch (err) {
          console.error("Failed to clear chat history", err);
        }
        updateUser(user);
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const { message, errorType, securityQuestion: q } = error.response.data;
        setError(message);

        if (errorType === 'ACCOUNT_LOCKED' && q) {
          setIsLocked(true);
          setSecurityQuestion(q);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }

  }

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!securityAnswer || !newPassword) {
      setError("Please fill all fields");
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.AUTH.RESET_PASSWORD_SECURITY, {
        email,
        securityAnswer,
        newPassword
      });

      setError("");
      setIsLocked(false);
      setSecurityAnswer("");
      setNewPassword("");
      setPassword("");
      toast.success("Password reset successfully! Please login with your new password.");

    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to reset password.");
      }
    }
  }

  return (
    <AuthLayout>
      <div className='lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center'>
        <h3 className='text-xl font-bold text-black'>Welcome back</h3>
        <p className='text-xs text-slate-700 mt-[5px] mb-6'>Please enter your details to login</p>


        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <Loader />
          </div>
        )}

        {!isLocked ? (
          <form onSubmit={handleLogin}>
            <Input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              autoComplete="username"
            />

            <Input
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              label="Password"
              type="password"
              placeholder="Minimum 6 Characters"
              autoComplete="current-password"
            />

            {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

            <button type="submit" className='btn-primary cursor-pointer mt-5'>
              LOGIN
            </button>


            <p className='text-[13px] text-slate-800 mt-3'>
              Don't have an account?{" "}
              <Link className='font-medium text-primary underline' to="/signup">
                Sign Up
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4 bg-red-50 p-3 rounded text-sm text-red-600 border border-red-100">
              Account Locked. Please answer the security question to reset your password.
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Security Question</label>
              <p className="text-gray-900 font-medium">{securityQuestion}</p>
            </div>

            <Input
              value={securityAnswer}
              onChange={({ target }) => setSecurityAnswer(target.value)}
              label="Security Answer"
              type="text"
              placeholder="Enter your secret answer"
            />

            <Input
              value={newPassword}
              onChange={({ target }) => setNewPassword(target.value)}
              label="New Password"
              type="password"
              placeholder="Enter new password"
            />

            {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

            <button type="submit" className='btn-primary cursor-pointer mt-5'>
              RESET PASSWORD
            </button>
            <button type="button" onClick={() => setIsLocked(false)} className='w-full text-center text-sm text-gray-500 mt-3 hover:text-gray-700'>
              Cancel
            </button>
          </form>
        )}
      </div>

    </AuthLayout>
  )
}

export default Login