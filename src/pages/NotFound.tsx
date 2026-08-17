import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, CreditCard } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  return (
    <PageContainer>
      <div className="text-center py-16 sm:py-24 max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CreditCard className="w-10 h-10" />
        </div>
        
        <div className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
          404 Error
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Page Not Found
        </h1>

        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mb-8 leading-relaxed">
          The page you are looking for doesn't exist, may have been moved, or the URL address was typed incorrectly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full sm:w-auto" leftIcon={<Home className="w-4 h-4" />}>
              Back to Home
            </Button>
          </Link>
          <Link to="/gift-cards" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full sm:w-auto" leftIcon={<Search className="w-4 h-4" />}>
              Browse Gift Cards
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};
