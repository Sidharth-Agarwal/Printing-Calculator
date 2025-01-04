# Print Calculator  

## Overview  
The **Print Calculator** is a comprehensive web application designed for managing printing orders. It provides features such as billing, material and stock management, and role-based authentication for administrators, staff, and general users. This project streamlines the workflow for printing businesses by offering a clean UI and integration with Firebase for real-time data updates.  

---

## Features  

### 1. **Authentication**  
- Role-based access control:  
  - **Admin**: Access to all sections and functionality.  
  - **Staff**: Limited access to **New Bill**, **Paper DB**, **Material DB**, and **Die DB**.  
  - **Registered Users**: View access to **Paper DB**, **Material DB**, and **Die DB**.  
- Secure login and registration using Firebase Authentication.  
- Protected routes to ensure access control based on roles.  

### 2. **Billing Form**  
- Multi-step form for creating and managing bills.  
- Order and Paper section features:  
  - Capture **Client Name**, **Project Name**, **Date**, and **Estimated Delivery Date**.  
  - Select **Job Type** and enforce quantity in multiples of 100.  
  - Integration with **Paper DB** and **Die DB** for easy selection.  
- Validations and real-time updates.  

### 3. **Material and Stock Management**  
- Sections for managing:  
  - **Paper DB**: Add, edit, delete, and view papers.  
  - **Material DB**: Manage materials used in the printing process.  
  - **Die DB**: Manage die details with support for image uploads and dynamic updates.  

### 4. **Estimates and Orders**  
- Create and manage estimates.  
- Move estimates to orders with tracking progress through stages such as:  
  - **Design**, **Positives**, **Printing**, **Quality Check**, and **Delivery**.  

### 5. **Role-Based Navigation**  
- Admins see all sections, including **Estimates DB**.  
- Staff and Registered Users see limited sections based on their roles.  

---

## Tech Stack  

### Frontend  
- **React** with Tailwind CSS for a clean, responsive UI.  
- **React Router** for managing routes and navigation.  

### Backend  
- **Firebase**:  
  - Firestore for real-time database management.  
  - Authentication for secure login and registration.  
  - Storage for handling file uploads (e.g., die images).  

### Tools and Libraries  
- **React-Datepicker**: For date selection.  
- **React-Firebase-Hooks**: To simplify authentication and Firebase integration.  
- **jsPDF** and **html2canvas**: For exporting details as PDFs.  

---

## Setup and Installation  

### Prerequisites  
- Node.js (v14 or higher) installed.  
- Firebase project set up with Firestore, Authentication, and Storage configured.  

### Steps  
1. Clone the repository:  
   ```bash  
   git clone https://github.com/Sidharth-Agarwal/Printing-Calculator.git
   cd print-calculator  

2. Install the dependencies:
    ```bash
    npm run install:legacy

3. Configure firebase:
    Replace the Firebase configuration in ```firebaseConfig.js``` with your firebase project details.

4. Start the development server:
    ```bash
    npm start