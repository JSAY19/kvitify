import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute, RequireOnboarding } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { ProgressPage } from './pages/ProgressPage';
import { ProfilePage } from './pages/ProfilePage';
import { AchievementsPage } from './pages/AchievementsPage';
import { BreathingPage } from './pages/BreathingPage';
import { JournalPage } from './pages/JournalPage';
import { CommunityPage } from './pages/CommunityPage';
import { CravingPage } from './pages/CravingPage';
import { NotFoundPage, ForbiddenPage, ServerErrorPage, ErrorPage } from './pages/ErrorPage';
import { useUIStore } from './stores/uiStore';
import { useAuthStore } from './stores/authStore';

export function App() {
  const darkMode = useUIStore((s) => s.darkMode);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const user = useAuthStore((s) => s.user);
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (hydrated && user) fetchMe();
  }, [hydrated, user, fetchMe]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
        Загрузка…
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          className: '!bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-slate-100 !shadow-lg !rounded-xl !text-sm',
          duration: 3000,
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          element={
            <RequireOnboarding>
              <AppShell />
            </RequireOnboarding>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/breathing" element={<BreathingPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/craving" element={<CravingPage />} />
        </Route>
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="/429" element={<ErrorPage status={429} showReload />} />
        <Route path="/503" element={<ErrorPage status={503} showReload />} />
        <Route path="/418" element={<ErrorPage status={418} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
