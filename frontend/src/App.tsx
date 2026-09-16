import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/useAuth'
import DashboardLayout from './pages/DashboardLayout'
import OverviewPage from './pages/dashboard/OverviewPage'
import TeamMembersPage from './pages/dashboard/TeamMembersPage'
import JoiningTasksPage from './pages/dashboard/JoiningTasksPage'
import JobOpeningsPage from './pages/dashboard/JobOpeningsPage'
import CandidatesPage from './pages/dashboard/CandidatesPage'
import InterviewsPage from './pages/dashboard/InterviewsPage'
import OffersPage from './pages/dashboard/OffersPage'
import BackgroundChecksPage from './pages/dashboard/BackgroundChecksPage'
import DocumentsPage from './pages/dashboard/DocumentsPage'
import TrainingPage from './pages/dashboard/TrainingPage'
import AssetsPage from './pages/dashboard/AssetsPage'
import FormsToolPage from './pages/dashboard/FormsToolPage'
import ApplyPage from './pages/ApplyPage'
import FormPage from './pages/FormPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/team-members" element={<TeamMembersPage />} />
            <Route path="/joining-tasks" element={<JoiningTasksPage />} />
            <Route path="/job-openings" element={<JobOpeningsPage />} />
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/interviews" element={<InterviewsPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/background-checks" element={<BackgroundChecksPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/forms" element={<FormsToolPage />} />
          </Route>
          <Route path="/apply" element={<ApplyPage />} />
          <Route path="/f/:token" element={<FormPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
