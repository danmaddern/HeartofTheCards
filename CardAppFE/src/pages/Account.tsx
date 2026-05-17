import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, MapPin, Plus, Trash2, Check, Edit } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { addressesService } from '../services/addresses.service';
import { Address } from '../types';
import { apiClient } from '../api/client';
import { handleApiError } from '../lib/api';

const AU_STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'];

export const Account = () => {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [editingAddr, setEditingAddr] = useState<string | null>(null);

  const { data: addresses, isLoading: addrLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressesService.getAll,
  });

  const { register: regProfile, handleSubmit: handleProfile, formState: { isSubmitting: savingProfile } } = useForm({
    defaultValues: { firstName: user?.firstName, lastName: user?.lastName, phone: user?.phone || '' },
  });

  const { register: regAddr, handleSubmit: handleAddr, reset: resetAddr, formState: { isSubmitting: savingAddr } } = useForm({
    defaultValues: { fullName: '', line1: '', line2: '', suburb: '', state: 'VIC', postcode: '', phone: '' },
  });

  const onSaveProfile = async (data: any) => {
    try {
      const { data: updatedUser, error } = await apiClient.PATCH('/api/users/me', { body: data });
      if (error) throw error;
      updateUser(updatedUser as any);
      toast.success('Profile updated');
    } catch (err) {
      handleApiError(err);
    }
  };

  const onSaveAddress = async (data: any) => {
    try {
      if (editingAddr) {
        await addressesService.update(editingAddr, data);
        toast.success('Address updated');
        setEditingAddr(null);
      } else {
        await addressesService.create({ ...data, country: 'Australia' });
        toast.success('Address added');
        setShowAddAddr(false);
      }
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      resetAddr();
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleRemoveAddr = async (id: string) => {
    try {
      await addressesService.remove(id);
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address removed');
    } catch (err) {
      handleApiError(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="section-title mb-8">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <User size={18} className="text-gold-400" /> Profile Details
          </h2>
          <form onSubmit={handleProfile(onSaveProfile)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First Name</label>
                <input {...regProfile('firstName')} className="input-field" />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input {...regProfile('lastName')} className="input-field" />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input value={user?.email} disabled className="input-field opacity-50 cursor-not-allowed" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input {...regProfile('phone')} className="input-field" placeholder="0412 345 678" />
            </div>
            <button type="submit" disabled={savingProfile} className="btn-primary w-full">
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Addresses */}
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <MapPin size={18} className="text-gold-400" /> Delivery Addresses
          </h2>

          <div className="space-y-3 mb-4">
            {addrLoading ? (
              <div className="text-dark-400 text-sm">Loading addresses...</div>
            ) : addresses?.length === 0 ? (
              <p className="text-dark-400 text-sm">No addresses saved yet.</p>
            ) : (
              addresses?.map((addr: Address) => (
                <div key={addr.id} className="bg-dark-900 rounded-xl p-3 border border-dark-700">
                  <div className="flex items-start justify-between">
                    <div className="text-sm">
                      <p className="text-white font-medium">{addr.fullName}</p>
                      <p className="text-dark-400">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                      <p className="text-dark-400">{addr.suburb} {addr.state} {addr.postcode}</p>
                      <p className="text-dark-400">{addr.phone}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {addr.isDefault && (
                        <span className="badge-gold text-xs">
                          <Check size={10} /> Default
                        </span>
                      )}
                      <button onClick={() => handleRemoveAddr(addr.id)} className="p-1.5 text-dark-500 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {!showAddAddr ? (
            <button onClick={() => setShowAddAddr(true)} className="flex items-center gap-2 text-gold-400 hover:text-gold-300 text-sm font-medium transition-colors">
              <Plus size={16} /> Add New Address
            </button>
          ) : (
            <form onSubmit={handleAddr(onSaveAddress)} className="space-y-3">
              <h3 className="text-white font-medium text-sm">New Address</h3>
              <input {...regAddr('fullName')} className="input-field text-sm" placeholder="Full Name" required />
              <input {...regAddr('line1')} className="input-field text-sm" placeholder="Address Line 1" required />
              <input {...regAddr('line2')} className="input-field text-sm" placeholder="Address Line 2 (optional)" />
              <div className="grid grid-cols-2 gap-2">
                <input {...regAddr('suburb')} className="input-field text-sm" placeholder="Suburb" required />
                <select {...regAddr('state')} className="input-field text-sm">
                  {AU_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input {...regAddr('postcode')} className="input-field text-sm" placeholder="Postcode" maxLength={4} required />
                <input {...regAddr('phone')} className="input-field text-sm" placeholder="Phone" required />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={savingAddr} className="btn-primary flex-1 text-sm py-2">
                  {savingAddr ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowAddAddr(false)} className="btn-secondary text-sm py-2">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
