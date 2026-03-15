import React from "react";

function InputField(props) {
    const { label, id, type, placeholder, disabled, handleChange, htmlName, value, errorMsg } = props;

    const baseInputClass =
        "block w-full text-sm rounded-lg p-2.5 " +
        "focus:ring-primary-100 focus:border-primary-100 " +
        "dark:focus:ring-primary-100 dark:focus:border-primary-100";

    const normalInputClass =
        baseInputClass +
        " bg-gray-50 border border-gray-300 text-gray-900 " +
        "dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";

    const errorInputClass =
        baseInputClass +
        " bg-red-50 border border-red-500 text-red-900 placeholder-red-700 " +
        "dark:bg-gray-700 dark:border-red-500 dark:text-red-400 dark:placeholder-red-400";

    const fileInputClass =
        "block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer " +
        "bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400";

    return (
        <>
            <label htmlFor={id} className={`block mb-2 text-sm font-medium ${errorMsg ? "text-red-700 dark:text-red-500" : "text-gray-900 dark:text-white"}`}>
                {label}
            </label>

            {type === "textArea" ? (
                <textarea
                    id={id}
                    rows="8"
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    placeholder={placeholder}
                />
            ) : (
                <input
                    disabled={disabled}
                    type={type}
                    id={id}
                    placeholder={placeholder}
                    value={value}
                    name={htmlName}
                    onChange={handleChange}
                    className={type === "file" ? fileInputClass : errorMsg ? errorInputClass : normalInputClass}
                />
            )}

            {errorMsg && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                    <span className="font-medium">{errorMsg}</span>
                </p>
            )}
        </>
    );
}

export default InputField;
