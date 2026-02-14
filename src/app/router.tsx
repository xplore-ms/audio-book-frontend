import { Routes, Route } from 'react-router-dom';
import HomeView from '../pages/HomeView';
import HowItWorks from '../pages/HowItWorks';
import StoreView from '../pages/StoreView';
import LibraryView from '../pages/LibraryViewNew';
import MyLibraryView from '../pages/MyLibraryViewNew';
import ConfigureJobView from '../pages/ConfigureJobView';
import { SignIn, SignUp } from '../components/Auth/AuthForms';
import VerifyPayment from '../pages/VerifyPayment';
import AudiobookPagesView from '../pages/AudiobookPagesView';
import AudiobookPlayerView from '../pages/AudiobookPlayerView';
import ProtectedRoute from '../components/Protected';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><HomeView /></ProtectedRoute>} />
      <Route path="/library" element={<ProtectedRoute><LibraryView /></ProtectedRoute>} />
      <Route path="/my-library" element={<ProtectedRoute><MyLibraryView /></ProtectedRoute>} />
      <Route path="/public-library/:jobId" element={<ProtectedRoute><AudiobookPagesView mode='public'/></ProtectedRoute>} />
      <Route path="/my-library/:jobId" element={<ProtectedRoute><AudiobookPlayerView mode='private' /></ProtectedRoute>} />
      <Route path="/shared/:jobId" element={<ProtectedRoute><AudiobookPlayerView mode='private' /></ProtectedRoute>} />
      <Route path="/configure/:jobId" element={<ProtectedRoute><ConfigureJobView /></ProtectedRoute>} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/payment/verify" element={<ProtectedRoute><VerifyPayment /></ProtectedRoute>} />
      <Route path="/store" element={<ProtectedRoute><StoreView /></ProtectedRoute>} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
}
