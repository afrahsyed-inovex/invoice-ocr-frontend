import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import MunhimPage from './pages/MunhimPage';
import UsmanPage from './pages/UsmanPage';
import { ROUTES } from './routes';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to={ROUTES.munhim} replace />} />
        <Route path={ROUTES.munhim} element={<MunhimPage />} />
        <Route path={ROUTES.usman} element={<UsmanPage />} />
        <Route path="*" element={<Navigate to={ROUTES.munhim} replace />} />
      </Route>
    </Routes>
  );
}
