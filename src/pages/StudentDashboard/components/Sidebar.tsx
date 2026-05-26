import { Link, useLocation } from 'wouter';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import {
  Home,
  BookOpen,
  CheckSquare,
  Trophy,
  Video,
  MessageSquare,
  Award,
  LogOut,
  User
} from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/student-dashboard' },
  { icon: BookOpen, label: 'My Courses', path: '/my-courses' },
  { icon: Video, label: 'Live Sessions', path: '/live-sessions' },
  { icon: CheckSquare, label: 'Assignments', path: '/assignments' },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
  { icon: MessageSquare, label: 'Messages', path: '/messages' },
  { icon: Award, label: 'Certificates', path: '/certificates' },
];

export function Sidebar() {
  const { data: summary } = useDashboardSummary();
  const [location] = useLocation();

  const profilePhoto = summary?.user?.profilePhotoUrl || null;

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="
        fixed left-5 top-[108px] bottom-8 w-[74px]
        bg-white/95 backdrop-blur-lg
        rounded-2xl
        border border-retro-sage/25
        shadow-[0_4px_32px_rgba(36,72,85,0.10)]
        hidden md:flex flex-col items-center
        py-6 gap-1
        z-50
        transition-all duration-300
      ">
        {/* Profile */}
        <Link href="/profile">
          <div className="group relative mb-3 cursor-pointer">
            <div className={`
              w-12 h-12 rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-sm
              ${location === '/profile'
                ? 'border-retro-salmon shadow-retro-salmon/20 scale-105'
                : 'border-retro-sage/30 hover:border-retro-salmon/50 hover:scale-105'}
            `}>
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-retro-teal/10 flex items-center justify-center">
                  <User size={20} className="text-retro-teal/60" />
                </div>
              )}
            </div>
            {/* Active dot */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
            {/* Tooltip */}
            <div className="
              absolute left-[60px] top-1/2 -translate-y-1/2 pointer-events-none
              bg-retro-teal text-white text-[11px] font-bold
              px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xl
              opacity-0 group-hover:opacity-100
              translate-x-2 group-hover:translate-x-0
              transition-all duration-200 z-50
            ">
              Profile
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-retro-teal rotate-45 rounded-[2px]" />
            </div>
          </div>
        </Link>

        {/* Divider */}
        <div className="w-8 h-px bg-retro-sage/30 my-1 shrink-0" />

        {/* Nav Items */}
        <div className="flex flex-col gap-1 flex-1 w-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;

            return (
              <Link key={item.path} href={item.path}>
                <div className="group relative flex justify-center">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    transition-all duration-200
                    ${isActive
                      ? 'bg-retro-teal text-white shadow-md shadow-retro-teal/20'
                      : 'text-retro-teal/40 hover:text-retro-teal hover:bg-retro-teal/8'}
                  `}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  {/* Active bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-retro-salmon rounded-r-full" />
                  )}
                  {/* Tooltip */}
                  <div className="
                    absolute left-[60px] top-1/2 -translate-y-1/2 pointer-events-none
                    bg-retro-teal text-white text-[11px] font-bold
                    px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xl
                    opacity-0 group-hover:opacity-100
                    translate-x-2 group-hover:translate-x-0
                    transition-all duration-200 z-50
                  ">
                    {item.label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-retro-teal rotate-45 rounded-[2px]" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-8 h-px bg-retro-sage/30 my-1 shrink-0" />

        {/* Logout */}
        <div className="px-2">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            className="group relative w-12 h-12 rounded-xl text-red-400 hover:text-white hover:bg-red-500 flex items-center justify-center transition-all duration-200"
          >
            <LogOut size={19} />
            <div className="
              absolute left-[60px] top-1/2 -translate-y-1/2 pointer-events-none
              bg-red-500 text-white text-[11px] font-bold
              px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xl
              opacity-0 group-hover:opacity-100
              translate-x-2 group-hover:translate-x-0
              transition-all duration-200 z-50
            ">
              Sign Out
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-red-500 rotate-45 rounded-[2px]" />
            </div>
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="
        fixed bottom-5 left-1/2 -translate-x-1/2
        bg-retro-teal/95 backdrop-blur-lg
        rounded-full px-2 py-2
        shadow-[0_8px_32px_rgba(36,72,85,0.30)]
        z-[100] flex items-center gap-0.5
        md:hidden max-w-[96vw]
        border border-white/10
      ">
        {/* Profile */}
        <Link href="/profile">
          <div className={`w-9 h-9 rounded-full border-2 overflow-hidden shrink-0 transition-all duration-300 ${location === '/profile' ? 'border-retro-salmon scale-110' : 'border-white/20'}`}>
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/10 flex items-center justify-center">
                <User size={16} className="text-white/70" />
              </div>
            )}
          </div>
        </Link>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;

          return (
            <Link key={item.path} href={item.path}>
              <div className={`
                w-9 h-9 rounded-full flex items-center justify-center
                transition-all duration-200 shrink-0
                ${isActive
                  ? 'bg-retro-salmon text-white scale-110 shadow-lg'
                  : 'text-white/50 hover:text-white/80'}
              `}>
                <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
