import React, { useState, useEffect, useRef } from 'react';
import avatarImage from '@/assets/avatar.png';
import { useProfile } from '../hooks/useProfile';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, LogOut } from 'lucide-react';
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
      <div className="w-10 h-10 rounded-full border-[3px] border-retro-bg border-t-retro-salmon animate-spin" />
    </div>
  );

  const user = data?.user;
  const photoSrc = user?.profilePhotoUrl || avatarImage;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-24 px-4 sm:px-0">
      
      {/* ── HEADER ── */}
      <div className="mb-12 border-b border-retro-sage/20 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-retro-teal tracking-tight mb-2">Profile Settings</h1>
          <p className="text-retro-teal/60 text-sm">Manage your personal information, preferences, and account security.</p>
        </div>
        <div className="shrink-0">
          {!editing ? (
            <button
              onClick={startEditing}
              className="bg-retro-teal text-white text-sm font-bold px-5 py-2.5 rounded-lg shadow-sm hover:bg-retro-teal/90 transition-all"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={cancelEditing}
                className="text-retro-teal/70 hover:text-retro-teal text-sm font-bold px-4 py-2.5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="bg-retro-salmon text-white text-sm font-bold px-5 py-2.5 rounded-lg shadow-sm hover:brightness-110 disabled:opacity-60 transition-all flex items-center gap-2"
              >
                {isUpdating && <Loader2 size={14} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-12">
        
        {/* ── SECTION: PERSONAL INFO ── */}
        <section className="flex flex-col md:flex-row gap-8 md:gap-16 border-b border-retro-sage/20 pb-12">
          <div className="md:w-1/3 shrink-0">
            <h2 className="text-base font-extrabold text-retro-teal mb-1">Personal Information</h2>
            <p className="text-xs text-retro-teal/60 leading-relaxed pr-4">
              Update your photo and personal details here. Your name and email are synced with your organisation.
            </p>
          </div>
          
          <div className="flex-1 space-y-8">
            {/* Avatar row */}
            <div className="flex items-center gap-6">
              <div className="relative group w-24 h-24 shrink-0">
                <img
                  src={photoSrc}
                  alt={user?.fullName || 'Avatar'}
                  className="w-24 h-24 rounded-full object-cover border border-retro-sage/30 shadow-sm"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-white/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Loader2 size={24} className="animate-spin text-retro-teal" />
                  </div>
                )}
                <div
                  onClick={() => editing && fileInputRef.current?.click()}
                  className={`absolute inset-0 rounded-full flex items-center justify-center bg-retro-teal/60 backdrop-blur-sm transition-opacity ${editing ? 'opacity-0 group-hover:opacity-100 cursor-pointer' : 'hidden'}`}
                >
                  <Camera size={20} className="text-white" />
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
              </div>
              <div>
                <p className="text-sm font-bold text-retro-teal mb-1">Profile Photo</p>
                <p className="text-xs text-retro-teal/50 mb-3">Square image recommended. Max size 2MB.</p>
                {editing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-retro-sage/40 text-retro-teal text-xs font-bold px-4 py-2 rounded-lg hover:bg-retro-bg transition-colors"
                  >
                    Change Photo
                  </button>
                )}
              </div>
            </div>
            
            {/* Form grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label className="block text-xs font-bold text-retro-teal/70 mb-2">Full Name</label>
                <div className="w-full bg-retro-bg/50 border border-retro-sage/20 rounded-lg px-4 py-2.5 text-sm font-medium text-retro-teal/50 cursor-not-allowed">
                  {user?.fullName || '—'}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-retro-teal/70 mb-2">Email Address</label>
                <div className="w-full bg-retro-bg/50 border border-retro-sage/20 rounded-lg px-4 py-2.5 text-sm font-medium text-retro-teal/50 cursor-not-allowed truncate">
                  {user?.email || '—'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-retro-teal/70 mb-2">Phone Number</label>
                {editing ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full bg-white border border-retro-sage/40 rounded-lg px-4 py-2.5 text-sm font-medium text-retro-teal focus:border-retro-salmon outline-none transition-all shadow-sm"
                  />
                ) : (
                  <div className="w-full bg-white border border-retro-sage/20 rounded-lg px-4 py-2.5 text-sm font-medium text-retro-teal shadow-sm">
                    {phone || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-retro-teal/70 mb-2">Language</label>
                {editing ? (
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full bg-white border border-retro-sage/40 rounded-lg px-4 py-2.5 text-sm font-medium text-retro-teal focus:border-retro-salmon outline-none transition-all shadow-sm"
                  >
                    {['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full bg-white border border-retro-sage/20 rounded-lg px-4 py-2.5 text-sm font-medium text-retro-teal shadow-sm">
                    {language || 'English'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION: SKILLS ── */}
        <section className="flex flex-col md:flex-row gap-8 md:gap-16 border-b border-retro-sage/20 pb-12">
          <div className="md:w-1/3 shrink-0">
            <h2 className="text-base font-extrabold text-retro-teal mb-1">Skills & Preferences</h2>
            <p className="text-xs text-retro-teal/60 leading-relaxed pr-4">
              Add skills to help us personalize your learning recommendations.
            </p>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.length > 0 ? skills.map(s => (
                <span key={s} className="flex items-center gap-1.5 text-xs font-bold bg-white border border-retro-sage/30 shadow-sm text-retro-teal px-3 py-1.5 rounded-md">
                  {s}
                  {editing && (
                    <button onClick={() => setSkills(skills.filter(sk => sk !== s))} className="text-retro-teal/40 hover:text-red-500 transition-colors ml-1">
                      &times;
                    </button>
                  )}
                </span>
              )) : (
                <span className="text-sm font-medium text-retro-teal/40">No skills added yet.</span>
              )}
            </div>
            
            {editing && (
              <div>
                <input
                  type="text"
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={addSkill}
                  placeholder="Type a skill and press Enter…"
                  className="w-full sm:w-2/3 bg-white border border-retro-sage/40 rounded-lg px-4 py-2.5 text-sm font-medium text-retro-teal focus:border-retro-salmon outline-none transition-all shadow-sm"
                />
              </div>
            )}
          </div>
        </section>

        {/* ── SECTION: ACCOUNT ACTIONS ── */}
        <section className="flex flex-col md:flex-row gap-8 md:gap-16 pb-6">
          <div className="md:w-1/3 shrink-0">
            <h2 className="text-base font-extrabold text-red-600 mb-1">Account Security</h2>
            <p className="text-xs text-red-600/60 leading-relaxed pr-4">
              Actions that affect your active session.
            </p>
          </div>
          
          <div className="flex-1">
            <button
              onClick={() => logoutAndRedirect('/')}
              className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
            >
              <LogOut size={16} /> Sign Out of Account
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
