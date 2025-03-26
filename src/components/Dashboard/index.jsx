import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Header from "./Header";
import Table from "./Table";
import Add from "./Add";
import Edit from "./Edit";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

const Dashboard = ({ setIsAuthenticated }) => {
  const [employees, setEmployees] = useState();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const getEmployees = async () => {
    const querySnapshot = await getDocs(collection(db, "employees"));
    const employees = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setEmployees(employees);
  };

  useEffect(() => {
    getEmployees();
  }, []);

  const handleEdit = (id) => {
    const [employee] = employees.filter((employee) => employee.id === id);

    setSelectedEmployee(employee);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    let employee;
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      customClass: {
        confirmButton: "swal-confirm",
        cancelButton: "swal-cancel",
      },
      showLoaderOnConfirm: true,
      // based on swal docs preConfirm goes together with showLoaderOnConfirm hence this;
      preConfirm: async () => {
        try {
          [employee] = employees.filter((employee) => employee.id === id);
          await deleteDoc(doc(db, "employees", id));
          setEmployees((prevEmployees) =>
            prevEmployees.filter((prev) => prev.id !== id)
          );
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: error.message,
            icon: "error",
          });
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        if (employee && employee.firstName && employee.lastName) {
          Swal.fire({
            title: "Deleted!",
            text: `${employee.firstName} ${employee.lastName}'s data has been deleted.`,
            icon: "success",
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: "Employee data is not available.",
            icon: "error",
          });
        }
      }
    });
  };

  return (
    <div className="container">
      {!isAdding && !isEditing && (
        <>
          <Header
            setIsAdding={setIsAdding}
            setIsAuthenticated={setIsAuthenticated}
          />
          <Table
            employees={employees}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        </>
      )}
      {isAdding && (
        <Add
          employees={employees}
          setEmployees={setEmployees}
          setIsAdding={setIsAdding}
          getEmployees={getEmployees}
        />
      )}
      {isEditing && (
        <Edit
          employees={employees}
          selectedEmployee={selectedEmployee}
          setEmployees={setEmployees}
          setIsEditing={setIsEditing}
          getEmployees={getEmployees}
        />
      )}
    </div>
  );
};

export default Dashboard;
