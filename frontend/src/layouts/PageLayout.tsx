import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import { NotificationProvider, Notification } from '../contexts/NotificationContext';

// Define the page layout props type
interface PageLayoutProps {
  children: React.ReactNode;
  user: {
    userType: 'admin' | 'customer' | 'driver';
    name: string;
    email: string;
    phone?: string;
    profilePicture?: string;
  } | null;
  currentPage: string;
  setCurrentPage: (pageName: string) => void;
  handleLogout: () => void;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  message: {
    text: string;
    type: 'info' | 'success' | 'warning' | 'error';
    visible: boolean;
  };
  setMessage: (message: {
    text: string;
    type: 'info' | 'success' | 'warning' | 'error';
    visible: boolean;
  }) => void;
}

// Page Layout component that provides consistent structure
const PageLayout = ({
  children,
  user,
  currentPage,
  setCurrentPage,
  handleLogout,
  toggleTheme,
  theme,
  sidebarCollapsed,
  toggleSidebar,
  message,
  setMessage
}: PageLayoutProps) => {
  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  return (
    <NotificationProvider>
      <div className="d-flex flex-column min-vh-100" style={{
        backgroundColor: theme === 'light' ? '#ffffff' : '#121212',
        color: theme === 'light' ? '#212529' : '#f8f9fa'
      }}>
        {/* Navigation for the app */}
        <Navbar
          user={user}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
          toggleTheme={toggleTheme}
          theme={theme}
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
            className="container-fluid flex-grow-1"
          >
            {children}
          </motion.div>
        </AnimatePresence>

        <Footer
          setCurrentPage={setCurrentPage}
          theme={theme}
        />

        {/* Enhanced Notification Modal */}
        <Notification
          message={message.text}
          type={message.type}
          visible={message.visible}
          onClose={() => setMessage(prev => ({ ...prev, visible: false }))}
        />
      </div>
    </NotificationProvider>
  );
};

export default PageLayout;