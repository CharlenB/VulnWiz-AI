import React, { useState } from 'react';
import { 
  Server, 
  Globe, 
  Cloud, 
  Code, 
  Plus, 
  Radar, 
  Search, 
  X,
  Calendar
} from 'lucide-react';
import { validateTargetScope } from '../../services/securityGuards';
import { getRolePermissions } from '../../services/rbacService';
import type { Asset, AssetType, CriticalityLevel, UserRole } from '../../types';

interface AssetManagementViewProps {
  assets: Asset[];
  onAddAsset: (newAsset: Asset) => void;
  onTriggerScan: (asset: Asset) => void;
  currentRole: UserRole;
}

export const AssetManagementView: React.FC<AssetManagementViewProps> = ({
  assets,
  onAddAsset,
  onTriggerScan,
  currentRole,
}) => {
  const rolePerms = getRolePermissions(currentRole);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [scopeError, setScopeError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [type, setType] = useState<AssetType>('web');
  const [owner, setOwner] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [criticality, setCriticality] = useState<CriticalityLevel>('high');

  const filteredAssets = assets.filter(a => {
    const matchesType = filterType === 'all' || a.type === filterType;
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.owner.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target) return;

    const validation = validateTargetScope(target);
    if (!validation.allowed) {
      setScopeError(validation.reason || 'Restricted target input.');
      return;
    }

    setScopeError(null);
    const newAsset: Asset = {
      id: `ast-${Date.now().toString().slice(-4)}`,
      name,
      target,
      type,
      owner: owner || 'SecOps Team',
      techStack: techStackInput ? techStackInput.split(',').map(s => s.trim()) : ['HTTPS', 'TLS 1.3'],
      criticality,
      lastScanDate: 'Never scanned',
      vulnerabilityCounts: { critical: 0, high: 0, medium: 0, low: 0 },
      status: 'active',
    };

    onAddAsset(newAsset);
    setShowAddModal(false);
    // Reset
    setName('');
    setTarget('');
    setOwner('');
    setTechStackInput('');
  };

  const getAssetIcon = (t: AssetType) => {
    switch (t) {
      case 'web': return <Globe size={18} color="var(--accent-cyan)" />;
      case 'api': return <Code size={18} color="var(--accent-blue)" />;
      case 'infrastructure': return <Server size={18} color="var(--accent-purple)" />;
      case 'cloud': return <Cloud size={18} color="var(--accent-amber)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Asset Discovery & Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Inventory of registered corporate infrastructure, domains, APIs, and cloud resources.
          </p>
        </div>

        {rolePerms.canAddAsset && (
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Target Asset
          </button>
        )}
      </div>

      {/* Controls & Search Filter Bar */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px', width: '320px' }}>
          <Search size={16} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="Search assets by name, URL, owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.85rem', width: '100%', outline: 'none' }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'web', 'api', 'infrastructure', 'cloud'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                background: filterType === t ? '#EDE9FE' : '#FFFFFF',
                color: filterType === t ? 'var(--accent-purple)' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {filteredAssets.map(asset => (
          <div key={asset.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              {/* Asset Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {getAssetIcon(asset.type)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{asset.name}</h3>
                    <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{asset.type.toUpperCase()}</span>
                  </div>
                </div>
                <span className={`badge badge-${asset.criticality}`}>{asset.criticality}</span>
              </div>

              {/* Target Address */}
              <div style={{
                background: '#F8FAFC',
                padding: '8px 12px',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                color: 'var(--accent-purple)',
                wordBreak: 'break-all',
                marginBottom: '12px',
                border: '1px solid #E2E8F0',
              }}>
                {asset.target}
              </div>

              {/* Owner & Last Scan */}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                <div>Owner: <strong style={{ color: 'var(--text-muted)' }}>{asset.owner}</strong></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> Last Scanned: <span style={{ color: 'var(--text-muted)' }}>{asset.lastScanDate}</span>
                </div>
              </div>

              {/* Tech Stack Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {asset.techStack.map((tech, idx) => (
                  <span key={idx} style={{
                    background: 'rgba(51, 65, 85, 0.3)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                  }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Asset Footer & Scan Trigger Button */}
            <div style={{
              borderTop: '1px solid var(--border-color)',
              paddingTop: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span className="badge badge-critical">{asset.vulnerabilityCounts.critical} Crit</span>
                <span className="badge badge-high">{asset.vulnerabilityCounts.high} High</span>
              </div>

              <button
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => onTriggerScan(asset)}
              >
                <Radar size={14} color="var(--accent-cyan)" /> Scan Target
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
        }}>
          <div className="glass-panel" style={{ width: '500px', maxWidth: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Register New Asset</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {scopeError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid var(--accent-red)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  fontSize: '0.8rem',
                  color: '#FCA5A5',
                }}>
                  ⚠️ {scopeError}
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Asset Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Billing Microservice"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    background: '#F8FAFC',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Target Endpoint / IP / Domain / S3 Bucket *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://billing.acme.com or 192.0.2.1"
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    background: '#F8FAFC',
                    border: '1px solid var(--border-color)',
                    color: 'var(--accent-purple)',
                    fontFamily: 'var(--font-mono)',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                    Asset Category
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as AssetType)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      background: '#F8FAFC',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      outline: 'none',
                    }}
                  >
                    <option value="web">Web Application</option>
                    <option value="api">API Endpoint</option>
                    <option value="infrastructure">Infrastructure / IP</option>
                    <option value="cloud">Cloud Resource (AWS/GCP)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                    Business Criticality
                  </label>
                  <select
                    value={criticality}
                    onChange={e => setCriticality(e.target.value as CriticalityLevel)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      background: '#F8FAFC',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      outline: 'none',
                    }}
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Owner / Responsible Team
                </label>
                <input
                  type="text"
                  placeholder="e.g. Billing Team / John Doe"
                  value={owner}
                  onChange={e => setOwner(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    background: '#090D16',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Technology Stack (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Node.js, Express, Postgres, Docker"
                  value={techStackInput}
                  onChange={e => setTechStackInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    background: '#090D16',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
