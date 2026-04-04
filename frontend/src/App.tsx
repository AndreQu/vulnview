import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CVEs } from './pages/CVEs';
import { Dashboard } from './pages/Dashboard';
import { Devices } from './pages/Devices';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/cves" element={<CVEs />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
