import React, { useState } from 'react';
import styles from './AdminPage.module.css'; // Import CSS Modules
import QuestionGenerator from '../components/QuestionGenerator'; // Corrected import path
import PendingQuestionsView from '../components/admin/PendingQuestionsView'; // Import PendingQuestionsView
import ApprovedQuestionsView from '../components/admin/ApprovedQuestionsView'; // Import ApprovedQuestionsView
import DeactivatedQuestionsView from '../components/admin/DeactivatedQuestionsView'; // Import DeactivatedQuestionsView

// Placeholder for components we will create later
const PendingQuestionsViewPlaceholder = () => (
  <div className={styles.adminSectionBox}>
    <div className={styles.viewHeader}>
      <h2>Pending Approval (0)</h2>
      <button>Refresh Pending List</button>
    </div>
    <p>Pending questions list will go here.</p>
  </div>
);

const ApprovedQuestionsViewPlaceholder = () => (
  <div className={styles.adminSectionBox}>
    <div className={styles.viewHeader}>
        <h2>Manage Approved Questions (0)</h2>
        <button>Refresh Approved List</button>
    </div>
    <p>Filter and approved questions table will go here.</p>
  </div>
);

const DeactivatedQuestionsViewPlaceholder = () => (
  <div className={styles.adminSectionBox}>
    <div className={styles.viewHeader}>
      <h2>Manage Deactivated Questions (0)</h2>
      <button>Refresh Deactivated List</button>
    </div>
    <p>Deactivated questions list will go here.</p>
  </div>
);

function AdminPage() {
  const [activeView, setActiveView] = useState('pending'); // 'pending', 'approved', 'deactivated'

  // This function will be passed to QuestionGenerator so it can potentially trigger a refresh
  // of the pending list in the parent (AdminPage) or a context later.
  // For now, it can just log or be a no-op.
  const handleQuestionsGenerated = () => {
    console.log('Questions generated! AdminPage notified.');
    // Consider automatically switching to the 'pending' view or refreshing it
    // setActiveView('pending'); // Optionally switch view
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'pending':
        return <PendingQuestionsView />;
      case 'approved':
        return <ApprovedQuestionsView />;
      case 'deactivated':
        return <DeactivatedQuestionsView />; // Use the actual component
      default:
        return <PendingQuestionsView />; // Default to pending view
    }
  };

  return (
    <div className={`container ${styles.adminPageContainer}`}> {/* Using global .container and local styles */}
      <h1>Admin Panel</h1>

      {/* Question Generator Section (Always Visible) */}
      <div className={styles.adminSectionBox}> 
        <h2>Generate New Questions</h2>
        <QuestionGenerator onQuestionsGenerated={handleQuestionsGenerated} />
      </div>

      {/* Navigation for Tabs/Views */}
      <div className={styles.adminNav}>
        <button 
          className={`${styles.navBtn} ${activeView === 'pending' ? styles.active : ''}`}
          onClick={() => setActiveView('pending')}
        >
          Pending Approval
        </button>
        <button 
          className={`${styles.navBtn} ${activeView === 'approved' ? styles.active : ''}`}
          onClick={() => setActiveView('approved')}
        >
          Manage Approved Questions
        </button>
        <button 
          className={`${styles.navBtn} ${activeView === 'deactivated' ? styles.active : ''}`}
          onClick={() => setActiveView('deactivated')}
        >
          Manage Deactivated Questions
        </button>
      </div>

      {/* Tabbed Views Container */}
      <div className={styles.adminViewsContainer}>
        {renderActiveView()}
      </div>
    </div>
  );
}

export default AdminPage; 
 