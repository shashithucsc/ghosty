'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, User, Mail, Calendar, Users, School, GraduationCap, MapPin, Ruler, Palette, Award, Eye, EyeOff, MessageSquarePlus, Loader2 } from 'lucide-react';
import CreatePostModal from '@/components/profile/CreatePostModal';

interface ProfileData {
  id: string;
  username: string;
  email: string;
  fullName: string;
  birthday: string;
  gender: string;
  universityName: string;
  faculty: string;
  bio: string;
  anonymousName: string;
  anonymousAvatar: string;
  age: number | null;
  heightCm: number | null;
  skinTone: string;
  degreeType: string;
  hometown: string;
  isPublic: boolean;
}

const skinToneOptions = ['Fair', 'Medium', 'Olive', 'Tan', 'Brown', 'Dark'];
const degreeOptions = ['Diploma', 'Private Degree', 'Government Degree', 'Master', 'PhD'];
const genderOptions = ['Male', 'Female'];

export default function MyProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');

  const [profileData, setProfileData] = useState<ProfileData>({
    id: '', username: '', email: '', fullName: '', birthday: '', gender: '',
    universityName: '', faculty: '', bio: '', anonymousName: '', anonymousAvatar: 'U', // Removed emoji default
    age: null, heightCm: null, skinTone: '', degreeType: '', hometown: '', isPublic: true,
  });

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    const userId = localStorage.getItem('userId');
    const verificationStatusLocal = localStorage.getItem('verificationStatus');
    const registrationType = localStorage.getItem('registrationType');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (!userId) { router.push('/login'); return; }
    setVerificationStatus(verificationStatusLocal || 'unverified');

    if (!isAdmin) {
      if (registrationType === 'verified' && verificationStatusLocal === 'pending') {
        router.push('/pending-verification'); return;
      }
      if (registrationType === 'verified' && verificationStatusLocal === 'rejected') {
        localStorage.clear(); router.push('/login'); return;
      }
      if (registrationType === 'verified' && verificationStatusLocal !== 'verified') {
        router.push('/pending-verification'); return;
      }
    }

    setIsCheckingAuth(false);

    try {
      const response = await fetch(`/api/profile/edit?userId=${userId}`);
      const result = await response.json();
      if (response.ok && result.success) setProfileData(result.data);
      else setError('Failed to load profile');
    } catch (err) { setError('Failed to load profile'); } 
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');

    try {
      const response = await fetch('/api/profile/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profileData.id,
          fullName: profileData.fullName,
          birthday: profileData.birthday,
          gender: profileData.gender,
          universityName: profileData.universityName,
          faculty: profileData.faculty,
          bio: profileData.bio,
          heightCm: profileData.heightCm,
          skinTone: profileData.skinTone,
          degreeType: profileData.degreeType,
          hometown: profileData.hometown,
          isPublic: profileData.isPublic,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSuccess('Profile updated successfully');
        localStorage.setItem('username', result.data.username);
        localStorage.setItem('avatar', result.data.avatar);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(result.error || 'Failed to update');
      }
    } catch (err) { setError('Failed to update profile'); } 
    finally { setSaving(false); }
  };

  const handleChange = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  if (isCheckingAuth || loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center font-sans">
        <div className="w-16 h-16 border-4 border-black border-t-[#FFD166] rounded-full animate-spin shadow-[4px_4px_0px_rgba(0,0,0,1)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5] py-8 px-4 pb-24 font-sans text-black">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-6">
          <h1 className="text-4xl font-black uppercase tracking-tight">Edit Profile</h1>
          {verificationStatus === 'verified' && profileData.id && (
            <button
              onClick={() => setIsCreatePostModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-[#FFD166] border-4 border-black text-black font-black uppercase text-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#ffc033] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
            >
              <MessageSquarePlus className="w-5 h-5 stroke-[3]" />
              <span className="hidden sm:inline">Create Post</span>
            </button>
          )}
        </div>

        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={() => setIsCreatePostModalOpen(false)}
          userId={profileData.id}
          userGender={profileData.gender}
          verificationStatus={verificationStatus}
        />

        {/* Alerts */}
        {success && (
          <div className="mb-6 p-4 bg-[#A3E635] border-4 border-black font-black uppercase tracking-wider text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-[#FF6B6B] border-4 border-black font-black uppercase tracking-wider text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section: Personal Info */}
          <section className="bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black uppercase tracking-widest mb-6 flex items-center gap-3 bg-[#4ECDC4] self-start inline-flex px-3 py-1 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <User className="w-5 h-5 stroke-[3]" /> 
              Personal Info
            </h2>
            
            <div className="space-y-5">
               {/* Read-Only Fields */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-black uppercase tracking-widest mb-2">Username</label>
                    <input type="text" value={profileData.username} disabled className="w-full px-4 py-3 bg-gray-200 border-4 border-black text-gray-500 font-bold uppercase cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-black uppercase tracking-widest mb-2">Email</label>
                    <input type="text" value={profileData.email} disabled className="w-full px-4 py-3 bg-gray-200 border-4 border-black text-gray-500 font-bold uppercase cursor-not-allowed" />
                  </div>
               </div>

               <div>
                 <label className="block text-sm font-black uppercase tracking-widest mb-2">Full Name</label>
                 <input 
                   type="text" 
                   value={profileData.fullName} 
                   onChange={(e) => handleChange('fullName', e.target.value)}
                   className="w-full px-4 py-3 bg-[#F8F9FA] border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-shadow"
                 />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-black uppercase tracking-widest mb-2">Birthday</label>
                    <input 
                      type="date" 
                      value={profileData.birthday} 
                      onChange={(e) => handleChange('birthday', e.target.value)}
                      className="w-full px-4 py-3 bg-[#F8F9FA] border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black uppercase tracking-widest mb-2">Gender</label>
                    <select 
                      value={profileData.gender} 
                      onChange={(e) => handleChange('gender', e.target.value)}
                      className="w-full px-4 py-3 bg-[#F8F9FA] border-4 border-black font-bold uppercase focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-shadow appearance-none"
                    >
                      <option value="">SELECT GENDER</option>
                      {genderOptions.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                    </select>
                  </div>
               </div>
            </div>
          </section>

          {/* Section: Education */}
          <section className="bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black uppercase tracking-widest mb-6 flex items-center gap-3 bg-[#FFD166] self-start inline-flex px-3 py-1 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <School className="w-5 h-5 stroke-[3]" /> 
              Education
            </h2>
            <div className="space-y-5">
               <div>
                 <label className="block text-sm font-black uppercase tracking-widest mb-2">University</label>
                 <input 
                   type="text" 
                   value={profileData.universityName} 
                   onChange={(e) => handleChange('universityName', e.target.value)}
                   className="w-full px-4 py-3 bg-[#F8F9FA] border-4 border-black font-bold uppercase focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-shadow"
                 />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-black uppercase tracking-widest mb-2">Faculty</label>
                    <input 
                      type="text" 
                      value={profileData.faculty} 
                      onChange={(e) => handleChange('faculty', e.target.value)}
                      className="w-full px-4 py-3 bg-[#F8F9FA] border-4 border-black font-bold uppercase focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black uppercase tracking-widest mb-2">Degree Type</label>
                    <select 
                      value={profileData.degreeType} 
                      onChange={(e) => handleChange('degreeType', e.target.value)}
                      className="w-full px-4 py-3 bg-[#F8F9FA] border-4 border-black font-bold uppercase focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-shadow appearance-none"
                    >
                      <option value="">SELECT TYPE</option>
                      {degreeOptions.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                    </select>
                  </div>
               </div>
            </div>
          </section>

          {/* Section: Details */}
          <section className="bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black uppercase tracking-widest mb-6 flex items-center gap-3 bg-[#FF9F1C] self-start inline-flex px-3 py-1 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <Palette className="w-5 h-5 stroke-[3]" /> 
              Appearance & Bio
            </h2>
            <div className="space-y-5">
               <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-black uppercase tracking-widest mb-2">Height (cm)</label>
                    <input 
                      type="number" 
                      value={profileData.heightCm || ''} 
                      onChange={(e) => handleChange('heightCm', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-[#F8F9FA] border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black uppercase tracking-widest mb-2">Skin Tone</label>
                    <select 
                      value={profileData.skinTone} 
                      onChange={(e) => handleChange('skinTone', e.target.value)}
                      className="w-full px-4 py-3 bg-[#F8F9FA] border-4 border-black font-bold uppercase focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-shadow appearance-none"
                    >
                      <option value="">SELECT</option>
                      {skinToneOptions.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                    </select>
                  </div>
               </div>
               <div>
                 <label className="block text-sm font-black uppercase tracking-widest mb-2">Hometown</label>
                 <input 
                   type="text" 
                   value={profileData.hometown} 
                   onChange={(e) => handleChange('hometown', e.target.value)}
                   className="w-full px-4 py-3 bg-[#F8F9FA] border-4 border-black font-bold uppercase focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-shadow"
                 />
               </div>
               <div>
                 <label className="block text-sm font-black uppercase tracking-widest mb-2">Bio</label>
                 <textarea 
                   rows={4}
                   value={profileData.bio} 
                   onChange={(e) => handleChange('bio', e.target.value)}
                   className="w-full px-4 py-3 bg-[#F8F9FA] border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-shadow resize-none"
                   placeholder="WRITE SOMETHING ABOUT YOURSELF..."
                 />
               </div>
            </div>
          </section>

          {/* Section: Privacy (Chunky Toggle) */}
          <section className="bg-[#F8F9FA] border-4 border-black rounded-3xl p-6 flex items-center justify-between shadow-[8px_8px_0px_rgba(0,0,0,1)]">
             <div className="flex items-center gap-4">
                <div className={`w-12 h-12 flex items-center justify-center border-4 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] ${profileData.isPublic ? 'bg-[#A3E635]' : 'bg-gray-300'}`}>
                  {profileData.isPublic ? <Eye className="w-6 h-6 stroke-[3]" /> : <EyeOff className="w-6 h-6 stroke-[3]" />}
                </div>
                <div>
                  <p className="text-lg font-black uppercase tracking-tight">Public Profile</p>
                  <p className="text-sm font-bold text-gray-600 uppercase">{profileData.isPublic ? 'Visible to everyone' : 'Hidden from feed'}</p>
                </div>
             </div>
             
             {/* Custom Neobrutalist Toggle Switch */}
             <button
                type="button"
                onClick={() => handleChange('isPublic', !profileData.isPublic)}
                className={`relative inline-flex h-10 w-20 items-center border-4 border-black transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] ${
                  profileData.isPublic ? 'bg-[#4ECDC4]' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-8 w-8 border-4 border-black bg-white transition-transform ${
                  profileData.isPublic ? 'translate-x-10' : 'translate-x-0'
                }`} />
              </button>
          </section>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-5 mt-4 bg-black text-white border-4 border-black font-black uppercase text-xl tracking-wider rounded-2xl shadow-[8px_8px_0px_rgba(163,230,53,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[10px_10px_0px_rgba(163,230,53,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-6 h-6 stroke-[3] animate-spin" /> : <Save className="w-6 h-6 stroke-[3]" />}
            {saving ? 'SAVING CHANGES...' : 'SAVE PROFILE'}
          </button>

        </form>
      </div>
    </div>
  );
}