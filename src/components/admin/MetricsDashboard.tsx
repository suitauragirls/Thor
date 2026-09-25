import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { Activity, Percent, IndianRupee, ShoppingCart, Users } from 'lucide-react';
import { VisitorAnalytics } from '../../utils/visitorTracker';

interface MetricsDashboardProps {
  visitorStats: VisitorAnalytics;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ visitorStats }) => {
  const { orders = [] } = useAdmin();

  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled' && o.status !== 'Refunded')
    .reduce((sum, ord) => sum + ord.finalTotal, 0);

  const totalOrders = orders.length;
  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  
  // Assuming visitorStats contains todayUniqueVisitors
  const conversionRate = visitorStats.todayUniqueVisitors > 0 
    ? ((totalOrders / visitorStats.todayUniqueVisitors) * 100).toFixed(1) 
    : '0.0';

  const metrics = [
    {
      title: 'Live Traffic',
      value: visitorStats.liveActiveCount,
      icon: Activity,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Conversion %',
      value: `${conversionRate}%`,
      icon: Percent,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'text-[#3D0F1F]',
      bgColor: 'bg-[#3D0F1F]/10'
    },
    {
      title: 'Avg Order Value',
      value: `₹${aov.toLocaleString('en-IN')}`,
      icon: ShoppingCart,
      color: 'text-[#B8935A]',
      bgColor: 'bg-[#B8935A]/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div key={metric.title} className="bg-[#FDFBF7] p-5 rounded-2xl border border-[#B8935A]/25 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{metric.title}</span>
            <div className={`p-2 rounded-lg ${metric.bgColor} ${metric.color}`}>
              <metric.icon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-gray-900">{metric.value}</p>
        </div>
      ))}
    </div>
  );
};
