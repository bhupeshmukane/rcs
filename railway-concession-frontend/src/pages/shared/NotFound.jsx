import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-2xl font-bold text-sky-700">404</div>

        <h2 className="mt-5 text-3xl font-black text-slate-900">Page Not Found</h2>

        <p className="mt-3 text-slate-600">
          Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you entered the wrong URL.
        </p>

        <div className="mt-8 space-y-3">
          <Link to="/">
            <Button className="w-full bg-slate-900 text-white hover:bg-slate-700">
              Go Back Home
            </Button>
          </Link>

          <Link to="/login">
            <Button variant="outline" className="w-full border-slate-400 text-slate-700 hover:bg-slate-100">
              Sign In Again
            </Button>
          </Link>
        </div>

        <div className="mt-8 rounded-xl border border-sky-100 bg-sky-50 p-4">
          <p className="text-sm text-slate-600">
            Need help? Contact support at{' '}
            <a href="mailto:support@railway-concession.com" className="text-sky-700 hover:underline">
              support@railway-concession.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;