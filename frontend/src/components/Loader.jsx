import React from 'react';

const Loader = () => {
    return (
        <div className="flex items-center justify-center min-h-[200px] w-full">
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500">Loading...</p> 
            </div>
        </div>
    );
};

export default Loader;
