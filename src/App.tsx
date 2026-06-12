import { Switch, Route, useLocation } from "wouter";
import { buildApiUrl } from "@/lib/api";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "@/components/layout/ScrollToTop";
import {
  clearPostLoginRedirect,
  ensureSessionFresh,
  readPostLoginRedirect,
  readStoredSession,
  resetSessionHeartbeat,
  savePostLoginRedirect,
  subscribeToSession,
  subscribeToSessionExpired,
  type SessionExpiredPayload,
} from "@/utils/session";
import { redirectToGoogleOAuth } from "@/utils/auth";
import Navbar from "@/components/layout/Navbar";
import NotFound from "@/pages/not-found";
import AssessmentPage from "@/pages/AssessmentPage";
import EnrollmentPage from "@/pages/EnrollmentPage";
import CoursePlayerPage from "@/pages/CoursePlayerPage";
import OnDemandPlayerPage from "@/pages/OnDemandPlayerPage";
import CongratsPage from "@/pages/CongratsPage";
import CongratsFeedbackPage from "@/pages/CongratsFeedbackPage";
import CourseCertificatePage from "@/pages/CourseCertificatePage";
import LandingPage from "@/pages/LandingPage";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import CourseDetailsPage from "@/pages/CourseDetailsPage";

import CohortPage from "@/pages/CohortPage";
import OnDemandPage from "@/pages/OnDemandPage";
import WorkshopPage from "@/pages/WorkshopPage";
import WorkshopDetailsPage from "@/pages/WorkshopDetailsPage";
import RegistrationPage from "@/pages/RegistrationPage";

import MethodologyPage from "@/pages/MethodologyPage";
import MoreInfoPage from "@/pages/MoreInfoPage";
import BlogsPage from "@/pages/BlogsPage";
import BlogDetailPage from "@/pages/BlogDetailPage";

// Student Dashboard Components
import { Layout as DashboardLayout } from "@/pages/StudentDashboard/components/Layout";
import { Home as DashboardHome } from "@/pages/StudentDashboard/pages/Home";
import { MyCourses as DashboardMyCourses } from "@/pages/StudentDashboard/pages/MyCourses";
import { Leaderboard as DashboardLeaderboard } from "@/pages/StudentDashboard/pages/Leaderboard";
import { Assignments as DashboardAssignments } from "@/pages/StudentDashboard/pages/Assignments";
import DashboardMessages from "@/pages/StudentDashboard/pages/messaging/MessagingModule";
import { Certificates as DashboardCertificates } from "@/pages/StudentDashboard/pages/Certificates";
import { Profile as DashboardProfile } from "@/pages/StudentDashboard/pages/Profile";
import { LiveSessions as DashboardLiveSessions } from "@/pages/StudentDashboard/pages/LiveSessions";
import { ThemeProvider } from "@/contexts/ThemeContext";

function DashboardRoute({ component: Component }: { component: React.ComponentType }) {

  return (
    <DashboardLayout>
      <Component />
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/become-a-tutor">
        {() => {
          window.location.replace("https://expert.ottobon.in/");
          return null;
        }}
      </Route>
      <Route path="/methodology" component={MethodologyPage} />
      <Route path="/more-info" component={MoreInfoPage} />
      <Route path="/our-courses/cohort" component={CohortPage} />
      <Route path="/our-courses/on-demand" component={OnDemandPage} />
      <Route path="/our-courses/workshops" component={WorkshopPage} />

      {/* Registration Routes - Most specific first */}
      <Route path="/registration/:programType/:courseSlug/success" component={RegistrationPage} />
      <Route path="/registration/:programType/:courseSlug/payment" component={RegistrationPage} />
      <Route path="/registration/:programType/:courseSlug/assessment" component={RegistrationPage} />
      <Route path="/registration/:programType/:courseSlug" component={RegistrationPage} />
      <Route path="/registration/:programType" component={RegistrationPage} />
      <Route path="/registration" component={RegistrationPage} />

      {/* Course Routes */}
      <Route path="/course/:id/assessment" component={AssessmentPage} />
      <Route path="/course/:id/enroll" component={EnrollmentPage} />
      <Route path="/course/:id/learn/:lesson">
        {() => <CoursePlayerPage />}
      </Route>
      <Route path="/ondemand/:id/learn/:lesson" component={OnDemandPlayerPage} />
      <Route path="/ondemand/:id/congrats/certificate" component={CourseCertificatePage} />
      <Route path="/ondemand/:id/congrats/feedback" component={CongratsFeedbackPage} />
      <Route path="/ondemand/:id/congrats" component={CongratsPage} />
      <Route path="/course/:id/congrats/certificate" component={CourseCertificatePage} />
      <Route path="/course/:id/congrats/feedback" component={CongratsFeedbackPage} />
      <Route path="/course/:id/congrats" component={CongratsPage} />
      <Route path="/course/:id" component={CourseDetailsPage} />
      <Route path="/ondemand/:id" component={CourseDetailsPage} />
      <Route path="/workshop/:id" component={WorkshopDetailsPage} />
      <Route path="/workshop">
        {() => {
          window.location.replace("/our-courses/workshops");
          return null;
        }}
      </Route>

      {/* Student Dashboard Routes - Unified into App.tsx */}
      <Route path="/student-dashboard">
        <DashboardRoute component={DashboardHome} />
      </Route>
      <Route path="/student_dashboard">
        <DashboardRoute component={DashboardHome} />
      </Route>
      <Route path="/my-courses">
        <DashboardRoute component={DashboardMyCourses} />
      </Route>
      <Route path="/live-sessions">
        <DashboardRoute component={DashboardLiveSessions} />
      </Route>
      <Route path="/leaderboard">
        <DashboardRoute component={DashboardLeaderboard} />
      </Route>
      <Route path="/assignments">
        <DashboardRoute component={DashboardAssignments} />
      </Route>
      <Route path="/messages">
        <DashboardRoute component={DashboardMessages} />
      </Route>
      <Route path="/certificates">
        <DashboardRoute component={DashboardCertificates} />
      </Route>
      <Route path="/profile">
        <DashboardRoute component={DashboardProfile} />
      </Route>

      {/* Legacy Dashboard Redirect */}
      <Route path="/dashboard">
        {() => {
          window.location.replace("/student-dashboard");
          return null;
        }}
      </Route>

      <Route path="/auth/callback" component={AuthCallbackPage} />


      <Route path="/blogs" component={BlogsPage} />
      <Route path="/blogs/:id" component={BlogDetailPage} />

      {/* Default route goes to dashboard */}
      <Route path="/" component={LandingPage} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}


function App({ isAuthenticated, user, setIsAuthenticated, setUser }: any) {
  const [location] = useLocation();
  const [sessionExpired, setSessionExpired] = useState<SessionExpiredPayload | null>(null);
  const shouldHideNavbar =
    location === "/course" ||
    location.startsWith("/course/") ||
    location.startsWith("/ondemand/") ||
    location.startsWith("/registration");

  const isProtectedRoute =
    location === "/student-dashboard" ||
    location === "/student_dashboard" ||
    location === "/my-courses" ||
    location === "/live-sessions" ||
    location === "/leaderboard" ||
    location === "/assignments" ||
    location === "/messages" ||
    location === "/certificates" ||
    location === "/profile" ||
    location.startsWith("/course/") ||
    location.startsWith("/ondemand/");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const isAuthCallback = () => window.location.pathname === "/auth/callback";

    const unsubscribe = subscribeToSession((session) => {
      if (session?.accessToken) {
        clearPostLoginRedirect();
        setSessionExpired(null);
        return;
      }
    });

    const unsubscribeExpired = subscribeToSessionExpired((payload) => {
      if (!isAuthCallback()) {
        setSessionExpired(payload);
      }
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isAuthCallback()) {
        resetSessionHeartbeat();
      }
    };

    const handleFocus = () => {
      if (!isAuthCallback()) {
        resetSessionHeartbeat();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      unsubscribe();
      unsubscribeExpired();
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!isProtectedRoute) {
      return;
    }

    if (typeof window === "undefined" || window.location.pathname === "/auth/callback") {
      return;
    }

    const storedAuth = window.localStorage.getItem("isAuthenticated") === "true";
    if (!storedAuth) {
      return;
    }

    let mounted = true;
    void ensureSessionFresh(readStoredSession(), { notifyOnFailure: false }).then((session) => {
      if (!mounted) {
        return;
      }
      if (!session) {
        const redirectPath = readPostLoginRedirect() ?? savePostLoginRedirect();
        setSessionExpired({ reason: "refresh_failed", redirectPath });
      }
    });

    return () => {
      mounted = false;
    };
  }, [isProtectedRoute, location]);

  const handleLoginAgain = () => {
    const redirectPath = savePostLoginRedirect(sessionExpired?.redirectPath ?? location);
    redirectToGoogleOAuth(redirectPath);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <ScrollToTop />
          <Toaster />
          {!shouldHideNavbar && (
            <Navbar
              onLogin={() => {
                const homeRedirect = '/student-dashboard';
                savePostLoginRedirect(homeRedirect);
                // Use buildApiUrl to ensure we target the correct backend port (4000)
                const target = `${buildApiUrl('/auth/google')}?redirect=${encodeURIComponent(homeRedirect)}`;
                window.location.href = target;
              }}
              onApplyTutor={() => window.location.href = 'https://expert.ottobon.in/'}
              isAuthenticated={isAuthenticated}
              user={user ?? undefined}
              onLogout={() => {
                localStorage.removeItem('session');
                localStorage.removeItem('user');
                localStorage.setItem('isAuthenticated', 'false');
                setIsAuthenticated(false);
                setUser(null);
                window.location.href = '/';
              }}
            />
          )}
          <Router />
          {sessionExpired && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4">
              <div className="w-full max-w-md rounded-2xl border border-[#f3d3c2] bg-white p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-[#1f2937]">Session expired</h2>
                <p className="mt-2 text-sm text-[#4b5563] leading-relaxed">
                  Your session has expired. Sign in again to continue, and you will be returned to the same page.
                </p>
                <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={handleLoginAgain}
                    className="rounded-xl bg-[#E64833] px-4 py-2 text-sm font-bold text-white hover:brightness-110 transition"
                  >
                    Login again
                  </button>
                </div>
              </div>
            </div>
          )}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AppWithState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ fullName?: string; email?: string; picture?: string } | null>(null);

  useEffect(() => {
    // Check initial auth
    const init = async () => {
      const session = await readStoredSession();
      if (session?.accessToken) {
        setIsAuthenticated(true);
        const u = localStorage.getItem('user');
        if (u) setUser(JSON.parse(u));
      } else {
        // Fallback to purely local storage if session check fails or is simpler
        const storedAuth = localStorage.getItem('isAuthenticated') === 'true';
        const storedUser = localStorage.getItem('user');
        if (storedAuth && storedUser) {
          setIsAuthenticated(true);
          setUser(JSON.parse(storedUser));
        }
      }
    }
    init();

    // Subscribe to changes
    const unsubscribe = subscribeToSession((session) => {
      if (session?.accessToken) {
        setIsAuthenticated(true);
        // We might not get full user object from session update event depending on implementation
        // but we can try reading from LS
        const u = localStorage.getItem('user');
        if (u) setUser(JSON.parse(u));
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return <App isAuthenticated={isAuthenticated} user={user} setIsAuthenticated={setIsAuthenticated} setUser={setUser} />;
}

export default AppWithState;
