import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import authService from "../../services/authService";
import ErrorMessage from "../common/ErrorMessage";
import SuccessMessage from "../common/SuccessMessage";
import Button from "../ui/Button";

const LoginForm = () => {

  const [activeTab, setActiveTab] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { login } = useAuth();

  const [studentForm, setStudentForm] = useState({
    studentId: "",
    dob: ""
  });

  const [staffForm, setStaffForm] = useState({
    email: "",
    password: ""
  });

  const handleStudentChange = (e) => {
    setStudentForm({
      ...studentForm,
      [e.target.name]: e.target.value
    });
  };

  const handleStaffChange = (e) => {
    setStaffForm({
      ...staffForm,
      [e.target.name]: e.target.value
    });
  };

  const handleStudentSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {

      await authService.requestStudentOtp(
        studentForm.studentId,
        studentForm.dob
      );

      setSuccess("OTP sent to your registered email.");

      setTimeout(() => {
        window.location.href =
          `/verify-otp?studentId=${studentForm.studentId}`;
      }, 1200);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {

      const response =
        await authService.staffLogin(
          staffForm.email,
          staffForm.password
        );

      login(response.staff, "staff");

      setSuccess("Login successful! Redirecting...");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">

        <button
          onClick={() => setActiveTab("student")}
          className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
            activeTab === "student"
              ? 'bg-white text-sky-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Student Login
        </button>

        <button
          onClick={() => setActiveTab("staff")}
          className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
            activeTab === "staff"
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Staff Login
        </button>

      </div>

      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      {activeTab === "student" && (

        <form onSubmit={handleStudentSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Student ID
            </label>

            <input
              type="text"
              name="studentId"
              value={studentForm.studentId}
              onChange={handleStudentChange}
              placeholder="TU4F2222016"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Date of Birth
            </label>

            <input
              type="date"
              name="dob"
              value={studentForm.dob}
              onChange={handleStudentChange}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Sending OTP..." : "Continue with OTP"}
          </Button>

          <p className="text-center text-xs text-slate-500">
            OTP will be sent to your registered email.
          </p>

        </form>

      )}

      {activeTab === "staff" && (

        <form onSubmit={handleStaffSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={staffForm.email}
              onChange={handleStaffChange}
              placeholder="staff@college.com"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={staffForm.password}
              onChange={handleStaffChange}
              placeholder="Enter password"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? "Signing in..." : "Login as Staff"}
          </Button>

        </form>

      )}

    </div>

  );
};

export default LoginForm;