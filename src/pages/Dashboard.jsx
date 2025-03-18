import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, Check, X } from "lucide-react";
import styles from "./Dashboard.module.css";

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

  // Refs for detecting outside clicks
  const departmentsRef = useRef(null);
  const prioritiesRef = useRef(null);
  const employeesRef = useRef(null);

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
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
        console.error(err);
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

  const filterData = [
    {
      name: "departments",
      label: "დეპარტამენტები",
      items: departments,
      selectedItems: selectedFilters.departments,
      handleSelect: handleDepartmentSelect,
      applyFilter: applyDepartmentFilters,
      type: "checkbox",
    },
    {
      name: "priorities",
      label: "პრიორიტეტები",
      items: priorities,
      selectedItems: selectedFilters.priorities,
      handleSelect: handlePrioritySelect,
      applyFilter: applyPriorityFilters,
      type: "checkbox",
    },
    {
      name: "employees",
      label: "თანამშრომელი",
      items: employees,
      selectedItems: selectedFilters.employee,
      handleSelect: handleEmployeeSelect,
      applyFilter: applyEmployeeFilter,
      type: "radio", // For selecting a single employee
    },
  ];

  const statusColors = {
    1: "#F7BC30", // Yellow
    2: "#FB5607", // Orange
    3: "#FF006E", // Pink
    4: "#3A86FF", // Blue
  };

  const priorityColors = {
    1: "#08A508", //Green
    2: "#FFBE0B", //Yellow
    3: "#FA4D4D",
  };

  const departmentColors = {
    0: "#ff66a8",
    1: "#89b6ff",
    2: "#ffd86d",
    3: "#fd9a6a",
    4: "#17f1fd",
    5: "#41ff0c",
    6: "#e14704",
  };

  return (
    <>
      <div className={styles.mainContainer}>
        <span className={styles.pageTitle}>დავალებების გვერდი</span>

        <div className={styles.filtersContainer}>
          {filterData.map((filter) => (
            <div
              ref={eval(`${filter.name}Ref`)}
              className={styles.filter}
              key={filter.name}
            >
              <button
                onClick={() => toggleDropdown(filter.name)}
                style={{
                  color: dropdownStates[filter.name] ? "#8338EC" : "#0D0F10",
                }}
              >
                {filter.label}
                <span>
                  <ChevronDown />
                </span>
              </button>
              {dropdownStates[filter.name] && (
                <div className={styles.filterMenu}>
                  <div className={styles.filterOptions}>
                    {filter.items.map((item) => (
                      <div key={item.id} className={styles.filterOption}>
                        <div className={styles.checkBox}>
                          <input
                            type={filter.type}
                            id={`${filter.name}-${item.id}`}
                            checked={
                              filter.type === "checkbox"
                                ? filter.selectedItems.includes(item.id)
                                : filter.selectedItems === item.id
                            }
                            onChange={() => filter.handleSelect(item.id)}
                          />
                          <Check size={16} className={styles.checkIcon} />
                        </div>
                        <label
                          htmlFor={`${filter.name}-${item.id}`}
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          {/* For employees, show avatar */}
                          {filter.name === "employees" && item.avatar && (
                            <img
                              src={item.avatar}
                              alt="Avatar"
                              width="28"
                              height="28"
                              style={{
                                borderRadius: "50%",
                                marginRight: "10px",
                              }}
                            />
                          )}
                          {item.name} {item.surname}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className={styles.filterSubmit}>
                    <button onClick={filter.applyFilter}>გაფილტვრა</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.selectedFilters}>
          {/* Active Filters Display */}
          {(filters.departments.length > 0 ||
            filters.priorities.length > 0 ||
            filters.employee) && (
            <>
              {filters.departments.map((deptId) => (
                <div
                  key={`active-dept-${deptId}`}
                  className={styles.selectedFilter}
                >
                  {getDepartmentName(deptId)}
                  <button onClick={() => removeFilter("departments", deptId)}>
                    <X size={14} style={{ color: "#343A40" }} />
                  </button>
                </div>
              ))}

              {filters.priorities.map((priorityId) => (
                <div
                  key={`active-priority-${priorityId}`}
                  className={styles.selectedFilter}
                >
                  {getPriorityName(priorityId)}
                  <button
                    onClick={() => removeFilter("priorities", priorityId)}
                  >
                    <X size={14} style={{ color: "#343A40" }} />
                  </button>
                </div>
              ))}

              {filters.employee && (
                <div className={styles.selectedFilter}>
                  {getEmployeeName(filters.employee)}
                  <button onClick={() => removeFilter("employee")}>
                    <X size={14} style={{ color: "#343A40" }} />
                  </button>
                </div>
              )}

              <button onClick={clearAllFilters} className={styles.filterClear}>
                გასუფთავება
              </button>
            </>
          )}
        </div>

        {/* Filtered Tasks Display */}
        <div>
          <div className={styles.tasksContainer}>
            {statuses.map((status) => (
              <div key={status.id} className={styles.tasksColumns}>
                <span
                  className={styles.statusTitle}
                  style={{ backgroundColor: statusColors[status.id] }}
                >
                  {status.name}
                </span>

                {filteredTasks
                  .filter((task) => task.status.id === status.id)
                  .map((task) => (
                    <NavLink
                      to={`/task/${task.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div
                        key={task.id}
                        className={styles.taskCard}
                        style={{ borderColor: statusColors[status.id] }}
                      >
                        <div className={styles.taskCardTop}>
                          <div className={styles.taskCardTopLeft}>
                            <span
                              className={styles.taskCardPriority}
                              style={{
                                borderColor: priorityColors[task.priority.id],
                                color: priorityColors[task.priority.id],
                              }}
                            >
                              <img
                                src={task.priority.icon}
                                width="18px"
                                height="20px"
                                style={{ marginRight: "4px" }}
                              />
                              {task.priority.name}
                            </span>

                            <span
                              className={styles.taskCardDepartment}
                              style={{
                                backgroundColor:
                                  departmentColors[task.department.id],
                              }}
                            >
                              {task.department.name}
                            </span>
                          </div>
                          <div className={styles.taskCardTopRight}>
                            <span className={styles.taskCardDate}>
                              {(() => {
                                const months = [
                                  "იან",
                                  "თებ",
                                  "მარ",
                                  "აპრ",
                                  "მაი",
                                  "ივნ",
                                  "ივლ",
                                  "აგვ",
                                  "სექ",
                                  "ოქტ",
                                  "ნოე",
                                  "დეკ",
                                ];

                                const dateString = task.due_date;

                                const date = new Date(dateString);
                                const day = date.getDate();
                                const month = months[date.getMonth()];
                                const year = date.getFullYear();

                                return `${day} ${month}, ${year}`;
                              })()}
                            </span>
                          </div>
                        </div>

                        <div className={styles.taskCardMiddle}>
                          <span className={styles.taskTitle}>{task.name}</span>
                          <p className={styles.taskDescription}>
                            {task.description
                              ? task.description.length > 100
                                ? `${task.description.substring(0, 100)}...`
                                : task.description
                              : ""}
                          </p>
                        </div>

                        <div className={styles.taskCardBottom}>
                          <img
                            src={task.employee.avatar}
                            alt="avatar"
                            style={{
                              width: "31px",
                              height: "31px",
                              borderRadius: "50%",
                            }}
                          />
                          <div className={styles.taskCardComments}>
                            <svg
                              width="22"
                              height="23"
                              viewBox="0 0 22 23"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3.08086 2.25977C1.87258 2.25977 0.880859 3.25148 0.880859 4.45977V15.0198C0.880859 16.228 1.87258 17.2198 3.08086 17.2198H4.88211C4.94227 17.7491 4.93539 18.239 4.79961 18.6498C4.63289 19.1551 4.3218 19.5796 3.74086 19.9285C3.57758 20.0316 3.50195 20.2293 3.5518 20.4149C3.60164 20.6005 3.76836 20.7329 3.96086 20.7398C5.82742 20.7398 7.96727 19.7652 9.04836 17.2198H18.9209C20.1291 17.2198 21.1209 16.228 21.1209 15.0198V4.45977C21.1209 3.25148 20.1291 2.25977 18.9209 2.25977H3.08086ZM3.08086 3.13977H18.9209C19.6496 3.13977 20.2409 3.73102 20.2409 4.45977V15.0198C20.2409 15.7485 19.6496 16.3398 18.9209 16.3398H8.80086C8.61695 16.3398 8.45195 16.4549 8.38836 16.6285C7.7043 18.4951 6.48227 19.3837 5.21211 19.7085C5.38398 19.4627 5.54727 19.2032 5.63836 18.9248C5.86695 18.2304 5.84805 17.4707 5.70711 16.6973C5.66758 16.4927 5.49055 16.3432 5.28086 16.3398H3.08086C2.35211 16.3398 1.76086 15.7485 1.76086 15.0198V4.45977C1.76086 3.73102 2.35211 3.13977 3.08086 3.13977Z"
                                fill="#212529"
                              />
                            </svg>
                            <span>{task.total_comments}</span>
                          </div>
                        </div>
                      </div>
                    </NavLink>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
