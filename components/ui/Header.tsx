
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Screen } from '../../types';

interface HeaderProps {
    showQuit?: boolean;
    onQuit?: () => void;
}

const Logo: React.FC = () => (
    <div className="flex items-center gap-2 cursor-pointer">
        <div className="bg-brand-primary p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
        </div>
        <span className="text-xl font-bold text-light-text">AI Quiz Nexus</span>
    </div>
);


const Header: React.FC<HeaderProps> = ({ showQuit = false, onQuit }) => {
    const { navigateTo } = useAppContext();

    return (
        <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-10 bg-transparent">
            <div className="container mx-auto flex justify-between items-center">
                <div onClick={() => navigateTo(Screen.HOME)}>
                    <Logo />
                </div>
                <div className="flex items-center gap-4">
                    {!showQuit && (
                        <>
                            <button onClick={() => navigateTo(Screen.PROFILE)} className="flex items-center gap-2 text-medium-text hover:text-light-text transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                <span className="hidden sm:inline">Profile</span>
                            </button>
                            <button className="flex items-center gap-2 text-medium-text hover:text-light-text transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                <span className="hidden sm:inline">Settings</span>
                            </button>
                        </>
                    )}
                    {showQuit && (
                        <button onClick={onQuit} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Quit
                        </button>
                    )}
                     <img src="https://picsum.photos/seed/avatar/40/40" alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-brand-secondary" />
                </div>
            </div>
        </header>
    );
};

export default Header;
