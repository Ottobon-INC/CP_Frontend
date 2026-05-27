import React, { useMemo } from 'react';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { useLeaderboardData } from '../hooks/useLeaderboardData';
import { useLocation } from 'wouter';
import {
  BookOpen, Trophy, Award, ArrowRight, Play,
  Zap, AlertTriangle, CheckCircle2, ChevronRight,
  GraduationCap, Flame, TrendingUp, Sparkles,
} from 'lucide-react';

/* ── tiny helper ── */
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/* ── SVG donut ── */
function Donut({ pct, size = 80, stroke = 7, color = '#E64833' }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
      />
    </svg>
  );
}

export function Home() {
  const { data: summary, isLoading } = useDashboardSummary();
  const { summary: lb } = useLeaderboardData();
  const [, setLocation] = useLocation();

  const tasks = useMemo(() => summary?.dynamicTasks || [], [summary]);
  const urgent = useMemo(() => summary?.urgentTasks || [], [summary]);
  const courses = useMemo(() => [...(summary?.cohorts || []), ...(summary?.onDemand || [])], [summary]);
  const resume = summary?.resumeCourse;
  const userName = summary?.user?.fullName?.split(' ')[0] || 'Learner';
  const certs = summary?.completed || [];
  const catalog = summary?.catalog || [];
  const rank = lb?.rank;

  const goto = (courseSlug: string | null | undefined, lastSlug?: string | null, isOnDemand = false) => {
    if (!courseSlug) return;
    const safeLesson = (lastSlug ?? "").trim() || "start";
    const base = isOnDemand ? "/ondemand" : "/course";
    setLocation(`${base}/${courseSlug}/learn/${safeLesson}`);
  };

  /* ─────────── loading skeleton ─────────── */
  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-[3px] border-retro-bg border-t-retro-salmon animate-spin" />
        <span className="text-retro-teal/40 text-sm font-medium">Loading…</span>
      </div>
    </div>
  );

  /* ─────────── progress % for hero donut ─────────── */
  const topProgress = courses[0]?.progress ?? 0;
  const doneCount = tasks.filter(t => t.checked).length;

  return (
    <div className="animate-fade-in pb-16">
      {/*
       * ═══════════════════════════════════════════════
       *   BENTO GRID
       *   Row 1 (desktop): [HERO 7col] [RANK 2col] [STREAK 3col]
       *   Row 2 (desktop): [COURSES 6col] [TASKS 3col] [CERT 3col]
       *   Row 3 (desktop): [CATALOG 6col] [URGENT 6col]
       * ═══════════════════════════════════════════════
       */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 auto-rows-auto">

        {/* ── HERO ── lg:col-span-7 */}
        <div className="sm:col-span-2 lg:col-span-7 relative overflow-hidden rounded-2xl bg-retro-teal min-h-[220px] p-7 flex flex-col justify-between group">
          {/* geometric decoration */}
          <div className="absolute -right-14 -top-14 w-56 h-56 rounded-full border-[40px] border-white/[0.04] pointer-events-none" />
          <div className="absolute right-10 bottom-6 w-28 h-28 rounded-full border-[20px] border-retro-salmon/20 pointer-events-none" />
          <div className="absolute -left-6 -bottom-10 w-44 h-44 rounded-full bg-retro-salmon/10 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 text-retro-bg/60 text-xs font-semibold tracking-widest uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-retro-salmon inline-block animate-pulse" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {greeting()},&nbsp;
              <span className="text-retro-bg">{userName}</span> 👋
            </h1>
            <p className="text-retro-bg/50 text-sm font-medium mt-2 mb-6 max-w-sm leading-relaxed">
              {resume
                ? `Pick up where you left off — "${resume.title}".`
                : 'Your dashboard is ready. Start or continue your learning today.'}
            </p>

            <div className="flex flex-wrap gap-2">
              {resume ? (
                <button
                  onClick={() => goto(resume.courseSlug, resume.lastLessonSlug)}
                  className="inline-flex items-center gap-2 bg-retro-salmon text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-retro-salmon/30 hover:brightness-110 hover:scale-[1.02] active:scale-[0.97] transition-all"
                >
                  <Play size={14} fill="currentColor" /> Continue
                </button>
              ) : (
                <button
                  onClick={() => setLocation('/our-courses/cohort')}
                  className="inline-flex items-center gap-2 bg-retro-salmon text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-retro-salmon/30 hover:brightness-110 hover:scale-[1.02] active:scale-[0.97] transition-all"
                >
                  <Zap size={14} /> Explore Courses
                </button>
              )}
              <button
                onClick={() => setLocation('/my-courses')}
                className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/15 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-white/15 transition-all"
              >
                My Courses <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* donut (desktop) */}
          {courses.length > 0 && (
            <div className="absolute right-7 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2">
              <div className="relative">
                <Donut pct={topProgress} size={96} stroke={8} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white font-extrabold text-xl leading-none">{topProgress}%</span>
                </div>
              </div>
              <span className="text-retro-bg/40 text-[10px] font-bold text-center max-w-[80px] truncate leading-tight">
                {courses[0].title}
              </span>
            </div>
          )}
        </div>

        {/* ── RANK ── lg:col-span-2 */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 p-6 flex flex-col items-center justify-center text-center min-h-[160px]">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
          <Trophy size={28} className="text-white/90 mb-2" strokeWidth={2} />
          <p className="text-4xl font-black text-white leading-none tracking-tighter">
            {rank ? `#${rank}` : '—'}
          </p>
          <p className="text-amber-100 text-[11px] font-bold uppercase tracking-widest mt-1">Rank</p>
        </div>

        {/* ── STREAK / CERTS ── lg:col-span-3 */}
        <div className="lg:col-span-3 rounded-2xl bg-retro-salmon relative overflow-hidden p-6 flex flex-col justify-between min-h-[160px]">
          <div className="absolute -bottom-5 -right-5 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
          <Sparkles size={22} className="text-white/80 mb-3" />
          <div>
            <p className="text-4xl font-black text-white leading-none">{certs.length}</p>
            <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest mt-1">Certificates Earned</p>
          </div>
          <button
            onClick={() => setLocation('/certificates')}
            className="mt-4 text-xs font-bold text-white/70 hover:text-white flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>

        {/* ── ACTIVE COURSES ── lg:col-span-6 */}
        <div className="sm:col-span-2 lg:col-span-6 rounded-2xl bg-white/90 backdrop-blur-sm border border-retro-sage/20 shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen size={15} className="text-retro-salmon" />
              <h2 className="text-sm font-bold text-retro-teal">Active Courses</h2>
            </div>
            <button onClick={() => setLocation('/my-courses')} className="text-[11px] font-bold text-retro-salmon/80 hover:text-retro-salmon flex items-center gap-0.5 transition-colors">
              View all <ArrowRight size={11} />
            </button>
          </div>

          {courses.length === 0 ? (
            <div className="px-6 pb-6 pt-3 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 bg-retro-bg rounded-2xl flex items-center justify-center">
                <GraduationCap size={22} className="text-retro-teal/30" />
              </div>
              <p className="text-retro-teal/40 text-xs font-semibold">No active courses yet</p>
              <button
                onClick={() => setLocation('/our-courses/cohort')}
                className="text-xs font-bold bg-retro-salmon text-white px-4 py-2 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-retro-salmon/20"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="divide-y divide-retro-sage/10">
              {courses.slice(0, 3).map((c, i) => {
                const pct = c.progress ?? 0;
                const isCohort = 'status' in c;
                return (
                  <div
                    key={c.id}
                    onClick={() =>
                      goto(
                        c.courseSlug,
                        'lastLessonSlug' in c ? (c as any).lastLessonSlug : null,
                        !('status' in c),
                      )
                    }
                    className="flex items-center gap-4 px-6 py-4 hover:bg-retro-bg/20 transition-colors cursor-pointer group"
                  >
                    {/* index circle */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-black ${i === 0 ? 'bg-retro-salmon text-white' :
                      i === 1 ? 'bg-retro-teal text-white' :
                        'bg-retro-bg text-retro-teal'
                      }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${isCohort ? 'bg-retro-teal/10 text-retro-teal' : 'bg-retro-salmon/10 text-retro-salmon'
                          }`}>
                          {isCohort ? 'Cohort' : 'On-demand'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-retro-teal truncate">{c.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1 bg-retro-bg rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${i % 2 === 0 ? 'bg-retro-salmon' : 'bg-retro-teal'}`}
                            style={{ width: `${pct}%`, transition: 'width 1.2s ease' }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-retro-teal/60 shrink-0">{pct}%</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goto(
                          c.courseSlug,
                          'lastLessonSlug' in c ? (c as any).lastLessonSlug : null,
                          !('status' in c),
                        );
                      }}
                      className="shrink-0 w-8 h-8 rounded-xl bg-retro-teal/5 text-retro-teal/50 flex items-center justify-center group-hover:bg-retro-salmon group-hover:text-white transition-all duration-200"
                    >
                      <Play size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── TASKS ── lg:col-span-3 */}
        <div className="lg:col-span-3 rounded-2xl bg-white/90 backdrop-blur-sm border border-retro-sage/20 shadow-[0_2px_16px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-retro-teal flex items-center gap-2">
              <Flame size={14} className="text-retro-salmon" /> Today's Tasks
            </h2>
            {tasks.length > 0 && (
              <span className="text-[10px] font-black bg-retro-teal text-white px-2 py-0.5 rounded-full">
                {doneCount}/{tasks.length}
              </span>
            )}
          </div>

          {tasks.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center gap-2">
              <CheckCircle2 size={28} className="text-emerald-400" />
              <p className="text-xs text-retro-teal/40 font-semibold">All done for today!</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {tasks.map((t) => (
                <div key={t.id} className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${t.checked ? 'opacity-40' : 'hover:bg-retro-bg/30'}`}>
                  <div className={`w-4 h-4 mt-0.5 rounded-full border-2 shrink-0 flex items-center justify-center ${t.checked ? 'bg-retro-salmon border-retro-salmon' : 'border-retro-sage'
                    }`}>
                    {t.checked && <span className="block w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className={`text-xs font-medium leading-snug ${t.checked ? 'line-through text-retro-teal/30' : 'text-retro-teal'}`}>
                    {t.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── LEADERBOARD MINI ── lg:col-span-3 */}
        <div
          className="lg:col-span-3 rounded-2xl bg-retro-teal/5 border border-retro-teal/10 p-6 flex flex-col cursor-pointer hover:bg-retro-teal/8 transition-colors"
          onClick={() => setLocation('/leaderboard')}
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={14} className="text-amber-500" />
            <h2 className="text-sm font-bold text-retro-teal">Leaderboard</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div className="text-6xl font-black text-retro-teal leading-none tracking-tighter">
              {rank ? `#${rank}` : '—'}
            </div>
            <p className="text-retro-teal/40 text-[11px] font-bold uppercase tracking-widest mt-2">Your rank</p>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-retro-teal/10">
            <span className="text-[11px] text-retro-teal/50 font-semibold">See full standings</span>
            <ArrowRight size={13} className="text-retro-teal/30" />
          </div>
        </div>

        {/* ── CATALOG / RECOMMENDED ── lg:col-span-6 */}
        {catalog.length > 0 && (
          <div className="sm:col-span-2 lg:col-span-6 rounded-2xl bg-white/90 backdrop-blur-sm border border-retro-sage/20 shadow-[0_2px_16px_rgba(0,0,0,0.04)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-retro-teal flex items-center gap-2">
                <TrendingUp size={14} className="text-retro-salmon" /> Recommended For You
              </h2>
              <button onClick={() => setLocation('/our-courses/cohort')} className="text-[11px] font-bold text-retro-salmon/80 hover:text-retro-salmon flex items-center gap-0.5 transition-colors">
                Browse <ArrowRight size={11} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {catalog.slice(0, 4).map((course) => (
                <div
                  key={course.id}
                  onClick={() => setLocation('/our-courses/cohort')}
                  className="group flex items-start gap-3 p-3.5 rounded-xl border border-retro-sage/15 hover:border-retro-salmon/30 hover:bg-retro-bg/30 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-retro-teal/20 to-retro-teal/10 flex items-center justify-center shrink-0">
                    <BookOpen size={14} className="text-retro-teal/60" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-retro-teal truncate group-hover:text-retro-salmon transition-colors leading-snug">{course.title}</p>
                    <p className="text-[10px] text-retro-teal/40 font-semibold mt-0.5 capitalize">{course.category}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setLocation('/our-courses/cohort')}
              className="mt-4 w-full py-2.5 rounded-xl border border-retro-salmon/20 text-xs font-bold text-retro-salmon hover:bg-retro-salmon hover:text-white transition-all duration-200"
            >
              Explore All Courses
            </button>
          </div>
        )}

        {/* ── URGENT ── lg:col-span-6 */}
        <div className={`sm:col-span-2 ${catalog.length > 0 ? 'lg:col-span-6' : 'lg:col-span-12'} rounded-2xl ${urgent.length > 0 ? 'bg-red-50 border border-red-100' : 'bg-emerald-50 border border-emerald-100'
          } p-6`}>
          <div className="flex items-center gap-2 mb-4">
            {urgent.length > 0
              ? <AlertTriangle size={15} className="text-red-500" />
              : <CheckCircle2 size={15} className="text-emerald-500" />
            }
            <h2 className={`text-sm font-bold ${urgent.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {urgent.length > 0 ? `${urgent.length} Deadline${urgent.length > 1 ? 's' : ''} Today` : 'No Urgent Tasks!'}
            </h2>
          </div>

          {urgent.length > 0 ? (
            <div className={`grid gap-3 ${catalog.length > 0 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {urgent.map((t) => (
                <div key={t.id} className={`flex items-start gap-3 p-3.5 rounded-xl border-l-[3px] ${t.type === 'quiz' ? 'bg-red-100/70 border-red-500' : 'bg-white border-retro-salmon'
                  }`}>
                  <div>
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${t.type === 'quiz' ? 'text-red-500' : 'text-retro-salmon'}`}>
                      {t.time} · {t.type}
                    </p>
                    <p className="text-xs font-semibold text-retro-teal leading-snug">{t.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 size={22} className="text-emerald-500" />
              </div>
              <p className="text-xs text-emerald-600/70 font-semibold">You're all caught up for today. Great work!</p>
            </div>
          )}
        </div>

      </div>{/* /bento grid */}
    </div>
  );
}
