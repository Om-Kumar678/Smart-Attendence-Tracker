export const demoUsers = {
  admin: { name: 'Avery Morgan', email: 'avery@northstar.edu', role: 'admin', initials: 'AM', title: 'College administrator' },
  teacher: { name: 'Jordan Lee', email: 'jordan@northstar.edu', role: 'teacher', initials: 'JL', title: 'Faculty member' },
  student: { name: 'Sam Rivera', email: 'sam@northstar.edu', role: 'student', initials: 'SR', title: 'Computer Science · Year 2', rollNumber: 'CS2024018', course: 'Computer Science', semester: 'Semester 4', className: 'CS · Year 2' },
};

export const initialData = {
  students: [
    { id: 1, name: 'Ava Patel', rollNumber: 'CS2024001', email: 'ava.patel@northstar.edu', course: 'Computer Science', status: 'Active', attendance: 92 },
    { id: 2, name: 'Noah Williams', rollNumber: 'CS2024002', email: 'noah.w@northstar.edu', course: 'Computer Science', status: 'Active', attendance: 68 },
    { id: 3, name: 'Mia Chen', rollNumber: 'IT2024018', email: 'mia.chen@northstar.edu', course: 'Information Tech', status: 'Active', attendance: 84 },
    { id: 4, name: 'Ethan Johnson', rollNumber: 'DS2024009', email: 'ethan.j@northstar.edu', course: 'Data Science', status: 'On leave', attendance: 73 },
    { id: 5, name: 'Isabella Kim', rollNumber: 'CS2024012', email: 'isabella.k@northstar.edu', course: 'Computer Science', status: 'Active', attendance: 96 },
    { id: 6, name: 'Oliver Brown', rollNumber: 'IT2024021', email: 'oliver.b@northstar.edu', course: 'Information Tech', status: 'Active', attendance: 78 },
    { id: 7, name: 'Sofia Garcia', rollNumber: 'DS2024014', email: 'sofia.g@northstar.edu', course: 'Data Science', status: 'Active', attendance: 71 },
    { id: 8, name: 'Liam Davis', rollNumber: 'CS2024027', email: 'liam.d@northstar.edu', course: 'Computer Science', status: 'Active', attendance: 89 },
  ],
  teachers: [
    { id: 1, name: 'Jordan Lee', employeeId: 'FAC-1042', email: 'jordan.lee@northstar.edu', subjects: 'Data Structures, Algorithms', status: 'Active' },
    { id: 2, name: 'Priya Shah', employeeId: 'FAC-1088', email: 'priya.shah@northstar.edu', subjects: 'Database Systems', status: 'Active' },
    { id: 3, name: 'Marcus Reed', employeeId: 'FAC-1103', email: 'marcus.reed@northstar.edu', subjects: 'Computer Networks', status: 'Active' },
    { id: 4, name: 'Elena Petrova', employeeId: 'FAC-1121', email: 'elena.p@northstar.edu', subjects: 'Machine Learning', status: 'On leave' },
  ],
  classes: [
    { id: 1, name: 'CS · Year 2', course: 'Computer Science', semester: 'Semester 4', studentCount: 42, teacher: 'Jordan Lee' },
    { id: 2, name: 'IT · Year 3', course: 'Information Tech', semester: 'Semester 6', studentCount: 36, teacher: 'Priya Shah' },
    { id: 3, name: 'DS · Year 2', course: 'Data Science', semester: 'Semester 4', studentCount: 28, teacher: 'Elena Petrova' },
  ],
  subjects: [
    { id: 1, name: 'Data Structures', code: 'CS204', className: 'CS · Year 2', teacher: 'Jordan Lee' },
    { id: 2, name: 'Database Systems', code: 'IT306', className: 'IT · Year 3', teacher: 'Priya Shah' },
    { id: 3, name: 'Machine Learning', code: 'DS210', className: 'DS · Year 2', teacher: 'Elena Petrova' },
    { id: 4, name: 'Algorithms', code: 'CS206', className: 'CS · Year 2', teacher: 'Jordan Lee' },
  ],
  attendance: [
    { id: 7, date: '2026-10-16', student: 'Sam Rivera', rollNumber: 'CS2024018', className: 'CS · Year 2', subject: 'Data Structures', status: 'Present' },
    { id: 8, date: '2026-10-15', student: 'Sam Rivera', rollNumber: 'CS2024018', className: 'CS · Year 2', subject: 'Algorithms', status: 'Late' },
    { id: 9, date: '2026-10-14', student: 'Sam Rivera', rollNumber: 'CS2024018', className: 'CS · Year 2', subject: 'Database Systems', status: 'Absent' },
    { id: 1, date: '2026-10-16', student: 'Ava Patel', rollNumber: 'CS2024001', className: 'CS · Year 2', subject: 'Data Structures', status: 'Present' },
    { id: 2, date: '2026-10-16', student: 'Noah Williams', rollNumber: 'CS2024002', className: 'CS · Year 2', subject: 'Data Structures', status: 'Absent' },
    { id: 3, date: '2026-10-15', student: 'Mia Chen', rollNumber: 'IT2024018', className: 'IT · Year 3', subject: 'Database Systems', status: 'Present' },
    { id: 4, date: '2026-10-15', student: 'Ethan Johnson', rollNumber: 'DS2024009', className: 'DS · Year 2', subject: 'Machine Learning', status: 'Late' },
    { id: 5, date: '2026-10-14', student: 'Isabella Kim', rollNumber: 'CS2024012', className: 'CS · Year 2', subject: 'Algorithms', status: 'Present' },
    { id: 6, date: '2026-10-14', student: 'Oliver Brown', rollNumber: 'IT2024021', className: 'IT · Year 3', subject: 'Database Systems', status: 'On Leave' },
  ],
};

export const weeklyAttendance = [
  { day: 'Mon', present: 84, absent: 16 }, { day: 'Tue', present: 91, absent: 9 },
  { day: 'Wed', present: 78, absent: 22 }, { day: 'Thu', present: 94, absent: 6 },
  { day: 'Fri', present: 88, absent: 12 }, { day: 'Sat', present: 73, absent: 27 },
];
export const monthlyAttendance = [
  { month: 'May', rate: 81 }, { month: 'Jun', rate: 86 }, { month: 'Jul', rate: 83 },
  { month: 'Aug', rate: 90 }, { month: 'Sep', rate: 87 }, { month: 'Oct', rate: 92 },
];
export const subjectsForStudent = [
  { name: 'Data Structures', present: 24, total: 28, rate: 86 },
  { name: 'Database Systems', present: 19, total: 25, rate: 76 },
  { name: 'Algorithms', present: 17, total: 24, rate: 71 },
  { name: 'Computer Networks', present: 22, total: 23, rate: 96 },
];

let data = structuredClone(initialData);
let nextMockId = 10000;
export function resetMockData() { data = structuredClone(initialData); nextMockId = 10000; }
export function mockList(resource) { return structuredClone(data[resource] || []); }
export function mockCreate(resource, item) {
  const row = { ...item, id: ++nextMockId };
  data[resource] = [row, ...(data[resource] || [])];
  return structuredClone(row);
}
export function mockUpdate(resource, id, item) {
  data[resource] = (data[resource] || []).map((row) => String(row.id) === String(id) ? { ...row, ...item } : row);
  return structuredClone(data[resource].find((row) => String(row.id) === String(id)));
}
export function mockDelete(resource, id) {
  data[resource] = (data[resource] || []).filter((row) => String(row.id) !== String(id));
}
