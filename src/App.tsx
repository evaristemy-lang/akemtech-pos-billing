/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { Dashboard } from './components/dashboard/Dashboard';
import { PosTerminal } from './components/pos/PosTerminal';
import { InvoicingManager } from './components/invoicing/InvoicingManager';
import { InventoryManager } from './components/inventory/InventoryManager';
import { CustomersManager } from './components/customers/CustomersManager';
import { SuppliersManager } from './components/suppliers/SuppliersManager';
import { ExpensesManager } from './components/expenses/ExpensesManager';
import { TreasuryManager } from './components/treasury/TreasuryManager';
import { EmployeesManager } from './components/employees/EmployeesManager';
import { AccountingManager } from './components/accounting/AccountingManager';
import { ReportsManager } from './components/reports/ReportsManager';
import { AkemAiAssistant } from './components/ai/AkemAiAssistant';
import { BranchManager } from './components/branches/BranchManager';
import { DeliveryManager } from './components/deliveries/DeliveryManager';
import { DocumentsVault } from './components/documents/DocumentsVault';
import { SettingsManager } from './components/settings/SettingsManager';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { PrinterSettingsModal } from './components/common/PrinterSettingsModal';
import { CustomerDisplayModal } from './components/common/CustomerDisplayModal';

const MainLayout: React.FC = () => {
  const { activeTab, showOnboarding, setShowOnboarding } = useApp();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'pos':
        return <PosTerminal />;
      case 'invoices':
        return <InvoicingManager />;
      case 'inventory':
        return <InventoryManager />;
      case 'customers':
        return <CustomersManager />;
      case 'suppliers':
        return <SuppliersManager />;
      case 'expenses':
        return <ExpensesManager />;
      case 'payments':
        return <TreasuryManager />;
      case 'employees':
        return <EmployeesManager />;
      case 'accounting':
        return <AccountingManager />;
      case 'reports':
        return <ReportsManager />;
      case 'ai':
        return <AkemAiAssistant />;
      case 'branches':
        return <BranchManager />;
      case 'deliveries':
        return <DeliveryManager />;
      case 'documents':
        return <DocumentsVault />;
      case 'settings':
        return <SettingsManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      {/* Desktop Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* View Container */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {renderActiveTab()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Onboarding Wizard Modal if requested */}
      {showOnboarding && (
        <OnboardingWizard onClose={() => setShowOnboarding(false)} />
      )}

      {/* Universal Printer & Hardware Modal */}
      <PrinterSettingsModal />

      {/* Customer Facing Pole Display Modal */}
      <CustomerDisplayModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
