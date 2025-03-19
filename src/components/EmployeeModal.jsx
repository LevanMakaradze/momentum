import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Check, CircleX, Asterisk } from "lucide-react";
import styles from "./EmployeeModal.module.css";
import AvatarIcon from "../assets/gallery-export.svg";
import TrashIcon from "../assets/trash-2.svg";

const API_TOKEN = import.meta.env.VITE_API_TOKEN;

function EmployeeModal({ isOpen, onClose, onEmployeeAdded }) {
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

  // Function to reset all form states
  const resetForm = () => {
    setImagePreview(null);
    setImageFile(null);
    setIsDropdownOpen(false);
    setSelectedDepartment("");
    setFormErrors({
      name: null,
      surname: null,
      avatar: null,
      department: null,
    });
    setFormTouched({
      name: false,
      surname: false,
      avatar: false,
      department: false,
    });
    setFormValid(false);
    setInputData({
      name: "",
      surname: "",
      avatar: null,
      department: "",
    });
    setIsSubmitting(false);
  };

  // Reset the form when modal closes
  const handleClose = (wasSuccessful = false) => {
    if (!isSubmitting) {
      resetForm();
      onClose(wasSuccessful);
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

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
      handleClose();
    }
  };

  const handleUploadButtonClick = (e) => {
    e.preventDefault(); // Prevent the form submission
    if (!isSubmitting) {
      document.getElementById("fileInput").click();
    }
  };

  const handleImageUpload = (e) => {
    if (isSubmitting) return;
    
    const file = e.target.files[0];
    if (file) {
      if (file.size > 600 * 1024) {
        alert("ავატარის ზომა მაქსიმუმ 600კბ!");
        setFormErrors({ ...formErrors, avatar: "მაქსიმუმ 600კბ" });
      } else {
        setFormErrors({ ...formErrors, avatar: null });
        const imageUrl = URL.createObjectURL(file);
        setImagePreview(imageUrl);
        setImageFile(file);
        setFormTouched({ ...formTouched, avatar: true });
        setInputData({ ...inputData, avatar: file });
      }
    }
  };

  const removeImagePreview = () => {
    if (isSubmitting) return;
    
    setImagePreview(null);
    setImageFile(null);
    setInputData({ ...inputData, avatar: null });
    setFormTouched({ ...formTouched, avatar: true });
    setFormErrors({ ...formErrors, avatar: "ავატარი აუცილებელია" });
  };

  const toggleDropdown = () => {
    if (isSubmitting) return;
    
    setIsDropdownOpen(!isDropdownOpen);
    setFormTouched({ ...formTouched, department: true });
  };

  const selectDepartment = (departmentName, departmentId) => {
    if (isSubmitting) return;
    
    setSelectedDepartment(departmentName);
    setInputData({ ...inputData, department: departmentId });
    setIsDropdownOpen(false);
    setFormTouched({ ...formTouched, department: true });
    setFormErrors({ ...formErrors, department: null });
  };

  const handleInputChange = (e) => {
    if (isSubmitting) return;
    
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value });
    setFormTouched({ ...formTouched, [name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;

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
        formData.append('department_id', inputData.department);

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
        
        // Show success message and close modal
        alert("თანამშრომელი წარმატებით დაემატა!");
        
        // Close the modal with success flag
        handleClose(true);
        
        // If onEmployeeAdded callback exists, call it with the new employee data
        if (onEmployeeAdded && typeof onEmployeeAdded === 'function') {
          onEmployeeAdded(data.employee);
        }
      } catch (error) {
        console.error('Error submitting employee data:', error);
        setIsSubmitting(false);
      }
    }
  };

  // Function to determine validation message color
  const getValidationMessageColor = (fieldName) => {
    if (formErrors[fieldName] && formTouched[fieldName]) {
      return styles.ValidationError;
    } else if (formTouched[fieldName] && !formErrors[fieldName]) {
      return styles.ValidationSuccess;
    } else {
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
        <div className={styles.ModalClose}>
          <CircleX size={40} onClick={() => handleClose()} style={{cursor: "pointer"}}/>
        </div>
        
        {/* Employee creation form */}
        <form onSubmit={handleSubmit} className={styles.ModalForm}>
          <div className={styles.ModalTitle}>
            <span>თანამშრომლის დამატება</span>
          </div>
          <div className={styles.FormInputs}>
            <div className={styles.FormTop}>
              <div className={styles.FormTopInner}>
                <label>სახელი
                  <Asterisk size={8} style={{
                    position:"absolute", top:"0", right:"-8", color:"#343A40"
                  }}/>
                </label>
                <input
                  type="text"
                  name="name"
                  value={inputData.name}
                  onChange={handleInputChange}
                  onBlur={() => setFormTouched({ ...formTouched, name: true })}
                  className={getInputBorderStyle("name")}
                  disabled={isSubmitting}
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
                <label>გვარი
                  <Asterisk size={8} style={{
                    position:"absolute", top:"0", right:"-8", color:"#343A40"
                  }}/>
                </label>
                <input
                  type="text"
                  name="surname"
                  value={inputData.surname}
                  onChange={handleInputChange}
                  onBlur={() => setFormTouched({ ...formTouched, surname: true })}
                  className={getInputBorderStyle("surname")}
                  disabled={isSubmitting}
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
              <label>ავატარი
                <Asterisk size={8} style={{
                  position:"absolute", top:"0", right:"-8", color:"#343A40"
                }}/>
              </label>
              {!imagePreview ? (
                <div>
                  <button
                    className={`${styles.ImageUploadButton} ${
                      formErrors.avatar && formTouched.avatar
                        ? styles.InputError
                        : ""
                    }`}
                    onClick={handleUploadButtonClick}
                    disabled={isSubmitting}
                  >
                    <div className={styles.PreviewImageBox}>
                      <img src={AvatarIcon} style={{ width: "24px" }} alt="Upload avatar"/>
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
                    disabled={isSubmitting}
                  />
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
                      style={{cursor: isSubmitting ? "default" : "pointer"}}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className={styles.SelectableInputContainer}>
              <label>დეპარტამენტი
                <Asterisk size={8} style={{
                  position:"absolute", top:"0", right:"-8", color:"#343A40"
                }}/>
              </label>
              <div className={styles.CustomDropdown}>
                <input
                  id="departmentInput"
                  type="text"
                  value={selectedDepartment}
                  onClick={toggleDropdown}
                  readOnly
                  className={`${styles.DropdownInput} ${getInputBorderStyle("department")}`}
                  disabled={isSubmitting}
                />
                <div className={styles.DropdownArrow}>
                  {isDropdownOpen ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
                {isDropdownOpen && !isSubmitting && (
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
            </div>
            
          </div>
          <div className={styles.FormButtons}>
            <button
              type="button"
              onClick={() => handleClose()}
              className={styles.CancelButton}
              disabled={isSubmitting}
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