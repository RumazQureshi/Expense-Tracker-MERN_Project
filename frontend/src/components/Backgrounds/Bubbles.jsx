import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const Bubbles = () => {
    const [bubbles, setBubbles] = useState([]);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    useEffect(() => {
        const bubbleCount = 15;
        const newBubbles = Array.from({ length: bubbleCount }).map((_, i) => {
            const variantType = Math.random();
            let colorClass = 'bg-purple-200/30';

            if (variantType > 0.7) {
                colorClass = 'bg-purple-600 opacity-80';
            } else if (variantType > 0.4) {
                colorClass = 'bg-fuchsia-400/40';
            }

            return {
                id: i,
                size: Math.random() * 60 + 30,
                x: Math.random() * 100,
                y: Math.random() * 100,
                duration: Math.random() * 20 + 10,
                delay: Math.random() * 5,
                floatRange: Math.random() * 100 + 50,
                parallaxFactor: Math.random() * 0.5 + 0.2,
                colorClass,
            };
        });
        setBubbles(newBubbles);

        const handleMouseMove = (e) => {
            const { innerWidth, innerHeight } = window;
            const x = e.clientX - innerWidth / 2;
            const y = e.clientY - innerHeight / 2;
            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {bubbles.map((bubble) => (
                <Bubble
                    key={bubble.id}
                    bubble={bubble}
                    mouseX={smoothX}
                    mouseY={smoothY}
                />
            ))}
        </div>
    );
};

const Bubble = ({ bubble, mouseX, mouseY }) => {
    const x = useTransform(mouseX, (value) => value * bubble.parallaxFactor);
    const y = useTransform(mouseY, (value) => value * bubble.parallaxFactor);

    return (
        <motion.div
            style={{
                width: bubble.size,
                height: bubble.size,
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                x,
                y,
            }}
            className={`absolute rounded-full ${bubble.colorClass}`}
            animate={{
                x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
                y: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
                scale: [1, 1.1, 0.9, 1],
            }}
            transition={{
                duration: bubble.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: bubble.delay,
            }}
        />
    );
};

export default Bubbles;
