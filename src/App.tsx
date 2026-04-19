import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { VendorLayout } from './components/layout/VendorLayout'
import { CustomerLayout } from './components/layout/CustomerLayout'
import { AuthGuard, VendorGuard } from './components/auth/AuthGuard'

import { HomePage } from './pages/public/HomePage'
import { SearchPage } from './pages/public/SearchPage'
import { VendorProfilePage } from './pages/public/VendorProfilePage'
import { JoinPage } from './pages/public/JoinPage'
import { AboutPage } from './pages/public/AboutPage'
import { BudgetMatcherPage } from './pages/public/BudgetMatcherPage'
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/vendors/:id" element={<VendorProfilePage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/budget-matcher" element={<BudgetMatcherPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
            <Route path="/vendor/settings" element={<VendorSettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
