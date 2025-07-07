import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";

import Login from "./pages/Login";
import DashboardLayout from "./components/atomic/dashboardLayout/DashboardLayout";
import { PMDashboard } from "./components/PMDashboard";
import { AuthProvider } from "./contexts/AuthContext";

import RoleProtectedRoute from "./components/atomic/protectedRoute/RoleProtectedRoute";
import { RFCDashboard } from "./components/RFCDashboard";
import { DocumentCenter } from "./components/DocumentCenter";
import { ProjectsDashboard } from "./components/ProjectsDashboard";
import { Deliverables } from "./components/Deliverables";
import { ProjectExecutionFlow } from "./components/ProjectExecutionFlow";
import TaskAssignmentPage from "./components/TaskAssignmentPage";
import { DocumentationDashboard } from "./components/DocumentationDashboard";
import { TeamActivity } from "./components/TeamActivity";
import { EstimationDashboard } from "./components/EstimationDashboard";
import { WorkerDashboard } from "./components/WorkerDashboard";
import Home from "./components/Home";
import MyTasks from "./components/MyTasks";
// Placeholder components for missing ones
const PMSettings = () => (
  <div className="p-8 text-2xl text-blue-800">[Settings Placeholder]</div>
);
const CommonCalendar = () => (
  <div className="p-8 text-2xl text-blue-800">
    [Common Calendar Placeholder]
  </div>
);

const queryClient = new QueryClient();

const dummyUser = { id: "", name: "", role: "", email: "", phone: "" };
const dummyUserRole = "";
const dummyProjectId = "";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* PM Team */}
            <Route path="/pm" element={<RoleProtectedRoute />}>
              <Route
                path=""
                element={
                  <DashboardLayout>
                    <ProjectsDashboard />
                  </DashboardLayout>
                }
              />
              
              <Route
                path="documents"
                element={
                  <DashboardLayout>
                    <DocumentCenter
                    
                    />
                  </DashboardLayout>
                }
              />
              <Route
                path="calendar"
                element={
                  <DashboardLayout>
                    <CommonCalendar />
                  </DashboardLayout>
                }
              />
              <Route
                path="my-task"
                element={
                  <DashboardLayout>
                    <MyTasks />
                  </DashboardLayout>
                }
              />
            </Route>

            {/* RFQ Team */}
            <Route path="/rfq" element={<RoleProtectedRoute />}>
              <Route
                path=""
                element={
                  <DashboardLayout>
                    <RFCDashboard />
                  </DashboardLayout>
                }
              />

              <Route
                path="documents"
                element={
                  <DashboardLayout>
                    <DocumentCenter />
                  </DashboardLayout>
                }
              />
              <Route
                path="calendar"
                element={
                  <DashboardLayout>
                    <CommonCalendar />
                  </DashboardLayout>
                }
              />
            </Route>

            {/* Estimation Department */}
            <Route path="/estimation" element={<RoleProtectedRoute />}>
              <Route
                path=""
                element={
                  <DashboardLayout>
                    <EstimationDashboard />
                  </DashboardLayout>
                }
              />
              <Route
                path="documents"
                element={
                  <DashboardLayout>
                    <DocumentCenter />
                  </DashboardLayout>
                }
              />
              <Route
                path="calendar"
                element={
                  <DashboardLayout>
                    <CommonCalendar />
                  </DashboardLayout>
                }
              />
            </Route>

            {/* Documentation Team */}
            <Route path="/documentation" element={<RoleProtectedRoute />}>
              <Route
                path=""
                element={
                  <DashboardLayout>
                    <DocumentationDashboard userRole={dummyUserRole} />
                  </DashboardLayout>
                }
              />
              <Route
                path="projects"
                element={
                  <DashboardLayout>
                    <ProjectsDashboard />
                  </DashboardLayout>
                }
              />
              <Route
                path="returned"
                element={
                  <DashboardLayout>
                    <ProjectExecutionFlow section="returned" user={dummyUser} />
                  </DashboardLayout>
                }
              />
              <Route
                path="outgoing"
                element={
                  <DashboardLayout>
                    <ProjectExecutionFlow section="outgoing" user={dummyUser} />
                  </DashboardLayout>
                }
              />
              <Route
                path="clientlog"
                element={
                  <DashboardLayout>
                    <ProjectExecutionFlow
                      section="clientlog"
                      user={dummyUser}
                    />
                  </DashboardLayout>
                }
              />
              <Route
                path="register"
                element={
                  <DashboardLayout>
                    <ProjectExecutionFlow section="register" user={dummyUser} />
                  </DashboardLayout>
                }
              />
            </Route>

            {/* Working Team */}
            <Route path="/worker" element={<RoleProtectedRoute />}>
              <Route
                path=""
                element={
                  <DashboardLayout>
                    <WorkerDashboard />
                  </DashboardLayout>
                }
              />
              <Route
                path="projects"
                element={
                  <DashboardLayout>
                    <ProjectsDashboard />
                  </DashboardLayout>
                }
              />
              <Route
                path="tasks"
                element={
                  <DashboardLayout>
                    <TaskAssignmentPage user={dummyUser} />
                  </DashboardLayout>
                }
              />
              <Route
                path="calendar"
                element={
                  <DashboardLayout>
                    <CommonCalendar />
                  </DashboardLayout>
                }
              />
            </Route>

            {/* Admin (example, can be expanded) */}
            <Route path="/admin" element={<RoleProtectedRoute />}>
              <Route
                path=""
                element={
                  <DashboardLayout>
                    <PMDashboard />
                  </DashboardLayout>
                }
              />
              <Route
                path="projects"
                element={
                  <DashboardLayout>
                    <ProjectsDashboard />
                  </DashboardLayout>
                }
              />
              <Route
                path="reports"
                element={
                  <DashboardLayout>
                    <ProjectExecutionFlow section="reports" user={dummyUser} />
                  </DashboardLayout>
                }
              />
              <Route
                path="archive"
                element={
                  <DashboardLayout>
                    <ProjectExecutionFlow section="archive" user={dummyUser} />
                  </DashboardLayout>
                }
              />
              <Route
                path="calendar"
                element={
                  <DashboardLayout>
                    <CommonCalendar />
                  </DashboardLayout>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
