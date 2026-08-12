import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../authSlice";
// ADDED useState HERE:
import { useEffect, useState } from "react";

const signupSchema = z.object({
  firstname: z.string().min(2, { message: "Name should be at least 2 characters long" }),
  emailId: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password should be at least 6 characters long" }),
});

function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth);
  
  // STATE FOR PASSWORD VISIBILITY
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  }); 

  useEffect(() => {  
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1d232a] font-sans">
      <div className="w-full max-w-md p-8">
        <h1 className="text-4xl font-bold text-white text-center mb-10 tracking-wide">
          Judgify
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          
          <div className="form-control w-full">
            <label className="label pb-1">
              <span className="label-text text-gray-300 text-base">First Name</span>
            </label>
            <input
              type="text"
              placeholder="John"
              className={`input input-bordered w-full bg-[#191e24] text-white focus:outline-none focus:border-white ${
                errors.firstname ? 'input-error' : 'border-gray-600'
              }`}
              {...register("firstname")} 
            />
            {errors.firstname && ( 
              <label className="label py-1">
                <span className="label-text-alt text-error text-sm">
                  {errors.firstname.message} 
                </span>
              </label>
            )}
          </div>

          <div className="form-control w-full">
            <label className="label pb-1">
              <span className="label-text text-gray-300 text-base">Email</span>
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              className={`input input-bordered w-full bg-[#191e24] text-white focus:outline-none focus:border-white ${
                errors.emailId ? 'input-error' : 'border-gray-600'
              }`}
              {...register("emailId")} 
            />
            {errors.emailId && ( 
              <label className="label py-1">
                <span className="label-text-alt text-error text-sm">
                  {errors.emailId.message}
                </span>
              </label>
            )}
          </div>

          {/* UPDATED PASSWORD FIELD */}
          <div className="form-control w-full">
            <label className="label pb-1">
              <span className="label-text text-gray-300 text-base">Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="........"
                className={`input input-bordered w-full pr-10 bg-[#191e24] text-white focus:outline-none focus:border-white ${
                  errors.password ? 'input-error' : 'border-gray-600'
                }`}
                {...register("password")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <label className="label py-1">
                <span className="label-text-alt text-error text-sm">
                  {errors.password.message}
                </span>
              </label>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="btn bg-[#6366f1] hover:bg-[#4f46e5] border-none text-white px-8 normal-case text-lg"
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>
          </div>

          <div className="text-center mt-4 text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-[#6366f1] hover:underline font-semibold">
              Log In
            </Link>
          </div>
          
        </form>
      </div>
    </div>
  );
}

export default Signup;