import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AdminDashboard = ({ token, theme }) => {
  const [stats, setStats] = useState({ users: 0, drivers: 0, bookings: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const colors = themeColors[theme];

  useEffect(() => {
    // Mock API call to fetch stats
    const fetchStats = async () => {
      try {
        // Replace with: await fetch(`${process.env.REACT_APP_API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
        setStats({ users: 150, drivers: 45, bookings: 1200, revenue: 15000000 });
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch admin stats");
      }
    };
    fetchStats();
  }, [token]);

  const statCards = [
    { title: 'Total Users', value: stats.users, icon: 'bi-people', color: colors.primary },
    { title: 'Active Drivers', value: stats.drivers, icon: 'bi-car-front', color: colors.success },
    { title: 'Total Bookings', value: stats.bookings, icon: 'bi-calendar-check', color: colors.info },
    { title: 'Revenue (RWF)', value: stats.revenue.toLocaleString(), icon: 'bi-cash-stack', color: colors.warning },
  ];

  return (
    <motion.div initial="initial" animate="animate" variants={pageTransition} className="container-fluid py-4">
      <h2 className="mb-4">System Overview</h2>
      
      <div className="row g-3 mb-4">
        {statCards.map((card, index) => (
          <div className="col-12 col-sm-6 col-xl-3" key={index}>
            <AnimatedCard delay={index * 0.1} theme={theme}>
              <div className="card border-0 shadow-sm p-3" style={{ backgroundColor: colors.cardBg }}>
                <div className="d-flex align-items-center">
                  <div className="rounded-circle p-3 me-3" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
                    <i className={`bi ${card.icon} fs-3`}></i>
                  </div>
                  <div>
                    <h6 className="text-muted mb-0">{card.title}</h6>
                    <h4 className="fw-bold mb-0">{card.value}</h4>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>
        ))}
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4" style={{ backgroundColor: colors.cardBg }}>
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="fw-bold">Recent Bookings</h5>
            </div>
            <div className="card-body px-4 pb-4">
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr className="text-muted">
                      <th>Customer</th>
                      <th>Driver</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Jean Pierre</td>
                      <td>Musa K.</td>
                      <td>Feb 14, 2026</td>
                      <td><span className="badge bg-success-subtle text-success">Completed</span></td>
                    </tr>
                    {/* Map more rows here */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm" style={{ backgroundColor: colors.cardBg }}>
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="fw-bold">Pending Driver Approvals</h5>
            </div>
            <div className="card-body px-4">
               <div className="d-flex align-items-center mb-3">
                 <div className="bg-light rounded p-2 me-3">📝</div>
                 <div>
                   <p className="mb-0 fw-semibold">Alex M. - Toyota RAV4</p>
                   <small className="text-primary" style={{ cursor: 'pointer' }}>Review Documents</small>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
