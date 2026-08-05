import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import type { NavTab } from './components/Sidebar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { AssetManagementView } from './components/Assets/AssetManagementView';
import { EasmView } from './components/Easm/EasmView';
import { ScannerView } from './components/Scanner/ScannerView';
import { VulnerabilityManagementView } from './components/Vulnerabilities/VulnerabilityManagementView';
import { AIAnalystView } from './components/AIAnalyst/AIAnalystView';
import { VulnDatabaseView } from './components/VulnDatabase/VulnDatabaseView';
import { SbomView } from './components/Sbom/SbomView';
import { ComplianceView } from './components/Compliance/ComplianceView';
import { ReportGeneratorView } from './components/Reports/ReportGeneratorView';
import { TenantSettingsView } from './components/Settings/TenantSettingsView';

import { RegisterTenantModal } from './components/Auth/RegisterTenantModal';

import { 
  INITIAL_TENANT, 
  INITIAL_ASSETS, 
  INITIAL_VULNERABILITIES, 
  INITIAL_AUDIT_LOGS,
  MOCK_TENANTS
} from './services/storage';

import type { Tenant, Asset, Vulnerability, ScanJob, VulnStatus, UserRole } from './types';

import { isTabAllowedForRole } from './services/rbacService';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [tenant, setTenant] = useState<Tenant>(INITIAL_TENANT);
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>(INITIAL_VULNERABILITIES);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [currentRole, setCurrentRole] = useState<UserRole>('Super Admin');
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (!isTabAllowedForRole(activeTab, newRole)) {
      setActiveTab('dashboard');
    }
  };

  const handleTenantRegistered = (newTenant: Tenant, seedAssets: Asset[], seedVulns: Vulnerability[]) => {
    MOCK_TENANTS.unshift(newTenant);
    setTenant(newTenant);
    setAssets(prev => [...seedAssets, ...prev]);
    setVulnerabilities(prev => [...seedVulns, ...prev]);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: `admin@${newTenant.domain}`,
      role: 'Super Admin' as UserRole,
      action: 'TENANT_REGISTERED',
      details: `Self-service tenant registered: ${newTenant.name} (${newTenant.domain}) under ${newTenant.plan} plan.`,
      ip: '198.51.100.22',
      status: 'SUCCESS' as const,
    };
    setAuditLogs(prev => [newLog, ...prev]);
    setShowRegisterModal(false);
  };
  
  // Navigation & context pass
  const [targetAssetToScan, setTargetAssetToScan] = useState<Asset | null>(null);
  const [selectedVulnForAi, setSelectedVulnForAi] = useState<Vulnerability | null>(null);
  const [notificationsCount, setNotificationsCount] = useState<number>(2);

  // Handlers
  const handleAddAsset = (newAsset: Asset) => {
    setAssets(prev => [newAsset, ...prev]);
    setTenant(prev => ({ ...prev, assetsCount: prev.assetsCount + 1 }));
    
    // Add audit log
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'sarah.connor@acmefinancial.com',
      role: currentRole,
      action: 'ASSET_CREATED',
      details: `Created new asset: ${newAsset.name} (${newAsset.target})`,
      ip: '198.51.100.12',
      status: 'SUCCESS' as const,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleTriggerScanFromAsset = (asset: Asset) => {
    setTargetAssetToScan(asset);
    setActiveTab('scanner');
  };

  const handleScanCompleted = (job: ScanJob, newFindings: Vulnerability[]) => {
    if (newFindings.length > 0) {
      setVulnerabilities(prev => [...newFindings, ...prev]);
      setNotificationsCount(prev => prev + newFindings.length);
      
      // Recalculate score slightly
      setTenant(prev => ({
        ...prev,
        totalVulns: prev.totalVulns + newFindings.length,
        openCriticals: prev.openCriticals + newFindings.filter(f => f.severity === 'critical').length,
        securityScore: Math.max(45, prev.securityScore - 3),
      }));
    }

    // Update asset last scan date
    setAssets(prev => prev.map(a => a.id === job.assetId ? {
      ...a,
      lastScanDate: job.completedAt || new Date().toISOString().replace('T', ' ').slice(0, 16),
      vulnerabilityCounts: {
        ...a.vulnerabilityCounts,
        critical: a.vulnerabilityCounts.critical + newFindings.filter(f => f.severity === 'critical').length,
        high: a.vulnerabilityCounts.high + newFindings.filter(f => f.severity === 'high').length,
      }
    } : a));

    // Audit log
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: job.authorizedBy,
      role: currentRole,
      action: 'SCAN_COMPLETED',
      details: `Completed scan job on ${job.assetName}. Found ${newFindings.length} vulnerabilities.`,
      ip: '198.51.100.12',
      status: 'SUCCESS' as const,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleUpdateVulnStatus = (vulnId: string, status: VulnStatus, assignedTo?: string, evidence?: string) => {
    setVulnerabilities(prev => prev.map(v => v.id === vulnId ? {
      ...v,
      status,
      assignedTo: assignedTo || v.assignedTo,
      remediationEvidence: evidence || v.remediationEvidence,
    } : v));

    // Audit log
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'sarah.connor@acmefinancial.com',
      role: currentRole,
      action: 'VULN_STATUS_CHANGE',
      details: `Updated vuln ${vulnId} status to ${status.toUpperCase()}`,
      ip: '198.51.100.12',
      status: 'SUCCESS' as const,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleSelectVulnForAi = (vuln: Vulnerability) => {
    setSelectedVulnForAi(vuln);
    setActiveTab('ai-analyst');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Top Navbar */}
      <Navbar
        tenant={tenant}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        onTenantChange={setTenant}
        onOpenRegisterModal={() => setShowRegisterModal(true)}
        notificationCount={notificationsCount}
      />

      {/* Main Body Layout */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          openCriticalsCount={vulnerabilities.filter(v => v.severity === 'critical' && v.status !== 'closed').length}
          currentRole={currentRole}
        />

        {/* Center Content Workspace */}
        <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto', maxWidth: '1600px', margin: '0 auto' }}>
          {activeTab === 'dashboard' && (
            <DashboardView
              tenant={tenant}
              vulnerabilities={vulnerabilities}
              assets={assets}
              onNavigate={setActiveTab}
              onSelectVuln={handleSelectVulnForAi}
            />
          )}

          {activeTab === 'assets' && (
            <AssetManagementView
              assets={assets}
              onAddAsset={handleAddAsset}
              onTriggerScan={handleTriggerScanFromAsset}
              currentRole={currentRole}
            />
          )}

          {activeTab === 'easm' && (
            <EasmView onImportAsset={handleAddAsset} />
          )}

          {activeTab === 'scanner' && (
            <ScannerView
              assets={assets}
              onScanCompleted={handleScanCompleted}
              initialAssetToScan={targetAssetToScan}
            />
          )}

          {activeTab === 'vulnerabilities' && (
            <VulnerabilityManagementView
              vulnerabilities={vulnerabilities}
              onUpdateStatus={handleUpdateVulnStatus}
              onSelectForAi={handleSelectVulnForAi}
            />
          )}

          {activeTab === 'ai-analyst' && (
            <AIAnalystView
              vulnerabilities={vulnerabilities}
              assets={assets}
              selectedVulnForAi={selectedVulnForAi}
            />
          )}

          {activeTab === 'sbom' && (
            <SbomView />
          )}

          {activeTab === 'compliance' && (
            <ComplianceView />
          )}

          {activeTab === 'database' && (
            <VulnDatabaseView />
          )}

          {activeTab === 'reports' && (
            <ReportGeneratorView
              tenant={tenant}
              vulnerabilities={vulnerabilities}
              assets={assets}
            />
          )}

          {activeTab === 'settings' && (
            <TenantSettingsView
              tenant={tenant}
              auditLogs={auditLogs}
              onUpdateTenant={setTenant}
              onOpenRegisterModal={() => setShowRegisterModal(true)}
            />
          )}

          {/* Global App Footer */}
          <footer style={{
            marginTop: '48px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
            fontSize: '0.825rem',
            color: 'var(--text-dim)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            lineHeight: 1.5,
          }}>
            <div>Copyright © 2026 VulnWiz AI for LAU.AI</div>
            <div style={{ fontWeight: 700, color: 'var(--accent-purple)', fontSize: '0.85rem' }}>
              Developed by Charlen Baloukjy
            </div>
          </footer>
        </main>
      </div>

      {/* Model A: Self-Service Tenant Registration & Provisioning Modal */}
      {showRegisterModal && (
        <RegisterTenantModal
          onClose={() => setShowRegisterModal(false)}
          onTenantRegistered={handleTenantRegistered}
        />
      )}
    </div>
  );
}
export default App;
