import React from 'react';
import logoImage from '@/logo.png';

const Footer: React.FC = () => {
    return (
        <footer className="bg-[#1A1C2E] text-white py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                {/* Logo Section */}
                <div className="flex items-center gap-2">
                    <img src={logoImage} alt="Ottobon" className="h-8 w-auto object-contain" />
                    <span className="text-xl font-bold tracking-tight text-white">Ottobon</span>
                </div>

                {/* Copyright */}
                <div className="text-sm text-slate-300/80">
                    © 2026 Ottobon. All rights reserved.
                </div>

                {/* Links */}
                <div className="flex items-center gap-8 text-sm font-medium text-slate-300/80">
                    <button className="hover:text-white transition-colors">Privacy</button>
                    <button className="hover:text-white transition-colors">Terms</button>
                    {/* <button className="hover:text-white transition-colors">Contact </button> */}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
