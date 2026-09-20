import { useState } from 'react';
import { Send, Copy, CheckCircle, Code, Play } from 'lucide-react';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requestBody?: string;
  queryParams?: string;
}

interface ApiRequest {
  endpoint: ApiEndpoint;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
}

export default function ApiPlayground() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [request, setRequest] = useState<ApiRequest | null>(null);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const endpoints: ApiEndpoint[] = [
    {
      method: 'GET',
      path: '/api/v1/loans',
      description: 'List all loans',
      queryParams: '?status=active&limit=10',
    },
    {
      method: 'POST',
      path: '/api/v1/loans',
      description: 'Create a new loan',
      requestBody: JSON.stringify({
        borrowerId: 'BR-001',
        productId: 'P-001',
        principal: 15000,
      }, null, 2),
    },
    {
      method: 'GET',
      path: '/api/v1/loans/:id',
      description: 'Get loan details',
      queryParams: '',
    },
    {
      method: 'POST',
      path: '/api/v1/loans/:id/disburse',
      description: 'Disburse a loan',
      requestBody: JSON.stringify({
        mpesaPhone: '+254712345678',
      }, null, 2),
    },
    {
      method: 'GET',
      path: '/api/v1/borrowers',
      description: 'List all borrowers',
      queryParams: '?kycStatus=verified',
    },
    {
      method: 'POST',
      path: '/api/v1/borrowers',
      description: 'Register a new borrower',
      requestBody: JSON.stringify({
        phone: '+254712345678',
        firstName: 'John',
        lastName: 'Doe',
        idNumber: '12345678',
      }, null, 2),
    },
    {
      method: 'GET',
      path: '/api/v1/products',
      description: 'List loan products',
      queryParams: '?status=active',
    },
    {
      method: 'POST',
      path: '/api/v1/mpesa/stk-push',
      description: 'Initiate M-Pesa STK Push',
      requestBody: JSON.stringify({
        phone: '+254712345678',
        amount: 15000,
        accountReference: 'LN-001',
      }, null, 2),
    },
    {
      method: 'GET',
      path: '/api/v1/audit-log',
      description: 'Query audit log',
      queryParams: '?action=LOAN_DISBURSED&limit=50',
    },
  ];

  const handleSelectEndpoint = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    
    const baseUrl = 'https://api.lendingos.co.ke';
    const url = `${baseUrl}${endpoint.path}${endpoint.queryParams || ''}`;
    
    setRequest({
      endpoint,
      url,
      method: endpoint.method,
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json',
        'X-Tenant-ID': 'T-MIKA-001',
      },
      body: endpoint.requestBody,
    });
    
    setResponse(null);
  };

  const handleSendRequest = () => {
    if (!request) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResponse = generateMockResponse(request);
      setResponse(mockResponse);
      setLoading(false);
    }, 800 + Math.random() * 700);
  };

  const generateMockResponse = (req: ApiRequest): ApiResponse => {
    const startTime = Date.now();
    
    // Generate mock response based on endpoint
    let responseBody = {};
    let status = 200;
    
    if (req.endpoint.path.includes('/loans') && req.method === 'GET') {
      responseBody = {
        data: [
          {
            id: 'LN-001',
            borrowerId: 'BR-001',
            principal: 15000,
            status: 'active',
            createdAt: '2026-02-15T10:30:00Z',
          },
          {
            id: 'LN-002',
            borrowerId: 'BR-002',
            principal: 25000,
            status: 'active',
            createdAt: '2026-02-16T14:20:00Z',
          },
        ],
        pagination: {
          total: 1247,
          limit: 10,
          offset: 0,
        },
      };
    } else if (req.endpoint.path.includes('/loans') && req.method === 'POST') {
      status = 201;
      responseBody = {
        id: 'LN-1248',
        borrowerId: 'BR-001',
        productId: 'P-001',
        principal: 15000,
        status: 'applied',
        createdAt: new Date().toISOString(),
      };
    } else if (req.endpoint.path.includes('/disburse')) {
      responseBody = {
        success: true,
        transactionId: 'MP-2026-001247',
        mpesaReceipt: 'QKJ8A7B6C5',
        status: 'completed',
      };
    } else if (req.endpoint.path.includes('/borrowers') && req.method === 'GET') {
      responseBody = {
        data: [
          {
            id: 'BR-001',
            phone: '+254712345678',
            firstName: 'John',
            lastName: 'Doe',
            kycStatus: 'verified',
          },
        ],
        pagination: {
          total: 892,
          limit: 10,
          offset: 0,
        },
      };
    } else if (req.endpoint.path.includes('/stk-push')) {
      responseBody = {
        requestId: 'STK-2026-001247',
        status: 'pending',
        message: 'STK push sent to +254712345678',
      };
    } else {
      responseBody = {
        message: 'Success',
        data: [],
      };
    }
    
    return {
      status,
      statusText: status === 200 ? 'OK' : status === 201 ? 'Created' : 'Error',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': `req-${Date.now()}`,
        'X-RateLimit-Remaining': '999',
      },
      body: JSON.stringify(responseBody, null, 2),
      time: Date.now() - startTime,
    };
  };

  const copyCurl = () => {
    if (!request) return;
    
    const curl = `curl -X ${request.method} '${request.url}' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Tenant-ID: T-MIKA-001' \\
  ${request.body ? `-d '${request.body}'` : ''}`;
    
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Playground</h1>
        <p className="text-gray-600 mt-1">
          Test API endpoints interactively
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoint Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Endpoints</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {endpoints.map((endpoint, i) => (
              <button
                key={i}
                onClick={() => handleSelectEndpoint(endpoint)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedEndpoint === endpoint
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                    endpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                    endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-xs font-mono text-gray-600">{endpoint.path}</code>
                </div>
                <p className="text-xs text-gray-600">{endpoint.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Request Builder */}
        <div className="lg:col-span-2 space-y-6">
          {request ? (
            <>
              {/* Request */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Request</h2>
                  <button
                    onClick={copyCurl}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy as cURL'}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-2 rounded-l-lg text-sm font-medium ${
                        request.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                        request.method === 'POST' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {request.method}
                      </span>
                      <input
                        type="text"
                        value={request.url}
                        onChange={(e) => setRequest({ ...request, url: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Headers</label>
                    <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono overflow-x-auto">
                      {JSON.stringify(request.headers, null, 2)}
                    </pre>
                  </div>

                  {request.body && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                      <textarea
                        value={request.body}
                        onChange={(e) => setRequest({ ...request, body: e.target.value })}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleSendRequest}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300"
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Request
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Response */}
              {response && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Response</h2>
                    <div className="flex items-center gap-3 text-sm">
                      <span className={`px-2 py-1 rounded font-medium ${
                        response.status < 300 ? 'bg-green-100 text-green-700' :
                        response.status < 400 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {response.status} {response.statusText}
                      </span>
                      <span className="text-gray-600">{response.time}ms</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Response Headers</label>
                      <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono overflow-x-auto">
                        {JSON.stringify(response.headers, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Response Body</label>
                      <pre className="bg-gray-900 text-green-400 border border-gray-200 rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-96">
                        {response.body}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Code className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Endpoint</h3>
              <p className="text-sm text-gray-600">
                Choose an API endpoint from the list to start testing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
