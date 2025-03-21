import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Styles from "./Header.module.css";
import { Plus } from "lucide-react";
import EmployeeModal from "./EmployeeModal"; // Import the EmployeeModal component

function Header({ onEmployeeAdded }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleEmployeeAdded = () => {
    // Call the parent's callback
    if (onEmployeeAdded) {
      onEmployeeAdded();
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    handleEmployeeAdded();
  };

  return (
    <>
      {/* Header */}
      <header className={Styles.Header}>
        <NavLink to="/" style={{ textDecoration: "none" }}>
          <span className={Styles.HeaderTitleText}>
            Momentum{" "}
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.25 18L28.125 10.6875L29.25 3.375H6.75L7.875 10.6875L15.75 18L7.875 25.3125L6.75 32.625H29.25L28.125 25.3125L20.25 18Z"
                fill="#A4E2F1"
              />
              <path
                d="M7.70215 9.5625L7.8754 10.6875L15.7504 18H20.2504L28.1254 10.6875L28.2986 9.5625H7.70215Z"
                fill="#F7BC30"
              />
              <path d="M28.125 9H7.875V10.125H28.125V9Z" fill="white" />
              <path
                d="M8.4375 32.0625L18 25.3125L27.5625 32.0625"
                fill="#F7BC30"
              />
              <path
                d="M27.2373 32.5215L17.9999 26.001L8.76255 32.5215L8.1123 31.6035L17.9999 24.624L27.8876 31.6035L27.2373 32.5215Z"
                fill="white"
              />
              <path d="M18.5625 18H17.4375V25.3125H18.5625V18Z" fill="white" />
              <path
                d="M30.562 33.75H5.43848L6.82223 24.7545L14.0965 18L6.82223 11.2455L5.43848 2.25H30.5609L29.1771 11.2455L21.904 18L29.1782 24.7545L30.562 33.75ZM8.06198 31.5H27.9396L27.0734 25.8705L18.5965 18L27.0722 10.1295L27.9385 4.5H8.06198L8.92823 10.1295L17.404 18L8.92823 25.8705L8.06198 31.5Z"
                fill="#8338EC"
              />
            </svg>
          </span>
        </NavLink>

        <div className={Styles.HeaderMenu}>
          <button className={Styles.NewEmployeeButton} onClick={openModal}>
            <span>თანამშრომლის შექმნა</span>
          </button>

          <NavLink to="/NewTask" style={{ textDecoration: "none" }}>
            <button className={Styles.NewTaskButton}>
              <Plus size={20} color="white" />
              <span>შექმენი ახალი დავალება</span>
            </button>
          </NavLink>
        </div>
      </header>

      {/* Employee Modal */}
      <EmployeeModal isOpen={isModalOpen} onClose={closeModal} onEmployeeAdded={handleEmployeeAdded} />
    </>
  );
}

export default Header;
