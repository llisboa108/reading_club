import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import BillingPage from "./pages/Billing/BillingPage";
import PaymentConfirmationsPage from "./pages/Billing/PaymentConfirmationsPage";
import MembersPage from "./pages/Members/MembersPage";
import PlansPage from "./pages/Plans/PlansPage";
import ProtectedRoute from "./components/ProtectedRoute";

import BooksPage from "./pages/Books/BooksPage";
import BookDetailPage from "./pages/Books/BookDetailPage";
import AuthorsPublishersPage from "./pages/Catalog/AuthorsPublishersPage";
import ReadingsPage from "./pages/Readings/ReadingsPage";
import ReadingDetailPage from "./pages/Readings/Readingdetailpage";
import MeetsPage from "./pages/Meets/MeetsPage";
import BlogPage from "./pages/Blog/BlogPage";
import BlogDetailPage from "./pages/Blog/BlogDetailPage";
import LandingPage from "./pages/Landing/LandingPage";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public marketing site */}
          <Route path="/" element={<LandingPage />} />

          {/* Dashboard Layout */}
          <Route element={ <ProtectedRoute> <AppLayout /> </ProtectedRoute> } >
            <Route path="/dashboard" element={<Home />} />

            {/* Club pages */}
            <Route path="/books" element={<BooksPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/catalog" element={<AuthorsPublishersPage />} />
            <Route path="/readings" element={<ReadingsPage />} />
            <Route path="/readings/:id" element={<ReadingDetailPage />} />
            <Route path="/meets" element={<MeetsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/billing/confirmations" element={<PaymentConfirmationsPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/plans" element={<PlansPage />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
