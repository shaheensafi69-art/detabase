'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { CustomService, ServiceCategory } from '@/types';
import { BASE_SERVICES, CATEGORIES_CONFIG } from '@/lib/constants';
import { PlatformLogo, getPlatformDomain } from '@/components/PlatformLogo';

interface ServiceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customServices: CustomService[];
  onAddService: (newService: CustomService) => void;
  onDeleteService: (id: string) => void;
}

export default function ServiceManagerModal({
  isOpen,
  onClose,
  customServices,
  onAddService,
  onDeleteService,
}: ServiceManagerModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('account');
  const [isPercentage, setIsPercentage] = useState(false);
  const [defaultCommission, setDefaultCommission] = useState<number>(8);
  const [defaultPrice, setDefaultPrice] = useState<number>(60);
  const [defaultOfficeCost, setDefaultOfficeCost] = useState<number>(15);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a service title');
      return;
    }

    const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const catConf = CATEGORIES_CONFIG[category];
    const resolvedPlatform = getPlatformDomain(platform) || platform.trim() || title.trim();

    const newSvc: CustomService = {
      id,
      category,
      title: title.trim(),
      englishTitle: title.trim(),
      platform: resolvedPlatform,
      defaultCommission: isPercentage ? Number(defaultCommission) : 0,
      defaultPrice: !isPercentage ? Number(defaultPrice) : 0,
      defaultOfficeCost: Number(defaultOfficeCost),
      description: description.trim() || `${title.trim()} (${platform || catConf.title})`,
      color: catConf.color,
      bgColor: catConf.bgColor,
      icon: catConf.icon,
      isCustom: true,
    };

    onAddService(newSvc);
    setIsAdding(false);
    setTitle('');
    setPlatform('');
    setDescription('');
  };

  const allMergedServices = [
    ...Object.values(BASE_SERVICES),
    ...customServices,
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '780px',
          background: 'linear-gradient(180deg, #0b1f36 0%, #06111f 100%)',
          border: '1px solid rgba(2, 132, 199, 0.35)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284c7 0%, #f97316 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Layers size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                Service & Platform Manager
              </h2>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Add custom standalone platforms with automatic logo detection
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="btn btn-emerald"
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                <Plus size={16} />
                + Add New Service
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '6px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* New Service Form Drawer */}
          {isAdding && (
            <form
              onSubmit={handleSubmit}
              style={{
                background: 'rgba(2, 132, 199, 0.08)',
                border: '1px solid rgba(2, 132, 199, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#38bdf8', marginBottom: '16px' }}>
                Create New Standalone Platform Service:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Service Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setTitle(newTitle);
                      if (!platform) {
                        const autoDom = getPlatformDomain(newTitle);
                        if (autoDom && autoDom !== 'com') {
                          setPlatform(autoDom);
                        }
                      }
                    }}
                    placeholder="e.g. Upwork Freelancer Account / Binance"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Platform Website / Link (for Automatic Logo API) *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input
                        type="text"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        placeholder="e.g. www.upwork.com or upwork.com"
                        className="form-input"
                        style={{ paddingRight: '36px' }}
                      />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                      }}
                      title="Live Logo.dev API Preview"
                    >
                      <PlatformLogo platform={platform || title || 'upwork.com'} size={38} />
                    </div>
                  </div>
                  {(platform || title) && (
                    <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>✓ Logo.dev API Domain:</span>
                      <strong style={{ color: '#34d399' }}>{getPlatformDomain(platform || title)}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Department Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                    className="form-select"
                  >
                    <option value="cashout">Cash-Out Services</option>
                    <option value="account">Account Creation</option>
                    <option value="company_bank">Company & Banking</option>
                    <option value="card_other">Card & Other Services</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Pricing Calculation Model</label>
                  <select
                    value={isPercentage ? 'percent' : 'fixed'}
                    onChange={(e) => setIsPercentage(e.target.value === 'percent')}
                    className="form-select"
                  >
                    <option value="percent">Percentage Commission (%)</option>
                    <option value="fixed">Fixed Service Fee ($ USD)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {isPercentage ? (
                  <div className="form-group">
                    <label className="form-label">Default Commission (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={defaultCommission}
                      onChange={(e) => setDefaultCommission(parseFloat(e.target.value) || 0)}
                      className="form-input"
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Default Price ($ USD)</label>
                    <input
                      type="number"
                      value={defaultPrice}
                      onChange={(e) => setDefaultPrice(parseFloat(e.target.value) || 0)}
                      className="form-input"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Office Internal Expense ($ USD)</label>
                  <input
                    type="number"
                    value={defaultOfficeCost}
                    onChange={(e) => setDefaultOfficeCost(parseFloat(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Short Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief note about this service..."
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-emerald"
                  style={{ fontSize: '13px' }}
                >
                  <CheckCircle2 size={16} />
                  Save Service
                </button>
              </div>
            </form>
          )}

          {/* List of Current Services */}
          <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {allMergedServices.map((svc: any) => {
              const isCust = (svc as CustomService).isCustom;
              const catConf = CATEGORIES_CONFIG[svc.category as ServiceCategory] || CATEGORIES_CONFIG.card_other;

              return (
                <div
                  key={svc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <PlatformLogo platform={svc.platform || svc.title} size={36} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                          {svc.title}
                        </span>
                        {isCust && (
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(249, 115, 22, 0.2)',
                              color: '#fb923c',
                              fontWeight: 700,
                            }}
                          >
                            Custom
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        {svc.platform || 'Platform'} • Category: {catConf.title}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ textAlign: 'right', fontSize: '12px' }}>
                      <div style={{ color: '#38bdf8', fontWeight: 700 }}>
                        {svc.defaultCommission ? `${svc.defaultCommission}% Fee` : `$${svc.defaultPrice || 0} Price`}
                      </div>
                      {svc.defaultCost || svc.defaultOfficeCost ? (
                        <div style={{ color: 'var(--text-dim)', fontSize: '10.5px' }}>
                          Cost: ${svc.defaultCost || svc.defaultOfficeCost}
                        </div>
                      ) : null}
                    </div>

                    {isCust && (
                      <button
                        onClick={() => onDeleteService(svc.id)}
                        style={{
                          background: 'rgba(244, 63, 94, 0.1)',
                          border: '1px solid rgba(244, 63, 94, 0.25)',
                          color: '#fb7185',
                          borderRadius: '8px',
                          padding: '6px 8px',
                          cursor: 'pointer',
                        }}
                        title="Delete custom service"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
