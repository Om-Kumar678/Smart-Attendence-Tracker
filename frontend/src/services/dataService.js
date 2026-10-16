import { api, extractList } from './api.js';
import { endpoints } from './endpoints.js';
import { MOCK_MODE } from './authService.js';
import { mockCreate, mockDelete, mockList, mockUpdate } from './mockData.js';

export async function listResource(resource) {
  if (MOCK_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 180));
    if (resource === 'teacherClasses') return mockList('classes').slice(0, 2);
    return mockList(resource);
  }
  const { data } = await api.get(resource === 'teacherClasses' ? endpoints.teacherClasses : endpoints[resource]);
  return extractList(data);
}

export async function listClassStudents(classId) {
  if (MOCK_MODE) {
    const classItem = mockList('classes').find((item) => String(item.id) === String(classId));
    if (!classItem) return [];
    const students = mockList('students');
    return classItem.studentIds
      ? students.filter((student) => classItem.studentIds.includes(student.id))
      : students.filter((student) => student.course === classItem.course);
  }
  const { data } = await api.get(endpoints.classStudents(classId));
  return extractList(data);
}

export async function saveClassStudents(classId, studentIds) {
  if (MOCK_MODE) {
    const classItem = mockList('classes').find((item) => String(item.id) === String(classId));
    if (!classItem) throw new Error('The selected class no longer exists.');
    mockUpdate('classes', classId, { studentIds, studentCount: studentIds.length });
    return;
  }
  await api.put(endpoints.classStudents(classId), { studentIds });
}

export async function createResource(resource, payload) {
  if (MOCK_MODE) return mockCreate(resource, payload);
  const { data } = await api.post(endpoints[resource], payload);
  return data?.data || data;
}

export async function updateResource(resource, id, payload) {
  if (MOCK_MODE) return mockUpdate(resource, id, payload);
  const { data } = await api.put(`${endpoints[resource]}/${id}`, payload);
  return data?.data || data;
}

export async function updateAttendance(id, payload) {
  if (MOCK_MODE) return mockUpdate('attendance', id, payload);
  const { data } = await api.put(`${endpoints.attendance}/${id}`, payload);
  return data?.data || data;
}

export async function deleteResource(resource, id) {
  if (MOCK_MODE) return mockDelete(resource, id);
  await api.delete(`${endpoints[resource]}/${id}`);
}

export async function listAttendance(params = {}) {
  if (MOCK_MODE) return mockList('attendance');
  const { data } = await api.get(endpoints.attendance, { params });
  return extractList(data);
}

export async function listMyAttendance(params = {}) {
  if (MOCK_MODE) return mockList('attendance').filter((row) => row.student === 'Sam Rivera');
  const { data } = await api.get(endpoints.studentAttendance, { params });
  return extractList(data);
}

export async function saveAttendance(records) {
  if (MOCK_MODE) {
    return records.map((record, index) => mockCreate('attendance', { ...record, id: `${Date.now()}-${index}` }));
  }
  const { data } = await api.post(endpoints.attendance, { records });
  return data?.data || data;
}

export async function fetchReport(params = {}) {
  if (MOCK_MODE) return mockList('attendance');
  const { data } = await api.get(endpoints.reports, { params });
  return extractList(data);
}
