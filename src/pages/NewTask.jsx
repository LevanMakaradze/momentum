import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

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

  // Initialize the form
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isValid, dirtyFields},
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
    const savedFormData = localStorage.getItem('taskFormData');
    if (savedFormData) {
      const parsedData = JSON.parse(savedFormData);
      
      // Set form values from localStorage
      Object.keys(parsedData).forEach(key => {
        // Special handling for date objects
        if (key === 'deadline' && parsedData[key]) {
          setValue(key, new Date(parsedData[key]));
        } else {
          setValue(key, parsedData[key]);
        }
      });
    }
  }, [setValue]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (!loading && Object.keys(watchedFields).length > 0) {
      const formDataToSave = { ...watchedFields };
      
      // Convert date object to string for storage
      if (formDataToSave.deadline instanceof Date) {
        formDataToSave.deadline = formDataToSave.deadline.toISOString();
      }
      
      localStorage.setItem('taskFormData', JSON.stringify(formDataToSave));
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

        // Check if we already have saved data
        const savedFormData = localStorage.getItem('taskFormData');
        
        // Only set defaults if there's no saved data
        if (!savedFormData) {
          // Set default priority
          if (formattedPriorities.length > 0) {
            const mediumPriority =
              formattedPriorities.find((p) => p.label === "საშუალო") ||
              formattedPriorities[0];
            setValue("priority", mediumPriority);
          }

          // Set default status
          if (formattedStatuses.length > 0) {
            const startStatus =
              formattedStatuses.find((s) => s.label === "დასაწყები") ||
              formattedStatuses[0];
            setValue("status", startStatus);
          }

          // Set default deadline to tomorrow
          setValue("deadline", new Date(Date.now() + 24 * 60 * 60 * 1000));
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

          // Only clear employee if we don't have saved data for this department
          const savedFormData = localStorage.getItem('taskFormData');
          const parsedData = savedFormData ? JSON.parse(savedFormData) : null;
          
          // If we don't have a saved employee or the department has changed, reset employee
          if (!parsedData?.employee || 
              (parsedData.department && 
              parsedData.department.value !== selectedDepartment.value)) {
            setValue("employee", null);
          }
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

    // If description is filled, check it meets the validation
    if (watchedFields.description && watchedFields.description.trim() !== "") {
      const words = watchedFields.description.trim().split(/\s+/);
      if (words.length < 4) {
        setFormIsValid(false);
        return;
      }
    }

    setFormIsValid(allFieldsValid);
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
      localStorage.removeItem('taskFormData');
      
      // Reset the form
      reset();
      
      // Navigate to home page
      navigate('/');

    } catch (err) {
      console.error("Error submitting task:", err);
      setSubmitError("Failed to submit task. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const getValidationMessageColor = (fieldName) => {
    // If the field has an error, return red
    if (errors[fieldName]) {
      return "red";
    }
    // If the field is dirty (has been changed) or touched (has been focused) and has no errors, return green
    else if (dirtyFields[fieldName] && !errors[fieldName]) {
      return "green";
    }
    // Otherwise return grey (default state)
    else {
      return "grey";
    }
  };

  return (
    <div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {submitError && <div style={{ color: "red" }}>{submitError}</div>}
      {submitSuccess && (
        <div style={{ color: "green" }}>Task submitted successfully!</div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ width: "50%", margin: "100px auto" }}
      >
        <div>
          <label>სათაური*</label>
          <input
            {...register("title", {
              required: true,
              minLength: 3,
              maxLength: 255,
            })}
            type="text"
          />
          <p style={{ color: getValidationMessageColor("title") }}>
            მინიმუმ 3 და მაქსიმუმ 255 სიმბოლო
          </p>
        </div>

        <div>
          <label>აღწერა</label>
          <textarea
            style={{ height: "100px", width: "100%", resize: "none" }}
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
          />
          <p style={{ color: getValidationMessageColor("description") }}>
            მინიმუმ 4 სიტყვა და მაქსიმუმ 255 სიმბოლო
          </p>
        </div>

        <div>
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
                  <div style={{ display: "flex", alignItems: "center" }}>
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

        <div>
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

        <div>
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
          <div>
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
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {e.avatar && (
                        <img
                          src={e.avatar}
                          alt="avatar"
                          width="20"
                          style={{ marginRight: "10px", borderRadius: "50%" }}
                        />
                      )}
                      {e.label}
                    </div>
                  )}
                  placeholder={
                    employees.length > 0 ? "" : "თანამშრომლები არ მოიძებნა"
                  }
                  isDisabled={employees.length === 0}
                />
              )}
            />
          </div>
        )}

        <div>
          <label>დედლაინი</label>
          <Controller
            name="deadline"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <DatePicker
                {...field}
                selected={field.value}
                onChange={(date) => setValue("deadline", date)}
                minDate={new Date()}
                dateFormat="dd.MM.yyyy"
              />
            )}
          />
        </div>

        <button
          type="submit"
          disabled={!(isValid && formIsValid) || submitLoading}
        >
          {submitLoading ? "გთხოვთ მოიცადოთ..." : "დამატება"}
        </button>
      </form>
    </div>
  );
};

export default NewTask;