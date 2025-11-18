"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Users, PlusCircle, Edit2, LogOut } from 'lucide-react';

export default function AddCategory() {
  const router = useRouter();
  const [categoryName, setCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const colors = [
    { name: 'Pink', value: '#f3a7d3' },
    { name: 'Blue', value: '#7b93ff' },
    { name: 'Purple', value: '#c5a3e8' },
    { name: 'Green', value: '#9cd89c' },
    { name: 'Grey', value: '#d4a08a' }
  ];

  const handleSave = async () => {
    if (!categoryName.trim() || !selectedColor) {
      alert('Please enter a category name and select a color');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: categoryName.trim(),
          name: categoryName.trim(),
          color: selectedColor
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to save category");
        return;
      }

      router.push('/admin/dashboard');
    } catch (err) {
      console.error("Error creating category:", err);
      alert("Something went wrong while saving the category.");
    }
  };

  const handleCancel = () => {
    router.push('/admin/detail');
  };

  const handleLogout = () => {
    router.push('/admin/loginadmin');
  };

  return (
    <div className="min-h-screen bg-[#F8F3ED] flex flex-col">
      {/* Top Header */}
      <div className="w-full bg-[#945C2B] flex items-center justify-start px-6 py-3 relative fixed top-0 z-30 shadow-md">
        <h1 className="text-xl font-semibold text-white">Add Category</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-6 py-8 mt-14 pb-24">
        <div className="w-full max-w-lg space-y-6">
          {/* Category Name Input */}
          <div>
            <label className="block text-xl font-semibold text-[#945C2B] mb-3">
              Category Name
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-[#945C2B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#945C2B] text-[#945C2B] text-base"
              placeholder="Enter category name"
            />
          </div>

          {/* Select Color */}
          <div>
            <h2 className="text-xl font-semibold text-[#945C2B] mb-4">Select Color</h2>
            <div className="space-y-3">
              {colors.map((color) => (
                <label
                  key={color.name}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative">
                    <input
                      type="radio"
                      name="color"
                      value={color.value}
                      checked={selectedColor === color.value}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-7 h-7 rounded-full border-3 transition-all ${
                        selectedColor === color.value
                          ? 'border-[#945C2B] scale-110'
                          : 'border-[#945C2B] bg-white'
                      }`}
                    >
                      {selectedColor === color.value && (
                        <div
                          className="w-full h-full rounded-full"
                          style={{ backgroundColor: color.value }}
                        ></div>
                      )}
                    </div>
                  </div>
                  <span className="text-lg font-medium text-[#945C2B] group-hover:text-[#7d4a22]">
                    {color.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#d5853c] hover:bg-[#b96f2f] text-white font-bold py-3 px-4 rounded-lg transition-colors active:scale-95 text-base"
            >
              SAVE CATEGORY
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
  
  {/* Home */}
  <button 
  onClick={() => router.push('/admin/dashboard')}
  className="flex-1 flex flex-col items-center justify-center py-4 hover:bg-white transition-colors active:scale-95"
  >
    <Home size={28} className="text-[#945C2B]" />
  </button>

  {/* Users */}
  <button 
    onClick={() => router.push('/admin/detail')}
    className="flex-1 flex flex-col items-center justify-center py-4 hover:bg-white transition-colors active:scale-95"
  >
    <Users size={28} className="text-[#945C2B]" />
  </button>

  {/* Plus */}
  <button className="flex-1 flex flex-col items-center justify-center py-4 bg-white border-t-4 border-[#945C2B]">
    <PlusCircle size={28} className="text-[#945C2B]" />
  </button>

  {/* Pencil */}
  <button 
    onClick={() => router.push('/admin/edit')}
    className="flex-1 flex flex-col items-center justify-center py-4 hover:bg-white transition-colors active:scale-95"
  >
    <Edit2 size={28} className="text-[#945C2B]" />
  </button>

  {/* Logout */}
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
