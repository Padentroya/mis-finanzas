import React, { useMemo } from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { Transaction, CategoryColorMap } from '../types';

interface CategoryTreemapProps {
  transactions: Transaction[];
  colors: CategoryColorMap;
}

const CustomContent = (props: any) => {
  const { root, depth, x, y, width, height, index, payload, name, value, customColors } = props;
  
  // Retrieve color from the passed customColors map or fallback
  const color = customColors[name] || '#94a3b8';

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color,
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
        rx={8}
        ry={8}
      />
      {width > 50 && height > 30 ? (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 2}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
            fontWeight="bold"
            style={{ pointerEvents: 'none' }}
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 12}
            textAnchor="middle"
            fill="#fff"
            fontSize={10}
            fillOpacity={0.9}
            style={{ pointerEvents: 'none' }}
          >
            €{value}
          </text>
        </>
      ) : null}
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl">
        <p className="font-bold text-slate-800">{payload[0].payload.name}</p>
        <p className="text-emerald-600 font-semibold">
          €{payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const CategoryTreemap: React.FC<CategoryTreemapProps> = ({ transactions, colors }) => {
  const data = useMemo(() => {
    // Filter only expenses
    const expenses = transactions.filter(t => t.type === 'expense');
    
    // Group by Category
    const grouped = expenses.reduce((acc, curr) => {
      const existing = acc.find(item => item.name === curr.category);
      if (existing) {
        existing.size += curr.amount;
      } else {
        acc.push({ name: curr.category, size: curr.amount });
      }
      return acc;
    }, [] as { name: string; size: number }[]);

    // Sort by size desc to make the treemap look better
    return grouped.sort((a, b) => b.size - a.size);
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
        No hay datos de gastos para generar el mapa
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#fff"
          fill="#8884d8"
          content={<CustomContent customColors={colors} />}
          animationDuration={800}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryTreemap;