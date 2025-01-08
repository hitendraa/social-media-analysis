import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
            <div className="max-w-6xl mx-auto flex justify-center items-center">
                <h1 className="text-2xl font-bold tracking-tight">Sociolytics</h1>
                <nav className="flex space-x-4">
                    {/* Add additional navigation links here if needed */}
                </nav>
            </div>
        </header>
    );
};

export default Header;