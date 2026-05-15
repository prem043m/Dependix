import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import RepositoryDetails from "./pages/RepositoryDetails";
import QueueMonitoring from "./pages/QueueMonitoring";
import Governance from "./pages/Governance";
import Layout from "./components/layouts/Layout";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/governance" element={<Governance />} />
          <Route path="/repositories/:id" element={<RepositoryDetails />} />
          <Route path="/queues" element={<QueueMonitoring />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
