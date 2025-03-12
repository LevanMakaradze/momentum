import { useState } from "react";
import { NavLink } from "react-router-dom";
import Styles from "./Header.module.css";
import { Plus } from "lucide-react";
import EmployeeModal from "./EmployeeModal"; // Import the EmployeeModal component

function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Header */}
      <header className={Styles.Header}>
        <span className={Styles.HeaderTitleText}>Momentum</span>
        
        <div className={Styles.HeaderMenu}>
          <button className={Styles.NewEmployeeButton} onClick={openModal}>
            <span>თანამშრომლის შექმნა</span>
          </button>
          
          <NavLink to="/" style={{ textDecoration: "none" }}>
            <button className={Styles.NewTaskButton}>
              <Plus size={20} color="white" />
              <span>შექმენი ახალი დავალება</span>
            </button>
          </NavLink>
        </div>
      </header>

      {/* Employee Modal */}
      <EmployeeModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}

export default Header;