import { Routes, Route } from 'react-router-dom';
import HomeView from './components/HomeView';
import HowItWorks from './components/HowItWorks';
import StoreView from './components/StoreView';
import LibraryView from './components/LibraryViewNew';
import MyLibraryView from './components/MyLibraryViewNew';
import ConfigureJobView from './components/ConfigureJobView';
import { SignIn, SignUp } from './components/Auth/AuthForms';
import VerifyPayment from './components/VerifyPayment';
import AudiobookPagesView from './components/AudiobookPagesView';
import AudiobookPlayerView from './components/AudiobookPlayerView';
import ProtectedRoute from './components/Protected';
import AppLayout from './components/layout/AppLayout';

export default function App() {
  return (
    <AppLayout>
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
    </AppLayout>
  );
}