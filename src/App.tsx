/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Properties } from './components/Properties';
import { Tenants } from './components/Tenants';
import { UtilitySettlements } from './components/UtilitySettlements';
import { YieldCalculator } from './components/YieldCalculator';
import { RentIncreases } from './components/RentIncreases';
import { Portfolio } from './components/Portfolio';
import { Operations } from './components/Operations';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'properties' && <Properties />}
        {activeTab === 'tenants' && <Tenants />}
        {activeTab === 'utilities' && <UtilitySettlements />}
        {activeTab === 'rent-increases' && <RentIncreases />}
        {activeTab === 'calculator' && <YieldCalculator />}
        {activeTab === 'portfolio' && <Portfolio />}
        {activeTab === 'operations' && <Operations />}
    </Layout>
  );
}
