"use client"

import { useTheme } from "next-themes"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { useSettings } from "@/context/settings-context"
import { useState } from "react"

interface PieChartProps {
  data: {
    name: string
    value: number
    color: string
  }[]
}

export function PieChartComponent({ data }: PieChartProps) {
  const { theme } = useTheme()
  const { formatCurrency, translate } = useSettings()
  const isDark = theme === "dark"
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)

  // Procesar los colores para que sean compatibles con Recharts
  const processedData = data.map(item => ({
    name: item.name,
    value: item.value,
    // Extraer colores de las clases de Tailwind
    color: getColorFromTailwind(item.color, isDark)
  }))

  // Función para obtener colores de las clases de Tailwind
  function getColorFromTailwind(colorClass: string, isDarkMode: boolean) {
    const colorMap: Record<string, string> = {
      // Colores para modo claro
      'purple-500': '#8b5cf6',
      'blue-500': '#3b82f6',
      'emerald-500': '#10b981',
      'amber-500': '#f59e0b',
      'rose-500': '#f43f5e',
      'indigo-500': '#6366f1',
      'teal-500': '#14b8a6',
      
      // Colores para modo oscuro
      'purple-600': '#7c3aed',
      'blue-600': '#2563eb',
      'emerald-600': '#059669',
      'amber-600': '#d97706',
      'rose-600': '#e11d48',
      'indigo-600': '#4f46e5',
      'teal-600': '#0d9488',
    }
    
    // Extraer el nombre base del color de la clase
    const colorParts = colorClass.split('/')
    const baseColor = colorParts[0]
    
    // Determinar si usar la versión oscura o clara
    const colorKey = isDarkMode ? 
      baseColor.replace('-500', '-600') : 
      baseColor
    
    return colorMap[colorKey] || '#8b5cf6' // Color púrpura por defecto
  }

  // Personalizar el tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <Card className="p-2 border shadow-md dark:bg-card/95 backdrop-blur-sm">
          <CardContent className="p-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
              <span className="font-medium">{data.name}:</span>
              <span>{data.value}%</span>
            </div>
          </CardContent>
        </Card>
      )
    }
    return null
  }

  // Renderizado del sector activo
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke={isDark ? "#1e1e2f" : "#ffffff"}
          strokeWidth={2}
        />
      </g>
    );
  };

  // Manejador de eventos para activar un sector
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // Manejador de eventos para desactivar un sector
  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  // Renderizar un mensaje si no hay datos
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{translate("common.no_data")}</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={processedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={90}
          innerRadius={0}
          fill="#8884d8"
          dataKey="value"
          animationDuration={1000}
          animationEasing="ease-out"
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          onMouseEnter={onPieEnter}
          onMouseLeave={onPieLeave}
          label={({ name, value, cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
            // Calcular la posición del texto para evitar superposiciones
            const RADIAN = Math.PI / 180;
            const radius = outerRadius * 0.7;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);
            
            // Solo mostrar etiquetas para segmentos grandes (más del 8%)
            return value > 8 ? (
              <text 
                x={x} 
                y={y} 
                fill={isDark ? "#e2e8f0" : "#1e293b"}
                textAnchor="middle" 
                dominantBaseline="middle"
                className="text-xs font-medium"
              >
                {`${value}%`}
              </text>
            ) : null;
          }}
        >
          {processedData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color} 
              stroke={isDark ? "#1e1e2f" : "#ffffff"} 
              strokeWidth={2}
              className="focus:outline-none hover:opacity-80 transition-opacity"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          layout="vertical" 
          verticalAlign="middle" 
          align="right"
          formatter={(value, entry: any, index) => (
            <span className="text-sm font-medium hover:opacity-80 cursor-pointer" 
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(undefined)}>
              {value}
            </span>
          )}
          wrapperStyle={{ 
            fontFamily: 'inherit',
            fontSize: '14px',
            paddingLeft: '10px'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
