import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, Users, Clock, MousePointer, Target, BarChart3, PieChart, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllComparisonSlugs, getComparisonBySlug } from '@/data/comparisons';
import { getActiveExperiments, getPersistedTrafficSource } from '@/lib/comparison-ab-testing';
import { getAnalyticsSummaryQueryStructure } from '@/lib/comparison-analytics';
import Footer from '@/components/Footer';

interface MockMetric {
  pageViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  scrollDepth: number;
  ctaClickRate: number;
  conversionRate: number;
}

interface VariantMetrics {
  variantId: string;
  organic: MockMetric;
  other: MockMetric;
}

interface ComparisonMetrics {
  slug: string;
  name: string;
  variants: VariantMetrics[];
}

function generateMockMetrics(): MockMetric {
  return {
    pageViews: Math.floor(Math.random() * 500) + 100,
    uniqueVisitors: Math.floor(Math.random() * 300) + 50,
    avgTimeOnPage: Math.floor(Math.random() * 180) + 30,
    bounceRate: Math.random() * 40 + 20,
    scrollDepth: Math.random() * 30 + 60,
    ctaClickRate: Math.random() * 15 + 5,
    conversionRate: Math.random() * 8 + 2,
  };
}

function generateComparisonMetrics(): ComparisonMetrics[] {
  const slugs = getAllComparisonSlugs();
  return slugs.map(slug => {
    const comparison = getComparisonBySlug(slug);
    if (!comparison) return null;
    
    return {
      slug,
      name: comparison.competitorDisplayName,
      variants: comparison.experiment.variants.map(v => ({
        variantId: v.id,
        organic: generateMockMetrics(),
        other: generateMockMetrics(),
      })),
    };
  }).filter(Boolean) as ComparisonMetrics[];
}

export default function CompareAnalyticsPage() {
  const [metrics, setMetrics] = useState<ComparisonMetrics[]>([]);
  const [selectedComparison, setSelectedComparison] = useState<string | null>(null);
  const [showQuery, setShowQuery] = useState(false);
  
  useEffect(() => {
    setMetrics(generateComparisonMetrics());
  }, []);
  
  const activeExperiments = getActiveExperiments();
  const trafficSource = getPersistedTrafficSource();
  
  const refreshData = () => {
    setMetrics(generateComparisonMetrics());
  };
  
  const selectedMetrics = selectedComparison 
    ? metrics.find(m => m.slug === selectedComparison)
    : null;
  
  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-3xl font-bold text-white">Comparison A/B Testing Dashboard</h1>
            <p className="text-gray-400 mt-2">
              Track performance of comparison pages across different variants and traffic sources
            </p>
          </div>
          <Button
            variant="outline"
            onClick={refreshData}
            className="border-gray-700 text-gray-300"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Your Traffic Source</p>
                  <p className="text-lg font-semibold text-white capitalize">{trafficSource}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Active Experiments</p>
                  <p className="text-lg font-semibold text-white">{Object.keys(activeExperiments).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Comparison Pages</p>
                  <p className="text-lg font-semibold text-white">{metrics.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <PieChart className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Variants</p>
                  <p className="text-lg font-semibold text-white">
                    {metrics.reduce((acc, m) => acc + m.variants.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Comparison Pages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {metrics.map(m => (
                  <button
                    key={m.slug}
                    onClick={() => setSelectedComparison(m.slug)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedComparison === m.slug
                        ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <div className="font-medium">vs {m.name}</div>
                    <div className="text-sm text-gray-500">{m.variants.length} variants</div>
                  </button>
                ))}
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-800 mt-6">
              <CardHeader>
                <CardTitle className="text-white">Your Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(activeExperiments).length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No active experiment assignments. Visit a comparison page to get assigned a variant.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(activeExperiments).map(([slug, variantId]) => (
                      <div key={slug} className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">vs {slug}</span>
                        <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300">{variantId}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            {selectedMetrics ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Cortex vs {selectedMetrics.name} - Variant Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {selectedMetrics.variants.map(variant => (
                        <VariantCard key={variant.variantId} variant={variant} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="bg-gray-900/50 border-gray-800 h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Select a comparison page to view metrics</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">GA4 Query Template</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuery(!showQuery)}
              className="border-gray-700 text-gray-300"
            >
              {showQuery ? 'Hide Query' : 'Show Query'}
            </Button>
          </CardHeader>
          {showQuery && (
            <CardContent>
              <pre className="bg-black/50 rounded-lg p-4 text-xs text-green-400 overflow-x-auto">
                {getAnalyticsSummaryQueryStructure()}
              </pre>
            </CardContent>
          )}
        </Card>
        
        <div className="mt-8 p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">Demo Mode</h3>
          <p className="text-gray-400 text-sm">
            This dashboard shows simulated data for demonstration purposes. In production, 
            connect to your GA4 or analytics backend to display real metrics. The query template 
            above can be used with BigQuery to extract real data from GA4.
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

interface VariantCardProps {
  variant: VariantMetrics;
}

function VariantCard({ variant }: VariantCardProps) {
  return (
    <div className="border border-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium">
          {variant.variantId}
        </span>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-green-400 mb-3">Organic Traffic (Google)</h4>
          <MetricGrid metrics={variant.organic} />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">Other Traffic</h4>
          <MetricGrid metrics={variant.other} />
        </div>
      </div>
    </div>
  );
}

function MetricGrid({ metrics }: { metrics: MockMetric }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <MetricItem
        label="Page Views"
        value={metrics.pageViews.toLocaleString()}
        icon={<Users className="h-4 w-4" />}
      />
      <MetricItem
        label="Avg Time"
        value={`${Math.floor(metrics.avgTimeOnPage / 60)}:${(metrics.avgTimeOnPage % 60).toString().padStart(2, '0')}`}
        icon={<Clock className="h-4 w-4" />}
      />
      <MetricItem
        label="CTA Rate"
        value={`${metrics.ctaClickRate.toFixed(1)}%`}
        icon={<MousePointer className="h-4 w-4" />}
        trend={metrics.ctaClickRate > 10 ? 'up' : 'down'}
      />
      <MetricItem
        label="Conversion"
        value={`${metrics.conversionRate.toFixed(1)}%`}
        icon={<Target className="h-4 w-4" />}
        trend={metrics.conversionRate > 5 ? 'up' : 'down'}
      />
    </div>
  );
}

interface MetricItemProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
}

function MetricItem({ label, value, icon, trend }: MetricItemProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3">
      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white font-semibold">{value}</span>
        {trend && (
          trend === 'up' 
            ? <TrendingUp className="h-3 w-3 text-green-400" />
            : <TrendingDown className="h-3 w-3 text-red-400" />
        )}
      </div>
    </div>
  );
}
