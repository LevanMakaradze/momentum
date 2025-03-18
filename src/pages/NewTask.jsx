import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./NewTask.module.css";
import { Calendar } from "lucide-react";

const API_TOKEN = import.meta.env.VITE_API_TOKEN;

const NewTask = ({ submitTask }) => {
  // States for API data
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  // Track the previous department to detect changes
  const [previousDepartment, setPreviousDepartment] = useState(null);

  // Initialize the form
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    trigger, // Add trigger to manually validate fields
    formState: { errors, isValid, dirtyFields },
  } = useForm({
    mode: "onChange",
  });

  // Initialize navigate - this will be used for redirection after form submission
  const navigate = useNavigate();
  const selectedDepartment = watch("department");
  const watchedFields = watch();
  const [formIsValid, setFormIsValid] = useState(false);

  // Load form data from localStorage
  useEffect(() => {
    const savedFormData = localStorage.getItem("taskFormData");
    const parsedData = savedFormData ? JSON.parse(savedFormData) : {};

    // Set form values from localStorage for fields that exist
    Object.keys(parsedData).forEach((key) => {
      // Special handling for date objects
      if (key === "deadline" && parsedData[key]) {
        setValue(key, new Date(parsedData[key]));
      } else if (parsedData[key]) {
        setValue(key, parsedData[key]);
      }
    });

    // Apply default values for fields that don't exist in localStorage

    // Set default priority if not in localStorage
    if (!parsedData.priority) {
      const defaultPriority =
        priorities.find((p) => p.label === "საშუალო") ||
        (priorities.length > 0 ? priorities[0] : null);
      if (defaultPriority) setValue("priority", defaultPriority);
    }

    // Set default status if not in localStorage
    if (!parsedData.status) {
      const defaultStatus =
        statuses.find((s) => s.label === "დასაწყები") ||
        (statuses.length > 0 ? statuses[0] : null);
      if (defaultStatus) setValue("status", defaultStatus);
    }

    // Set default deadline to tomorrow if not in localStorage
    if (!parsedData.deadline) {
      setValue("deadline", new Date(Date.now() + 24 * 60 * 60 * 1000));
    }
  }, [setValue, priorities, statuses]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (!loading && Object.keys(watchedFields).length > 0) {
      const formDataToSave = { ...watchedFields };

      // Convert date object to string for storage
      if (formDataToSave.deadline instanceof Date) {
        formDataToSave.deadline = formDataToSave.deadline.toISOString();
      }

      localStorage.setItem("taskFormData", JSON.stringify(formDataToSave));
    }
  }, [watchedFields, loading]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch priorities
        const prioritiesResponse = await axios.get(
          "https://momentum.redberryinternship.ge/api/priorities"
        );
        const formattedPriorities = prioritiesResponse.data.map((priority) => ({
          value: priority.id,
          label: priority.name,
          icon: priority.icon,
        }));
        setPriorities(formattedPriorities);

        // Fetch statuses
        const statusesResponse = await axios.get(
          "https://momentum.redberryinternship.ge/api/statuses"
        );
        const formattedStatuses = statusesResponse.data.map((status) => ({
          value: status.id,
          label: status.name,
        }));
        setStatuses(formattedStatuses);

        // Fetch departments
        const departmentsResponse = await axios.get(
          "https://momentum.redberryinternship.ge/api/departments"
        );
        const formattedDepartments = departmentsResponse.data.map(
          (department) => ({
            value: department.id,
            label: department.name,
          })
        );
        setDepartments(formattedDepartments);

        // Get saved form data
        const savedFormData = localStorage.getItem("taskFormData");
        const parsedData = savedFormData ? JSON.parse(savedFormData) : {};

        // Apply saved values first if they exist
        Object.keys(parsedData).forEach((key) => {
          // Special handling for date objects
          if (key === "deadline" && parsedData[key]) {
            setValue(key, new Date(parsedData[key]));
          } else if (parsedData[key]) {
            setValue(key, parsedData[key]);
          }
        });

        // Set default priority if not in localStorage
        if (!parsedData.priority && formattedPriorities.length > 0) {
          const mediumPriority =
            formattedPriorities.find((p) => p.label === "საშუალო") ||
            formattedPriorities[0];
          setValue("priority", mediumPriority);
        }

        // Set default status if not in localStorage
        if (!parsedData.status && formattedStatuses.length > 0) {
          const startStatus =
            formattedStatuses.find((s) => s.label === "დასაწყები") ||
            formattedStatuses[0];
          setValue("status", startStatus);
        }

        // Set default deadline if not in localStorage
        if (!parsedData.deadline) {
          setValue("deadline", new Date(Date.now() + 24 * 60 * 60 * 1000));
        }

        // Initialize previousDepartment with saved value
        if (parsedData.department) {
          setPreviousDepartment(parsedData.department);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
        setLoading(false);
        console.error("API Error:", err);
      }
    };

    fetchData();
  }, [setValue]);

  // Handle department changes to reset employee selection
  useEffect(() => {
    // Skip if loading or no department selected
    if (loading || !selectedDepartment) return;

    // Check if department has changed
    if (
      previousDepartment &&
      selectedDepartment.value !== previousDepartment.value
    ) {
      // Clear employee when department changes
      setValue("employee", null);

      // Update localStorage to remove employee
      const savedFormData = localStorage.getItem("taskFormData");
      if (savedFormData) {
        const parsedData = JSON.parse(savedFormData);
        parsedData.employee = null;
        localStorage.setItem("taskFormData", JSON.stringify(parsedData));
      }

      // Re-validate form
      trigger("employee");
    }

    // Update previous department reference
    setPreviousDepartment(selectedDepartment);
  }, [selectedDepartment, previousDepartment, setValue, loading, trigger]);

  // Fetch employees when department changes
  useEffect(() => {
    const fetchEmployees = async () => {
      if (selectedDepartment) {
        try {
          const employeesResponse = await axios.get(
            "https://momentum.redberryinternship.ge/api/employees",
            {
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
              },
            }
          );

          // Filter employees by selected department
          const filteredEmployees = employeesResponse.data.filter(
            (employee) => employee.department.id === selectedDepartment.value
          );

          const formattedEmployees = filteredEmployees.map((employee) => ({
            value: employee.id,
            label: `${employee.name} ${employee.surname}`,
            avatar: employee.avatar,
          }));

          setEmployees(formattedEmployees);
        } catch (err) {
          console.error("Error fetching employees:", err);
        }
      }
    };

    fetchEmployees();
  }, [selectedDepartment, setValue]);

  // Check form validity
  useEffect(() => {
    // Skip validation if still loading
    if (loading) return;

    // Check if all required fields are filled
    const requiredFields = ["title", "priority", "status", "department"];
    if (selectedDepartment) {
      requiredFields.push("employee");
    }
    requiredFields.push("deadline");

    const allFieldsValid = requiredFields.every((field) => {
      return watchedFields[field] !== undefined && !errors[field];
    });

    // Additional validation for employee field
    const isEmployeeValid =
      !selectedDepartment ||
      (selectedDepartment &&
        watchedFields.employee &&
        watchedFields.employee.value !== undefined);

    // If description is filled, check it meets the validation
    let isDescriptionValid = true;
    if (watchedFields.description && watchedFields.description.trim() !== "") {
      const words = watchedFields.description.trim().split(/\s+/);
      if (words.length < 4) {
        isDescriptionValid = false;
      }
    }

    setFormIsValid(allFieldsValid && isEmployeeValid && isDescriptionValid);
  }, [watchedFields, errors, selectedDepartment, loading]);

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Format the data to match the API requirements
      const formattedData = {
        name: data.title,
        description: data.description || "",
        due_date: data.deadline.toISOString().split("T")[0],
        status_id: data.status.value,
        employee_id: data.employee.value,
        priority_id: data.priority.value,
      };

      // Send POST request to the API
      const response = await axios.post(
        "https://momentum.redberryinternship.ge/api/tasks",
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSubmitSuccess(true);

      // Clear form data from localStorage
      localStorage.removeItem("taskFormData");

      // Reset the form
      reset();

      navigate("/");
    } catch (err) {
      console.error("Error submitting task:", err);
      setSubmitError("Failed to submit task. Please try again.");
      setSubmitLoading(false);
    }
  };

  const getValidationMessageColor = (fieldName, validationType) => {
    const fieldValue = watchedFields[fieldName];

    // Handle minimum validation
    if (validationType === "min") {
      if (fieldName === "title") {
        if (!fieldValue) return "#6c757d";
        return fieldValue.length >= 3 ? "green" : "red";
      }
      if (fieldName === "description") {
        if (!fieldValue || !fieldValue.trim()) return "#6c757d";
        const words = fieldValue.trim().split(/\s+/);
        return words.length >= 4 ? "green" : "red";
      }
    }

    // Handle maximum validation
    if (validationType === "max") {
      if (!fieldValue) return "#6c757d";
      return fieldValue.length <= 255 ? "green" : "red";
    }

    return "#6c757d";
  };

  const getInputBorderColor = (fieldName) => {
    const fieldValue = watchedFields[fieldName];

    // If field is empty, return default border
    if (!fieldValue) return "";

    if (fieldName === "title") {
      // Both validations must be true for green border
      const isMinValid = fieldValue.length >= 3;
      const isMaxValid = fieldValue.length <= 255;
      return isMinValid && isMaxValid ? "green" : "red";
    }

    if (fieldName === "description") {
      // If empty, it's valid
      if (!fieldValue.trim()) return "";

      // Both validations must be true for green border
      const words = fieldValue.trim().split(/\s+/);
      const isMinValid = words.length >= 4;
      const isMaxValid = fieldValue.length <= 255;
      return isMinValid && isMaxValid ? "green" : "red";
    }

    return "";
  };

  const CustomDatePickerInput = ({ value, onClick }) => {
    return (
      <div style={{ position: 'relative' }}>
        <Calendar
          size={18}
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            pointerEvents: 'none', // Ensures it doesn't block the input field
          }}
        />
        <input
          value={value}
          onClick={onClick}
          style={{
            padding:'5px 0 5px 35px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>
    );
  };

  return (
    <>
      <div className={styles.title}>
        <span>შექმენი ახალი დავალება</span>
      </div>

      <div className={styles.newTaskContainer}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formInputContainer}>
            <div className={styles.leftColumn}>
              <div className={styles.inputItem}>
                <label>სათაური*</label>
                <input
                  {...register("title", {
                    required: true,
                    minLength: 3,
                    maxLength: 255,
                  })}
                  type="text"
                  style={{ borderColor: getInputBorderColor("title") }}
                />
                <div className={styles.validation}>
                  <p
                    style={{ color: getValidationMessageColor("title", "min") }}
                  >
                    მინიმუმ 2 სიმბოლო
                  </p>
                  <p
                    style={{ color: getValidationMessageColor("title", "max") }}
                  >
                    მაქსიმუმ 255 სიმბოლო
                  </p>
                </div>
              </div>

              <div className={styles.inputItem}>
                <label>აღწერა</label>
                <textarea
                  {...register("description", {
                    validate: (value) => {
                      // Allow empty description
                      if (!value || value.trim() === "") return true;

                      // Remove spaces and check for 4+ words
                      const words = value.trim().split(/\s+/);
                      return words.length >= 4;
                    },
                    maxLength: 255,
                  })}
                  style={{ borderColor: getInputBorderColor("description") }}
                />
                <div className={styles.validation}>
                  <p
                    style={{
                      color: getValidationMessageColor("description", "min"),
                    }}
                  >
                    მინიმუმ 4 სიტყვა
                  </p>
                  <p
                    style={{
                      color: getValidationMessageColor("description", "max"),
                    }}
                  >
                    მაქსიმუმ 255 სიმბოლო
                  </p>
                </div>
              </div>
              <div className={styles.bottomContainer}>
                <div className={styles.inputItem}>
                  <label>პრიორიტეტი*</label>
                  <Controller
                    name="priority"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={priorities}
                        formatOptionLabel={(option) => (
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            {option.icon && (
                              <img
                                src={option.icon}
                                alt="priority icon"
                                width="20"
                                style={{ marginRight: 10 }}
                              />
                            )}
                            {option.label}
                          </div>
                        )}
                        placeholder=""
                      />
                    )}
                  />
                </div>
                <div className={styles.inputItem}>
                  <label>სტატუსი*</label>
                  <Controller
                    name="status"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select {...field} options={statuses} placeholder="" />
                    )}
                  />
                </div>
              </div>
            </div>
            <div className={styles.rightColumn}>
              <div className={styles.rightTop}>
                <div className={styles.inputItem}>
                  <label>დეპარტამენტი*</label>
                  <Controller
                    name="department"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select {...field} options={departments} placeholder="" />
                    )}
                  />
                </div>
                {selectedDepartment && (
                  <div className={styles.inputItem}>
                    <label>პასუხისმგებელი თანამშრომელი*</label>
                    <Controller
                      name="employee"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={employees}
                          getOptionLabel={(e) => (
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              {e.avatar && (
                                <img
                                  src={e.avatar}
                                  alt="avatar"
                                  width="20"
                                  style={{
                                    marginRight: "10px",
                                    borderRadius: "50%",
                                  }}
                                />
                              )}
                              {e.label}
                            </div>
                          )}
                          placeholder={
                            employees.length > 0
                              ? ""
                              : "თანამშრომლები არ მოიძებნა"
                          }
                          isDisabled={employees.length === 0}
                        />
                      )}
                    />
                  </div>
                )}
              </div>
              <div className={styles.dateContainer}>
                <div className={styles.inputItem}>
                  <label>დედლაინი</label>


                  <Controller
    name="deadline"
    control={control}
    rules={{ required: true }}
    render={({ field }) => (
      <DatePicker
        {...field}
        selected={field.value}
        onChange={(date) => setValue('deadline', date)}
        minDate={new Date()}
        dateFormat="dd.MM.yyyy"
        customInput={<CustomDatePickerInput />} // Use custom input component
      />
    )}
  />






                </div>
              </div>
            </div>
          </div>

          <div className={styles.submit}>
            <button type="submit" disabled={!(isValid && formIsValid)}>
              დავალების შექმნა
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default NewTask;
