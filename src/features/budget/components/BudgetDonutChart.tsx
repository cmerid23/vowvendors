import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { BUDGET_CATEGORIES } from '../data/categories'
import type { CategoryBudget } from '../lib/calculator'

interface BudgetDonutChartProps {
  categories: CategoryBudget[]
  totalBudget: number
  perPersonCost: number
}

function formatK(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`
}

export function BudgetDonutChart({ categories, totalBudget, perPersonCost }: BudgetDonutChartProps) {
  const data = categories
    .filter((c) => c.tier !== 'skip' && c.allocatedAmount > 0)
    .map((c) => {
      const cat = BUDGET_CATEGORIES.find((b) => b.id === c.categoryId)!
      return {
        name: cat.name,
        value: c.allocatedAmount,
        color: cat.color,
        percent: c.allocatedPercent,
      }
    })

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-52 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
              strokeWidth={2}
              stroke="#fff"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`$${Number(value).toLocaleString()}`]}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-text-secondary font-medium">Total</span>
          <span className="text-xl font-bold font-heading text-text">
            {formatK(totalBudget)}
          </span>
          <span className="text-xs text-text-secondary">{formatK(perPersonCost)}/person</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 w-full max-w-xs">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-text-secondary truncate">{item.name}</span>
            <span className="text-xs font-medium text-text ml-auto">{item.percent.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
