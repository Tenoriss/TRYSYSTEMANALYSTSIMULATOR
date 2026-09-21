import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
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

function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label="Loading page">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
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
            </Routes>
          </Suspense>
        </AppProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
