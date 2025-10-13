import React from 'react';
import AddBookModal from '../components/AddBookModal';

// This page will be used for fullscreen add/edit on mobile
export default function EditBookPage({
  onClose,
  onAdd,
  initialValues,
  isEdit = false,
}) {
  // Always render fullscreen for mobile
  return (
    <div
      style={{
        WebkitOverflowScrolling: 'touch',
        padding: '16px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        minHeight: '100vh',
        background: '#fff',
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }}>
        <AddBookModal
          opened={true}
          onClose={onClose}
          onAdd={onAdd}
          initialValues={initialValues}
          isEdit={isEdit}
        />
      </div>
    </div>
  );
}
