import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface CreditScoreProps {
  score: number;
  factors: Array<{
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
    weight: number;
  }>;
}

export default function CreditScoreVisualization({ score, factors }: CreditScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 700) return 'text-green-600';
    if (score >= 600) return 'text-yellow-600';
    if (score >= 500) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 700) return 'Excellent';
    if (score >= 600) return 'Good';
    if (score >= 500) return 'Fair';
    return 'Poor';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 700) return 'bg-green-50 border-green-200';
    if (score >= 600) return 'bg-yellow-50 border-yellow-200';
    if (score >= 500) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getImpactIcon = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'neutral':
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive':
        return 'bg-green-50 border-green-200';
      case 'negative':
        return 'bg-red-50 border-red-200';
      case 'neutral':
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Score Display */}
      <div className={`rounded-lg border-2 p-6 ${getScoreBgColor(score)}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Your Credit Score</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold ${getScoreColor(score)}`}>
                {score}
              </span>
              <span className="text-gray-500">/ 850</span>
            </div>
            <p className={`text-lg font-semibold mt-2 ${getScoreColor(score)}`}>
              {getScoreLabel(score)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-2">Score Range</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>700-850: Excellent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>600-699: Good</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>500-599: Fair</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>300-499: Poor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Score Bar */}
        <div className="mt-6">
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
              style={{ width: '100%' }}
            ></div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-gray-900 rounded"
              style={{ left: `${(score / 850) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Score Factors */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Score Factors</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          These factors affect your credit score. Understanding them can help you improve your score over time.
        </p>

        <div className="space-y-3">
          {factors.map((factor, index) => (
            <div
              key={index}
              className={`rounded-lg border p-4 ${getImpactColor(factor.impact)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getImpactIcon(factor.impact)}
                  <h4 className="font-semibold text-gray-900">{factor.name}</h4>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  Weight: {factor.weight}%
                </span>
              </div>
              <p className="text-sm text-gray-700 ml-6">{factor.description}</p>
              
              {/* Weight Bar */}
              <div className="mt-3 ml-6">
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full ${
                      factor.impact === 'positive'
                        ? 'bg-green-500'
                        : factor.impact === 'negative'
                        ? 'bg-red-500'
                        : 'bg-gray-500'
                    }`}
                    style={{ width: `${factor.weight}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">How to Improve Your Score</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Make all loan repayments on time</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Keep your credit utilization below 30%</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span> Maintain a mix of different credit types</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Avoid applying for multiple loans in a short period</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Keep old accounts open to maintain credit history length</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
