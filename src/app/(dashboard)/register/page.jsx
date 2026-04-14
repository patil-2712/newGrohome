"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { 
  FaUser, FaPhone, FaMapMarkerAlt, FaSpinner, 
  FaPlus, FaTrash, FaCheck, FaEdit, FaHome, FaBuilding, 
  FaBriefcase, FaLocationArrow, FaTimes 
} from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [capturingLocation, setCapturingLocation] = useState(false);
  
  // Basic Info Form
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
  });
  
  // Address Management
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: "home",
      label: "Home",
      address1: "",
      address2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      isDefault: true,
      location: null
    }
  ]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const captureCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      
      setCapturingLocation(true);
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            
            const location = {
              lat: latitude,
              lng: longitude,
              city: data.city || data.locality || "Unknown",
              area: data.principalSubdivision || data.city,
              pincode: data.postcode,
              country: data.countryName || "India",
              state: data.principalSubdivision || ""
            };
            
            resolve(location);
          } catch (error) {
            resolve({
              lat: latitude,
              lng: longitude,
              city: "Unknown",
              area: "Unknown",
              pincode: "",
              country: "India",
              state: ""
            });
          } finally {
            setCapturingLocation(false);
          }
        },
        (error) => {
          setCapturingLocation(false);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const addAddressFromLocation = async () => {
    setAddressLoading(true);
    try {
      const location = await captureCurrentLocation();
      
      const newAddress = {
        id: Date.now(),
        type: "other",
        label: "Current Location",
        address1: location.area || "",
        address2: "",
        city: location.city,
        state: location.state,
        pincode: location.pincode || "",
        country: location.country,
        isDefault: addresses.length === 0,
        location: location
      };
      
      setAddresses([...addresses, newAddress]);
      toast.success("Location added as address!");
    } catch (error) {
      toast.error("Could not detect location");
    } finally {
      setAddressLoading(false);
    }
  };

  const addManualAddress = () => {
    setEditingAddress(null);
    setShowAddressModal(true);
  };

  const saveAddress = () => {
    if (!editingAddress) return;
    
    if (!editingAddress.address1 || !editingAddress.city || !editingAddress.pincode) {
      toast.error("Please fill required fields (Address, City, PIN Code)");
      return;
    }
    
    if (editingAddress.id) {
      setAddresses(addresses.map(addr => 
        addr.id === editingAddress.id ? editingAddress : addr
      ));
      toast.success("Address updated!");
    } else {
      setAddresses([...addresses, { ...editingAddress, id: Date.now() }]);
      toast.success("Address added!");
    }
    
    setShowAddressModal(false);
    setEditingAddress(null);
  };

  const deleteAddress = (id) => {
    if (addresses.length === 1) {
      toast.error("You need at least one address");
      return;
    }
    
    const addressToDelete = addresses.find(addr => addr.id === id);
    const wasDefault = addressToDelete?.isDefault;
    
    const newAddresses = addresses.filter(addr => addr.id !== id);
    
    if (wasDefault && newAddresses.length > 0) {
      newAddresses[0].isDefault = true;
    }
    
    setAddresses(newAddresses);
    toast.success("Address removed");
  };

  const setDefaultAddress = (id) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
    toast.success("Default address updated");
  };

  const handleRegister = async () => {
    // Validate basic info
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!formData.phone.trim() || formData.phone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    
    // Validate addresses
    const hasDefault = addresses.some(addr => addr.isDefault);
    if (!hasDefault) {
      toast.error("Please select a default address");
      return;
    }
    
    const incompleteAddress = addresses.find(addr => !addr.address1 || !addr.city || !addr.pincode);
    if (incompleteAddress) {
      toast.error("Please complete all address fields");
      return;
    }
    
    setLoading(true);
    
    try {
      const defaultAddress = addresses.find(addr => addr.isDefault);
      
      const registrationData = {
        fullName: formData.fullName,
        phone: formData.phone,
        addresses: addresses.map(addr => ({
          type: addr.type,
          label: addr.label,
          address1: addr.address1,
          address2: addr.address2,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          country: addr.country,
          isDefault: addr.isDefault,
          location: addr.location
        })),
        defaultAddress: {
          address1: defaultAddress.address1,
          address2: defaultAddress.address2,
          city: defaultAddress.city,
          state: defaultAddress.state,
          pincode: defaultAddress.pincode,
          country: defaultAddress.country,
          location: defaultAddress.location
        }
      };
      
      const response = await axios.post("/api/register", registrationData);
      
      if (response.data.success) {
        toast.success("Registration successful!");
        
        // Auto login after registration
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          if (defaultAddress.location) {
            localStorage.setItem("userLocation", JSON.stringify(defaultAddress.location));
          }
          
          toast.success("Logged in automatically!");
          router.push("/");
        } else {
          router.push("/login");
        }
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const AddressModal = () => (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold">
            {editingAddress?.id ? "Edit Address" : "Add New Address"}
          </h3>
          <button onClick={() => setShowAddressModal(false)} className="p-1 hover:bg-gray-100 rounded">
            <FaTimes />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Address Type *</label>
            <select
              value={editingAddress?.type || "home"}
              onChange={(e) => setEditingAddress({ ...editingAddress, type: e.target.value, label: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#6c6d2c]"
            >
              <option value="home">🏠 Home</option>
              <option value="work">💼 Work</option>
              <option value="other">📍 Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
            <input
              type="text"
              value={editingAddress?.address1 || ""}
              onChange={(e) => setEditingAddress({ ...editingAddress, address1: e.target.value })}
              placeholder="House number, street"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#6c6d2c]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Address Line 2</label>
            <input
              type="text"
              value={editingAddress?.address2 || ""}
              onChange={(e) => setEditingAddress({ ...editingAddress, address2: e.target.value })}
              placeholder="Apartment, floor, landmark"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#6c6d2c]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <input
                type="text"
                value={editingAddress?.city || ""}
                onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#6c6d2c]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input
                type="text"
                value={editingAddress?.state || ""}
                onChange={(e) => setEditingAddress({ ...editingAddress, state: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#6c6d2c]"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">PIN Code *</label>
              <input
                type="text"
                value={editingAddress?.pincode || ""}
                onChange={(e) => setEditingAddress({ ...editingAddress, pincode: e.target.value })}
                maxLength="6"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#6c6d2c]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input
                type="text"
                value={editingAddress?.country || "India"}
                onChange={(e) => setEditingAddress({ ...editingAddress, country: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#6c6d2c]"
              />
            </div>
          </div>
          
          <button
            onClick={addAddressFromLocation}
            disabled={addressLoading}
            className="w-full py-2 rounded-lg border-2 border-dashed border-[#6c6d2c] text-[#6c6d2c] font-medium hover:bg-[#6c6d2c]/5 flex items-center justify-center gap-2"
          >
            <FaLocationArrow />
            {addressLoading ? "Detecting..." : "Use Current Location"}
          </button>
        </div>
        
        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={() => setShowAddressModal(false)}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={saveAddress}
            className="flex-1 py-2 rounded-lg bg-[#6c6d2c] text-white font-medium"
          >
            Save Address
          </button>
        </div>
      </div>
    </div>
  );

  const getAddressIcon = (type) => {
    switch(type) {
      case 'home': return <FaHome className="text-blue-500" />;
      case 'work': return <FaBriefcase className="text-orange-500" />;
      default: return <FaMapMarkerAlt className="text-green-500" />;
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f5f1ea] to-white py-12 px-6">
      <div className="mx-auto max-w-2xl">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-[#6c6d2c] px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
            <p className="text-white/80 mt-1">Join us for a better shopping experience</p>
          </div>
          
          <div className="p-8">
            {/* Basic Information */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6c6d2c] focus:ring-2 focus:ring-[#6c6d2c]/20"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength="10"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6c6d2c] focus:ring-2 focus:ring-[#6c6d2c]/20"
                    placeholder="9876543210"
                  />
                </div>
              </div>
            </div>
            
            {/* Addresses Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">Your Addresses</h3>
                <div className="flex gap-2">
                  <button
                    onClick={addAddressFromLocation}
                    disabled={addressLoading}
                    className="px-3 py-1.5 text-sm rounded-lg border border-[#6c6d2c] text-[#6c6d2c] hover:bg-[#6c6d2c]/5 flex items-center gap-1"
                  >
                    <FaLocationArrow size={12} />
                    {addressLoading ? "Detecting..." : "Use My Location"}
                  </button>
                  <button
                    onClick={addManualAddress}
                    className="px-3 py-1.5 text-sm rounded-lg bg-[#6c6d2c] text-white flex items-center gap-1"
                  >
                    <FaPlus size={12} /> Add Address
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {addresses.map((addr) => (
                  <div key={addr.id} className={`p-4 rounded-xl border-2 transition-all
                    ${addr.isDefault ? 'border-[#6c6d2c] bg-[#6c6d2c]/5' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">{getAddressIcon(addr.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold capitalize">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] bg-[#6c6d2c] text-white px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {addr.address1}<br />
                            {addr.address2 && <>{addr.address2}<br /></>}
                            {addr.city}, {addr.state} - {addr.pincode}<br />
                            {addr.country}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingAddress(addr);
                            setShowAddressModal(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-500"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                    {!addr.isDefault && (
                      <button
                        onClick={() => setDefaultAddress(addr.id)}
                        className="mt-2 text-xs text-[#6c6d2c] hover:underline"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Register Button */}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full mt-8 py-3 rounded-xl bg-[#6c6d2c] text-white font-semibold hover:bg-[#5a5b25] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <FaSpinner className="animate-spin" />}
              {loading ? "Registering..." : "Register & Login"}
            </button>
            
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <button
                onClick={() => {
                  const event = new CustomEvent("openAccountModal");
                  window.dispatchEvent(event);
                }}
                className="text-[#6c6d2c] font-semibold hover:underline"
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
      
      {/* Address Modal */}
      {showAddressModal && <AddressModal />}
    </section>
  );
}