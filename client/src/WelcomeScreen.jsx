import { useState } from "react";
import { data, useNavigate } from 'react-router-dom';
import Header from "./Header";

function WelcomeScreen(){

    const navigate = useNavigate();

    //register user
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorReg, setRegError] = useState("");

    async function regUser(){
        try {
            const body = { username , password };
            const response = await fetch("http://localhost:5000/users", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            });

            if(response.ok){
                setUsername("");
                setPassword("");
                navigate("/dashboard");
                localStorage.setItem("username", username); // or username
            } else {
                const result = await response.json();
                setRegError(result.error);
            }

        } catch (err) {
            console.error(err.message);
        }
    }

    //log in user
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [error, setError] = useState("");

    async function loginUser() {
        try {
            const body = { username: loginUsername, password: loginPassword };
            const response = await fetch("http://localhost:5000/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            setLoginUsername("");
            setLoginPassword("");
            navigate("/dashboard");
            localStorage.setItem("username", loginUsername);
        } else {
            const result = await response.json();
            setError(result.error || "Login failed.");
        }

        } catch (err) {
        console.error(err.message);
        }
    } 

    const [activeSection, setActiveSection] = useState("landing");

    //password validation
    const [passwordValid, setPasswordValid] = useState("");
    const [isValid, setIsValid] = useState(true);

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    //username validation
    const [usernameValid, setUsernameValid] = useState("");
    const [isUsernameValid, setIsUsernameValid] = useState(true);

    const usernameRegex = /^[a-zA-Z0-9_]{3,12}$/;

    return(
        <>
            <section className={`h-screen bg-gradient-to-r from-blue-500 to-green-500 text-white flex flex-col justify-center items-center ${activeSection === "landing" ? "translate-x-0" : "hidden"}`}>
                <div className="flex flex-col justify-center items-center gap-2 p-4 border border-white rounded">
                    <h1 className="font-bold text-2xl">Mind Keep</h1>
                    <p>Secure, manage, and grow your mind’s contents.</p>
                    <button className="border border-white p-2 rounded w-full font-bold hover:bg-white hover:text-black
                    active:bg-white active:text-black" onClick={() => setActiveSection("login")}>Log In</button>
                    <button className="border border-white p-2 rounded w-full font-bold hover:bg-white hover:text-black
                    active:bg-white active:text-black" onClick={() => setActiveSection("register")}>Register</button>
                </div>
            </section>

            {/* Login Section */}
            <section className={`h-screen bg-gradient-to-r from-blue-500 to-green-500 text-white flex flex-col justify-center items-center ${activeSection === "login" ? "translate-x-0" : "hidden"}`}>
                <div className="flex flex-col justify-center items-center gap-2 p-4 border border-white rounded">
                    <h2 className="text-2xl font-bold mb-4">Login to Mind Keep</h2>
                    <form className="flex flex-col justify-center items-center gap-2 text-center" onSubmit={(e) => {
                        e.preventDefault(); 
                        loginUser();
                        }} 
                        autoComplete="off">
                        <div>
                            <label htmlFor="log-u-name" className="block">Username</label>
                            <input type="text" id="log-u-name" className="border border-white rounded" required
                            onChange={(e) => {
                                const input = e.target.value
                                setLoginUsername(input.toLowerCase());
                            }
                        }
                            autoComplete="off"
                            />
                        </div>
                        <div>
                            <label htmlFor="log-p-word" className="block">Password</label>
                            <input type="password" id="log-p-word" className="border border-white rounded" required
                            onChange={(e) => {
                                const input = e.target.value
                                setLoginPassword(input)
                            }
                        }
                            autoComplete="new-password"
                            />
                        </div>
                        {error && <p className="text-white text-sm mt-1 bg-red-500 p-2 rounded">{error}</p>}
                        <button type="submit" className="border border-white p-2 rounded w-full font-bold hover:bg-white hover:text-black
                        active:bg-white active:text-black">Login</button>
                        <button
                        type="reset"
                        onClick={() => {setActiveSection("landing"); setLoginUsername(""); setLoginPassword("")}}
                        className="mt-4 underline"
                        >
                        Back
                        </button>
                    </form>
                </div>
            </section>

            {/* Register Section */}
            <section className={`h-screen bg-gradient-to-r from-blue-500 to-green-500 text-white flex flex-col justify-center items-center ${activeSection === "register" ? "translate-x-0" : "hidden"}`}>
                <div className="flex flex-col justify-center items-center gap-2 p-4 border border-white rounded">
                    <h2 className="text-2xl font-bold mb-4">Register to Mind Keep</h2>
                    <form className="flex flex-col justify-center items-center gap-2 text-center" 
                        onSubmit={(e) => {
                            e.preventDefault(); 
                            if(isValid && isUsernameValid){
                                regUser();
                            }
                        }} 
                        autoComplete="off">
                        <div>
                            <label htmlFor="new-u-name" className="block">Username</label>
                            <input type="text" id="new-u-name" className="border border-white rounded" required
                            value={usernameValid}
                            onChange={(e) => {
                                const input = e.target.value;
                                setUsername(input.toLowerCase());
                                setUsernameValid(input);
                                setIsUsernameValid(usernameRegex.test(input));
                            }
                        }
                            autoComplete="off"
                            />
                            {!isUsernameValid && (
                                <p className="text-white text-sm mt-1 bg-red-500 p-2 rounded">
                                    Username must not include spaces, exceed 12 characters and not less than 3 characters.
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="new-p-word" className="block">Password</label>
                            <input type="password" id="new-p-word" className="border border-white rounded" required
                            value={passwordValid}
                            onChange={(e) => {
                                const input = e.target.value;
                                setPassword(input);
                                setPasswordValid(input);
                                setIsValid(passwordRegex.test(input));
                            }
                        }
                            autoComplete="new-password"
                            />
                            {!isValid && (
                                <p className="text-white text-sm mt-1 bg-red-500 p-2 rounded">
                                    Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.
                                </p>
                            )}
                        </div>
                        {errorReg && <p className="text-white text-sm mt-1 bg-red-500 p-2 rounded">{errorReg}</p>}
                        <button type="submit" className="border border-white p-2 rounded w-full font-bold hover:bg-white hover:text-black
                        active:bg-white active:text-black">Register</button>
                        <button
                        type="reset"
                        onClick={() => {setActiveSection("landing"); setUsername(""); setPassword("")}}
                        className="mt-4 underline"
                        >
                        Back
                        </button>
                    </form>
                </div>
            </section>
        </>
    );
}

export default WelcomeScreen