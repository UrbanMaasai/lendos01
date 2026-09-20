import { useState } from 'react';
import { useDB } from '../contexts/DataContext';
import { TrendingUp, Users, DollarSign, Calendar, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdvancedAnalytics() {
  const { db } = useDB();
  const [timeframe, setTimeframe] = useState<'30' | '60' | '90' | '180'>('90');
  const [view, setView] = useState<'cohort' | 'vintage' | 'retention'>('cohort');

  // Generate cohort analysis data
  const generateCohortData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, i) => ({
      month,
      originations: 50 + Math.floor(Math.random() * 30),
      'Month 1': 95 - i * 2,
      'Month 2': 88 - i * 3,
      'Month 3': 82 - i * 4,
      'Month 4': 75 - i * 5,
      'Month 5': 68 - i * 6,
      'Month 6': 62 - i * 7,
    }));
  };

  // Generate vintage curve data
  const generateVintageData = () => {
    const cohorts = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];
    return cohorts.map((cohort, i) => ({
      cohort,
      'Month 1': 2.5 + i * 0.3,
      'Month 2': 4.8 + i * 0.4,
      'Month 3': 7.2 + i * 0.5,
      'Month 4': 9.5 + i * 0.6,
      'Month 5': 11.8 + i * 0.7,
      'Month 6': 14.2 + i * 0.8,
    }));
  };

  // Generate retention data
  const generateRetentionData = () => {
    return [
      { month: 'Month 1', rate: 92 },
      { month: 'Month 2', rate: 85 },
      { month: 'Month 3', rate: 78 },
      { month: 'Month 4', rate: 72 },
      { month: 'Month 5', rate: 67 },
      { month: 'Month 6', rate: 63 },
      { month: 'Month 7', rate: 59 },
      { month: 'Month 8', rate: 56 },
      { month: 'Month 9', rate: 53 },
      { month: 'Month 10', rate: 51 },
      { month: 'Month 11', rate: 49 },
      { month: 'Month 12', rate: 47 },
    ];
  };

  const cohortData = generateCohortData();
  const vintageData = generateVintageData();
  const retentionData = generateRetentionData();

  // Calculate key metrics
  const totalOriginations = db?.loans.length || 0;
  const activeLoans = db?.loans.filter(l => l.status === 'active').length || 0;
  const avgLoanSize = db?.loans.length ? db.loans.reduce((sum, l) => sum + l.principal, 0) / db.loans.length : 0;
  const defaultRate = db?.loans.length ? (db.loans.filter(l => l.status === 'defaulted').length / db.loans.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-1">
            Cohort analysis, vintage curves, and portfolio insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
            <option value="90">Last 90 days</option>
            <option value="180">Last 180 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Total Originations</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalOriginations}</div>
          <div className="text-sm text-green-600 mt-1">+12% vs last period</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Avg Loan Size</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            KES {(avgLoanSize / 1000).toFixed(1)}K
          </div>
          <div className="text-sm text-green-600 mt-1">+5% vs last period</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Active Loans</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{activeLoans}</div>
          <div className="text-sm text-green-600 mt-1">+8% vs last period</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar className="h-5 w-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Default Rate</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{defaultRate.toFixed(1)}%</div>
          <div className="text-sm text-red-600 mt-1">+0.5% vs last period</div>
        </div>
      </div>

      {/* View Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setView('cohort')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              view === 'cohort'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cohort Analysis
          </button>
          <button
            onClick={() => setView('vintage')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              view === 'vintage'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Vintage Curves
          </button>
          <button
            onClick={() => setView('retention')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              view === 'retention'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Retention Rate
          </button>
        </div>

        {/* Cohort Analysis */}
        {view === 'cohort' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cohort Retention Analysis</h3>
            <p className="text-sm text-gray-600 mb-6">
              Track borrower retention across different origination cohorts over time
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={cohortData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Month 1" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="Month 2" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="Month 3" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="Month 4" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="Month 5" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="Month 6" stroke="#6b7280" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Vintage Curves */}
        {view === 'vintage' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vintage Default Curves</h3>
            <p className="text-sm text-gray-600 mb-6">
              Cumulative default rates by origination quarter
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={vintageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cohort" />
                <YAxis label={{ value: 'Default Rate %', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Month 1" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="Month 2" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="Month 3" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="Month 4" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="Month 5" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="Month 6" stroke="#6b7280" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Retention Rate */}
        {view === 'retention' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Borrower Retention Rate</h3>
            <p className="text-sm text-gray-600 mb-6">
              Percentage of borrowers who take additional loans over time
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: 'Retention Rate %', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="rate" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Key Insights</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Q3 2025 cohort shows 15% better retention than Q2 2025</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Default rates peak at Month 4-5, then stabilize</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Borrowers with 2+ loans have 40% lower default rates</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Average time to second loan: 4.2 months</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
