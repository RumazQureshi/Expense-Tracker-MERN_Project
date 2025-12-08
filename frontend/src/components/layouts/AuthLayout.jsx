import React from 'react';
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import Bubbles from "../Backgrounds/Bubbles";
import CARD_2 from "../../assets/images/CARD_2.png";
import { LuTrendingUpDown } from "react-icons/lu";

const AuthLayout = ({ children }) => {
    return <div className="flex" >
        <div className='w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12'>
            <h2 className='text-4xl font-bold text-black py-2'>Expense Tracker </h2>
            <Typewriter
                words={[
                    "Track your income & expenses.",
                    "Visualize your finances.",
                    "Manage your budget.",
                    "Analyze your spending habits.",
                    "Control your savings.",
                    "Set financial goals.",
                    "Monitor daily spending."
                ]}
                loop={true}
                cursor
                cursorStyle='|'
                typeSpeed={70}
                deleteSpeed={50}
                delaySpeed={1000}
            />
            {children}

        </div>
        <div className='hidden md:block w-[40vw] h-screen bg-violet-50 bg-auth-bg-img bg-cover bg-no-repeat bg-center overflow-hidden p-8 px-8 relative'>
            <motion.div
                drag
                dragSnapToOrigin
                className='w-48 h-48 rounded-[40px] bg-purple-600 absolute -top-7 -left-5 cursor-grab active:cursor-grabbing' />
            <motion.div
                drag
                dragSnapToOrigin
                className='w-48 h-56 rounded-[40px] border-[20px] border-fuchsia-600 absolute top-[30%] right-10 cursor-grab active:cursor-grabbing' />
            <motion.div
                drag
                dragSnapToOrigin
                className='w-48 h-48 rounded-[40px] bg-violet-500 absolute -bottom-7 -left-5 cursor-grab active:cursor-grabbing' />

            <Bubbles />

            <div className='grid grid-cols-1 z-20'>
                <StatsInfoCard
                    icon={<LuTrendingUpDown />}
                    label="Track Your Income & Expenses"
                    value={430000}
                    color="bg-primary"

                />
            </div>
            <img
                src={CARD_2}
                className='w-64 lg:w-[90%] absolute bottom-10 shadow-lg shadow-blue-400/15'

            />

        </div>
    </div>;
};

export default AuthLayout;


const StatsInfoCard = ({ icon, label, value, color }) => {
    // Determine target value: if string contains commas, strip them.
    const numericValue = typeof value === 'string' ? parseInt(value.replace(/,/g, ''), 10) : value;
    return <CountUpStats icon={icon} label={label} value={numericValue} color={color} />
}

const CountUpStats = ({ icon, label, value, color }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, latest => Math.round(latest).toLocaleString());
    const ref = React.useRef(null);

    React.useEffect(() => {
        const controls = animate(count, value, { duration: 2 });
        return controls.stop;
    }, [value]);

    // Update text content directly for performance and to avoid re-renders
    React.useEffect(() => {
        const unsubscribe = rounded.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = latest;
            }
        });
        return unsubscribe;
    }, [rounded]);

    return <div className='flex gap-6 bg-white p-4 rounded-xl shadow-md shadow-purple-400/10 border border-gray-200/50 z-10'>
        <div
            className={`w-12 h-12 flex items-center justify-center text-[26px] text-white ${color} rounded-full drop-shadow-xl`}
        >
            {icon}
        </div>
        <div>
            <h6 className='text-xs text-gray-500 mb-1'>{label}</h6>
            <span className='text-[20px] '>$<span ref={ref}>0</span></span>
        </div>
    </div>
}

const Typewriter = ({ words, typeSpeed = 100, deleteSpeed = 60, delaySpeed = 1500 }) => {
    const [text, setText] = React.useState('');
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [wordIndex, setWordIndex] = React.useState(() => Math.floor(Math.random() * words.length));
    const [typingSpeed, setTypingSpeed] = React.useState(typeSpeed);

    React.useEffect(() => {
        const handleType = () => {
            const currentWord = words[wordIndex % words.length];

            if (isDeleting) {
                setText(currentWord.substring(0, text.length - 1));
                setTypingSpeed(deleteSpeed);
            } else {
                setText(currentWord.substring(0, text.length + 1));
                setTypingSpeed(typeSpeed);
            }

            if (!isDeleting && text === currentWord) {
                setTypingSpeed(delaySpeed);
                setIsDeleting(true);
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setWordIndex(prev => {
                    let nextIndex;
                    do {
                        nextIndex = Math.floor(Math.random() * words.length);
                    } while (nextIndex === prev && words.length > 1);
                    return nextIndex;
                });
                setTypingSpeed(500);
            }
        };

        const timer = setTimeout(handleType, typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, wordIndex, words, typeSpeed, deleteSpeed, delaySpeed, typingSpeed]);

    return (
        <div className="h-6 mb-5">
            <h1 className="text-xl md:text-2xl font-medium bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent inline-block">
                {text}
                <span className="text-primary animate-pulse">|</span>
            </h1>
        </div>
    );
}