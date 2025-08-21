import { useState, useEffect } from "react";
import { data, useNavigate } from 'react-router-dom';
import Header from "./Header";
import logo from "./assets/logo/mk-logo.svg";
import { motion, AnimatePresence } from "framer-motion";
import { set } from "date-fns";
import { applyDefaultTheme } from "./themeUtil";
import { getColorPalette } from "./themeUtil";
import Icon from "@mdi/react";
import { mdiLoading } from "@mdi/js";

function WelcomeScreen({api}){

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true); // global loading splash

    //register user
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorReg, setRegError] = useState("");

    async function regUser(){
        try {
            const body = { username , password };
            const response = await fetch(`${api}/users`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            });

            const result = await response.json();

            if(response.ok){
                setUsername("");
                setPassword("");
                localStorage.setItem("username", username);
                localStorage.setItem("user_id", result.user_id);
                localStorage.setItem("currentTab", 'Notes');
                window.location = "/";
            } else {
                setRegError(result.error);
            }

        } catch (err) {
            console.error(err.message);
        }
    }


    async function applyUserTheme(userId) {
    try {
        const res = await fetch(`${api}/themes/all/${userId}`);
        const data = await res.json();

        const userThemes = data.userThemes || [];
        const allThemes = data.allThemes || [];

        // find selected theme
        const selected = userThemes.find((t) => t.is_selected);

        let themeToApply;
        if (selected) {
            themeToApply = allThemes.find((t) => t.id === selected.theme_id);
        } else {
            themeToApply = allThemes.find((t) => t.css_class === "theme-default");
        }

        if (themeToApply) {
            const palette = getColorPalette(themeToApply.css_class);

            const [
                bg, text, accent, headerText, readColor, tagColor,
                buttonBg, buttonText, cancelBtnBg, warningBtnBg,
                highlightClr, editClr, deleteClr, coinClr, fireClr, progressClr
            ] = palette;

            document.documentElement.style.setProperty("--bg-color", bg);
            document.documentElement.style.setProperty("--text-color", text);
            document.documentElement.style.setProperty("--accent-color", accent);
            document.documentElement.style.setProperty("--header-text-color", headerText);
            document.documentElement.style.setProperty("--read-color", readColor);
            document.documentElement.style.setProperty("--tag-color", tagColor);
            document.documentElement.style.setProperty("--button-bg-color", buttonBg);
            document.documentElement.style.setProperty("--button-text-color", buttonText);
            document.documentElement.style.setProperty("--cancel-btn-bg-color", cancelBtnBg);
            document.documentElement.style.setProperty("--warning-btn-bg-color", warningBtnBg);
            document.documentElement.style.setProperty("--highlight-color", highlightClr);
            document.documentElement.style.setProperty("--edit-color", editClr);
            document.documentElement.style.setProperty("--delete-color", deleteClr);
            document.documentElement.style.setProperty("--coin-color", coinClr);
            document.documentElement.style.setProperty("--fire-color", fireClr);
            document.documentElement.style.setProperty("--progress-color", progressClr);

            localStorage.setItem("selectedTheme", themeToApply.css_class);
        }
    } catch (err) {
        console.error("Error applying theme:", err);
    }
    }

    //log in user
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [error, setError] = useState("");

    async function loginUser() {

        try {
            const body = { username: loginUsername, password: loginPassword };
            const response = await fetch(`${api}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const result = await response.json();

        if (response.ok) {
            await applyUserTheme(result.user.user_id);
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

        // Simulate loading: wait for window load + maybe small delay
    useEffect(() => {
        const handleLoad = () => {
            // Tiny delay so spinner feels intentional
            setTimeout(() => setLoading(false), 700);
        };

        if (document.readyState === "complete") {
            handleLoad();
        } else {
            window.addEventListener("load", handleLoad);
        }

        return () => window.removeEventListener("load", handleLoad);
    }, []);

    if (loading) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-white text-black">
                <Icon path={mdiLoading} size={2} spin={true} />
                <p className="mt-4 text-gray-500">Loading Mind Keep...</p>
            </div>
        );
    }

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
                    <div className="flex flex-col justify-center items-center gap-2 p-4 border border-white rounded md:text-xl">
                        <img src={logo} alt="Mind Keep Logo" className="w-max mb-4 md:w-6/12" />
                        <p className="slogan">Secure, manage, and grow your mind’s contents.</p>
                        <button className="border border-black text-black p-2 rounded w-full mt-2 md:w-6/12" onClick={() => {setActiveSection("login"); goToSection("login")}}>Log In</button>
                        <button className="bg-[#1f48ff] text-white p-2 rounded w-full md:w-6/12" onClick={() => {setActiveSection("register"); goToSection("register")}}>Register</button>
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
                        <h2 className="mb-4 flex flex-col items-center justify-center w-full gap-4 md:h-2/6 md:text-lg md:mb-0">Log in to <img src={logo} alt="Mind Keep Logo" className="h-3/5"/></h2>
                        <form className="flex flex-col justify-center items-center gap-4 text-center md:gap-1" onSubmit={(e) => {
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
                        <h2 className="mb-4 flex flex-col items-center justify-center w-full gap-4 md:h-2/6 md:text-lg md:mb-0">Register to <img src={logo} alt="Mind Keep Logo" className="h-3/5"/></h2>
                        <form className="flex flex-col justify-center items-center gap-4 text-center md:gap-1"
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
                            {errorReg && <p className="text-red-500 text-xs mt-1 xl:text-sm">{errorReg}</p>}
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