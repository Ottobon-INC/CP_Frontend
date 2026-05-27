import React, { useState, useEffect, useRef } from 'react';
import avatarImage from '@/assets/avatar.png';
import { useProfile } from '../hooks/useProfile';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, LogOut, CheckCircle2, User, Phone, Globe, ShieldAlert, Award } from 'lucide-react';
import { logoutAndRedirect } from '@/utils/session';

export function Profile() {
  const { data, isLoading, updateProfile, isUpdating, updatePhoto, isUploading } = useProfile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [language, setLanguage] = useState('English');

  const [phoneCache, setPhoneCache] = useState('');
  const [skillsCache, setSkillsCache] = useState<string[]>([]);
  const [languageCache, setLanguageCache] = useState('English');

  useEffect(() => {
    if (data?.user) {
      setPhone(data.user.phone || '');
      setSkills(data.user.skills || []);
      setLanguage(data.user.language || 'English');
    }
  }, [data]);

  const startEditing = () => {
    setPhoneCache(phone);
    setSkillsCache([...skills]);
    setLanguageCache(language);
    setEditing(true);
  };

  const cancelEditing = () => {
    setPhone(phoneCache);
    setSkills(skillsCache);
    setLanguage(languageCache);
    setNewSkill('');
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      await updateProfile({ phone, skills, language });
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
      setEditing(false);
    } catch {
      toast({ variant: 'destructive', title: 'Update failed', description: 'Could not save your changes.' });
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File too large', description: 'Please select an image under 2 MB.' });
      return;
    }
    try {
      await updatePhoto(file);
      toast({ title: 'Photo updated', description: 'Your profile photo has been changed.' });
    } catch {
      toast({ variant: 'destructive', title: 'Upload failed', description: 'Could not upload the photo.' });
    }
  };

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 rounded-full border-4 border-[#FBE9D0] border-t-[#E64833] animate-spin shadow-lg" />
    </div>
  );

  const user = data?.user;
  const photoSrc = user?.profilePhotoUrl || avatarImage;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-24 px-4 sm:px-6">
      
      {/* HEADER SECTION */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-dark-teal tracking-tight mb-2">Your Profile</h1>
          <p className="text-gray-text text-sm font-medium">Manage your personal information, skills, and account security.</p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          {!editing ? (
            <button
              onClick={startEditing}
              className="bg-dark-teal text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-dark-teal/90 transition-all duration-300"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={cancelEditing}
                className="bg-white text-gray-text border border-border-soft text-sm font-bold px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="bg-gradient-to-r from-orange-primary to-[#FF705C] text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60 disabled:hover:translate-y-0 transition-all duration-300 flex items-center gap-2"
              >
                {isUpdating && <Loader2 size={16} className="animate-spin" />}
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* BENTO BOX GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: IDENTITY CARD */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
            {/* Decorative background blob */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-orange-primary/10 rounded-full blur-3xl group-hover:bg-orange-primary/20 transition-colors duration-700 pointer-events-none"></div>
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-primary to-orange-soft rounded-full scale-105 opacity-50 blur-md"></div>
                <div className="relative group/avatar w-32 h-32 shrink-0">
                  <img
                    src={photoSrc}
                    alt={user?.fullName || 'Avatar'}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center backdrop-blur-sm z-10">
                      <Loader2 size={28} className="animate-spin text-orange-primary" />
                    </div>
                  )}
                  <div
                    onClick={() => editing && fileInputRef.current?.click()}
                    className={`absolute inset-0 rounded-full flex flex-col items-center justify-center bg-dark-teal/70 backdrop-blur-sm transition-all duration-300 ${editing ? 'opacity-0 group-hover/avatar:opacity-100 cursor-pointer scale-95 group-hover/avatar:scale-100' : 'hidden'}`}
                  >
                    <Camera size={24} className="text-white mb-1" />
                    <span className="text-white text-xs font-bold">Update Photo</span>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </div>
              </div>
              
              <h2 className="text-2xl font-extrabold text-dark-teal mb-1">{user?.fullName || '—'}</h2>
              <p className="text-gray-text font-medium text-sm mb-4">{user?.email || '—'}</p>
              
              <div className="w-full flex items-center justify-center gap-2 bg-orange-soft/50 text-orange-primary text-xs font-bold px-4 py-2 rounded-full border border-orange-primary/20">
                <CheckCircle2 size={14} />
                Registered Student
              </div>
            </div>
          </div>

          {/* ACCOUNT SECURITY CARD */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-red-50 text-red-500 rounded-xl">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark-text">Security</h3>
                <p className="text-xs text-gray-text">Manage your session</p>
              </div>
            </div>
            
            <button
              onClick={() => logoutAndRedirect('/')}
              className="w-full flex justify-center items-center gap-2 bg-white text-red-600 border-2 border-red-100 text-sm font-bold px-6 py-3.5 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
            >
              <LogOut size={18} /> Sign Out Safely
            </button>
          </div>
        </div>
        
        {/* RIGHT COLUMN: DETAILS & SKILLS */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* PERSONAL INFORMATION */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl">
                <User size={20} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-dark-teal">Personal Details</h3>
                <p className="text-sm text-gray-text font-medium">Synced with your organisation details.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-text mb-2 uppercase tracking-wider">
                  <User size={14} /> Full Name
                </label>
                <div className="w-full bg-gray-50/50 border border-border-soft rounded-xl px-4 py-3.5 text-sm font-semibold text-dark-text/70 cursor-not-allowed transition-colors group-hover:bg-gray-50">
                  {user?.fullName || '—'}
                </div>
              </div>
              
              <div className="group">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-text mb-2 uppercase tracking-wider">
                  <Globe size={14} /> Email Address
                </label>
                <div className="w-full bg-gray-50/50 border border-border-soft rounded-xl px-4 py-3.5 text-sm font-semibold text-dark-text/70 cursor-not-allowed truncate transition-colors group-hover:bg-gray-50">
                  {user?.email || '—'}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-text mb-2 uppercase tracking-wider">
                  <Phone size={14} /> Phone Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full bg-white border-2 border-border-soft rounded-xl px-4 py-3 text-sm font-semibold text-dark-teal focus:border-orange-primary focus:ring-4 focus:ring-orange-primary/10 outline-none transition-all shadow-sm"
                  />
                ) : (
                  <div className="w-full bg-white border border-border-soft rounded-xl px-4 py-3.5 text-sm font-semibold text-dark-teal shadow-sm">
                    {phone || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-text mb-2 uppercase tracking-wider">
                  <Globe size={14} /> Language
                </label>
                {editing ? (
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full bg-white border-2 border-border-soft rounded-xl px-4 py-3 text-sm font-semibold text-dark-teal focus:border-orange-primary focus:ring-4 focus:ring-orange-primary/10 outline-none transition-all shadow-sm appearance-none"
                  >
                    {['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full bg-white border border-border-soft rounded-xl px-4 py-3.5 text-sm font-semibold text-dark-teal shadow-sm">
                    {language || 'English'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SKILLS & PREFERENCES */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-xl flex-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-orange-soft text-orange-primary rounded-xl">
                <Award size={20} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-dark-teal">Skills & Expertise</h3>
                <p className="text-sm text-gray-text font-medium">Add skills to personalize your recommendations.</p>
              </div>
            </div>

            <div className="bg-white border border-border-soft rounded-2xl p-6 shadow-sm min-h-[160px] flex flex-col justify-between">
              <div className="flex flex-wrap gap-2.5 mb-6">
                {skills.length > 0 ? skills.map(s => (
                  <span key={s} className="group flex items-center gap-2 text-sm font-bold bg-gray-50 border border-border-soft text-dark-teal px-4 py-2 rounded-full shadow-sm hover:border-orange-primary/30 hover:bg-orange-soft/30 transition-all">
                    {s}
                    {editing && (
                      <button 
                        onClick={() => setSkills(skills.filter(sk => sk !== s))} 
                        className="text-gray-400 hover:text-red-500 hover:scale-110 transition-all flex items-center justify-center rounded-full bg-white shadow-sm w-5 h-5"
                      >
                        &times;
                      </button>
                    )}
                  </span>
                )) : (
                  <div className="w-full text-center py-6 text-gray-text/60 font-medium">
                    No skills added yet. {editing && "Add some below!"}
                  </div>
                )}
              </div>
              
              {editing && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Award size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={addSkill}
                    placeholder="Type a skill and press Enter..."
                    className="w-full bg-gray-50 border-2 border-border-soft rounded-xl pl-11 pr-4 py-3.5 text-sm font-semibold text-dark-teal focus:bg-white focus:border-orange-primary focus:ring-4 focus:ring-orange-primary/10 outline-none transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">
                    Enter ↵
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
