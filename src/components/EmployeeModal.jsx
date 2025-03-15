import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import styles from "./EmployeeModal.module.css";
import AvatarIcon from "../assets/gallery-export.svg";
import TrashIcon from "../assets/trash-2.svg";
import CloseIcon from "../assets/close.svg";

const API_TOKEN = import.meta.env.VITE_API_TOKEN;

function EmployeeModal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation states
  const [formErrors, setFormErrors] = useState({
    name: null,
    surname: null,
    avatar: null,
    department: null,
  });

  const [formTouched, setFormTouched] = useState({
    name: false,
    surname: false,
    avatar: false,
    department: false,
  });

  const [formValid, setFormValid] = useState(false);

  const [inputData, setInputData] = useState({
    name: "",
    surname: "",
    avatar: null,
    department: "",
  });

  useEffect(() => {
    // Fetch departments from the API
    const fetchDepartments = async () => {
      try {
        const departmentsRes = await fetch(
          "https://momentum.redberryinternship.ge/api/departments"
        );
        if (!departmentsRes.ok) throw new Error("Failed to fetch departments");
        const departmentsData = await departmentsRes.json();
        setDepartments(departmentsData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDepartments();
  }, []);

  // Validate form when inputs change
  useEffect(() => {
    validateForm();
  }, [inputData, imageFile, selectedDepartment]);

  // Validate the entire form
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate name (min 2 chars, max 255 chars, only Georgian or Latin alphabet)
    if (!inputData.name) {
      errors.name = "სახელი აუცილებელია";
      isValid = false;
    } else if (inputData.name.length < 2) {
      errors.name = "მინიმუმ 2 სიმბოლო";
      isValid = false;
    } else if (inputData.name.length > 255) {
      errors.name = "მაქსიმუმ 255 სიმბოლო";
      isValid = false;
    } else if (!/^[a-zA-Zა-ჰ\s]+$/.test(inputData.name)) {
      errors.name = "მხოლოდ ქართული ან ლათინური სიმბოლოები";
      isValid = false;
    }

    // Validate surname (min 2 chars, max 255 chars, only Georgian or Latin alphabet)
    if (!inputData.surname) {
      errors.surname = "გვარი აუცილებელია";
      isValid = false;
    } else if (inputData.surname.length < 2) {
      errors.surname = "მინიმუმ 2 სიმბოლო";
      isValid = false;
    } else if (inputData.surname.length > 255) {
      errors.surname = "მაქსიმუმ 255 სიმბოლო";
      isValid = false;
    } else if (!/^[a-zA-Zა-ჰ\s]+$/.test(inputData.surname)) {
      errors.surname = "მხოლოდ ქართული ან ლათინური სიმბოლოები";
      isValid = false;
    }

    // Validate avatar
    if (!imageFile) {
      errors.avatar = "ავატარი აუცილებელია";
      isValid = false;
    } else if (imageFile.size > 600 * 1024) {
      // 600KB
      errors.avatar = "მაქსიმუმ 600კბ";
      isValid = false;
    }

    // Validate department
    if (!selectedDepartment) {
      errors.department = "დეპარტამენტი აუცილებელია";
      isValid = false;
    }

    setFormErrors(errors);
    setFormValid(isValid);
  };

  // Handle click outside the modal content
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleUploadButtonClick = (e) => {
    e.preventDefault(); // Prevent the form submission
    document.getElementById("fileInput").click();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 600 * 1024) {
        setFormErrors({ ...formErrors, avatar: "მაქსიმუმ 600კბ" });
      } else {
        setFormErrors({ ...formErrors, avatar: null });
      }

      const imageUrl = URL.createObjectURL(file); // Create a URL for the uploaded image
      setImagePreview(imageUrl);
      setImageFile(file);
      setFormTouched({ ...formTouched, avatar: true });
      setInputData({ ...inputData, avatar: file });
    }
  };

  const removeImagePreview = () => {
    setImagePreview(null);
    setImageFile(null);
    setInputData({ ...inputData, avatar: null });
    setFormTouched({ ...formTouched, avatar: true });
    setFormErrors({ ...formErrors, avatar: "ავატარი აუცილებელია" });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setFormTouched({ ...formTouched, department: true });
  };

  const selectDepartment = (departmentName, departmentId) => {
    setSelectedDepartment(departmentName);
    setInputData({ ...inputData, department: departmentId });
    setIsDropdownOpen(false);
    setFormTouched({ ...formTouched, department: true });
    setFormErrors({ ...formErrors, department: null });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value });
    setFormTouched({ ...formTouched, [name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setFormTouched({
      name: true,
      surname: true,
      avatar: true,
      department: true,
    });

    // Final validation
    validateForm();

    if (formValid) {
      setIsSubmitting(true);
      
      try {
        // Create FormData object for multipart/form-data
        const formData = new FormData();
        formData.append('name', inputData.name);
        formData.append('surname', inputData.surname);
        formData.append('avatar', imageFile);
        formData.append('department_id', inputData.department); // This should be the department ID

        // Make the POST request
        const response = await fetch('https://momentum.redberryinternship.ge/api/employees', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        alert("თანამშრომელი წარმატებით დაემატა!");
        
        // Close the modal and reset form
        onClose();
      } catch (error) {
        console.error('Error submitting employee data:', error);
        // Handle error (show message to user, etc.)
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Function to determine validation message color like in NewTask
  const getValidationMessageColor = (fieldName) => {
    // If the field has an error and has been touched, return red
    if (formErrors[fieldName] && formTouched[fieldName]) {
      return styles.ValidationError;
    }
    // If the field is touched and has no errors, return green
    else if (formTouched[fieldName] && !formErrors[fieldName]) {
      return styles.ValidationSuccess;
    }
    // Otherwise return grey (default state)
    else {
      return styles.ValidationDefault;
    }
  };
  
  // Function to determine input border style
  const getInputBorderStyle = (fieldName) => {
    if (formErrors[fieldName] && formTouched[fieldName]) {
      return styles.InputError;
    } else if (formTouched[fieldName] && !formErrors[fieldName]) {
      return styles.InputSuccess;
    }
    return "";
  };

  if (!isOpen) return null;

  return (
    <div className={styles.ModalOverlay} onClick={handleOutsideClick}>
      <div className={styles.ModalContent} ref={modalRef}>
        <div className={styles.ModalClose} onClick={onClose}>
          <img src={CloseIcon} alt="Close" />
        </div>
        <div className={styles.ModalTitle}>
          <span>თანამშრომლის დამატება</span>
        </div>
        {/* Employee creation form */}
        <form onSubmit={handleSubmit}>
          <div className={styles.FormTop}>
            <div className={styles.FormTopInner}>
              <label>სახელი*</label>
              <input
                type="text"
                name="name"
                value={inputData.name}
                onChange={handleInputChange}
                onBlur={() => setFormTouched({ ...formTouched, name: true })}
                className={getInputBorderStyle("name")}
              />
              <div className={styles.ValidationContainer}>
                <div className={getValidationMessageColor("name")}>
                  <span>
                    <Check size={"16px"} />
                    მინიმუმ 2 სიმბოლო
                  </span>
                </div>

                <div className={getValidationMessageColor("name")}>
                  <span>
                    <Check size={"16px"} />
                    მაქსიმუმ 255 სიმბოლო
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.FormTopInner}>
              <label>გვარი*</label>
              <input
                type="text"
                name="surname"
                value={inputData.surname}
                onChange={handleInputChange}
                onBlur={() => setFormTouched({ ...formTouched, surname: true })}
                className={getInputBorderStyle("surname")}
              />
              <div className={styles.ValidationContainer}>
                <div className={getValidationMessageColor("surname")}>
                  <span>
                    <Check size={"16px"} />
                    მინიმუმ 2 სიმბოლო
                  </span>
                </div>

                <div className={getValidationMessageColor("surname")}>
                  <span>
                    <Check size={"16px"} />
                    მაქსიმუმ 255 სიმბოლო
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label>ავატარი*</label>
            {!imagePreview ? (
              <div>
                <button
                  className={`${styles.ImageUploadButton} ${
                    formErrors.avatar && formTouched.avatar
                      ? styles.InputError
                      : ""
                  }`}
                  onClick={handleUploadButtonClick}
                >
                  <div className={styles.PreviewImageBox}>
                    <img src={AvatarIcon} style={{ width: "24px" }}></img>
                    <span>ატვირთე ფოტო</span>
                  </div>
                </button>
                <input
                  id="fileInput"
                  className={styles.ImageUpload}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  onBlur={() =>
                    setFormTouched({ ...formTouched, avatar: true })
                  }
                />
                {formErrors.avatar && formTouched.avatar && (
                  <div className={styles.ValidationError}>
                    <span>{formErrors.avatar}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.PreviewUploaded}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className={styles.PreviewUploadedImage}
                />
                <div className={styles.Trash}>
                  <img
                    src={TrashIcon}
                    alt="Remove"
                    onClick={removeImagePreview}
                  />
                </div>
                {formErrors.avatar && formTouched.avatar && (
                  <div className={styles.ValidationError}>
                    <span>{formErrors.avatar}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.SelectableInputContainer}>
            <label>დეპარტამენტი*</label>
            <div className={styles.CustomDropdown}>
              <input
                id="departmentInput"
                type="text"
                value={selectedDepartment}
                placeholder="აირჩიეთ დეპარტამენტი"
                onClick={toggleDropdown}
                readOnly
                className={`${styles.DropdownInput} ${getInputBorderStyle("department")}`}
              />
              <div className={styles.DropdownArrow}>
                {isDropdownOpen ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>
              {isDropdownOpen && (
                <div id="departmentDropdown" className={styles.DropdownList}>
                  {departments.map((department) => (
                    <div
                      key={department.id}
                      className={styles.DropdownItem}
                      onClick={() =>
                        selectDepartment(department.name, department.id)
                      }
                    >
                      {department.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {formErrors.department && formTouched.department && (
              <div className={styles.ValidationError}>
                <span>{formErrors.department}</span>
              </div>
            )}
          </div>

          <div className={styles.FormButtons}>
            <button
              type="button"
              onClick={onClose}
              className={styles.CancelButton}
            >
              გაუქმება
            </button>
            <button
              type="submit"
              className={`${styles.SubmitButton} ${!formValid ? styles.SubmitButtonDisabled : ''}`}
              disabled={!formValid || isSubmitting}
            >
              {isSubmitting ? 'იტვირთება...' : 'დაამატე თანამშრომელი'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeeModal;