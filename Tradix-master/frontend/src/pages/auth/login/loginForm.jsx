import React, { useEffect, useState } from 'react';
import { useFormik } from "formik";
import InputField from 'components/common/inputs/InputField';
import Checkbox from 'components/common/checkbox';
import { Button } from 'components/common/buttons';
import { Link, useNavigate } from 'react-router-dom';
import { SignInSchema } from 'helpers/validation';
import { useSelector } from 'react-redux';
import { useLoginMutation } from "state/api/auth/authApi.js";
import { Eye, EyeOff } from 'lucide-react'; // 👈 Make sure you're using an icon library

const LoginForm = () => {

    const [login, { isSuccess, data }] = useLoginMutation();
    const registeredMail = useSelector((state) => state.auth.userInfo?.Email);
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword(prev => !prev);

    const initialValues = {
        Email: registeredMail || '',
        Password: '',
        IsRemember: true,
    };

    const { values, errors, touched, handleChange, handleSubmit, handleBlur } = useFormik({
        initialValues: initialValues,
        validationSchema: SignInSchema,
        onSubmit: values => {
            submitForm(values);
        },
    });

    useEffect(() => {
        if (isSuccess) {
            navigate('/dashboard');
        }
    }, [isSuccess, data]);

    const submitForm = async (formData) => {
        try {
            await login(formData).unwrap();
        } catch (error) {
            return;
        }
    }

    return (
        <>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                <div>
                    <InputField
                        label={"Your email"}
                        placeholder={"name@company.com"}
                        id={"email"}
                        type={"text"}
                        htmlName={"Email"}
                        value={values.Email}
                        handleChange={handleChange}
                        onBlur={handleBlur}
                        errorMsg={errors.Email && touched.Email && errors.Email}
                    />
                </div>

                <div className="relative">
                    <InputField
                        label={"Password"}
                        placeholder={"••••••••"}
                        id={"password"}
                        type={showPassword ? "text" : "password"}
                        htmlName={"Password"}
                        value={values.Password}
                        handleChange={handleChange}
                        onBlur={handleBlur}
                        errorMsg={errors.Password && touched.Password && errors.Password}
                    />
                    <div
                        className="absolute right-3 top-[38px] cursor-pointer text-gray-500"
                        onClick={togglePasswordVisibility}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <Checkbox
                                id="remember"
                                name="IsRemember"
                                onChange={handleChange}
                                checked={values.IsRemember}
                            />
                        </div>
                        <div className="ml-2 text-sm">
                            <label htmlFor="remember" className="text-gray-500 dark:text-gray-300">Remember me</label>
                        </div>
                    </div>
                    <a href="#" className="text-sm font-medium text-primary-100 hover:underline dark:text-brand-100">Forgot password?</a>
                </div>

                <Button type="submit" id="sign-in">Sign in</Button>

                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                    Don’t have an account yet?{" "}
                    <Link to={"/auth/signup"}>
                        <span className="font-medium text-primary-100 hover:underline dark:text-brand-100">Sign up</span>
                    </Link>
                </p>
            </form>
        </>
    )
}

export default LoginForm;
