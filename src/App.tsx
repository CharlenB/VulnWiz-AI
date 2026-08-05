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
import { BillingView } from './components/Billing/BillingView';
import { AdminConsoleView } from './components/Admin/AdminConsoleView';

// SaaS Public Marketing & Onboarding Components
import { LandingView } from './components/Landing/LandingView';
import { PricingView } from './components/Pricing/PricingView';
import { SignupView } from './components/Auth/SignupView';
import { CheckoutView } from './components/Checkout/CheckoutView';
import { LoginView } from './components/Auth/LoginView';

import { RegisterTenantModal } from './components/Auth/RegisterTenantModal';

import { 
  INITIAL_TENANT, 
  INITIAL_ASSETS, 
  INITIAL_VULNERABILITIES, 
  INITIAL_AUDIT_LOGS,
  MOCK_TENANTS
} from './services/storage';

import type { Tenant, Asset, Vulnerability, ScanJob, VulnStatus, UserRole, TenantPlan, BillingCycle, UserAccount } from './types';
import { isTabAllowedForRole } from './services/rbacService';
import { getCurrentUser, setCurrentUser } from './services/saasAuthService';

export function App() {
  // App Mode State: 'landing' | 'pricing' | 'signup' | 'checkout' | 'login' | 'platform'
  const [appMode, setAppMode] = useState<'landing' | 'pricing' | 'signup' | 'checkout' | 'login' | 'platform'>('platform');
  const [currentUser, setCurrentUserState] = useState<UserAccount | null>(getCurrentUser());

  const handleSignOut = () => {
    setCurrentUser(null);
    setCurrentUserState(null);
    setAppMode('landing');
  };

  // Plan Selection State for Signup/Checkout Flow
  const [signupPlan, setSignupPlan] = useState<TenantPlan>('Corporate Security');
  const [signupCycle, setSignupCycle] = useState<BillingCycle>('annual');

  // Platform Active Workspace State
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

  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(false);

  const handleTenantRegistered = (newTenant: Tenant, seedAssets: Asset[], seedVulns: Vulnerability[]) => {
    MOCK_TENANTS.unshift(newTenant);
    setTenant(newTenant);
    
    // Replace default mock datasets with new tenant's own provisioned assets & findings
    setAssets(seedAssets);
    setVulnerabilities(seedVulns);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: currentUser?.email || `admin@${newTenant.domain}`,
      role: 'Super Admin' as UserRole,
      action: 'TENANT_REGISTERED',
      details: `First-time tenant workspace provisioned: ${newTenant.name} (${newTenant.domain}) under ${newTenant.plan} plan.`,
      ip: '198.51.100.22',
      status: 'SUCCESS' as const,
    };
    setAuditLogs(prev => [newLog, ...prev]);
    setShowRegisterModal(false);
    setIsFirstTimeUser(false);
  };
  
  // Navigation & context pass
  const [targetAssetToScan, setTargetAssetToScan] = useState<Asset | null>(null);
  const [selectedVulnForAi, setSelectedVulnForAi] = useState<Vulnerability | null>(null);

  // Asset Creation Handler
  const handleAddAsset = (newAsset: Asset) => {
    setAssets(prev => [newAsset, ...prev]);
    setTenant(prev => ({
      ...prev,
      assetsCount: prev.assetsCount + 1
    }));
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'sarah.connor@acmefinancial.com',
      role: currentRole,
      action: 'ASSET_CREATED',
      details: `Registered new target asset: ${newAsset.name} (${newAsset.target})`,
      ip: '198.51.100.45',
      status: 'SUCCESS' as const
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Trigger scan from asset list
  const handleTriggerScanFromAsset = (asset: Asset) => {
    setTargetAssetToScan(asset);
    setActiveTab('scanner');
  };

  // Scan Completion Handler
  const handleScanCompleted = (job: ScanJob, newFindings: Vulnerability[]) => {
    if (newFindings.length > 0) {
      setVulnerabilities(prev => [...newFindings, ...prev]);
      setTenant(prev => ({
        ...prev,
        totalVulns: prev.totalVulns + newFindings.length,
        openCriticals: prev.openCriticals + newFindings.filter(f => f.severity === 'critical').length
      }));
    }

    setAssets(prev => prev.map(a => {
      if (a.id === job.assetId) {
        return {
          ...a,
          lastScanDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
          vulnerabilityCounts: {
            critical: a.vulnerabilityCounts.critical + newFindings.filter(f => f.severity === 'critical').length,
            high: a.vulnerabilityCounts.high + newFindings.filter(f => f.severity === 'high').length,
            medium: a.vulnerabilityCounts.medium + newFindings.filter(f => f.severity === 'medium').length,
            low: a.vulnerabilityCounts.low + newFindings.filter(f => f.severity === 'low').length,
          }
        };
      }
      return a;
    }));

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'sarah.connor@acmefinancial.com',
      role: currentRole,
      action: 'SCAN_COMPLETED',
      details: `OWASP Active Scan completed on ${job.assetTarget}. Discovered ${newFindings.length} new vulnerabilities.`,
      ip: '198.51.100.45',
      status: 'SUCCESS' as const
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Vulnerability Status Update Handler
  const handleUpdateVulnStatus = (vulnId: string, newStatus: VulnStatus, notes?: string) => {
    setVulnerabilities(prev => prev.map(v => {
      if (v.id === vulnId) {
        return {
          ...v,
          status: newStatus,
          verificationStatus: newStatus === 'verified' ? 'VERIFICATION_PASSED' : v.verificationStatus
        };
      }
      return v;
    }));

    const targetVuln = vulnerabilities.find(v => v.id === vulnId);
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'sarah.connor@acmefinancial.com',
      role: currentRole,
      action: 'VULN_STATUS_UPDATED',
      details: `Updated ${targetVuln?.cveId || targetVuln?.title} status to ${newStatus.toUpperCase()}.${notes ? ` Notes: ${notes}` : ''}`,
      ip: '198.51.100.45',
      status: 'SUCCESS' as const
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleSelectVulnForAi = (vuln: Vulnerability) => {
    setSelectedVulnForAi(vuln);
    setActiveTab('ai-analyst');
  };

  const notificationsCount = vulnerabilities.filter(v => v.severity === 'critical' && v.status === 'new').length;

  // ROUTING RENDER LOGIC BASED ON APP MODE
  if (appMode === 'landing') {
    return (
      <LandingView
        onGetStarted={() => setAppMode('pricing')}
        onSignIn={() => setAppMode('login')}
        onSelectPlan={(plan, cycle) => {
          setSignupPlan(plan as TenantPlan);
          setSignupCycle(cycle);
          setAppMode('signup');
        }}
      />
    );
  }

  if (appMode === 'pricing') {
    return (
      <PricingView
        onSelectPlan={(plan, cycle) => {
          setSignupPlan(plan);
          setSignupCycle(cycle);
          setAppMode('signup');
        }}
        onBackToLanding={() => setAppMode('landing')}
        onSignIn={() => setAppMode('login')}
      />
    );
  }

  if (appMode === 'signup') {
    return (
      <SignupView
        selectedPlan={signupPlan}
        billingCycle={signupCycle}
        onSignupSuccess={() => {
          const user = getCurrentUser();
          if (user) setCurrentUserState(user);
          setAppMode('checkout');
        }}
        onBackToPricing={() => setAppMode('pricing')}
        onSignIn={() => setAppMode('login')}
      />
    );
  }

  if (appMode === 'checkout') {
    const activeUser = currentUser || getCurrentUser();
    if (!activeUser) {
      setAppMode('signup');
      return null;
    }

    return (
      <CheckoutView
        user={activeUser}
        onPaymentSuccess={() => {
          const user = getCurrentUser();
          if (user) setCurrentUserState(user);
          setIsFirstTimeUser(true);
          setShowRegisterModal(true);
          setAppMode('platform');
        }}
        onBackToPricing={() => setAppMode('pricing')}
      />
    );
  }

  if (appMode === 'login') {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUserState(user);
          setAppMode('platform');
        }}
        onRedirectToCheckout={(user) => {
          setCurrentUserState(user);
          setAppMode('checkout');
        }}
        onBackToLanding={() => setAppMode('landing')}
        onSignUp={() => setAppMode('pricing')}
      />
    );
  }

  // PLATFORM WORKSPACE MODE (MAIN VULNWIZ AI APPLICATION)
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Top Navbar */}
      <Navbar
        tenant={tenant}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        onTenantChange={setTenant}
        onOpenRegisterModal={() => setShowRegisterModal(true)}
        onSignOut={handleSignOut}
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

          {activeTab === 'billing' && (
            <BillingView
              user={currentUser || {
                id: 'usr-acme-01',
                fullName: 'Charlen Baloukjy',
                email: 'charlen@acmefinancial.com',
                companyName: 'Acme Financial Security Inc.',
                role: 'Super Admin',
                status: 'ACTIVE',
                createdAt: '2026-08-01',
                selectedPlan: 'Enterprise MSSP',
                billingCycle: 'annual'
              }}
              onUpdatePlan={(newPlan) => {
                setTenant(prev => ({ ...prev, plan: newPlan }));
                if (currentUser) {
                  setCurrentUserState({ ...currentUser, selectedPlan: newPlan });
                }
              }}
            />
          )}

          {activeTab === 'admin' && (
            <AdminConsoleView />
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
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '4px' }}>
              <button onClick={() => setAppMode('landing')} style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', cursor: 'pointer', fontWeight: 600 }}>Public Landing Page</button>
              <button onClick={() => setAppMode('pricing')} style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', cursor: 'pointer', fontWeight: 600 }}>Pricing Plans</button>
              <button onClick={() => setAppMode('login')} style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', cursor: 'pointer', fontWeight: 600 }}>Sign In</button>
            </div>
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
          onClose={() => {
            setShowRegisterModal(false);
            setIsFirstTimeUser(false);
          }}
          onTenantRegistered={handleTenantRegistered}
          initialOrgName={currentUser?.companyName}
          initialEmail={currentUser?.email}
          initialPlan={currentUser?.selectedPlan}
          initialIndustry={currentUser?.industry}
          isFirstTimeOnboarding={isFirstTimeUser}
        />
      )}
    </div>
  );
}

export default App;
