// Adjust this single mapping to match the existing Express API.
export const endpoints = {
  auth: { login: '/auth/login', me: '/auth/me', changePassword: '/auth/change-password' },
  students: '/students',
  studentProfile: '/students/me',
  studentAttendance: '/attendance/me',
  classStudents: (classId) => `/classes/${classId}/students`,
  teachers: '/teachers',
  classes: '/classes',
  teacherClasses: '/classes/my',
  subjects: '/subjects',
  attendance: '/attendance',
  reports: '/reports/attendance',
};

export const entityFields = {
  students: ['name', 'rollNumber', 'email', 'course', 'status'],
  teachers: ['name', 'employeeId', 'email', 'subjects', 'status'],
  classes: ['name', 'course', 'semester', 'studentCount', 'teacher'],
  subjects: ['name', 'code', 'className', 'teacher'],
};
