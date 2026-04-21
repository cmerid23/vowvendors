import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { VendorLayout } from './components/layout/VendorLayout'
import { CustomerLayout } from './components/layout/CustomerLayout'
import { AuthGuard, VendorGuard } from './components/auth/AuthGuard'
import { useAuthListener } from './hooks/useAuth'

function AuthInit() {
  useAuthListener()
  return null
}

import { HomePage } from './pages/public/HomePage'
import { SearchPage } from './pages/public/SearchPage'
import { VendorProfilePage } from './pages/public/VendorProfilePage'
import { JoinPage } from './pages/public/JoinPage'
import { AboutPage } from './pages/public/AboutPage'
import { BudgetMatcherPage } from './pages/public/BudgetMatcherPage'
import { StyleQuizPage } from './pages/public/StyleQuizPage'
import { WedPoseLanding } from './pages/public/WedPoseLanding'
import { PublicWedPoseHome } from './pages/public/wedpose/PublicWedPoseHome'
import { PublicWedPoseCategory } from './pages/public/wedpose/PublicWedPoseCategory'
import { WedPoseShotList } from './pages/public/wedpose/WedPoseShotList'
import { WedPoseLayout } from './features/wedpose/components/layout/WedPoseLayout'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { CustomerFavoritesPage } from './pages/customer/CustomerFavoritesPage'
import { CustomerInquiriesPage } from './pages/customer/CustomerInquiriesPage'
import { CustomerProfilePage } from './pages/customer/CustomerProfilePage'
import { VendorOverviewPage } from './pages/vendor/VendorOverviewPage'
import { VendorProfileEditorPage } from './pages/vendor/VendorProfileEditorPage'
import { VendorPortfolioPage } from './pages/vendor/VendorPortfolioPage'
import { VendorInquiriesPage } from './pages/vendor/VendorInquiriesPage'
import { VendorChatPage } from './pages/vendor/VendorChatPage'
import { VendorWedPosePage } from './pages/vendor/VendorWedPosePage'
import { VendorSettingsPage } from './pages/vendor/VendorSettingsPage'
import VendorAvailabilityPage from './pages/vendor/VendorAvailabilityPage'
import { VendorGalleriesPage } from './pages/vendor/VendorGalleriesPage'
import { VendorGalleryDetailPage } from './pages/vendor/VendorGalleryDetailPage'
import { GalleryViewPage } from './pages/public/GalleryViewPage'
import { VendorContractsPage } from './pages/vendor/VendorContractsPage'
import { VendorContractBuilderPage } from './pages/vendor/VendorContractBuilderPage'
import { ContractSigningPage } from './features/contracts/pages/ContractSigningPage'
import { WeddingHubPage } from './features/hub/pages/WeddingHubPage'
import { HubCreator } from './features/hub/pages/HubCreator'
import { HubDashboard } from './features/hub/pages/HubDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <AuthInit />
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/vendors/:id" element={<VendorProfilePage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/budget-matcher" element={<BudgetMatcherPage />} />
          <Route path="/style-quiz" element={<StyleQuizPage />} />
          <Route path="/wedpose" element={<WedPoseLanding />} />
          <Route path="/gallery/:slug" element={<GalleryViewPage />} />
          <Route path="/sign/:contractId" element={<ContractSigningPage />} />
          <Route path="/wedding/:accessCode" element={<WeddingHubPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Public WedPose browsing — own dark layout, no AppShell */}
        <Route element={<WedPoseLayout />}>
          <Route path="/wedpose/poses" element={<PublicWedPoseHome />} />
          <Route path="/wedpose/poses/:categoryId" element={<PublicWedPoseCategory />} />
          <Route path="/wedpose/shot-list" element={<WedPoseShotList />} />
        </Route>

        <Route element={<AuthGuard />}>
          <Route element={<CustomerLayout />}>
            <Route path="/dashboard" element={<CustomerFavoritesPage />} />
            <Route path="/dashboard/inquiries" element={<CustomerInquiriesPage />} />
            <Route path="/dashboard/profile" element={<CustomerProfilePage />} />
          </Route>
        </Route>

        <Route element={<VendorGuard />}>
          <Route element={<VendorLayout />}>
            <Route path="/vendor/overview" element={<VendorOverviewPage />} />
            <Route path="/vendor/profile" element={<VendorProfileEditorPage />} />
            <Route path="/vendor/portfolio" element={<VendorPortfolioPage />} />
            <Route path="/vendor/inquiries" element={<VendorInquiriesPage />} />
            <Route path="/vendor/chat/:conversationId" element={<VendorChatPage />} />
            <Route path="/vendor/wedpose/*" element={<VendorWedPosePage />} />
            <Route path="/vendor/availability" element={<VendorAvailabilityPage />} />
            <Route path="/vendor/galleries" element={<VendorGalleriesPage />} />
            <Route path="/vendor/galleries/:galleryId" element={<VendorGalleryDetailPage />} />
            <Route path="/vendor/contracts" element={<VendorContractsPage />} />
            <Route path="/vendor/contracts/new" element={<VendorContractBuilderPage />} />
            <Route path="/vendor/contracts/:contractId/edit" element={<VendorContractBuilderPage />} />
            <Route path="/vendor/hub/new" element={<HubCreator />} />
            <Route path="/vendor/hub/:hubId" element={<HubDashboard />} />
            <Route path="/vendor/settings" element={<VendorSettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
