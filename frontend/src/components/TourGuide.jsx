import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { LuX } from 'react-icons/lu';
import { useUserAuth } from '../hooks/useUserAuth';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const TourGuide = () => {
    const { user, updateUser } = useUserAuth();
    const [stepIndex, setStepIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Configuration for different routes
    const routeConfig = {
        '/dashboard': {
            steps: [
                {
                    target: 'body',
                    title: 'Welcome to Dashboard!',
                    content: 'This is your main control center. Here is a quick overview of what you can do.',
                    placement: 'center',
                },
                {
                    target: '#sidebar-menu',
                    altTarget: '#mobile-menu-btn',
                    title: 'Navigation Menu',
                    content: 'Use this menu to switch between Dashboard, Incomes, Expenses, and Settings.',
                    placement: 'right',
                },
                {
                    target: '#stats-grid',
                    title: 'Financial Summary',
                    content: 'See your total Balance, Income, and Expenses at a glance.',
                    placement: 'bottom',
                },
                {
                    target: '#financial-overview',
                    title: 'Visual Breakdown',
                    content: 'The donut chart gives you a quick visual representation of your finances.',
                    placement: 'left',
                },
                {
                    target: '#recent-transactions',
                    title: 'Recent Transactions',
                    content: 'Your latest financial activities appear here for quick access.',
                    placement: 'top',
                }
            ]
        },
        '/income': {
            steps: [
                {
                    target: 'body',
                    title: 'Income Management',
                    content: 'Here you can track all your income properly.',
                    placement: 'center',
                },
                {
                    target: '#income-add-btn',
                    title: 'Add New Income',
                    content: 'Click here to add a new source of income.',
                    placement: 'bottom',
                },
                {
                    target: '#income-chart',
                    title: 'Income Trends',
                    content: 'Visualize your income over time with this chart.',
                    placement: 'top',
                },
                {
                    target: '#income-list',
                    title: 'Income History',
                    content: 'View, edit, or delete past income records here.',
                    placement: 'top',
                },
                {
                    target: '#income-download-btn',
                    title: 'Export Data',
                    content: 'Download your income report as an Excel file.',
                    placement: 'top',
                }
            ]
        },
        '/expense': {
            steps: [
                {
                    target: 'body',
                    title: 'Expense Tracking',
                    content: 'Keep an eye on where your money goes.',
                    placement: 'center',
                },
                {
                    target: '#expense-add-btn',
                    title: 'Add New Expense',
                    content: 'Add your daily spending here.',
                    placement: 'bottom',
                },
                {
                    target: '#expense-chart',
                    title: 'Expense Trends',
                    content: 'Track your spending habits over time.',
                    placement: 'top',
                },
                {
                    target: '#expense-list',
                    title: 'Expense History',
                    content: 'Manage your past expenses. You can edit or delete them.',
                    placement: 'top',
                },
                {
                    target: '#expense-download-btn',
                    title: 'Export Data',
                    content: 'Download your expense report for offline analysis.',
                    placement: 'top',
                }
            ]
        },
        '/settings': {
            steps: [
                {
                    target: 'body',
                    title: 'Profile Settings',
                    content: 'Customize your profile and app preferences here.',
                    placement: 'center',
                },
                {
                    target: '#settings-profile-pic',
                    title: 'Profile Picture',
                    content: 'Click here to upload or change your profile photo.',
                    placement: 'right',
                },
                {
                    target: '#settings-personal-info',
                    title: 'Personal Info',
                    content: 'Update your name and currency here.',
                    placement: 'top',
                },
                {
                    target: '#settings-security',
                    title: 'Account Security',
                    content: 'Set a security question. This helps you recover your password if you forget it.',
                    placement: 'top',
                },
                {
                    target: '#settings-chatbot',
                    title: 'Chatbot',
                    content: 'Toggle the chatbot. It can answer questions about your spending!',
                    placement: 'top',
                },
                {
                    target: '#settings-save-btn',
                    title: 'Save Changes',
                    content: 'Make sure to save your changes after editing.',
                    placement: 'top',
                }
            ]
        }
    };

    const currentConfig = routeConfig[location.pathname];
    const steps = currentConfig ? currentConfig.steps : [];

    const [coords, setCoords] = useState({ highlight: null, tooltip: null });

    // Initial check
    useEffect(() => {
        if (currentConfig && user) {
            const completedTours = user.completedTours || [];
            if (!completedTours.includes(location.pathname)) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        } else {
            setIsOpen(false);
        }
        setStepIndex(0); // Reset index on route change
    }, [location.pathname, user?.completedTours, currentConfig, user]);

    // Scroll Lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Calculate positions
    useEffect(() => {
        if (!isOpen || !currentConfig) return;

        const currentStep = steps[stepIndex];
        if (!currentStep) return;

        const updatePosition = () => {
            const target = currentStep.target === 'body' ? document.body : document.querySelector(currentStep.target);

            if (!target) {
                // Try finding alt target first if primary missing
                if (currentStep.altTarget) {
                    const altElement = document.querySelector(currentStep.altTarget);
                    if (altElement) {
                        const altRect = altElement.getBoundingClientRect();
                        // (Same alt logic as before: proceed if visible)
                        if (altRect.width > 0 && altRect.height > 0 && window.getComputedStyle(altElement).display !== 'none') {
                            calculateCoords(altElement, currentStep);
                            return;
                        }
                    }
                }

                // Fallback to center if absolutely no target found
                setCoords({ highlight: null, tooltip: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '320px' } });
                return;
            }

            // Normal target logic
            const rect = target.getBoundingClientRect();
            // Check visibility
            if (rect.width === 0 || rect.height === 0 || window.getComputedStyle(target).display === 'none') {
                // Try alt target again specifically for hidden primary
                if (currentStep.altTarget) {
                    const altElement = document.querySelector(currentStep.altTarget);
                    if (altElement) {
                        const altRect = altElement.getBoundingClientRect();
                        if (altRect.width > 0 && altRect.height > 0 && window.getComputedStyle(altElement).display !== 'none') {
                            calculateCoords(altElement, currentStep);
                            return;
                        }
                    }
                }
                // Hidden fallback
                setCoords({ highlight: null, tooltip: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '320px' } });
                return;
            }

            calculateCoords(target, currentStep);
        };

        const calculateCoords = (target, step) => {
            if (step.target === 'body') {
                setCoords({ highlight: null, tooltip: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '320px' } });
                return;
            }

            const rect = target.getBoundingClientRect();
            const highlight = {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            };

            const viewportW = window.innerWidth;
            const viewportH = window.innerHeight;
            const tooltipW = Math.min(320, viewportW - 32);
            const tooltipH = 200;
            const gap = 15;

            let top, left;

            // Helper to check boundaries
            const checkRight = (leftPos) => leftPos + tooltipW + gap < viewportW;
            const checkLeft = (leftPos) => leftPos - tooltipW - gap > 0;
            const checkBottom = (topPos) => topPos + tooltipH + gap < viewportH;
            const checkTop = (topPos) => topPos - tooltipH - gap > 0;

            let p = step.placement;

            // Force vertical placement on mobile to avoid squeezing
            if (viewportW < 768 && (p === 'left' || p === 'right')) {
                p = 'bottom';
            }

            if (p === 'right') {
                if (checkRight(rect.right)) {
                    left = rect.right + gap;
                    top = rect.top + rect.height / 2 - tooltipH / 2;
                } else {
                    left = rect.left - tooltipW - gap;
                    top = rect.top + rect.height / 2 - tooltipH / 2;
                }
            } else if (p === 'left') {
                if (checkLeft(rect.left)) {
                    left = rect.left - tooltipW - gap;
                    top = rect.top + rect.height / 2 - tooltipH / 2;
                } else {
                    left = rect.right + gap;
                    top = rect.top + rect.height / 2 - tooltipH / 2;
                }
            } else if (p === 'bottom') {
                if (checkBottom(rect.bottom)) {
                    left = rect.left + rect.width / 2 - tooltipW / 2;
                    top = rect.bottom + gap;
                } else {
                    left = rect.left + rect.width / 2 - tooltipW / 2;
                    top = rect.top - tooltipH - gap;
                }
            } else if (p === 'top') {
                if (checkTop(rect.top)) {
                    left = rect.left + rect.width / 2 - tooltipW / 2;
                    top = rect.top - tooltipH - gap;
                } else {
                    left = rect.left + rect.width / 2 - tooltipW / 2;
                    top = rect.bottom + gap;
                }
            }

            if (left === undefined || top === undefined) {
                left = rect.left + rect.width / 2 - tooltipW / 2;
                top = rect.bottom + gap;
            }

            if (left < 16) left = 16;
            if (left + tooltipW > viewportW - 16) left = viewportW - tooltipW - 16;
            if (top < 16) top = 16;
            if (top + tooltipH > viewportH - 16) top = viewportH - tooltipH - 16;

            setCoords({
                highlight,
                tooltip: { top, left, position: 'absolute', width: tooltipW }
            });
        };

        // Scroll logic first
        const initTarget = currentStep.target === 'body' ? document.body : document.querySelector(currentStep.target);
        if (initTarget && currentStep.target !== 'body') {
            // Instant scroll to avoid heavy lag
            initTarget.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
        }

        // Delay to allow layout/render
        const timer = setTimeout(updatePosition, 100); // reduced delay as scroll is auto

        // Listeners
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, { capture: true, passive: true });

        const mainContainer = document.getElementById('main-content-scroll-container');
        if (mainContainer) {
            mainContainer.addEventListener('scroll', updatePosition, { passive: true });
        }

        // Retry fallback
        const fallbackTimer = setTimeout(updatePosition, 500);

        return () => {
            clearTimeout(timer);
            clearTimeout(fallbackTimer);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, { capture: true });
            if (mainContainer) {
                mainContainer.removeEventListener('scroll', updatePosition);
            }
        };
    }, [stepIndex, isOpen, location.pathname]); // Add location.pathname

    const completeTour = async () => {
        try {
            await axiosInstance.put(API_PATHS.AUTH.UPDATE_TOUR_STATUS, { route: location.pathname });
            if (updateUser && user) {
                const updatedCompletedTours = [...(user.completedTours || [])];
                if (!updatedCompletedTours.includes(location.pathname)) {
                    updatedCompletedTours.push(location.pathname);
                }
                updateUser({ ...user, completedTours: updatedCompletedTours });
            }
        } catch (error) {
            console.error("Failed to update tour status", error);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        completeTour();
    };

    const handleNext = () => {
        if (stepIndex < steps.length - 1) {
            setStepIndex(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handleBack = () => {
        if (stepIndex > 0) {
            setStepIndex(prev => prev - 1);
        }
    };

    if (!isOpen || !currentConfig) return null;

    const currentStep = steps[stepIndex];
    if (!currentStep) return null;

    const isCenter = currentStep.target === 'body';

    return createPortal(
        <div className="fixed inset-0 z-[9999] overflow-hidden">
            <div className="absolute inset-0 bg-black/50 transition-colors duration-500" />

            {/* Highlight Box */}
            {!isCenter && coords.highlight && (
                <div
                    className="absolute bg-transparent border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] rounded-lg transition-all duration-300 pointer-events-none"
                    style={{
                        top: coords.highlight.top - 5,
                        left: coords.highlight.left - 5,
                        width: coords.highlight.width + 10,
                        height: coords.highlight.height + 10,
                    }}
                />
            )}

            {/* Tooltip Card */}
            {coords.tooltip && (
                <div
                    className="bg-white p-6 rounded-2xl shadow-xl absolute transition-all duration-300 z-[10000]"
                    style={coords.tooltip}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{currentStep.title}</h3>
                        <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                            <LuX />
                        </button>
                    </div>

                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        {currentStep.content}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                            {steps.map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full ${i === stepIndex ? 'bg-primary' : 'bg-gray-200'}`} />
                            ))}
                        </div>
                        <div className="flex gap-2">
                            {stepIndex > 0 && (
                                <button
                                    onClick={handleBack}
                                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                            >
                                {stepIndex === steps.length - 1 ? 'Finish' : 'Next'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>,
        document.body
    );
};

export default TourGuide;
