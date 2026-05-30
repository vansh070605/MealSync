import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createFlat, createUser, getUsers, saveUser, saveUserProfile } from "../api";
import { useStore } from "../store";
import { useAuth } from "../context/AuthContext";
import TopBar from "../components/TopBar";

const POPULAR_TAGS = [
  "Chicken", "Paneer", "Pasta", "Spicy", "Healthy", "Rice", 
  "Indian", "Asian", "Noodles", "Soup", "Potato", "Cheese"
];

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const { setFlatId, setUsers } = useStore();
  const { user, userProfile, setUserProfile } = useAuth();
  
  const [step, setStep] = useState(1);
  const [flatName, setFlatName] = useState("");
  const [memberCount, setMemberCount] = useState(2);
  const [members, setMembers] = useState([]);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNextStep1 = () => {
    if (!flatName.trim()) return;
    setStep(2);
  };

  const handleNextStep2 = () => {
    // Initialize members array
    // Pre-populate first member name with userProfile name if available
    const initMembers = Array(memberCount).fill(null).map((_, i) => ({
      name: i === 0 && userProfile?.name ? userProfile.name : "",
      avatar: "🧑",
      likes: [],
      dislikes: [],
      spice_tolerance: 3
    }));
    setMembers(initMembers);
    setStep(3);
  };

  const handleMemberUpdate = (field, value) => {
    const updated = [...members];
    updated[currentMemberIndex] = {
      ...updated[currentMemberIndex],
      [field]: value
    };
    setMembers(updated);
  };

  const toggleTag = (field, tag) => {
    const tagLower = tag.toLowerCase();
    const currentList = members[currentMemberIndex][field];
    const newList = currentList.includes(tagLower)
      ? currentList.filter(t => t !== tagLower)
      : [...currentList, tagLower];
    handleMemberUpdate(field, newList);
  };

  const handleNextMember = () => {
    if (!members[currentMemberIndex].name.trim()) return;
    
    if (currentMemberIndex < memberCount - 1) {
      setCurrentMemberIndex(prev => prev + 1);
    } else {
      submitOnboarding();
    }
  };

  const submitOnboarding = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create Flat
      const flatRes = await createFlat(flatName);
      const newFlatId = flatRes.data.id;
      
      // 2. Create Users in this Flat
      let isFirst = true;
      for (const m of members) {
        if (isFirst && user) {
          // Link first profile to the logged-in user's credentials
          await saveUser(newFlatId, user.uid, {
            ...m,
            effort_tolerance: "Medium"
          });
          
          // Update user's global profile state in Firebase
          const updatedProfile = {
            ...userProfile,
            flatId: newFlatId,
            name: m.name,
            spice_tolerance: m.spice_tolerance,
            likes: m.likes,
            dislikes: m.dislikes,
            effort_tolerance: "Medium"
          };
          await saveUserProfile(user.uid, updatedProfile);
          setUserProfile(updatedProfile);
          isFirst = false;
        } else {
          await createUser(newFlatId, {
            ...m,
            effort_tolerance: "Medium"
          });
        }
      }
      
      // 3. Update Global Context
      setFlatId(newFlatId);
      
      // Fetch the users again and put into store
      const usersRes = await getUsers(newFlatId);
      setUsers(usersRes.data);
      
      setIsSubmitting(false);
      navigate("/input"); // go to home or input screen
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert("Error saving onboarding details: " + (err.message || err));
    }
  };

  return (
    <div className="pb-24 animate-fade-in min-h-screen bg-[#FDFCF8]">
      <TopBar title="Welcome to MealSync" subtitle="Let's set up your household" />
      
      <div className="max-w-md mx-auto px-6 mt-8">
        
        {/* Step 1: Flat Name */}
        {step === 1 && (
          <div className="space-y-6 animate-slide-up">
            <h2 className="text-2xl font-black text-slate-800">What's your household name?</h2>
            <p className="text-sm text-slate-500 font-medium">This represents your flat, family, or friend group.</p>
            <input 
              type="text" 
              placeholder="e.g. The Avengers, Flat 404..." 
              className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all"
              value={flatName}
              onChange={(e) => setFlatName(e.target.value)}
            />
            <button 
              onClick={handleNextStep1}
              disabled={!flatName.trim()}
              className="w-full h-14 bg-emerald-800 text-white rounded-2xl font-bold disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Member Count */}
        {step === 2 && (
          <div className="space-y-6 animate-slide-up">
            <h2 className="text-2xl font-black text-slate-800">How many people live here?</h2>
            <p className="text-sm text-slate-500 font-medium">We'll set up profiles for each of them.</p>
            
            <div className="flex items-center justify-center gap-6 py-8">
              <button onClick={() => setMemberCount(Math.max(1, memberCount - 1))} className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xl hover:bg-slate-200">-</button>
              <span className="text-5xl font-black text-slate-800">{memberCount}</span>
              <button onClick={() => setMemberCount(memberCount + 1)} className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xl hover:bg-slate-200">+</button>
            </div>

            <button 
              onClick={handleNextStep2}
              className="w-full h-14 bg-emerald-800 text-white rounded-2xl font-bold"
            >
              Create {memberCount} profiles
            </button>
          </div>
        )}

        {/* Step 3: Member Profiles */}
        {step === 3 && members.length > 0 && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-2xl font-black text-slate-800">Member {currentMemberIndex + 1} of {memberCount}</h2>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{flatName}</span>
            </div>
            
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:border-emerald-500"
                  value={members[currentMemberIndex].name}
                  onChange={(e) => handleMemberUpdate("name", e.target.value)}
                  placeholder="e.g. John"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Spice Tolerance (1-5)</label>
                <input 
                  type="range" min="1" max="5" 
                  className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                  value={members[currentMemberIndex].spice_tolerance}
                  onChange={(e) => handleMemberUpdate("spice_tolerance", parseInt(e.target.value))}
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-300 mt-2">
                  <span>Mild</span>
                  <span>Extra Spicy</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Loves these</label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TAGS.map(tag => {
                    const isSelected = members[currentMemberIndex].likes.includes(tag.toLowerCase());
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag("likes", tag)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                          isSelected 
                            ? "bg-emerald-700 text-white border-emerald-700 shadow-md" 
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300"
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Dislikes these</label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TAGS.map(tag => {
                    const isSelected = members[currentMemberIndex].dislikes.includes(tag.toLowerCase());
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag("dislikes", tag)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                          isSelected 
                            ? "bg-rose-600 text-white border-rose-600 shadow-md" 
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-rose-300"
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <button 
              onClick={handleNextMember}
              disabled={!members[currentMemberIndex].name.trim() || isSubmitting}
              className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : currentMemberIndex < memberCount - 1 ? (
                "Next Profile"
              ) : (
                "Finish Setup"
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
