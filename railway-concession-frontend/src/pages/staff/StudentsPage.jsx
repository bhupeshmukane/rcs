import React, { useState, useEffect } from 'react';
import studentService from '../../services/studentService';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const StudentsPage = () => {

  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {

    try {

      setLoading(true);

      const data =
        await studentService.getAllStudents();

      setStudents(data);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };

  // Toggle Active
  const handleToggleStatus = async (id) => {

    try {

      await studentService.toggleStudentStatus(id);

      setSuccess("Student status updated");

      fetchStudents();

    } catch (err) {

      setError(err.message);

    }

  };

  // Toggle Drop Year
  const handleToggleDropYear = async (id) => {

    try {

      await studentService.toggleDropYear(id);

      setSuccess("Drop year updated");

      fetchStudents();

    } catch (err) {

      setError(err.message);

    }

  };

  // Delete Student
  const handleDeleteStudent = async (id) => {

    if (!window.confirm("Delete this student permanently?"))
      return;

    try {

      await studentService.deleteStudent(id);

      setSuccess("Student deleted");

      fetchStudents();

    } catch (err) {

      setError(err.message);

    }

  };

  // Checkbox Select
  const handleCheckboxChange = (id) => {

    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );

  };

  const handleSelectAll = () => {

    if (selectedIds.length === students.length)
      setSelectedIds([]);
    else
      setSelectedIds(students.map(s => s.id));

  };

  // Bulk Delete
  const handleBulkDelete = async () => {

    if (selectedIds.length === 0)
      return;

    if (!window.confirm("Delete selected students?"))
      return;

    try {

      await studentService.bulkDeleteStudents(selectedIds);

      setSuccess("Selected students deleted");

      setSelectedIds([]);

      fetchStudents();

    } catch (err) {

      setError(err.message);

    }

  };

  // Search filter
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return <LoadingSpinner text="Loading students..." />;

  if (error)
    return <ErrorMessage message={error} />;

  return (

    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-r from-slate-950 via-blue-950 to-teal-800 p-6 text-white shadow-xl md:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-100">Staff Console</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Students Management</h1>
            <p className="mt-2 max-w-2xl text-sm text-sky-100 md:text-base">
              Search, update, and maintain student records used for concession approvals.
            </p>
          </div>
          {selectedIds.length > 0 && (
            <Button variant="danger" onClick={handleBulkDelete}>
              Delete Selected ({selectedIds.length})
            </Button>
          )}
        </div>
      </section>

      {success && (
        <SuccessMessage
          message={success}
          onDismiss={() => setSuccess('')}
        />
      )}

      <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search students..."
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 md:w-80"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === students.length &&
                      students.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">ID</th>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">Name</th>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">Email</th>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">Department</th>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">Year</th>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">Status</th>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">Drop Year</th>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr
                  key={student.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(student.id)}
                      onChange={() =>
                        handleCheckboxChange(student.id)
                      }
                    />
                  </td>
                  <td className="px-3 py-3 font-medium text-slate-800">{student.id}</td>
                  <td className="px-3 py-3 text-slate-700">{student.name}</td>
                  <td className="px-3 py-3 text-slate-700">{student.email}</td>
                  <td className="px-3 py-3 text-slate-700">{student.department}</td>
                  <td className="px-3 py-3 text-slate-700">{student.year}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      student.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {student.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    {student.isDropYear ? "Yes" : "No"}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-300 text-slate-700 hover:bg-slate-100"
                        onClick={() =>
                          handleToggleStatus(student.id)
                        }
                      >
                        {student.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-300 text-slate-700 hover:bg-slate-100"
                        onClick={() =>
                          handleToggleDropYear(student.id)
                        }
                      >
                        Drop Year
                      </Button>

                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          handleDeleteStudent(student.id)
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>

  );

};

export default StudentsPage;
