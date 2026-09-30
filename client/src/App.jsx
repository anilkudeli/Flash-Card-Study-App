import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AppShell from './components/AppShell.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import AuthPage from './pages/AuthPage.jsx';
import PasswordResetPage from './pages/PasswordResetPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Decks from './pages/Decks.jsx';
import DeckDetail from './pages/DeckDetail.jsx';
import Study from './pages/Study.jsx';
import Progress from './pages/Progress.jsx';

function HomeRoute() {
  const { user } = useAuth();
  return <AppShell>{user ? <Dashboard /> : <Home />}</AppShell>;
}

function Page({ children }) {
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return <Routes>
    <Route path="/" element={<HomeRoute />} />
    <Route path="/login" element={<Page><AuthPage mode="login" /></Page>} />
    <Route path="/register" element={<Page><AuthPage mode="register" /></Page>} />
    <Route path="/forgot-password" element={<Page><PasswordResetPage mode="request" /></Page>} />
    <Route path="/reset-password" element={<Page><PasswordResetPage mode="reset" /></Page>} />
    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/decks" element={<Page><Decks /></Page>} />
      <Route path="/decks/:deckId" element={<Page><DeckDetail /></Page>} />
      <Route path="/study" element={<Page><Study /></Page>} />
      <Route path="/study/:deckId" element={<Page><Study /></Page>} />
      <Route path="/progress" element={<Page><Progress /></Page>} />
    </Route>
    <Route path="*" element={<Page><section className="not-found"><p className="eyebrow">404 · PAGE NOT FOUND</p><h1>That card isn’t in this deck.</h1><a className="button" href="/">Back to home</a></section></Page>} />
  </Routes>;
}
