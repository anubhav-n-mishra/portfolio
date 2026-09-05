'use client';

import { useState } from 'react';
import IDELayout from '@/components/IDELayout';
import LandingPage from '@/components/LandingPage';
import { useMounted } from '@/lib/hooks';

export default function Home() {
    // Always start on the landing page so a visitor can switch views freely.
    const [view, setView] = useState<'landing' | 'ide'>('landing');
    const [ideKey, setIdeKey] = useState(0); // remount key
    const mounted = useMounted();

    const handleSelectIDE = () => {
        // Aggressive cleanup before switching to IDE
        window.scrollTo(0, 0);

        // Remove all data attributes from html and body
        document.documentElement.removeAttribute('data-theme');
        document.body.removeAttribute('data-theme');

        // Remove any portfolio-specific classes
        document.body.className = document.body.className
            .split(' ')
            .filter(cls => !cls.includes('portfolio'))
            .join(' ');

        // Force scroll restoration to manual
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        localStorage.setItem('ide-experience', 'ide');
        setIdeKey(prev => prev + 1); // Increment key to force remount
        setView('ide');
    };

    if (!mounted) {
        return null;
    }

    if (view === 'landing') {
        return <LandingPage onSelectIDE={handleSelectIDE} />;
    }

    return <IDELayout key={ideKey} />;
}
