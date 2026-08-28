import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  User, 
  ArrowRight,
  Info
} from 'lucide-react';
import { UserAccount, TSPBeneficiary } from '../../types';

interface BeneficiaryManagerProps {
  user: UserAccount;
  onUpdateBeneficiaries: (updatedBeneficiaries: TSPBeneficiary[], message: string) => void;
}

export const BeneficiaryManager: React.FC<BeneficiaryManagerProps> = ({
  user,
  onUpdateBeneficiaries
}) => {
  const [beneficiaries, setBeneficiaries] = useState<TSPBeneficiary[]>(user.beneficiaries);
  const [isAdding, setIsAdding] = useState(false);
  const [newType, setNewType] = useState<'Primary' | 'Contingent'>('Primary');
  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState('Child');
  const [newShare, setNewShare] = useState<number>(25);

  const primarySum = beneficiaries
    .filter(b => b.type === 'Primary')
    .reduce((acc, b) => acc + b.sharePercentage, 0);

  const contingentSum = beneficiaries
    .filter(b => b.type === 'Contingent')
    .reduce((acc, b) => acc + b.sharePercentage, 0);

  const handleAddBeneficiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newBen: TSPBeneficiary = {
      id: `BEN-${Date.now()}`,
      name: newName,
      relationship: newRelationship,
      sharePercentage: newShare,
      type: newType
    };

    const updated = [...beneficiaries, newBen];
    setBeneficiaries(updated);
    setIsAdding(false);
    setNewName('');
  };

  const handleRemove = (id: string) => {
    setBeneficiaries(prev => prev.filter(b => b.id !== id));
  };

  const handleSaveAll = () => {
    if (primarySum !== 100) {
      alert('Primary beneficiaries must sum to exactly 100%.');
      return;
    }
    if (beneficiaries.some(b => b.type === 'Contingent') && contingentSum !== 100) {
      alert('Contingent beneficiaries must sum to exactly 100%.');
      return;
    }

    onUpdateBeneficiaries(beneficiaries, 'Your beneficiary designations have been electronically submitted and officially recorded on Form TSP-3.');
  };

  return (
    <div className="space-y-6 pb-12" id="beneficiary-manager">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HeartHandshake className="w-5 h-5 text-rose-600" />
            <h2 className="text-xl font-black text-slate-900">Beneficiary Designations</h2>
          </div>
          <p className="text-xs text-slate-600">
            Ensure your TSP funds are distributed according to your wishes. Designations on file supersede wills or state intestacy laws.
          </p>
        </div>

        <button 
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Beneficiary</span>
        </button>
      </div>

      {/* Validation Status Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl border ${primarySum === 100 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase">Primary Allocation</span>
            <span className="text-lg font-black">{primarySum}%</span>
          </div>
          <div className="text-xs mt-1">
            {primarySum === 100 ? '✓ Valid: Exactly 100%' : `⚠ Invalid: Must equal 100% (currently ${primarySum}%)`}
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${contingentSum === 100 || contingentSum === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase">Contingent Allocation</span>
            <span className="text-lg font-black">{contingentSum}%</span>
          </div>
          <div className="text-xs mt-1">
            {contingentSum === 100 || contingentSum === 0 ? '✓ Valid' : `⚠ Invalid: Must equal 100% (currently ${contingentSum}%)`}
          </div>
        </div>
      </div>

      {/* Beneficiaries List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Designated Individuals & Entities</h3>

        <div className="divide-y divide-slate-100">
          {beneficiaries.map((b) => (
            <div key={b.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                  b.type === 'Primary' ? 'bg-blue-100 text-blue-900' : 'bg-purple-100 text-purple-900'
                }`}>
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{b.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.type === 'Primary' ? 'bg-blue-900 text-white' : 'bg-purple-800 text-white'
                    }`}>
                      {b.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">{b.relationship}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900">{b.sharePercentage}%</span>
                  <div className="text-[10px] text-slate-400">Share Allocation</div>
                </div>
                <button 
                  onClick={() => handleRemove(b.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove beneficiary"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Modal / In-line Form */}
        {isAdding && (
          <form onSubmit={handleAddBeneficiary} className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-xs text-slate-900">Add New Beneficiary</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Type</label>
                <select 
                  value={newType} 
                  onChange={(e: any) => setNewType(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                >
                  <option value="Primary">Primary</option>
                  <option value="Contingent">Contingent</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Relationship</label>
                <input 
                  type="text" 
                  value={newRelationship}
                  onChange={(e) => setNewRelationship(e.target.value)}
                  placeholder="Child, Spouse, Trust"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Share %</label>
                <input 
                  type="number" 
                  min="1" 
                  max="100"
                  value={newShare}
                  onChange={(e) => setNewShare(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-slate-600 text-xs font-bold hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-1.5 bg-blue-900 text-white text-xs font-bold rounded-lg hover:bg-blue-800 cursor-pointer"
              >
                Add
              </button>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button 
            onClick={handleSaveAll}
            disabled={primarySum !== 100}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Electronically Save & Confirm Form TSP-3</span>
          </button>
        </div>
      </div>
    </div>
  );
};
