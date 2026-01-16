// src/hooks/useLanguage.ts
import { useState, useEffect } from 'react';

interface Translations {
  [key: string]: string;
}

const translations: Translations = {
  // Common translations
  'attendance': 'Attendance',
  'courses': 'Courses', 
  'add': 'Add',
  'edit': 'Edit',
  'delete': 'Delete',
  'save': 'Save',
  'cancel': 'Cancel',
  'search': 'Search',
  'filter': 'Filter',
  'view': 'View',
  'create': 'Create',
  'success': 'Success',
  'error': 'Error',
  'loading': 'Loading',
  'name': 'Name',
  'description': 'Description',
  'date': 'Date',
  'status': 'Status',
  'present': 'Present',
  'absent': 'Absent',
  'late': 'Late',
  'student': 'Student',
  'course': 'Course',
  'grade': 'Grade',
  'semester': 'Semester',
  'academic_year': 'Academic Year',
  'notes': 'Notes',
  'tasks': 'Tasks',
  'timetable': 'Timetable',
  'dashboard': 'Dashboard',
  'profile': 'Profile',
  'settings': 'Settings',
  'logout': 'Logout',
  'login': 'Login',
  'signup': 'Sign Up',
  'email': 'Email',
  'password': 'Password',
  'confirm_password': 'Confirm Password',
  'full_name': 'Full Name',
  // Add more translations as needed
};

export const useLanguage = () => {
  const [language, setLanguage] = useState('en');

  const t = (key: string): string => {
    return translations[key] || key;
  };

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    // You can add localStorage persistence here
    localStorage.setItem('language', newLanguage);
  };

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  return {
    language,
    t,
    changeLanguage,
  };
};
