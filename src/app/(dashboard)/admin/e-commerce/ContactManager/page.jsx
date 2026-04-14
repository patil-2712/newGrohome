// src/components/admin/ContactManager.jsx
"use client";

import { useState, useEffect } from "react";
import { FaPhoneAlt, FaTrash, FaEdit } from "react-icons/fa";

export default function ContactManager() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    shopName: "",
    address: [""],
    phone: "",
    order: 0,
    isActive: true
  });

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/contact');
      const data = await res.json();
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Handle address lines
  const handleAddressChange = (index, value) => {
    const newAddress = [...formData.address];
    newAddress[index] = value;
    setFormData(prev => ({ ...prev, address: newAddress }));
  };

  const addAddressLine = () => {
    setFormData(prev => ({ ...prev, address: [...prev.address, ""] }));
  };

  const removeAddressLine = (index) => {
    const newAddress = formData.address.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, address: newAddress }));
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

  // Submit new contact
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Filter out empty address lines
    const filteredAddress = formData.address.filter(line => line.trim() !== "");

    if (!formData.shopName || filteredAddress.length === 0) {
      alert('Shop name and at least one address line are required');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          address: filteredAddress
        })
      });

      if (res.ok) {
        setFormData({
          shopName: "",
          address: [""],
          phone: "",
          order: 0,
          isActive: true
        });
        fetchContacts();
        alert('Contact location added successfully!');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to add contact location');
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact location');
    } finally {
      setLoading(false);
    }
  };

  // Edit contact
  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      shopName: contact.shopName,
      address: contact.address,
      phone: contact.phone || "",
      order: contact.order,
      isActive: contact.isActive
    });
  };

  // Update contact
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const filteredAddress = formData.address.filter(line => line.trim() !== "");

    if (!formData.shopName || filteredAddress.length === 0) {
      alert('Shop name and at least one address line are required');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/contact/${editingContact._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          address: filteredAddress
        })
      });

      if (res.ok) {
        setEditingContact(null);
        setFormData({
          shopName: "",
          address: [""],
          phone: "",
          order: 0,
          isActive: true
        });
        fetchContacts();
        alert('Contact location updated successfully!');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to update contact location');
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Failed to update contact location');
    } finally {
      setLoading(false);
    }
  };

  // Delete contact
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this contact location?')) return;

    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchContacts();
        alert('Contact location deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact location');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Contact Page Management</h1>

      {/* Add/Edit Form */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingContact ? 'Edit Contact Location' : 'Add New Contact Location'}
        </h2>
        <form onSubmit={editingContact ? handleUpdate : handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Shop Name *</label>
            <input
              type="text"
              name="shopName"
              value={formData.shopName}
              onChange={handleInputChange}
              required
              placeholder="e.g., The Gruham Foods Shop - Periyar Nagar"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address Lines *</label>
            {formData.address.map((line, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={line}
                  onChange={(e) => handleAddressChange(index, e.target.value)}
                  placeholder={`Address line ${index + 1}`}
                  className="flex-1 border rounded-lg px-3 py-2"
                />
                {formData.address.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAddressLine(index)}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addAddressLine}
              className="text-blue-500 text-sm hover:text-blue-700 mt-1"
            >
              + Add another address line
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="e.g., 0424 4030204"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

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
              {loading ? 'Saving...' : editingContact ? 'Update Location' : 'Add Location'}
            </button>
            {editingContact && (
              <button
                type="button"
                onClick={() => {
                  setEditingContact(null);
                  setFormData({
                    shopName: "",
                    address: [""],
                    phone: "",
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

      {/* Contact Locations List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Existing Contact Locations</h2>
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div key={contact._id} className="border rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-lg">{contact.shopName}</span>
                  <span className={`ml-3 px-2 py-1 text-xs rounded ${
                    contact.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {contact.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(contact)}
                    className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(contact._id)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
              <div className="p-4">
                {contact.address.map((line, idx) => (
                  <p key={idx} className="text-gray-700">{line}</p>
                ))}
                {contact.phone && (
                  <p className="flex items-center gap-2 mt-2 text-gray-700">
                    <FaPhoneAlt /> {contact.phone}
                  </p>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  Order: {contact.order}
                </div>
              </div>
            </div>
          ))}
        </div>
        {contacts.length === 0 && (
          <p className="text-center text-gray-500 py-8">No contact locations found. Add your first location!</p>
        )}
      </div>
    </div>
  );
}