import React from 'react';
import { User, Mail, Shield, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-dmart-100 text-dmart-700 font-black text-2xl flex items-center justify-center shadow-inner">
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">{user.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={user.role} />
              <span className="text-xs text-slate-400">Account Verified</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <Mail className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-slate-400 font-bold block">Email Address</span>
              <span className="font-bold text-slate-800 text-sm">{user.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <Shield className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-slate-400 font-bold block">Assigned Security Role</span>
              <span className="font-bold text-slate-800 text-sm capitalize">{user.role}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <User className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-slate-400 font-bold block">User ID</span>
              <span className="font-mono text-slate-700">{user._id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
