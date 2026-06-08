import React, { useState, useEffect, useMemo } from 'react';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { useLocation } from 'wouter';
import { CohortsView, CohortTopPerformer } from '../components/CohortsView';
import cohortIcon from '@/assets/html_css.png';
import onDemandIcon from '@/assets/js_sql.png';
import workshopIcon from '@/assets/uiux.png';
import recommendedImage from '@/assets/recommended.png';

export function MyCourses() {
  const { data: summary, isLoading } = useDashboardSummary();
  const [, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortOption, setSortOption] = useState<{ id: string, label: string }>({ id: 'all', label: 'All Courses' });
  const [sortOpen, setSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filters = ['All', 'Cohorts', 'On-demand', 'Workshops'];
  const sortOptions = [
    { id: 'all', label: 'All Courses' },
    { id: 'enrolled', label: 'Enrolled' },
    { id: 'not-enrolled', label: 'Not Enrolled' },
    { id: 'coming-soon', label: 'Coming Soon' },
  ];

  const resolveCourseTarget = (course: {
    courseSlug: string | null;
    lastLessonSlug?: string | null;
    isEnrolled?: boolean;
    programType?: 'cohort' | 'ondemand' | 'workshop' | 'catalog';
  }) => {
    if (!course.courseSlug) {
      return null;
    }
    // Enrolled learners should jump directly into the player.
    if (course.isEnrolled) {
      const safeLesson = (course.lastLessonSlug ?? '').trim() || 'start';
      if (course.programType === 'ondemand') {
        return `/ondemand/${course.courseSlug}/learn/${safeLesson}`;
      }
      if (course.programType === 'cohort') {
        return `/course/${course.courseSlug}/learn/${safeLesson}`;
      }
    }
    if (course.programType === 'ondemand') {
      return `/ondemand/${course.courseSlug}`;
    }
    return `/course/${course.courseSlug}`;
  };

  const mappedCourses = useMemo(() => {
    if (!summary) return [];
    
    console.log('[MyCourses] Summary received:', summary);
    
    const cohorts = summary.cohorts.map(c => ({
      id: c.id,
      title: c.title,
      desc: `Batch ${c.batchNo} • Status: ${c.status}`,
      progress: c.progress,
      lastAccess: c.nextSessionDate ? `Next session: ${c.nextSessionDate}` : 'Join cohort',
      tag: `Cohort (Batch ${c.batchNo})`,
      icon: cohortIcon,
      btnText: 'Resume',
      courseSlug: c.courseSlug,
      lastLessonSlug: c.lastLessonSlug,
      isEnrolled: true,
      programType: 'cohort' as const,
    }));

    const onDemand = summary.onDemand.map(od => ({
      id: od.id,
      title: od.title,
      desc: od.lastAccessedModule || 'Continue learning',
      progress: od.progress,
      lastAccess: 'On-demand',
      tag: 'On-demand',
      icon: onDemandIcon,
      btnText: 'Resume',
      courseSlug: od.courseSlug,
      lastLessonSlug: od.lastLessonSlug,
      isEnrolled: true,
      programType: 'ondemand' as const,
    }));

    const workshops = summary.workshops.map(w => ({
      id: w.id,
      title: w.title,
      desc: `${w.date} at ${w.time}`,
      progress: 0,
      lastAccess: 'Workshop',
      tag: 'Workshop',
      icon: workshopIcon,
      btnText: 'View',
      courseSlug: null,
      lastLessonSlug: null,
      isEnrolled: true,
      programType: 'workshop' as const,
    }));

    const catalog = summary.catalog.map(c => ({
      id: c.id,
      title: c.title,
      desc: `Explore: ${c.category} • Enroll now to start your journey`,
      progress: 0,
      lastAccess: `${c.students}+ Students joined`,
      tag: c.category,
      icon: c.thumbnailUrl || onDemandIcon,
      btnText: 'Enroll Now',
      courseSlug: c.courseSlug,
      lastLessonSlug: null,
      isEnrolled: false,
      programType: 'catalog' as const,
    }));

    // Temporarily remove onDemand courses from the list
    return [...cohorts, ...workshops];
  }, [summary]);

  // Helpers
  const isComingSoon = (c: any) => c.tag.toLowerCase().includes('upcoming') || (!c.isEnrolled && c.tag.toLowerCase().includes('cohort'));
  const isEnrolled = (c: any) => c.isEnrolled;
  const isNotEnrolled = (c: any) => !c.isEnrolled;

  const { activeCourses, completedCourses } = useMemo(() => {
    const filtered = mappedCourses.filter(c => {
      // Search
      if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      // Pill Filter
      if (activeFilter.toLowerCase() !== 'all') {
        const tagLower = c.tag.toLowerCase();
        const filterLower = activeFilter.toLowerCase();
        
        // Match if tag contains filter or filter contains tag (handles Cohort vs Cohorts)
        if (!tagLower.includes(filterLower) && !filterLower.includes(tagLower)) return false;
      }

      return true;
    });

    return {
      activeCourses: filtered.filter(c => c.progress < 100),
      completedCourses: filtered.filter(c => c.progress === 100)
    };
  }, [searchQuery, activeFilter, mappedCourses]);

  const displayRecommendations = useMemo(() => {
    if (!summary?.catalog) return [];
    
    if (activeFilter === 'Cohorts') {
      return summary.catalog.filter(c => c.programType === 'cohort').slice(0, 3);
    }
    if (activeFilter === 'On-demand') {
      // Temporarily hide on-demand recommendations
      return [];
    }
    if (activeFilter === 'Workshops') {
      return summary.catalog.filter(c => c.programType === 'workshop').slice(0, 3);
    }
    
    // For 'All', try to show a mix
    const cohorts = summary.catalog.filter(c => c.programType === 'cohort');
    const workshops = summary.catalog.filter(c => c.programType === 'workshop');
    
    const mix: any[] = [];
    if (cohorts.length > 0) mix.push(cohorts[0]);
    if (workshops.length > 0) mix.push(workshops[0]);
    
    // Fill the rest up to 3 if we don't have all types (excluding ondemand temporarily)
    const remaining = summary.catalog.filter(c => c.programType !== 'ondemand' && !mix.find(m => m.id === c.id));
    return [...mix, ...remaining].slice(0, 3);
  }, [summary, activeFilter]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = () => setSortOpen(false);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <div className="animate-fade-in relative z-0 pb-16">
      {/* Search Bar & Header - Only show if not in Cohorts tab */}
      {activeFilter !== 'Cohorts' && (
        <>
          <div className="mb-6 relative w-full sm:max-w-sm">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-retro-teal/60"></i>
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full bg-white border border-retro-sage/20 rounded-full py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-retro-salmon shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-2">
            <div>
              <p className="text-sm text-retro-teal/60 mt-1 font-medium">Manage and continue your learning</p>
            </div>
            <div className="bg-gray-200 text-retro-teal py-1 px-4 rounded-full text-xs md:text-sm font-bold">
              {mappedCourses.length} Active Courses
            </div>
          </div>
        </>
      )}

      {/* Filter Pills - Always visible */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`py-2 px-4 rounded-full text-xs font-semibold transition-colors border ${activeFilter === f ? 'bg-dark-text text-white border-dark-text' : 'bg-white text-retro-teal/60 border-border-soft hover:bg-gray-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area - Grid with consistent sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8">
        <div>
          {activeFilter === 'Cohorts' ? (
            <div className="mt-4">
              <CohortsView hideSidebar={true} />
            </div>
          ) : activeFilter === 'On-demand' ? (
            <div className="mt-8 bg-white rounded-[2rem] p-12 shadow-sm border border-retro-sage/20 flex flex-col items-center justify-center text-center min-h-[40vh]">
              <div className="inline-flex items-center justify-center p-6 bg-[#FBE9D0]/50 rounded-full mb-8 text-[#E64833] animate-pulse ring-8 ring-[#FBE9D0]/20">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-extrabold text-[#244855] mb-4">On-Demand Upgrading</h3>
              <p className="text-lg text-[#244855]/70 max-w-lg mx-auto leading-relaxed">
                We are currently crafting new, cutting-edge on-demand learning experiences. Your enrolled on-demand courses will be available here soon.
              </p>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold text-retro-teal mb-5">Continue Learning</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                {activeCourses.map((course: any, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-retro-sage/20 flex flex-col">
                    <p className="text-xs text-retro-salmon font-bold mb-2">
                      {course.tag}
                    </p>
                    <h4 className="text-lg font-bold mb-4">{course.title}</h4>
                    <div className="h-[120px] rounded-lg bg-cover bg-center mb-4 bg-gray-100 flex items-center justify-center">
                      <i className={`fas ${course.tag.toLowerCase().includes('on-demand') ? 'fa-play-circle' : 'fa-users'} text-gray-300 text-4xl`}></i>
                    </div>
                    <div className="h-[8px] bg-gray-200 rounded-full w-full mb-2"><div className="h-full bg-retro-cyan rounded-full" style={{ width: `${course.progress}%` }}></div></div>
                    <div className="flex justify-between text-xs font-bold mb-2"><span>Completion %</span><span>{course.progress}%</span></div>
                    <p className="text-retro-salmon text-xs font-bold">
                      In Progress
                    </p>
                    <button 
                      onClick={() => {
                        const target = resolveCourseTarget(course);
                        if (target) setLocation(target);
                      }}
                      className="w-full mt-4 bg-retro-salmon text-white py-2 rounded-lg font-bold hover:shadow-md transition-all shadow-sm"
                    >
                      Resume Learning
                    </button>
                  </div>
                ))}
                {activeCourses.length === 0 && !isLoading && (
                  <div className="col-span-2 py-8 px-4 text-center bg-white rounded-2xl border border-dashed border-border-soft">
                    <p className="text-retro-teal/60 font-medium text-sm">No active courses found in this category.</p>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold text-retro-teal mb-5">Completed Courses</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourses.map(course => (
                  <div key={course.id} className="bg-white rounded-2xl p-5 shadow-sm border border-retro-sage/20 flex flex-col min-h-[250px] justify-between transition-transform hover:-translate-y-1">
                    <div>
                      <div className="flex justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg border border-retro-sage/20 bg-center bg-contain bg-no-repeat" style={{ backgroundImage: `url('${course.icon}')` }}></div>
                        <i className="fas fa-ellipsis-v text-retro-teal/60 cursor-pointer hover:text-retro-teal p-2"></i>
                      </div>
                      <h4 className="font-bold text-[1.05rem] mb-2 leading-tight">{course.title}</h4>
                      <p className="text-[0.8rem] text-retro-teal/60 leading-relaxed font-medium mb-4">{course.desc}</p>
                    </div>
                    <div>
                      <div className="h-[6px] bg-retro-cyan rounded-full w-full mb-3"></div>
                      <p className="text-[0.7rem] text-retro-teal/60 mb-3">Completed</p>
                      <div className="flex justify-between items-center">
                        <span className={`text-[0.75rem] font-bold px-2 py-1 rounded bg-gray-100 text-gray-700`}>{course.tag}</span>
                        <button 
                          onClick={() => {
                            const target = resolveCourseTarget(course);
                            if (target) setLocation(target);
                          }}
                          className={`bg-retro-salmon text-white border-none py-1.5 px-4 text-xs font-bold rounded hover:opacity-90`}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {completedCourses.length === 0 && !isLoading && (
                  <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-border-soft">
                    <p className="text-retro-teal/60 font-medium">You haven't completed any courses in this category yet.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <aside>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-retro-sage/20 mb-6">
            <h3 className="text-lg font-bold mb-6">Learning Summary</h3>
            <div className="flex justify-between mb-4"><span className="text-retro-teal/60 text-sm font-medium">Enrolled courses</span><span className="text-2xl font-bold font-sans">{mappedCourses.length}</span></div>
            <div className="flex justify-between mb-4"><span className="text-retro-teal/60 text-sm font-medium">Completed courses</span><span className="text-2xl font-bold font-sans">{mappedCourses.filter(c => c.progress === 100).length}</span></div>
            <div className="flex justify-between items-end mt-4 mb-2">
              <p className="text-sm text-retro-teal/60 font-semibold">Average progress</p>
              <p className="text-sm font-bold text-retro-teal">
                {mappedCourses.length > 0 
                  ? Math.round(mappedCourses.reduce((acc, c) => acc + (c.progress || 0), 0) / mappedCourses.length) 
                  : 0}%
              </p>
            </div>
            
            <div className="flex items-end gap-1.5 h-[60px] opacity-80 pt-2">
              {[...Array(6)].map((_, i) => {
                const course = mappedCourses[i];
                const progress = course ? (course.progress || 2) : 2; // Min 2% for visibility
                const isActive = !!course;
                
                return (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-t-sm transition-all duration-1000 ease-out ${isActive ? 'bg-retro-teal' : 'bg-gray-100'}`}
                    style={{ height: `${Math.max(progress, 5)}%` }}
                  ></div>
                );
              })}
            </div>
          </div>

          {displayRecommendations.length > 0 && (
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 shadow-lg border border-slate-700/50 group hover:shadow-xl hover:shadow-[#E84E36]/10 transition-all duration-300">
              {/* Background accent */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-[#E84E36]/20 rounded-full blur-2xl group-hover:bg-[#E84E36]/30 transition-all duration-500"></div>
              
              <div className="flex items-center gap-2 mb-6 relative z-10">
                <div className="w-8 h-8 rounded-full bg-[#E84E36]/20 flex items-center justify-center">
                  <i className="fas fa-star text-[#E84E36] text-sm"></i>
                </div>
                <h3 className="text-base font-bold text-white tracking-wide">Recommended For You</h3>
              </div>
              
              <div className="space-y-4 relative z-10">
                {displayRecommendations.map((course, idx) => (
                  <div key={idx} className="group/item flex flex-col gap-3 pb-4 border-b border-slate-700/50 last:border-0 last:pb-0">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${
                          course.programType === 'cohort' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 
                          course.programType === 'ondemand' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {course.programType === 'ondemand' ? 'On-Demand' : course.programType}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">
                          {course.category || 'General'}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm leading-snug line-clamp-2">{course.title}</h4>
                    </div>
                    
                    <button 
                      onClick={() => setLocation(course.programType === 'ondemand' ? `/ondemand/${course.courseSlug || course.courseId}` : `/course/${course.courseSlug || course.courseId}`)}
                      className="w-full bg-slate-800/50 border border-slate-600/50 text-slate-200 font-bold py-2 rounded-lg hover:bg-[#E84E36] hover:text-white hover:border-[#E84E36] transition-all duration-300 shadow-sm flex items-center justify-center gap-2 text-sm mt-1"
                    >
                      <span>View Details</span>
                      <i className="fas fa-arrow-right text-xs group-hover/item:translate-x-1 transition-transform"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
