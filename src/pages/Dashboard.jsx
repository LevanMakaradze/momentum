import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

const API_TOKEN = import.meta.env.VITE_API_TOKEN;

const Dashboard = () => {
  // states
  const [tasks, setTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState({
    departments: [],
    priorities: [],
    employee: null,
  });
  const [selectedFilters, setSelectedFilters] = useState({
    departments: [],
    priorities: [],
    employee: null,
  });
  const [dropdownStates, setDropdownStates] = useState({
    departments: false,
    priorities: false,
    employees: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs for detecting outside clicks
  const departmentsRef = useRef(null);
  const prioritiesRef = useRef(null);
  const employeesRef = useRef(null);

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch statuses
        const statusesRes = await fetch(
          "https://momentum.redberryinternship.ge/api/statuses"
        );
        if (!statusesRes.ok) throw new Error("Failed to fetch statuses");
        const statusesData = await statusesRes.json();
        setStatuses(statusesData);

        // Fetch departments
        const departmentsRes = await fetch(
          "https://momentum.redberryinternship.ge/api/departments"
        );
        if (!departmentsRes.ok) throw new Error("Failed to fetch departments");
        const departmentsData = await departmentsRes.json();
        setDepartments(departmentsData);

        // Fetch priorities
        const prioritiesRes = await fetch(
          "https://momentum.redberryinternship.ge/api/priorities"
        );
        if (!prioritiesRes.ok) throw new Error("Failed to fetch priorities");
        const prioritiesData = await prioritiesRes.json();
        setPriorities(prioritiesData);

        // Fetch employees
        const employeesRes = await fetch(
          "https://momentum.redberryinternship.ge/api/employees",
          {
            headers: { Authorization: `Bearer ${API_TOKEN}` },
          }
        );
        if (!employeesRes.ok) throw new Error("Failed to fetch employees");
        const employeesData = await employeesRes.json();
        setEmployees(employeesData);

        // Fetch tasks
        const tasksRes = await fetch(
          "https://momentum.redberryinternship.ge/api/tasks",
          {
            headers: { Authorization: `Bearer ${API_TOKEN}` },
          }
        );
        if (!tasksRes.ok) throw new Error("Failed to fetch tasks");
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
        setFilteredTasks(tasksData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        departmentsRef.current &&
        !departmentsRef.current.contains(event.target)
      ) {
        setDropdownStates((prev) => ({ ...prev, departments: false }));
      }
      if (
        prioritiesRef.current &&
        !prioritiesRef.current.contains(event.target)
      ) {
        setDropdownStates((prev) => ({ ...prev, priorities: false }));
      }
      if (
        employeesRef.current &&
        !employeesRef.current.contains(event.target)
      ) {
        setDropdownStates((prev) => ({ ...prev, employees: false }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter tasks based on selected filters
  useEffect(() => {
    let filtered = tasks;

    if (filters.departments.length > 0) {
      filtered = filtered.filter((task) =>
        filters.departments.includes(task.department.id)
      );
    }

    if (filters.priorities.length > 0) {
      filtered = filtered.filter((task) =>
        filters.priorities.includes(task.priority.id)
      );
    }

    if (filters.employee) {
      filtered = filtered.filter(
        (task) => task.employee.id === filters.employee
      );
    }

    setFilteredTasks(filtered);
  }, [filters, tasks]);

  // Functions
  const toggleDropdown = (dropdown) => {
    setDropdownStates((prev) => {
      const newState = {
        departments: false,
        priorities: false,
        employees: false,
      };
      newState[dropdown] = !prev[dropdown];
      return newState;
    });
  };

  const handleDepartmentSelect = (id) => {
    setSelectedFilters((prev) => ({
      ...prev,
      departments: prev.departments.includes(id)
        ? prev.departments.filter((dep) => dep !== id)
        : [...prev.departments, id],
    }));
  };

  const handlePrioritySelect = (id) => {
    setSelectedFilters((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(id)
        ? prev.priorities.filter((pri) => pri !== id)
        : [...prev.priorities, id],
    }));
  };

  const handleEmployeeSelect = (id) => {
    setSelectedFilters((prev) => ({
      ...prev,
      employee: prev.employee === id ? null : id,
    }));
  };

  const applyDepartmentFilters = () => {
    setFilters((prev) => ({
      ...prev,
      departments: selectedFilters.departments,
    }));
    setDropdownStates((prev) => ({ ...prev, departments: false }));
  };

  const applyPriorityFilters = () => {
    setFilters((prev) => ({
      ...prev,
      priorities: selectedFilters.priorities,
    }));
    setDropdownStates((prev) => ({ ...prev, priorities: false }));
  };

  const applyEmployeeFilter = () => {
    setFilters((prev) => ({
      ...prev,
      employee: selectedFilters.employee,
    }));
    setDropdownStates((prev) => ({ ...prev, employees: false }));
  };

  const removeFilter = (type, id) => {
    if (type === "employee") {
      setFilters((prev) => ({ ...prev, employee: null }));
      setSelectedFilters((prev) => ({ ...prev, employee: null }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [type]: prev[type].filter((item) => item !== id),
      }));
      setSelectedFilters((prev) => ({
        ...prev,
        [type]: prev[type].filter((item) => item !== id),
      }));
    }
  };

  const clearAllFilters = () => {
    setFilters({
      departments: [],
      priorities: [],
      employee: null,
    });
    setSelectedFilters({
      departments: [],
      priorities: [],
      employee: null,
    });
  };

  const getDepartmentName = (id) => {
    const dept = departments.find((d) => d.id === id);
    return dept ? dept.name : "";
  };

  const getPriorityName = (id) => {
    const priority = priorities.find((p) => p.id === id);
    return priority ? priority.name : "";
  };

  const getEmployeeName = (id) => {
    const employee = employees.find((e) => e.id === id);
    return employee ? employee.name : "";
  };

  return (
    <div style={{ margin: "100px auto", width: "80%" }}>
      <h1>ფილტრები</h1>
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        {/* Departments Dropdown */}
        <div ref={departmentsRef} style={{ position: "relative" }}>
          <button
            onClick={() => toggleDropdown("departments")}
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "200px",
              textAlign: "left",
            }}
          >
            დეპარტამენტები
            <span style={{ float: "right" }}>▼</span>
          </button>
          {dropdownStates.departments && (
            <div
              style={{
                position: "absolute",
                width: "200px",
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #ccc",
                backgroundColor: "white",
                zIndex: 10,
                padding: "10px",
              }}
            >
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  style={{ padding: "8px", cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    id={`department-${dept.id}`}
                    checked={selectedFilters.departments.includes(dept.id)}
                    onChange={() => handleDepartmentSelect(dept.id)}
                  />
                  <label htmlFor={`department-${dept.id}`}>{dept.name}</label>
                </div>
              ))}
              <button onClick={applyDepartmentFilters}>გაფილტვრა</button>
            </div>
          )}
        </div>

        {/* Priorities Dropdown */}
        <div ref={prioritiesRef} style={{ position: "relative" }}>
          <button
            onClick={() => toggleDropdown("priorities")}
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "200px",
              textAlign: "left",
            }}
          >
            პრიორიტეტები
            <span style={{ float: "right" }}>▼</span>
          </button>
          {dropdownStates.priorities && (
            <div
              style={{
                position: "absolute",
                width: "200px",
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #ccc",
                backgroundColor: "white",
                zIndex: 10,
                padding: "10px",
              }}
            >
              {priorities.map((priority) => (
                <div
                  key={priority.id}
                  style={{ padding: "8px", cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    id={`priority-${priority.id}`}
                    checked={selectedFilters.priorities.includes(priority.id)}
                    onChange={() => handlePrioritySelect(priority.id)}
                  />
                  <label htmlFor={`priority-${priority.id}`}>
                    <img src={priority.icon} alt="" width="16" height="16" />{" "}
                    {priority.name}
                  </label>
                </div>
              ))}
              <button onClick={applyPriorityFilters}>გაფილტვრა</button>
            </div>
          )}
        </div>

        {/* Employees Dropdown */}
        <div ref={employeesRef} style={{ position: "relative" }}>
          <button
            onClick={() => toggleDropdown("employees")}
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "200px",
              textAlign: "left",
            }}
          >
            თანამშრომელი
            <span style={{ float: "right" }}>▼</span>
          </button>
          {dropdownStates.employees && (
            <div
              style={{
                position: "absolute",
                width: "200px",
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #ccc",
                backgroundColor: "white",
                zIndex: 10,
                padding: "10px",
              }}
            >
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  style={{ padding: "8px", cursor: "pointer" }}
                >
                  <input
                    type="radio"
                    id={`employee-${employee.id}`}
                    name="employee"
                    checked={selectedFilters.employee === employee.id}
                    onChange={() => handleEmployeeSelect(employee.id)}
                  />
                  <label htmlFor={`employee-${employee.id}`}>
                    {employee.name}
                  </label>
                </div>
              ))}
              <button onClick={applyEmployeeFilter}>გაფილტვრა</button>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.departments.length > 0 ||
        filters.priorities.length > 0 ||
        filters.employee) && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "20px",
            alignItems: "center",
          }}
        >
          {filters.departments.map((deptId) => (
            <div key={`active-dept-${deptId}`}>
              {getDepartmentName(deptId)}
              <button onClick={() => removeFilter("departments", deptId)}>
                ✕
              </button>
            </div>
          ))}

          {filters.priorities.map((priorityId) => (
            <div key={`active-priority-${priorityId}`}>
              {getPriorityName(priorityId)}
              <button onClick={() => removeFilter("priorities", priorityId)}>
                ✕
              </button>
            </div>
          ))}

          {filters.employee && (
            <div>
              {getEmployeeName(filters.employee)}
              <button onClick={() => removeFilter("employee")}>✕</button>
            </div>
          )}

          <button onClick={clearAllFilters}>გასუფთავება</button>
        </div>
      )}

      {/* Filtered Tasks Display */}
      <div style={{ marginTop: "30px" }}>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        <div style={{ display: "flex", gap: "20px" }}>
          {statuses.map((status) => (
            <div
              key={status.id}
              style={{ width: "25%", height: "800px", overflowY: "scroll" }}
            >
              <span style={{ color: "red" }}>{status.name}</span>
              {filteredTasks
                .filter((task) => task.status.id === status.id)
                .map((task) => (
                  <NavLink to={`/task/${task.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div
                    key={task.id}
                    style={{
                      border: "1px solid black",
                      padding: "10px",
                      marginTop: "10px",
                    }}
                  >
                    <h4>{task.name}</h4>
                    <p>
                      {task.description.length > 100
                        ? `${task.description.substring(0, 100)}...`
                        : task.description}
                    </p>
                    <p>{task.department.name}</p>
                    <p>{task.priority.name}</p>
                    <img
                      src={task.employee.avatar}
                      alt="avatar"
                      style={{ width: "20px", height: "20px" }}
                    />
                    <p>კომენტარები: {task.total_comments}</p>
                  </div>
                  </NavLink>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
