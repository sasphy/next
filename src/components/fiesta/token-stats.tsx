import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Disc, 
  Users, 
  Wallet
} from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change, positive, index }) => (
  <motion.div 
    className="bg-card rounded-xl p-5 border border-border/50 relative overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.1 * index }}
    whileHover={{ y: -5 }}
  >
    <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-primary/5"></div>
    
    <div className="flex justify-between items-start">
      <div>
        <p className="text-muted-foreground mb-2">{title}</p>
        <h3 className="text-2xl md:text-3xl font-semibold">{value}</h3>
        
        {change && (
          <span className={`text-xs mt-1 flex items-center gap-1 ${positive ? 'text-green-500' : 'text-red-500'}`}>
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 transform rotate-180" />}
            {change}
          </span>
        )}
      </div>
      
      <div className="bg-primary/10 rounded-full p-3">
        {icon}
      </div>
    </div>
  </motion.div>
);

const TokenStats: React.FC = () => {
  const stats = [
    {
      icon: <BarChart3 className="h-5 w-5 text-primary" />,
      title: "Total Volume",
      value: "452.8 SOL",
      change: "+12.5%",
      positive: true,
    },
    {
      icon: <Disc className="h-5 w-5 text-primary" />,
      title: "Active Tokens",
      value: "142",
      change: "+8.3%",
      positive: true,
    },
    {
      icon: <Users className="h-5 w-5 text-primary" />,
      title: "Unique Holders",
      value: "1,872",
      change: "+22.6%",
      positive: true,
    },
    {
      icon: <Wallet className="h-5 w-5 text-primary" />,
      title: "Avg. Token Price",
      value: "3.24 SOL",
      change: "-0.8%",
      positive: false,
    },
  ];

  return (
    <section className="token-stats py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard 
            key={stat.title}
            index={index}
            {...stat}
          />
        ))}
      </div>
    </section>
  );
};

export default TokenStats; 