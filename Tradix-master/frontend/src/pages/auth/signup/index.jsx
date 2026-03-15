import React from 'react';
import Logo from 'assets/logo';
import { ToastContainer } from 'components/common/alerts';
import SignupForm from './signupForm';
import BackButton from 'components/common/buttons/BackButton';

const Signup = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
      >
        <source src="/loginnvd.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay for Better Readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50"></div>
      <BackButton />

      {/* Content Wrapper */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-6 py-8 mx-auto md:h-screen lg:py-0">
        <Logo margin="mb-4" height="sm:h-10 sm:w-10" />
        <div className="w-full  bg-opacity-90 rounded-lg shadow dark:border sm:max-w-md xl:p-0  dark:border-gray-800">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Create an account
            </h1>
            <SignupForm />
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </section>
  );
};

export default Signup;
