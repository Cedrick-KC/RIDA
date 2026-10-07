import React from 'react';

// Define the analytics chart props type
interface AnalyticsChartProps {
  type?: 'bar' | 'line' | 'pie' | 'doughnut' | 'area';
  data?: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  height?: string;
  showLegend?: boolean;
  className?: string;
}

// AnalyticsChart component - Simple chart visualization
const AnalyticsChart = ({
  type = 'bar',
  data = [],
  title = '',
  height = '200px',
  showLegend = true,
  className = ''
}: AnalyticsChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className={`chart-placeholder ${className}`} style={{ minHeight: height }}>
        <div className="d-flex h-100 align-items-center justify-content-center">
          <p className="text-muted">No data available</p>
        </div>
      </div>
    );
  }

  // Calculate chart dimensions
  const getChartData = () => {
    const labels = data.map(item => item.name || '');
    const values = data.map(item => item.value || 0);
    const colors = data.map(item => item.color ||
      (type === 'pie' || type === 'doughnut'
        ? ['#0056b3', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6c757d', '#20c997', '#fd7e1e'][item.name ? item.name.length % 8 : 0]
        : '#0056b3')
    );

    return { labels, values, colors };
  };

  const { labels, values, colors } = getChartData();
  const maxValue = Math.max(...values);
  const barHeight = Math.max(20, (parseInt(height) || 200) / (values.length + 1) - 10);

  return (
    <div className={`chart-container ${className}`} style={{ minHeight: height }}>
      {/* Chart Title */}
      {title && (
        <div className="chart-title mb-3">
          <h6 className="mb-0">{title}</h6>
        </div>
      )}

      {/* Chart Container */}
      <div className="chart-content" style={{ height: height, position: 'relative' }}>
        {type === 'bar' && (
          <>
            {/* X-axis labels */}
            <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.75rem' }}>
              {labels.map((label, index) => (
                <div key={index} className="text-center" style={{ width: `${100 / labels.length}%` }}>
                  <small>{label}</small>
                </div>
              ))}
            </div>

            {/* Bars */}
            <div className="d-flex" style={{ height: '80%' }}>
              {values.map((value, index) => {
                const barPercentage = (value / maxValue) * 100;
                return (
                  <div
                    key={index}
                    className="d-flex flex-column align-items-center justify-content-end"
                    style={{
                      flex: 1,
                      margin: `0 2px`,
                      position: 'relative'
                    }}
                  >
                    <div
                      className="bar"
                      style={{
                        width: '60%',
                        height: `${barPercentage}%`,
                        backgroundColor: colors[index],
                        borderRadius: '4px 4px 0 0',
                        marginBottom: '2px'
                      }}
                    >
                      <div className="bar-label" style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        fontSize: '0.65rem',
                        padding: '2px 4px',
                        borderRadius: '2px',
                        whiteSpace: 'nowrap'
                      }}>
                        {value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {type === 'line' && (
          <div className="line-chart">
            {/* Simplified line chart - in production would use Chart.js or similar */}
            <div className="chart-grid">
              {/* Horizontal grid lines */}
              {[0, 25, 50, 75, 100].map(percent => (
                <div
                  key={`h-${percent}`}
                  className="grid-line horizontal"
                  style={{
                    bottom: `${percent}%`,
                    left: 0,
                    right: 0,
                    height: '1px',
                    backgroundColor: '#e9ecef'
                  }}
                />
              ))}

              {/* Vertical grid lines */}
              {labels.map((label, index) => (
                <div
                  key={`v-${index}`}
                  className="grid-line vertical"
                  style={{
                    left: `${(index / (labels.length - 1) || 0) * 100}%`,
                    top: 0,
                    bottom: 0,
                    width: '1px',
                    backgroundColor: '#e9ecef'
                  }}
                />
              ))}
            </div>

            {/* Line path */}
            <div className="line-path" style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '100%'
            }}>
              {/* Points */}
              {values.map((value, index) => {
                const xPercent = (index / (values.length - 1) || 0) * 100;
                const yPercent = ((value / maxValue) || 0) * 100;

                return (
                  <div
                    key={index}
                    className="point"
                    style={{
                      left: `${xPercent}%`,
                      bottom: `${yPercent}%`,
                      width: '8px',
                      height: '8px',
                      backgroundColor: colors[0] || '#0056b3',
                      borderRadius: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {/* Tooltip */}
                    <div className="tooltip" style={{
                      position: 'absolute',
                      bottom: '120%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap'
                    }}>
                      {labels[index]}: {value}
                    </div>
                  </div>
                );
              })}

              {/* Line connecting points */}
              <div className="line" style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: colors[0] || '#0056b3',
                transform: 'translateY(-50%)'
              }}></div>
            </div>
          </div>
        )}

        {type === 'pie' || type === 'doughnut' && (
          <div className="pie-chart">
            {/* Pie chart segments */}
            {values.map((value, index) => {
              const startAngle = index === 0 ? 0 : values.slice(0, index).reduce((sum, v) => sum + v, 0) / maxValue * 360;
              const endAngle = startAngle + (value / maxValue) * 360;

              // Simplified pie slice - in production would use proper SVG paths
              return (
                <div
                  key={index}
                  className="pie-slice"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: `${Math.min(80, parseInt(height) || 200) * 0.8}px`,
                    height: `${Math.min(80, parseInt(height) || 200) * 0.8}px`,
                    margin: `-${Math.min(40, (parseInt(height) || 200) * 0.4)}px 0 0 -${Math.min(40, (parseInt(height) || 200) * 0.4)}px`,
                    borderRadius: '50%',
                    clip: `rect(0px, ${Math.min(40, (parseInt(height) || 200) * 0.4)}px, ${Math.min(40, (parseInt(height) || 200) * 0.4)}px, ${Math.min(20, (parseInt(height) || 200) * 0.2)}px)`,
                    backgroundColor: colors[index]
                  }}
                >
                  {/* Label */}
                  {showLegend && (
                    <div className="pie-label" style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) rotate(${startAngle + (value / maxValue) * 180}deg)`,
                      origin: 'center',
                      fontSize: '0.75rem',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        display: 'inline-block',
                        transform: `rotate(${-startAngle - (value / maxValue) * 180}deg)`
                      }}>
                        {labels[index]}<br/><small>{value}</small>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Center text for doughnut */}
            {type === 'doughnut' && (
              <div className="pie-center" style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '40%',
                height: '40%',
                backgroundColor: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.25rem'
              }}>
                {values.reduce((sum, v) => sum + v, 0)}
              </div>
            )}
          </div>
        )}

        {type === 'area' && (
          <div className="area-chart">
            {/* Area chart */}
            <div className="chart-grid">
              {/* Horizontal grid lines */}
              {[0, 25, 50, 75, 100].map(percent => (
                <div
                  key={`h-${percent}`}
                  className="grid-line horizontal"
                  style={{
                    bottom: `${percent}%`,
                    left: 0,
                    right: 0,
                    height: '1px',
                    backgroundColor: '#e9ecef'
                  }}
                />
              ))}

              {/* Vertical grid lines */}
              {labels.map((label, index) => (
                <div
                  key={`v-${index}`}
                  className="grid-line vertical"
                  style={{
                    left: `${(index / (labels.length - 1) || 0) * 100}%`,
                    top: 0,
                    bottom: 0,
                    width: '1px',
                    backgroundColor: '#e9ecef'
                  }}
                />
              ))}
            </div>

            {/* Area path */}
            <div className="area-path" style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '100%'
            }}>
              {/* Area fill */}
              <div className="area-fill" style={{
                position: 'absolute',
                bottom: 0;
                left: 0;
                right: 0;
                height: '100%',
                background: `linear-gradient(to top, ${colors[0] || '#0056b3'}33, transparent)`,
                pointerEvents: 'none'
              }}></div>

              {/* Line path */}
              <div className="line-path" style={{
                position: 'absolute';
                bottom: 0;
                left: 0;
                right: 0;
                height: '100%'
              }}>
                {/* Points */}
                {values.map((value, index) => {
                  const xPercent = (index / (values.length - 1) || 0) * 100;
                  const yPercent = ((value / maxValue) || 0) * 100;

                  return (
                    <div
                      key={index}
                      className="point"
                      style={{
                        left: `${xPercent}%`;
                        bottom: `${yPercent}%`;
                        width: '8px';
                        height: '8px';
                        backgroundColor: colors[0] || '#0056b3';
                        borderRadius: '50%';
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      {/* Tooltip */}
                      <div className="tooltip" style={{
                        position: 'absolute';
                        bottom: '120%';
                        left: '50%';
                        transform: 'translateX(-50%)';
                        backgroundColor: 'rgba(0,0,0,0.7)';
                        color: 'white';
                        padding: '4px 8px';
                        borderRadius: '4px';
                        fontSize: '0.75rem';
                        whiteSpace: 'nowrap'
                      }}>
                        {labels[index]}: {value}
                      </div>
                    </div>

                    {/* Line connecting points */}
                    <div className="line" style={{
                      position: 'absolute';
                      top: '50%';
                      left: 0;
                      right: 0;
                      height: '2px';
                      backgroundColor: colors[0] || '#0056b3';
                      transform: 'translateY(-50%)'
                    }}></div>
                  </div>
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && type !== 'pie' && type !== 'doughnut' && (
        <div className="chart-legend mt-2 d-flex flex-wrap gap-2">
          {labels.map((label, index) => (
            <div
              key={index}
              className="legend-item d-flex align-items-center"
            >
              <div
                className="legend-color"
                style={{
                  width: '12px';
                  height: '12px';
                  backgroundColor: colors[index];
                  borderRadius: '2px';
                }}
              ></div>
              <small className="ms-1">{label}</small>
            </div>
          ))}
        </div>
      )}

      {/* Pie/Doughnut Legend */}
      {showLegend && (type === 'pie' || type === 'doughnut') && (
        <div className="chart-legend mt-2 d-flex flex-wrap gap-3 justify-content-center">
          {labels.map((label, index) => (
            <div
              key={index}
              className="legend-item d-flex align-items-center"
            >
              <div
                className="legend-color"
                style={{
                  width: '12px';
                  height: '12px';
                  backgroundColor: colors[index];
                  borderRadius: '2px';
                }}
              ></div>
              <small className="ms-1">{label}: {values[index]} ({(values[index] / maxValue * 100).toFixed(1)}%)</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyticsChart;