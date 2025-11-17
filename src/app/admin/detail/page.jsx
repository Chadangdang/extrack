"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Home, Users, PlusCircle, Edit2, LogOut } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function UserDetails() {
  const router = useRouter();
  const [status, setStatus] = useState('active');

  // Sample user data
  const userData = {
    name: 'Chonmanee C.',
    email: 'chonmanee@...',
    totalTransactions: 124
  };

  // Transaction data
  const transactionData = [
    { name: 'Bill', value: 20, color: '#7b93ff' },
    { name: 'Salary', value: 10, color: '#9cd89c' },
    { name: 'Food', value: 40, color: '#f3a7d3' },
    { name: 'Shopping', value: 25, color: '#c5a3e8' },
    { name: 'Other', value: 5, color: '#d4a08a' }
  ];

  const handleSaveChanges = () => {
    router.push('/admin/dashboard'); // UPDATED
  };

  const handleCancel = () => {
    router.push('/admin/dashboard'); // UPDATED
  };

  const handleLogout = () => {
    router.push('/admin/loginadmin');
  };
  
  return (
    <div className="min-h-screen bg-[#F8F3ED] flex flex-col">
      {/* Top Header */}
      <div className="w-full bg-[#945C2B] flex items-center justify-left px-6 py-3 relative fixed top-0 z-30 shadow-md">
        <h1 className="text-xl font-semibold text-white">User Details</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-6 py-8 mt-14 pb-24">
        <div className="w-full max-w-lg bg-[#E9D6BF] rounded-lg p-6 shadow-md space-y-4">
          
          {/* User Name */}
          <div className="flex items-center gap-3 bg-[#d4c4a8] rounded-lg p-3">
            <User className="text-[#945C2B]" size={24} />
            <span className="text-lg font-semibold text-[#945C2B]">{userData.name}</span>
          </div>

          {/* Email */}
          <div className="bg-[#E9D6BF] rounded-lg p-3 border-b-2 border-[#945C2B]">
            <p className="text-base text-[#945C2B]">
              <span className="font-semibold">Email:</span> {userData.email}
            </p>
          </div>

          {/* Status Toggle */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[#945C2B]">Status</h3>
            <div className="flex border-2 border-[#945C2B] rounded-lg overflow-hidden">
              <button
                onClick={() => setStatus('active')}
                className={`flex-1 py-3 text-base font-semibold transition-colors ${
                  status === 'active'
                    ? 'bg-[#9cd89c] text-[#2f5f2f]'
                    : 'bg-white text-[#945C2B] hover:bg-gray-50'
                }`}
              >
                Active
              </button>

              <button
                onClick={() => setStatus('inactive')}
                className={`flex-1 py-3 text-base font-semibold transition-colors ${
                  status === 'inactive'
                    ? 'bg-[#e7b3b3] text-[#5f2f2f]'
                    : 'bg-white text-[#945C2B] hover:bg-gray-50'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="space-y-3 pt-3 border-t-2 border-[#945C2B]">
            <h3 className="text-lg font-semibold text-[#945C2B]">Transaction Summary</h3>

            {/* Pie Chart */}
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={transactionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    stroke="#945C2B"
                    strokeWidth={2}
                  >
                    {transactionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              {transactionData.map((item) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span style={{ color: item.color }} className="font-semibold">
                    {item.name} {item.value}%
                  </span>
                </div>
              ))}
            </div>

            {/* Total Transactions */}
            <div className="text-center mt-3">
              <p className="text-lg font-semibold text-[#945C2B]">
                Total Transactions: {userData.totalTransactions}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSaveChanges}
              className="flex-1 bg-[#d5853c] hover:bg-[#b96f2f] text-white font-bold py-3 px-4 rounded-lg transition-colors active:scale-95 text-base"
            >
              SAVE CHANGES
            </button>

            <button
              onClick={handleCancel}
              className="flex-1 bg-[#945C2B] hover:bg-[#7d4a22] text-white font-bold py-3 px-4 rounded-lg transition-colors active:scale-95 text-base"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="w-full bg-[#E9D6BF] flex border-t-2 border-[#945C2B] fixed bottom-0">
        
        {/* Home → Dashboard */}
        <button 
          onClick={() => router.push('/admin/dashboard')}
          className="flex-1 flex flex-col items-center justify-center py-4 hover:bg-white transition-colors active:scale-95"
        >
          <Home size={28} className="text-[#945C2B]" />
        </button>
        
        {/* Users (current page) */}
        <button className="flex-1 flex flex-col items-center justify-center py-4 bg-white border-t-4 border-[#945C2B]">
          <Users size={28} className="text-[#945C2B]" />
        </button>

        {/* Plus → Add Page */}
        <button 
          onClick={() => router.push('/admin/add')}
          className="flex-1 flex flex-col items-center justify-center py-4 hover:bg-white transition-colors active:scale-95"
        >
          <PlusCircle size={28} className="text-[#945C2B]" />
        </button>

        {/* Pencil → Edit Page */}
        <button 
          onClick={() => router.push('/admin/edit')}
          className="flex-1 flex flex-col items-center justify-center py-4 hover:bg-white transition-colors active:scale-95"
        >
          <Edit2 size={28} className="text-[#945C2B]" />
        </button>

        {/* Logout → Login */}
        <button 
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center justify-center py-4 hover:bg-white transition-colors active:scale-95"
        >
          <LogOut size={28} className="text-[#945C2B]" />
        </button>
      </div>
    </div>
  );
}
