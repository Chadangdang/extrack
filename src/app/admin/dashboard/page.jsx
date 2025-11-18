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
      // TODO: Add API call to delete category from backend
      // await deleteCategory(categoryKey);
      
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
      // TODO: Add API call to update category in backend
      // await updateCategory(categoryKey, { name: newName.trim() });
      
      setCategories(categories.map(cat =>
        (cat.key || cat.id) === categoryKey ? { ...cat, name: newName.trim() } : cat
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
      <div className="min-h-screen bg-[#F8F3ED] flex items-center justify-center">
        <p className="text-[#945C2B] text-lg">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F3ED] flex flex-col">
      {/* Top Header */}
      <div className="w-full bg-[#945C2B] flex items-center justify-left px-6 py-3 relative fixed top-0 z-30 shadow-md">
        <h1 className="text-xl font-semibold text-white">ADMIN DASHBOARD</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-6 py-8 pb-24 mt-14">
        {/* Search Bar */}
        <div className="w-full max-w-3xl mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#945C2B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#945C2B] text-[#945C2B]"
            />
          </div>
        </div>

        {/* User List Section */}
        <div className="w-full max-w-3xl mb-6 bg:white rounded-lg shadow-sm overflow-hidden border border-[#945C2B] bg-white">
          <button
            onClick={() => setUserSectionOpen(!userSectionOpen)}
            className="w-full flex items-center justify-between px-6 py-4 bg-[#E9D6BF] hover:bg-[#d9c6af] transition-colors"
          >
            <span className="font-semibold text-[#945C2B] text-lg">User List Section ({filteredUsers.length})</span>
            {userSectionOpen ? <ChevronDown className="text-[#945C2B]" size={22} /> : <ChevronRight className="text-[#945C2B]" size={22} />}
          </button>
          
          {userSectionOpen && (
            <div className="px-6 py-6 space-y-4 bg-[#F8F3ED]">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-[#945C2B] py-4">No users found</p>
              ) : (
                filteredUsers.map(user => (
                  <div key={user.id} className="bg-[#945C2B] rounded-lg p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="text-[#E9D6BF]" size={20} />
                      <span className="font-semibold text-white text-lg">{user.name}</span>
                    </div>
                    <div className="text-sm text-white space-y-1">
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
                      className="w-full mt-3 bg-[#E9D6BF] hover:bg:white text-[#945C2B] font-semibold py-3 px-4 rounded-lg transition-colors active:scale-95"
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
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-sm overflow-hidden border border-[#945C2B]">
          <button
            onClick={() => setCategorySectionOpen(!categorySectionOpen)}
            className="w-full flex items-center justify-between px-6 py-4 bg-[#E9D6BF] hover:bg-[#d9c6af] transition-colors"
          >
            <span className="font-semibold text-[#945C2B] text-lg">Category Section ({categories.length})</span>
            {categorySectionOpen ? <ChevronDown className="text-[#945C2B]" size={22} /> : <ChevronRight className="text-[#945C2B]" size={22} />}
          </button>
          
          {categorySectionOpen && (
            <div className="px-6 py-6 space-y-4 bg-[#F8F3ED]">
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
                      className="flex-1 px-4 py-3 rounded-lg border-2 border-[#945C2B] focus:outline-none text-[#945C2B]"
                      autoFocus
                    />
                  ) : (
                    <div 
                      className="flex-1 px-4 py-3 rounded-lg text-white font-medium text-base"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.name}
                    </div>
                  )}
                  <button
                    onClick={() => setEditingCategory(category.key || category.id)}
                    className="p-3 bg-[#E9D6BF] hover:bg-[#d9c6af] rounded-lg transition-colors border border-[#945C2B]"
                  >
                    <Edit2 size={18} className="text-[#945C2B]" />
                  </button>
                  <button
                    onClick={() => deleteCategory(category.key || category.id)}
                    className="p-3 bg-[#945C2B] hover:bg-[#7d4a22] rounded-lg transition-colors"
                  >
                    <Trash2 size={18} className="text-white" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={handleAddCategoryClick}
                className="flex items-center justify-center gap-2 w-full bg-[#E9D6BF] hover:bg-[#d9c6af] text-[#945C2B] font-semibold px-4 py-3 rounded-lg transition-colors active:scale-95 mt-2 border border-[#945C2B]"
              >
                <div className="bg-[#945C2B] rounded-full p-1">
                  <Plus size={16} className="text-white" />
                </div>
                Add Category
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="w-full bg-[#E9D6BF] flex border-t-2 border-[#945C2B] fixed bottom-0">
        
        {/* Home */}
        <button className="flex-1 flex flex-col items-center justify-center py-4 bg-white border-t-4 border-[#945C2B]">
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
        <button 
          onClick={() => router.push('/admin/add')}
          className="flex-1 flex flex-col items-center justify-center py-4 hover:bg-white transition-colors active:scale-95"
        >
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
