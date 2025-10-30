
import React from 'react';

interface SpinnerProps {
    text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ text = "Loading..." }) => (
    <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-brand-primary"></div>
        <p className="text-lg text-medium-text">{text}</p>
    </div>
);

export default Spinner;
