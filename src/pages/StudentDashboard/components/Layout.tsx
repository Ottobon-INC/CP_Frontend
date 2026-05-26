import { useLocation } from 'wouter';
import { Sidebar } from './Sidebar';
import React from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isMessages = location === '/messages' || location === '/student-dashboard/messages' || location === '/student_dashboard/messages';

  return (
    <div className={`flex min-h-screen font-sans bg-retro-bg ${isMessages ? 'overflow-hidden h-screen' : ''}`}>
      <Sidebar />
      <main className={`flex-1 md:ml-[100px] ml-0 flex flex-col md:pt-[108px] pt-24 ${isMessages ? 'h-screen' : 'min-h-screen pb-[100px]'}`}>
        <div className={isMessages ? 'flex-1 flex flex-col' : 'px-5 md:px-8 pb-10'}>
          {children}
        </div>
      </main>
    </div>
  );
}
