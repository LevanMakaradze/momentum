import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import NewTask from "./pages/NewTask";
import Task from "./pages/Task";
import "@fontsource/fredoka-one";
import { useState } from "react";
function App() {
  const [employeeRefreshTrigger, setEmployeeRefreshTrigger] = useState(0);

  // Function to handle employee added
  const handleEmployeeAdded = () => {
    setEmployeeRefreshTrigger((prev) => prev + 1);
  };

  return (
    <BrowserRouter basename="/momentum/">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header onEmployeeAdded={handleEmployeeAdded}  />
              <Dashboard refreshTrigger={employeeRefreshTrigger} />
            </>
          }
        />
        <Route
          path="/NewTask"
          element={
            <>
              <Header onEmployeeAdded={handleEmployeeAdded} />
              <NewTask refreshTrigger={employeeRefreshTrigger}/>
            </>
          }
        />
        <Route
          path="/Task/:taskId"
          element={
            <>
              <Header onEmployeeAdded={handleEmployeeAdded} />
              <Task />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
