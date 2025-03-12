import {useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import styles from "./EmployeeModal.module.css";
import AvatarIcon from "../assets/gallery-export.svg";
import TrashIcon from "../assets/trash-2.svg";
import CloseIcon from "../assets/close.svg";
import validationCheck from "../assets/validation-check.svg";

function EmployeeModal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // Example department options
  const departments = [
    "ტესტი1",
    "ტესტი2",
    "ტესტი3",
    "ტესტი4",
    "ტესტი5",
    "ტესტი6",
  ];


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
      const imageUrl = URL.createObjectURL(file); // Create a URL for the uploaded image
      setImagePreview(imageUrl);
    }
  };

  const removeImagePreview = () => {
    setImagePreview(null);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectDepartment = (department) => {
    setSelectedDepartment(department);
    setIsDropdownOpen(false);
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
        <form>
          <div className={styles.FormTop}>
            <div className={styles.FormTopInner}>
              <label>სახელი*</label>
              <input type="text" />
              <div className={styles.ValidationContainer}>
                <div>
                  <span>
                    <img src={validationCheck} alt="Validation Check" />
                    მინიმუმ 2 სიმბოლო
                  </span>
                </div>

                <div>
                  <span className={styles.ValidationCheck}>
                    <img src={validationCheck} alt="Validation Check" />
                    მაქსიმუმ 255 სიმბოლო
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.FormTopInner}>
              <label>გვარი*</label>
              <input type="text" />
              <div className={styles.ValidationContainer}>
                <div>
                  <span>
                    <img src={validationCheck} alt="Validation Check" />
                    მინიმუმ 2 სიმბოლო
                  </span>
                </div>

                <div>
                  <span className={styles.ValidationCheck}>
                    <img src={validationCheck} alt="Validation Check" />
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
                  className={styles.ImageUploadButton}
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
                  />
                </div>
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
                className={styles.DropdownInput}
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
                  {departments.map((dept, index) => (
                    <div
                      key={index}
                      className={styles.DropdownItem}
                      onClick={() => selectDepartment(dept)}
                    >
                      {dept}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.FormButtons}>
            <button
              type="button"
              onClick={onClose}
              className={styles.CancelButton}
            >
              გაუქმება
            </button>
            <button type="submit" className={styles.SubmitButton}>
              დაამატე თანამშრომელი
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeeModal;
