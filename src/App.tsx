import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { AppLayout } from './components/Layout'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Cases = lazy(() => import('./pages/Cases'))
const CaseDetail = lazy(() => import('./pages/CaseDetail'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const MyAnalyses = lazy(() => import('./pages/MyAnalyses'))
const Reports = lazy(() => import('./pages/Reports'))
const Achievements = lazy(() => import('./pages/Achievements'))
const Settings = lazy(() => import('./pages/Settings'))
const AnalysisLayout = lazy(() => import('./pages/AnalysisLayout'))
const Investigation = lazy(() => import('./pages/analysis/Investigation'))
const Problems = lazy(() => import('./pages/analysis/Problems'))
const Requirements = lazy(() => import('./pages/analysis/Requirements'))
const Modeling = lazy(() => import('./pages/analysis/Modeling'))
const Solution = lazy(() => import('./pages/analysis/Solution'))
const Evaluation = lazy(() => import('./pages/analysis/Evaluation'))
const Report = lazy(() => import('./pages/analysis/Report'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Login = lazy(() => import('./pages/Login'))
const SignUp = lazy(() => import('./pages/SignUp'))
const CaseForm = lazy(() => import('./pages/admin/CaseForm'))

function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label="Loading page">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
    </div>
  )
}

/** Everything behind this gate requires a signed-in account (local, no backend). */
function RequireAuth() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

/** Auth screens are for guests only — signed-in users go to the dashboard. */
function PublicOnly() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

/** Case authoring is restricted to admin/developer users (Level 5). */
function RequireAdmin() {
  const { isAdmin } = useApp()
  if (!isAdmin) return <Navigate to="/cases" replace />
  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<PublicOnly />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                </Route>
                <Route element={<RequireAuth />}>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/cases" element={<Cases />} />
                    <Route path="/cases/:id" element={<CaseDetail />} />
                    <Route path="/my-analyses" element={<MyAnalyses />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/achievements" element={<Achievements />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route element={<RequireAdmin />}>
                      <Route path="/admin/cases/new" element={<CaseForm />} />
                      <Route path="/admin/cases/:id/edit" element={<CaseForm />} />
                    </Route>
                    <Route path="/analysis/:id" element={<AnalysisLayout />}>
                      <Route index element={<Investigation />} />
                      <Route path="investigation" element={<Investigation />} />
                      <Route path="problems" element={<Problems />} />
                      <Route path="requirements" element={<Requirements />} />
                      <Route path="modeling" element={<Modeling />} />
                      <Route path="solution" element={<Solution />} />
                      <Route path="evaluation" element={<Evaluation />} />
                      <Route path="report" element={<Report />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </AppProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
