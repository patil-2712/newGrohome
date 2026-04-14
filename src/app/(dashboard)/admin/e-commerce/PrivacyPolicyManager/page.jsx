// src/components/admin/PrivacyPolicyManager.jsx
"use client";

import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function PrivacyPolicyManager() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    section: "",
    content: "",
    type: "paragraph",
    listItems: [""],
    order: 0,
    isActive: true
  });

  // Fetch sections
  const fetchSections = async () => {
    try {
      const res = await fetch('/api/privacy-policy');
      const data = await res.json();
      setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // Handle list items
  const handleListItemChange = (index, value) => {
    const newListItems = [...formData.listItems];
    newListItems[index] = value;
    setFormData(prev => ({ ...prev, listItems: newListItems }));
  };

  const addListItem = () => {
    setFormData(prev => ({ ...prev, listItems: [...prev.listItems, ""] }));
  };

  const removeListItem = (index) => {
    const newListItems = formData.listItems.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, listItems: newListItems }));
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Submit new section
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.section) {
      alert('Section title is required');
      setLoading(false);
      return;
    }

    // Filter out empty list items
    const filteredListItems = formData.listItems.filter(item => item.trim() !== "");

    // Validate based on type
    if (formData.type === 'paragraph' && (!formData.content || formData.content.trim() === '')) {
      alert('Content is required for paragraph type');
      setLoading(false);
      return;
    }

    if (formData.type === 'list' && filteredListItems.length === 0) {
      alert('At least one list item is required for list type');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/privacy-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: formData.section,
          content: formData.content,
          type: formData.type,
          listItems: filteredListItems,
          order: formData.order,
          isActive: formData.isActive
        })
      });

      if (res.ok) {
        setFormData({
          section: "",
          content: "",
          type: "paragraph",
          listItems: [""],
          order: 0,
          isActive: true
        });
        fetchSections();
        alert('Section added successfully!');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to add section');
      }
    } catch (error) {
      console.error('Error adding section:', error);
      alert('Failed to add section');
    } finally {
      setLoading(false);
    }
  };

  // Edit section
  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      section: section.section,
      content: section.content || "",
      type: section.type,
      listItems: section.listItems && section.listItems.length > 0 ? section.listItems : [""],
      order: section.order,
      isActive: section.isActive
    });
  };

  // Update section
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const filteredListItems = formData.listItems.filter(item => item.trim() !== "");

    // Validate based on type
    if (formData.type === 'paragraph' && (!formData.content || formData.content.trim() === '')) {
      alert('Content is required for paragraph type');
      setLoading(false);
      return;
    }

    if (formData.type === 'list' && filteredListItems.length === 0) {
      alert('At least one list item is required for list type');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/privacy-policy/${editingSection._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: formData.section,
          content: formData.content,
          type: formData.type,
          listItems: filteredListItems,
          order: formData.order,
          isActive: formData.isActive
        })
      });

      if (res.ok) {
        setEditingSection(null);
        setFormData({
          section: "",
          content: "",
          type: "paragraph",
          listItems: [""],
          order: 0,
          isActive: true
        });
        fetchSections();
        alert('Section updated successfully!');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to update section');
      }
    } catch (error) {
      console.error('Error updating section:', error);
      alert('Failed to update section');
    } finally {
      setLoading(false);
    }
  };

  // Delete section
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      const res = await fetch(`/api/privacy-policy/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchSections();
        alert('Section deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Failed to delete section');
    }
  };

  // Render section preview
  const renderSectionPreview = (section) => {
    if (section.type === 'heading') {
      return <h2 className="text-xl font-semibold text-[#1f1f1f]">{section.section}</h2>;
    } else if (section.type === 'list') {
      return (
        <div>
          <h2 className="text-xl font-semibold text-[#1f1f1f] mb-2">{section.section}</h2>
          <ul className="list-disc space-y-2 pl-6">
            {section.listItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      );
    } else {
      return (
        <div>
          <h2 className="text-xl font-semibold text-[#1f1f1f] mb-2">{section.section}</h2>
          <p>{section.content}</p>
        </div>
      );
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Privacy Policy Management</h1>

      {/* Add/Edit Form */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingSection ? 'Edit Section' : 'Add New Section'}
        </h2>
        <form onSubmit={editingSection ? handleUpdate : handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Section Title *</label>
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleInputChange}
              required
              placeholder="e.g., Information We Collect, Data Protection"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Section Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="paragraph">Paragraph (with content)</option>
              <option value="heading">Heading (title only)</option>
              <option value="list">List (with bullet points)</option>
            </select>
          </div>

          {formData.type === 'paragraph' && (
            <div>
              <label className="block text-sm font-medium mb-1">Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="5"
                required
                placeholder="Enter the content for this section..."
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          )}

          {formData.type === 'list' && (
            <div>
              <label className="block text-sm font-medium mb-1">List Items *</label>
              {formData.listItems.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleListItemChange(index, e.target.value)}
                    placeholder={`List item ${index + 1}`}
                    className="flex-1 border rounded-lg px-3 py-2"
                  />
                  {formData.listItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeListItem(index)}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addListItem}
                className="text-blue-500 text-sm hover:text-blue-700 mt-1"
              >
                + Add another list item
              </button>
              <p className="text-xs text-gray-500 mt-1">
                At least one list item is required
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Order</label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="w-4 h-4"
            />
            <label className="text-sm font-medium">Active</label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingSection ? 'Update Section' : 'Add Section'}
            </button>
            {editingSection && (
              <button
                type="button"
                onClick={() => {
                  setEditingSection(null);
                  setFormData({
                    section: "",
                    content: "",
                    type: "paragraph",
                    listItems: [""],
                    order: 0,
                    isActive: true
                  });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Sections List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Existing Sections</h2>
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section._id} className="border rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-lg">{section.section}</span>
                  <span className={`ml-3 px-2 py-1 text-xs rounded ${
                    section.type === 'heading' ? 'bg-purple-100 text-purple-700' :
                    section.type === 'list' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {section.type}
                  </span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded ${
                    section.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {section.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(section)}
                    className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(section._id)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
              <div className="p-4">
                {renderSectionPreview(section)}
                <div className="mt-2 text-xs text-gray-500">
                  Order: {section.order}
                </div>
              </div>
            </div>
          ))}
        </div>
        {sections.length === 0 && (
          <p className="text-center text-gray-500 py-8">No sections found. Add your first section!</p>
        )}
      </div>
    </div>
  );
}