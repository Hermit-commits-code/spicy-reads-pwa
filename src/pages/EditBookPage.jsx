import React from "react";
import AddBookModal from "../components/AddBookModal";

// This page will be used for fullscreen add/edit on mobile
export default function EditBookPage({
  opened,
  onClose,
  onAdd,
  initialValues,
  isEdit = false,
}) {
  // Always render fullscreen for mobile
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "white",
        zIndex: 9999,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        padding: "16px 0",
      }}
    >
      <AddBookModal
        opened={true}
        onClose={onClose}
        onAdd={onAdd}
        initialValues={initialValues}
        isEdit={isEdit}
      />
    </div>
  );
}
