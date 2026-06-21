import React from 'react';

const PrivacyPolicy = () => (
  <div className="container py-5">
    <h1>Privacy Policy for RIDA</h1>
    <p className="text-muted">Last Updated: February 2026</p>
    <hr />
    <h3>1. Information We Collect</h3>
    <ul>
      <li><strong>Location Data:</strong> We track driver locations to facilitate real-time booking.</li>
      <li><strong>Personal Info:</strong> Names, phone numbers, and profile pictures for identification.</li>
    </ul>
    <h3>2. How We Use Data</h3>
    <p>Data is used to calculate fares, connect customers with drivers, and ensure safety during trips.</p>
    <h3>3. Third-Party Sharing</h3>
    <p>We do not sell your data. Location data is shared only between the assigned driver and customer.</p>
  </div>
);

export default PrivacyPolicy;
