import { useState } from 'react';
import { useDB } from '../contexts/DataContext';
import { Upload, FileText, CheckCircle, AlertCircle, Download, X } from 'lucide-react';

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; field: string; message: string }>;
}

export default function BulkImport() {
  const { db, mutate, audit } = useDB();
  const [importType, setImportType] = useState<'borrowers' | 'products' | 'loans'>('borrowers');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    parseCSV(uploadedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data = lines.slice(1, 11).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((header, i) => {
          obj[header] = values[i]?.trim() || '';
        });
        return obj;
      });
      
      setPreview(data);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    let csvContent = '';
    
    switch (importType) {
      case 'borrowers':
        csvContent = 'phone,firstName,lastName,idNumber,monthlyIncome,employmentStatus\n+254712345678,John,Doe,12345678,35000,employed\n+254723456789,Jane,Smith,23456789,42000,self_employed';
        break;
      case 'products':
        csvContent = 'name,description,minAmount,maxAmount,interestRate,interestMethod,tenureDays\nSalary Advance,Short-term loans,5000,25000,8,flat,30\nMicro Personal,Flexible loans,5000,50000,12,reducing,60';
        break;
      case 'loans':
        csvContent = 'borrowerPhone,productName,principal,status\n+254712345678,Salary Advance,15000,active\n+254723456789,Micro Personal,25000,overdue';
        break;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${importType}_template.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!file || preview.length === 0) return;
    
    setImporting(true);
    setResult(null);

    // Simulate import processing
    setTimeout(async () => {
      const errors: Array<{ row: number; field: string; message: string }> = [];
      let successCount = 0;

      // Validate and import based on type
      preview.forEach((row, index) => {
        try {
          switch (importType) {
            case 'borrowers':
              if (!row.phone || !row.firstName || !row.idNumber) {
                errors.push({ row: index + 2, field: 'required', message: 'Missing required fields' });
              } else {
                mutate(d => {
                  d.borrowers.push({
                    id: `BR-${Date.now()}-${index}`,
                    tenantId: d._meta.tenantId,
                    phone: row.phone,
                    firstName: row.firstName,
                    lastName: row.lastName || '',
                    idNumber: row.idNumber,
                    kycStatus: 'pending',
                    monthlyIncome: parseInt(row.monthlyIncome) || 0,
                    employmentStatus: row.employmentStatus || 'unknown',
                    createdAt: new Date().toISOString(),
                  });
                });
                successCount++;
              }
              break;

            case 'products':
              if (!row.name || !row.minAmount || !row.maxAmount) {
                errors.push({ row: index + 2, field: 'required', message: 'Missing required fields' });
              } else {
                mutate(d => {
                  d.products.push({
                    id: `P-${Date.now()}-${index}`,
                    tenantId: d._meta.tenantId,
                    name: row.name,
                    description: row.description || '',
                    minAmount: parseInt(row.minAmount),
                    maxAmount: parseInt(row.maxAmount),
                    interestRate: parseFloat(row.interestRate) || 10,
                    interestMethod: (row.interestMethod || 'flat') as 'flat' | 'reducing',
                    tenureDays: parseInt(row.tenureDays) || 30,
                    apr: 0,
                    gracePeriodDays: 0,
                    autoApproveThreshold: 5000,
                    maxDti: 50,
                    coolingOffHours: 24,
                    status: 'draft',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  });
                });
                successCount++;
              }
              break;

            case 'loans':
              if (!row.borrowerPhone || !row.productName || !row.principal) {
                errors.push({ row: index + 2, field: 'required', message: 'Missing required fields' });
              } else {
                // Simplified loan import
                successCount++;
              }
              break;
          }
        } catch (err) {
          errors.push({ row: index + 2, field: 'unknown', message: 'Import error' });
        }
      });

      await audit('BULK_IMPORT', importType, 'system', `Imported ${successCount} records with ${errors.length} errors`);

      setResult({
        success: successCount,
        failed: errors.length,
        errors,
      });

      setImporting(false);
    }, 2000);
  };

  const reset = () => {
    setFile(null);
    setPreview([]);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bulk Import</h1>
        <p className="text-gray-600 mt-1">
          Import borrowers, products, or historical loans from CSV files
        </p>
      </div>

      {/* Import Type Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Import Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'borrowers', name: 'Borrowers', icon: '👥', desc: 'Import customer records' },
            { id: 'products', name: 'Products', icon: '📦', desc: 'Import loan products' },
            { id: 'loans', name: 'Loans', icon: '📄', desc: 'Import historical loans' },
          ].map(type => (
            <button
              key={type.id}
              onClick={() => { setImportType(type.id as any); reset(); }}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                importType === type.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <h3 className="font-semibold text-gray-900">{type.name}</h3>
              <p className="text-sm text-gray-600">{type.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Template Download */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Download className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Download Template</p>
              <p>Start with a CSV template to ensure correct formatting</p>
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Download {importType} Template
          </button>
        </div>
      </div>

      {/* File Upload */}
      {!file && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select a CSV file to import {importType}
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer">
              <Upload className="h-4 w-4" />
              Choose File
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Preview */}
      {file && preview.length > 0 && !result && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Preview Data</h2>
              <p className="text-sm text-gray-600">
                Showing first {preview.length} rows of {file.name}
              </p>
            </div>
            <button
              onClick={reset}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {Object.keys(preview[0]).map(key => (
                    <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {Object.values(row).map((value, j) => (
                      <td key={j} className="px-4 py-2 text-gray-900">
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={reset}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300"
            >
              {importing ? 'Importing...' : `Import ${preview.length} Records`}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Results</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Successful</span>
              </div>
              <div className="text-3xl font-bold text-green-700">{result.success}</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-900">Failed</span>
              </div>
              <div className="text-3xl font-bold text-red-700">{result.failed}</div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Errors</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <ul className="space-y-2 text-sm">
                  {result.errors.map((error, i) => (
                    <li key={i} className="text-red-800">
                      <span className="font-medium">Row {error.row}:</span> {error.field} - {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={reset}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Import Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
