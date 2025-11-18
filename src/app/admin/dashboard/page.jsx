"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight, ChevronDown, User, Edit2, Trash2, Plus, Home, Users, PlusCircle, LogOut } from 'lucide-react';
import { getAllUsers, getAdmins, getCategories } from '@/lib/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [userSectionOpen, setUserSectionOpen] = useState(false);
  const [categorySectionOpen, setCategorySectionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);

  // Check if user is admin and load data
  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      router.replace("/");
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, categoriesData] = await Promise.all([
        getAllUsers(),
        getCategories(),
      ]);

      // Map users data to match your component structure
      const mappedUsers = usersData.map(user => ({
        id: user.userId,
        name: user.username,
        email: user.email || 'N/A',
        status: user.status || 'active',
        transactions: user.transactionCount || 0
      }));

      setUsers(mappedUsers);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // View details now always goes to /admin/detail
  const handleViewDetails = () => {
    router.push('/admin/detail');
  };

  const handleActivate = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: 'active' }
        : user
    ));
  };

  const deleteCategory = async (categoryKey) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: categoryKey }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete category");
      }

      
      setCategories(categories.filter(cat => (cat.key || cat.id) !== categoryKey));
      alert('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const addCategory = async (categoryName) => {
    if (!categoryName || !categoryName.trim()) {
      return;
    }

    try {
      const colors = ['#f3a7d3', '#7b93ff', '#c5a3e8', '#9cd89c', '#f4dda7', '#ffa8a8', '#a8d5ff'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      // TODO: Add API call to create category in backend
      // const newCat = await createCategory({ name: categoryName.trim(), color: randomColor });
      
      const newCat = {
        key: `cat_${Date.now()}`,
        id: Date.now(),
        name: categoryName.trim(),
        color: randomColor
      };
      
      setCategories([...categories, newCat]);
      alert('Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category');
    }
  };

  const updateCategory = async (categoryKey, newName) => {
    if (!newName || !newName.trim()) {
      setEditingCategory(null);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          key: categoryKey,
          name: newName.trim()
        })
      });

      if (!res.ok) {
        throw new Error("Failed to update category");
      }

      const updated = await res.json();

      setCategories(categories.map(cat =>
        (cat.key || cat.id) === categoryKey ? updated : cat
      ));
      setEditingCategory(null);
      alert('Category updated successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
      setEditingCategory(null);
    }
  };

  const handleAddCategoryClick = () => {
    const name = prompt('Enter new category name:');
    if (name && name.trim()) {
      addCategory(name.trim());
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminId");
    router.push('/admin/loginadmin');
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center bg-[#F8F3ED] min-h-screen">
        <p className="text-[#945C2B] text-lg">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#F8F3ED] min-h-screen">
      {/* Top Header */}
      <div className="relative top-0 z-30 fixed flex justify-left items-center bg-[#945C2B] shadow-md px-6 py-3 w-full">
        <h1 className="font-semibold text-white text-xl">ADMIN DASHBOARD</h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 items-center mt-14 px-6 py-8 pb-24">
        {/* Search Bar */}
        <div className="mb-8 w-full max-w-3xl">
          <div className="relative">
            <Search className="top-1/2 left-4 absolute text-gray-400 transform -translate-y-1/2" size={20} />
            <input
              type="text"
              placeholder="Search users by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white py-3 pr-4 pl-12 border border-[#945C2B] rounded-lg w-full text-[#945C2B] focus:outline-none focus:ring-2 focus:ring-[#945C2B]"
            />
          </div>
        </div>

        {/* User List Section */}
        <div className="bg-white shadow-sm mb-6 border border-[#945C2B] rounded-lg w-full max-w-3xl overflow-hidden bg:white">
          <button
            onClick={() => setUserSectionOpen(!userSectionOpen)}
            className="flex justify-between items-center bg-[#E9D6BF] hover:bg-[#d9c6af] px-6 py-4 w-full transition-colors"
          >
            <span className="font-semibold text-[#945C2B] text-lg">User List Section ({filteredUsers.length})</span>
            {userSectionOpen ? <ChevronDown className="text-[#945C2B]" size={22} /> : <ChevronRight className="text-[#945C2B]" size={22} />}
          </button>
          
          {userSectionOpen && (
            <div className="space-y-4 bg-[#F8F3ED] px-6 py-6">
              {filteredUsers.length === 0 ? (
                <p className="py-4 text-[#945C2B] text-center">No users found</p>
              ) : (
                filteredUsers.map(user => (
                  <div key={user.id} className="space-y-3 bg-[#945C2B] p-5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="text-[#E9D6BF]" size={20} />
                      <span className="font-semibold text-lg text-white">{user.name}</span>
                    </div>
                    <div className="space-y-1 text-sm text-white">
                      <p>Email: {user.email}</p>
                      <div className="flex items-center gap-2">
                        <span>Status:</span>
                        <span className={`inline-flex items-center gap-1 font-medium`}>
                          <span className={`w-3 h-3 rounded-full ${user.status === 'active' ? 'bg-green-400' : 'bg-gray-300'}`}></span>
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p>Transactions: {user.transactions}</p>
                    </div>
                    <button
                      onClick={() => user.status === 'active' ? handleViewDetails() : handleActivate(user.id)}
                      className="bg-[#E9D6BF] mt-3 px-4 py-3 rounded-lg w-full font-semibold text-[#945C2B] transition-colors hover:bg:white active:scale-95"
                    >
                      {user.status === 'active' ? 'View Details' : 'Activate'}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Category Section */}
        <div className="bg-white shadow-sm border border-[#945C2B] rounded-lg w-full max-w-3xl overflow-hidden">
          <button
            onClick={() => setCategorySectionOpen(!categorySectionOpen)}
            className="flex justify-between items-center bg-[#E9D6BF] hover:bg-[#d9c6af] px-6 py-4 w-full transition-colors"
          >
            <span className="font-semibold text-[#945C2B] text-lg">Category Section ({categories.length})</span>
            {categorySectionOpen ? <ChevronDown className="text-[#945C2B]" size={22} /> : <ChevronRight className="text-[#945C2B]" size={22} />}
          </button>
          
          {categorySectionOpen && (
            <div className="space-y-4 bg-[#F8F3ED] px-6 py-6">
              {categories.map(category => (
                <div key={category.key || category.id} className="flex items-center gap-3">
                  {editingCategory === (category.key || category.id) ? (
                    <input
                      type="text"
                      defaultValue={category.name}
                      onBlur={(e) => updateCategory(category.key || category.id, e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          updateCategory(category.key || category.id, e.target.value);
                        }
                      }}
                      className="flex-1 px-4 py-3 border-[#945C2B] border-2 rounded-lg text-[#945C2B] focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <div 
                      className="flex-1 px-4 py-3 rounded-lg font-medium text-base text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.name}
                    </div>
                  )}
                  <button
                    onClick={() => setEditingCategory(category.key || category.id)}
                    className="bg-[#E9D6BF] hover:bg-[#d9c6af] p-3 border border-[#945C2B] rounded-lg transition-colors"
                  >
                    <Edit2 size={18} className="text-[#945C2B]" />
                  </button>
                  <button
                    onClick={() => deleteCategory(category.key || category.id)}
                    className="bg-[#945C2B] hover:bg-[#7d4a22] p-3 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} className="text-white" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={handleAddCategoryClick}
                className="flex justify-center items-center gap-2 bg-[#E9D6BF] hover:bg-[#d9c6af] mt-2 px-4 py-3 border border-[#945C2B] rounded-lg w-full font-semibold text-[#945C2B] transition-colors active:scale-95"
              >
                <div className="bg-[#945C2B] p-1 rounded-full">
                  <Plus size={16} className="text-white" />
                </div>
                Add Category
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-0 fixed flex bg-[#E9D6BF] border-[#945C2B] border-t-2 w-full">
        
        {/* Home */}
        <button className="flex flex-col flex-1 justify-center items-center bg-white py-4 border-[#945C2B] border-t-4">
          <Home size={28} className="text-[#945C2B]" />
        </button>

        {/* Users */}
        <button 
          onClick={() => router.push('/admin/detail')}
          className="flex flex-col flex-1 justify-center items-center hover:bg-white py-4 transition-colors active:scale-95"
        >
          <Users size={28} className="text-[#945C2B]" />
        </button>

        {/* Plus */}
        <button 
          onClick={() => router.push('/admin/add')}
          className="flex flex-col flex-1 justify-center items-center hover:bg-white py-4 transition-colors active:scale-95"
        >
          <PlusCircle size={28} className="text-[#945C2B]" />
        </button>

        {/* Pencil */}
        <button 
          onClick={() => router.push('/admin/edit')}
          className="flex flex-col flex-1 justify-center items-center hover:bg-white py-4 transition-colors active:scale-95"
        >
          <Edit2 size={28} className="text-[#945C2B]" />
        </button>

        {/* Logout */}
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
