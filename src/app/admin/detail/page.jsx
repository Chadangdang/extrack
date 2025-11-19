"use client";

import React, { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Home, Users, PlusCircle, Edit2, LogOut } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

function UserDetails() {
  const router = useRouter();
  const [status, setStatus] = useState('');

  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchSummary() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/transactions/summary?userId=${userId}`);
        const data = await res.json();
        setSummary(data);
        setStatus(data.user.status || 'active');
      } catch (err) {
        console.error("Failed to load summary", err);
      }
    }

    fetchSummary();
  }, [userId]);

  const userData = {
    name: summary?.user?.username || "Loading...",
    email: summary?.user?.email || "",
    totalTransactions: summary?.totalCount || 0
  };

  const transactionData = summary?.categories?.map(c => ({
    name: c.category,
    value: c.totalAmount,
    color: c.color
  })) || [];

  const totalValue = transactionData.reduce((sum, d) => sum + d.value, 0);

  const handleSaveChanges = async () => {
    if (!userId) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            status,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Failed to update user status:", data);
        return;
      }

      router.push('/admin/dashboard');
    } catch (err) {
      console.error("Error saving status:", err);
    }
  };

  const handleCancel = () => {
    router.push('/admin/dashboard'); // UPDATED
  };

  const handleLogout = () => {
    router.push('/admin/loginadmin');
  };
  
  return (
    <div className="flex flex-col bg-[#F8F3ED] min-h-screen">
      {/* Top Header */}
      <div className="relative top-0 z-30 fixed flex justify-left items-center bg-[#945C2B] shadow-md px-6 py-3 w-full">
        <h1 className="font-semibold text-white text-xl">User Details</h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 items-center mt-14 px-6 py-8 pb-24">
        <div className="space-y-4 bg-[#E9D6BF] shadow-md p-6 rounded-lg w-full max-w-lg">
          
          {/* User Name */}
          <div className="flex items-center gap-3 bg-[#d4c4a8] p-3 rounded-lg">
            <User className="text-[#945C2B]" size={24} />
            <span className="font-semibold text-[#945C2B] text-lg">{userData.name}</span>
          </div>

          {/* Email */}
          <div className="bg-[#E9D6BF] p-3 border-[#945C2B] border-b-2 rounded-lg">
            <p className="text-[#945C2B] text-base">
              <span className="font-semibold">Email:</span> {userData.email}
            </p>
          </div>

          {/* Status Toggle */}
          <div className="space-y-2">
            <h3 className="font-semibold text-[#945C2B] text-lg">Status</h3>
            <div className="flex border-[#945C2B] border-2 rounded-lg overflow-hidden">
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
          <div className="space-y-3 pt-3 border-[#945C2B] border-t-2">
            <h3 className="font-semibold text-[#945C2B] text-lg">Transaction Summary</h3>

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
                  >
                    {transactionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v} transactions`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              {transactionData.map((item) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div
                    className="rounded w-3 h-3"
                    style={{ backgroundColor: item.color, border: '1px solid rgba(0,0,0,0.25)' }}
                  ></div>
                  <span
                    className="font-semibold"
                    style={{
                      color: item.color,
                      textShadow: '-0.5px -0.5px 0 #945C2B, 0.5px -0.5px 0 #945C2B, -0.5px 0.5px 0 #945C2B, 0.5px 0.5px 0 #945C2B'
                    }}
                  >
                    {item.name} {totalValue ? Math.round((item.value / totalValue) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <p className="font-semibold text-[#945C2B] text-lg">
                Total Transactions: {userData.totalTransactions}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSaveChanges}
              className="flex-1 bg-[#d5853c] hover:bg-[#b96f2f] px-4 py-3 rounded-lg font-bold text-base text-white transition-colors active:scale-95"
            >
              SAVE CHANGES
            </button>

            <button
              onClick={handleCancel}
              className="flex-1 bg-[#945C2B] hover:bg-[#7d4a22] px-4 py-3 rounded-lg font-bold text-base text-white transition-colors active:scale-95"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-0 fixed flex bg-[#E9D6BF] border-[#945C2B] border-t-2 w-full">
        
        {/* Home → Dashboard */}
        <button 
          onClick={() => router.push('/admin/dashboard')}
          className="flex flex-col flex-1 justify-center items-center hover:bg-white py-4 transition-colors active:scale-95"
        >
          <Home size={28} className="text-[#945C2B]" />
        </button>
        
        {/* Users (current page) */}
        <button className="flex flex-col flex-1 justify-center items-center bg-white py-4 border-[#945C2B] border-t-4">
          <Users size={28} className="text-[#945C2B]" />
        </button>

        {/* Plus → Add Page */}
        <button 
          onClick={() => router.push('/admin/add')}
          className="flex flex-col flex-1 justify-center items-center hover:bg-white py-4 transition-colors active:scale-95"
        >
          <PlusCircle size={28} className="text-[#945C2B]" />
        </button>

        {/* Pencil → Edit Page */}
        <button 
          onClick={() => router.push('/admin/edit')}
          className="flex flex-col flex-1 justify-center items-center hover:bg-white py-4 transition-colors active:scale-95"
        >
          <Edit2 size={28} className="text-[#945C2B]" />
        </button>

        {/* Logout → Login */}
        <button 
          onClick={handleLogout}
          className="flex flex-col flex-1 justify-center items-center hover:bg-white py-4 transition-colors active:scale-95"
        >
          <LogOut size={28} className="text-[#945C2B]" />
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserDetails />
    </Suspense>
  )
}
