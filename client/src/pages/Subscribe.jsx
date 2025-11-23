import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Upload, CreditCard, Users, UserPlus, Trash2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Subscribe = () => {
  const [isTeamReg, setIsTeamReg] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // React Hook Form setup
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      roster: [{ name: '', gender: 'Male', jerseyNumber: '', position: 'PG' }]
    }
  });

  // Field Array for Dynamic Roster
  const { fields, append, remove } = useFieldArray({
    control,
    name: "roster"
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const formData = new FormData();
    
    // Basic User Info
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('contactNumber', data.contactNumber);
    
    // Team Registration Data
    formData.append('isTeamApplication', isTeamReg);
    if (isTeamReg) {
      formData.append('teamName', data.teamName);
      formData.append('conference', data.conference);
      // Send roster as JSON string
      formData.append('roster', JSON.stringify(data.roster));
    }
    
    // File Upload
    if (data.proof && data.proof[0]) {
      formData.append('proofOfPayment', data.proof[0]);
    }

    try {
      await registerUser(formData);
      toast.success(isTeamReg ? 'Team application submitted! Wait for approval.' : 'Registration successful! Wait for approval.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-indigo-900 px-8 py-6 text-white text-center">
          <h2 className="text-3xl font-extrabold">Join the League</h2>
          <p className="mt-2 text-indigo-200">Create an account or register your team for the upcoming season</p>
        </div>

        <div className="p-8">
          {/* Toggle Switch */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                type="button"
                onClick={() => setIsTeamReg(false)}
                className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${!isTeamReg ? 'bg-white text-indigo-900 shadow' : 'text-gray-500'}`}
              >
                Viewer Access
              </button>
              <button
                type="button"
                onClick={() => setIsTeamReg(true)}
                className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${isTeamReg ? 'bg-white text-indigo-900 shadow' : 'text-gray-500'}`}
              >
                Register Team
              </button>
            </div>
          </div>

          {/* Payment Info Box */}
          <div className="bg-blue-50 p-5 rounded-xl mb-8 border border-blue-100 flex items-start gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm text-blue-600">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 text-lg">Registration Fee Required</h3>
              <p className="text-sm text-blue-800 mt-1">
                {isTeamReg ? "Team Registration Fee: ₱5,000" : "Viewer Subscription: ₱150 / month"}
              </p>
              <p className="text-xs text-blue-600 mt-2">Scan QR via GCash/Maya and upload the screenshot below.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* SECTION 1: User Credentials */}
            <div className="space-y-6">
              <h4 className="text-sm uppercase tracking-wide text-gray-500 font-bold border-b pb-2">Account Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input {...register("name", { required: "Name is required" })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="John Doe" />
                  {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input {...register("contactNumber", { required: "Contact is required" })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0912 345 6789" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" {...register("email", { required: "Email is required" })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" {...register("password", { required: "Required", minLength: { value: 6, message: "Min 6 chars" } })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••" />
                  {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
                </div>
              </div>
            </div>

            {/* SECTION 2: Team Registration (Conditional) */}
            {isTeamReg && (
              <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-sm uppercase tracking-wide text-gray-700 font-bold">Team Information</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                    <input {...register("teamName", { required: isTeamReg })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" placeholder="e.g. The Shooters" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Conference</label>
                    <select {...register("conference")} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                      <option value="East">East Conference</option>
                      <option value="West">West Conference</option>
                    </select>
                  </div>
                </div>

                {/* Roster Builder */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Team Roster</label>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-col md:flex-row gap-3 mb-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100 items-end">
                      <div className="flex-1">
                        <label className="text-xs text-gray-400">Player Name</label>
                        <input {...register(`roster.${index}.name`, { required: true })} className="w-full p-2 border rounded text-sm" placeholder="Name" />
                      </div>
                      <div className="w-24">
                        <label className="text-xs text-gray-400">Jersey #</label>
                        <input {...register(`roster.${index}.jerseyNumber`)} className="w-full p-2 border rounded text-sm" placeholder="#" />
                      </div>
                      <div className="w-32">
                        <label className="text-xs text-gray-400">Position</label>
                        <select {...register(`roster.${index}.position`)} className="w-full p-2 border rounded text-sm bg-white">
                          <option value="PG">PG</option>
                          <option value="SG">SG</option>
                          <option value="SF">SF</option>
                          <option value="PF">PF</option>
                          <option value="C">C</option>
                        </select>
                      </div>
                      <div className="w-24">
                        <label className="text-xs text-gray-400">Gender</label>
                        <select {...register(`roster.${index}.gender`)} className="w-full p-2 border rounded text-sm bg-white">
                          <option value="Male">M</option>
                          <option value="Female">F</option>
                        </select>
                      </div>
                      <button type="button" onClick={() => remove(index)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => append({ name: '', gender: 'Male', jerseyNumber: '', position: 'PG' })} className="mt-2 flex items-center text-sm text-indigo-600 font-bold hover:text-indigo-800">
                    <UserPlus className="w-4 h-4 mr-1" /> Add Player
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 3: Payment Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Upload Payment Screenshot</label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer group">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept="image/*"
                  {...register("proof", { required: "Proof of payment is required" })}
                />
                <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                <p className="mt-2 text-sm font-medium text-gray-900">Click to upload screenshot</p>
                <p className="mt-1 text-xs text-gray-500">Supported: JPG, PNG (Max 5MB)</p>
                {errors.proof && <span className="text-red-500 text-xs font-bold mt-2 block">File is required</span>}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white transition-all ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5'}`}
            >
              {loading ? 'Submitting Application...' : isTeamReg ? 'Submit Team Application' : 'Register Account'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;