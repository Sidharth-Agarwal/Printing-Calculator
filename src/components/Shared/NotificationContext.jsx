import React, { createContext, useState, useContext } from 'react';
import Notification from '../components/Notification';
import ConfirmationModal from '../components/Shared/ConfirmationModal';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    message: '',
    title: '',
    status: 'success',
    onConfirm: () => {},
  });

  const showNotification = (message, status = 'success', duration = 3000) => {
    setNotification({ message, status, duration });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const showConfirmation = (message, title, status, onConfirm) => {
    setConfirmationModal({
      isOpen: true,
      message,
      title,
      status,
      onConfirm,
    });
  };

  const closeConfirmation = () => {
    setConfirmationModal({
      ...confirmationModal,
      isOpen: false,
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showConfirmation,
      }}
    >
      {children}
      
      {notification && (
        <Notification
          message={notification.message}
          status={notification.status}
          duration={notification.duration}
          onClose={closeNotification}
        />
      )}
      
      {confirmationModal.isOpen && (
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={closeConfirmation}
          message={confirmationModal.message}
          title={confirmationModal.title}
          status={confirmationModal.status}
          onConfirm={() => {
            confirmationModal.onConfirm();
            closeConfirmation();
          }}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);