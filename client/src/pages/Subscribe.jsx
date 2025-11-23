import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Subscribe = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    const formData = new FormData();
    
    // Append fields
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('contactNumber', data.contactNumber);
    
    // Append File
    if (data.proof[0]) {
      formData.append('proofOfPayment', data.proof[0]);
    }

    try {
      await registerUser(formData);
      toast.success('Registration successful! Please wait for admin approval.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Join the League</h2>
          <p className="mt-2 text-gray-600">Subscribe to access Pro Stats and League Features</p>
        </div>

        {/* Admin Payment QR Display would go here */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
          <h3 className="font-bold text-blue-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5" /> Payment Info
          </h3>
          <p className="text-sm text-blue-800 mt-2">Scan QR Code (GCash/Maya) and upload screenshot below.</p>
          {/* <img src="qr-code-url.jpg" alt="Payment QR" className="mt-2 w-32 mx-auto" /> */}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input 
                {...register("name", { required: "Name is required" })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
              />
              {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <input 
                {...register("contactNumber", { required: "Contact is required" })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email"
              {...register("email", { required: "Email is required" })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password"
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 chars" } })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
            />
            {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer">
            <label className="cursor-pointer w-full block">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">Upload Proof of Payment</span>
              <span className="mt-1 block text-xs text-gray-500">PNG, JPG up to 5MB</span>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                {...register("proof", { required: "Proof of payment is required" })}
              />
            </label>
            {errors.proof && <span className="text-red-500 text-xs block mt-2">{errors.proof.message}</span>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Submit Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Subscribe;