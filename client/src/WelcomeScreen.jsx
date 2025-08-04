import { useState } from "react";
import { data, useNavigate } from 'react-router-dom';
import Header from "./Header";
import logo from "./assets/logo/mk-logo.svg";
import { motion, AnimatePresence } from "framer-motion";
import { set } from "date-fns";

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

            const result = await response.json();

            if(response.ok){
                setUsername("");
                setPassword("");
                window.location = "/";
                localStorage.setItem("username", username);
                localStorage.setItem("user_id", result.user_id);
                localStorage.setItem("currentTab", 'Notes');
            } else {
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

        const result = await response.json();

        if (response.ok) {
            setLoginUsername("");
            setLoginPassword("");
            window.location = "/";
            window.location = "/dashboard";
            localStorage.setItem("username", result.user.username);
            localStorage.setItem("user_id", result.user.user_id);
            localStorage.setItem("currentTab", 'Notes');
        } else {
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

    // Animation variants for sliding

    const [direction, setDirection] = useState("right"); // Track swipe direction

    const variants = {
      initial: (direction) => ({
        x: direction === "left" ? "-100vw" : "100vw",
        opacity: 0,
        position: "absolute",
        width: "100%",
      }),
      animate: {
        x: 0,
        opacity: 1,
        position: "relative",
        width: "100%",
        transition: { type: "spring", stiffness: 300, damping: 30 }
      },
      exit: (direction) => ({
        x: direction === "left" ? "100vw" : "-100vw",
        opacity: 0,
        position: "absolute",
        width: "100%",
        transition: { type: "spring", stiffness: 300, damping: 30 }
      }),
    };

    const goToSection = (section) => {
        if (section === "landing") {
            // Always swipe left when returning to landing
            setDirection("left");
        } else if (section === "login" || section === "register") {
            // Always swipe right when going to login or register from landing
            setDirection("right");
        }
        setActiveSection(section);
    };

    return(
        <>
        <section className="welcome-container relative overflow-hidden h-screen w-screen">
            <AnimatePresence mode="wait" custom={direction}>
                {activeSection === "landing" && (
                    <motion.section
                    key="landing"
                    custom={direction}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="h-screen bg-white text-black flex flex-col justify-center items-center"
                    >
                    <div className="flex flex-col justify-center items-center gap-2 p-4 border border-white rounded">
                        <img src={logo} alt="Mind Keep Logo" className="w-max mb-4" />
                        <p className="slogan">Secure, manage, and grow your mind’s contents.</p>
                        <button className="border border-black text-black p-2 rounded w-full mt-2" onClick={() => {setActiveSection("login"); goToSection("login")}}>Log In</button>
                        <button className="bg-[#1f48ff] text-white p-2 rounded w-full" onClick={() => {setActiveSection("register"); goToSection("register")}}>Register</button>
                    </div>
                    </motion.section>
                )}
                {/* Login Section */}
                {activeSection === "login" && (
                    <motion.section
                      key="login"
                      custom={direction}
                      variants={variants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="h-screen bg-white text-black flex flex-col justify-center items-center"
                    >
                    <div className="flex flex-col justify-center items-center gap-2 p-4 border border-white rounded">
                        <h2 className="mb-4 flex flex-col items-center justify-center w-full gap-4">Log in to <img src={logo} alt="Mind Keep Logo" className="h-3/5"/></h2>
                        <form className="flex flex-col justify-center items-center gap-4 text-center" onSubmit={(e) => {
                            e.preventDefault();
                            loginUser();
                            }}
                            autoComplete="off">
                            <div>
                                <label htmlFor="log-u-name" className="block">Username</label>
                                <input type="text" id="log-u-name" className="border border-black rounded h-10 m-1" required
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
                                <input type="password" id="log-p-word" className="border border-black rounded h-10 m-1" required
                                onChange={(e) => {
                                    const input = e.target.value
                                    setLoginPassword(input)
                                }
                            }
                                autoComplete="new-password"
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                            <button type="submit" className="border bg-[#1f48ff] p-2 rounded w-full text-white">Login</button>
                            <button
                            type="reset"
                            onClick={() => {setActiveSection("landing"); setLoginUsername(""); setLoginPassword(""); setError(""); goToSection("landing")}}
                            className="mt-4 underline text-sm"
                            >
                            Back
                            </button>
                        </form>
                    </div>
                    </motion.section>
                )}
                {/* Register Section */}
                {activeSection === "register" && (
                <motion.section
                  key="register"
                  custom={direction}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="h-screen bg-white text-black flex flex-col justify-center items-center"
                >
                    <div className="flex flex-col justify-center items-center gap-2 p-4 border border-white rounded">
                        <h2 className="mb-4 flex flex-col items-center justify-center w-full gap-4">Register to <img src={logo} alt="Mind Keep Logo" className="h-3/5"/></h2>
                        <form className="flex flex-col justify-center items-center gap-4 text-center"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if(isValid && isUsernameValid){
                                    regUser();
                                }
                            }}
                            autoComplete="off">
                            <div>
                                <label htmlFor="new-u-name" className="block">Username</label>
                                <input type="text" id="new-u-name" className="border border-black rounded h-10 m-1" required
                                value={usernameValid}
                                onChange={(e) => {
                                    const input = e.target.value;
                                    setUsername(input);
                                    setUsernameValid(input);
                                    setIsUsernameValid(usernameRegex.test(input));
                                }
                            }
                                autoComplete="off"
                                />
                                {!isUsernameValid && (
                                    <p className="text-red-500 mt-1 error-username">
                                        Username must not include spaces, exceed 12 characters and not less than 3 characters.
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="new-p-word" className="block">Password</label>
                                <input type="password" id="new-p-word" className="border border-black rounded h-10 m-1" required
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
                                    <p className="text-red-500 text-sm mt-1 error-password">
                                        Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.
                                    </p>
                                )}
                            </div>
                            {errorReg && <p className="text-red-500 text-xs mt-1">{errorReg}</p>}
                            <button type="submit" className="border bg-[#1f48ff] p-2 rounded w-full text-white">Register</button>
                            <button
                            type="reset"
                            onClick={() => {setActiveSection("landing"); setUsername(""); setPassword(""); setRegError(""); setIsUsernameValid(true); setIsValid(true); setUsernameValid(""); setPasswordValid("");  goToSection("landing")}}
                            className="mt-4 underline text-sm"
                            >
                            Back
                            </button>
                        </form>
                    </div>
                </motion.section>
             )}
            </AnimatePresence>
        </section>
        </>
    );
}

export default WelcomeScreen