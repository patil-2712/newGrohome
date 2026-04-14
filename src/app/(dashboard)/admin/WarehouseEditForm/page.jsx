"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import CountryStateSearch from "@/components/CountryStateSearch";
import { toast } from "react-toastify";
import {
  FaSave, FaTimes, FaWarehouse, FaExclamationCircle, FaCheck, FaArrowLeft
} from "react-icons/fa";

const EMPTY_WH = {
  warehouseCode: "", warehouseName: "", parentWarehouse: "",
  account: "", company: "", phoneNo: "", mobileNo: "",
  addressLine1: "", addressLine2: "", city: "", state: "", pin: "",
  warehouseType: "", defaultInTransit: false, country: "",
  latitude: "", longitude: "",
};

export default function WarehouseEditForm() {
  const router = useRouter();
  const params = useParams();
  const warehouseId = params?.id;

  const [formData, setFormData] = useState({ ...EMPTY_WH });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errs, setErrs] = useState({});

  useEffect(() => {
    if (warehouseId) {
      fetchWarehouse();
    }
  }, [warehouseId]);

  const fetchWarehouse = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/warehouse?id=${warehouseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        const warehouse = res.data.data;
        setFormData({
          warehouseCode: warehouse.warehouseCode || "",
          warehouseName: warehouse.warehouseName || "",
          parentWarehouse: warehouse.parentWarehouse || "",
          account: warehouse.account || "",
          company: warehouse.company || "",
          phoneNo: warehouse.phoneNo || "",
          mobileNo: warehouse.mobileNo || "",
          addressLine1: warehouse.addressLine1 || "",
          addressLine2: warehouse.addressLine2 || "",
          city: warehouse.city || "",
          state: warehouse.state || "",
          pin: warehouse.pin || "",
          warehouseType: warehouse.warehouseType || "",
          defaultInTransit: warehouse.defaultInTransit || false,
          country: warehouse.country || "",
          latitude: warehouse.latitude || "",
          longitude: warehouse.longitude || "",
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch warehouse details");
      router.push("/warehouse");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errs[name]) setErrs(p => { const n = { ...p }; delete n[name]; return n; });
  };

  const handleSelectCountry = (c) => setFormData(p => ({ ...p, country: c?.name || "", state: "" }));
  const handleSelectState = (s) => setFormData(p => ({ ...p, state: s?.name || "" }));

  const fetchPin = async (pin) => {
    if (pin.length !== 6) return;
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data?.[0]?.Status === "Success") {
        const post = data[0]?.PostOffice?.[0];
        if (!post) return;
        setFormData(p => ({
          ...p,
          city: post.District || p.city,
          state: post.State || p.state,
          country: "India",
        }));
        toast.success("City, State & Country auto-filled!");
      }
    } catch { }
  };

  const validate = () => {
    const e = {};
    ["warehouseCode", "warehouseName", "account", "company", "phoneNo", 
     "addressLine1", "city", "state", "pin", "country", "warehouseType"]
      .forEach(f => { if (!formData[f]) e[f] = "Required"; });
    
    if (formData.phoneNo && !/^\d{10}$/.test(formData.phoneNo)) e.phoneNo = "Must be 10 digits";
    if (formData.mobileNo && !/^\d{10}$/.test(formData.mobileNo)) e.mobileNo = "Must be 10 digits";
    if (formData.pin && !/^\d{6}$/.test(formData.pin)) e.pin = "Must be 6 digits";
    
    setErrs(e);
    if (Object.keys(e).length) { 
      toast.error("Please fill all required fields"); 
      return false; 
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`/api/warehouse?id=${warehouseId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        toast.success("Warehouse updated successfully!");
        router.push("/warehouse");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update warehouse");
    } finally {
      setLoading(false);
    }
  };

  const Err = ({ k }) => errs[k]
    ? <p className="flex items-center gap-1 mt-1 text-[11px] text-red-500 font-medium">
        <FaExclamationCircle className="text-[10px] shrink-0" />{errs[k]}
      </p>
    : null;

  const fi = (k, extra = "") =>
    `w-full px-3 py-2.5 rounded-lg border text-sm font-medium transition-all outline-none ${extra}
     ${errs[k]
       ? "border-red-400 ring-2 ring-red-100 bg-red-50 placeholder:text-red-300"
       : "border-gray-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 placeholder:text-gray-300"}`;

  const Lbl = ({ text, req }) => (
    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
      {text}{req && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading warehouse details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
          >
            <FaArrowLeft className="text-sm" /> Back
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
              <FaWarehouse className="text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                Edit Warehouse
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Update warehouse information — {formData.warehouseCode}
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Lbl text="Warehouse Code" req />
                  <input 
                    className={fi("warehouseCode")} 
                    name="warehouseCode" 
                    value={formData.warehouseCode} 
                    onChange={handleChange} 
                    placeholder="e.g. WH001" 
                    disabled
                  />
                  <Err k="warehouseCode" />
                </div>
                
                <div>
                  <Lbl text="Warehouse Name" req />
                  <input 
                    className={fi("warehouseName")} 
                    name="warehouseName" 
                    value={formData.warehouseName} 
                    onChange={handleChange} 
                    placeholder="e.g. Main Warehouse" 
                  />
                  <Err k="warehouseName" />
                </div>
                
                <div>
                  <Lbl text="Account" req />
                  <input 
                    className={fi("account")} 
                    name="account" 
                    value={formData.account} 
                    onChange={handleChange} 
                    placeholder="Account name" 
                  />
                  <Err k="account" />
                </div>
                
                <div>
                  <Lbl text="Company" req />
                  <input 
                    className={fi("company")} 
                    name="company" 
                    value={formData.company} 
                    onChange={handleChange} 
                    placeholder="Company name" 
                  />
                  <Err k="company" />
                </div>
                
                <div>
                  <Lbl text="Phone No." req />
                  <input 
                    className={fi("phoneNo")} 
                    name="phoneNo" 
                    type="text" 
                    maxLength={10} 
                    value={formData.phoneNo} 
                    onChange={e => { if (/^\d{0,10}$/.test(e.target.value)) handleChange(e); }} 
                    placeholder="10-digit number" 
                  />
                  <Err k="phoneNo" />
                </div>
                
                <div>
                  <Lbl text="Mobile No." />
                  <input 
                    className={fi("mobileNo")} 
                    name="mobileNo" 
                    type="text" 
                    maxLength={10} 
                    value={formData.mobileNo} 
                    onChange={e => { if (/^\d{0,10}$/.test(e.target.value)) handleChange(e); }} 
                    placeholder="10-digit number" 
                  />
                  <Err k="mobileNo" />
                </div>
                
                <div>
                  <Lbl text="Address Line 1" req />
                  <input 
                    className={fi("addressLine1")} 
                    name="addressLine1" 
                    value={formData.addressLine1} 
                    onChange={handleChange} 
                    placeholder="Street / Building" 
                  />
                  <Err k="addressLine1" />
                </div>
                
                <div>
                  <Lbl text="Address Line 2" />
                  <input 
                    className={fi("")} 
                    name="addressLine2" 
                    value={formData.addressLine2} 
                    onChange={handleChange} 
                    placeholder="Area / Landmark" 
                  />
                </div>
                
                <div>
                  <Lbl text="City" req />
                  <input 
                    className={fi("city")} 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange} 
                    placeholder="City" 
                  />
                  <Err k="city" />
                </div>
                
                <div>
                  <Lbl text="PIN Code" req />
                  <input
                    className={fi("pin")} 
                    name="pin" 
                    type="number" 
                    maxLength={6}
                    value={formData.pin}
                    onChange={e => {
                      const val = e.target.value;
                      handleChange(e);
                      fetchPin(val);
                    }}
                    placeholder="6-digit PIN (auto-fills city & state)"
                  />
                  <Err k="pin" />
                  {formData.pin?.length === 6 && !errs.pin && formData.city && (
                    <p className="text-[11px] text-emerald-500 font-medium mt-1">
                      ✓ Auto-filled: {formData.city}, {formData.state}
                    </p>
                  )}
                </div>
                
                <div>
                  <Lbl text="Latitude" />
                  <input
                    className={fi("latitude")}
                    name="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="e.g. 28.6139"
                  />
                  <Err k="latitude" />
                </div>
                
                <div>
                  <Lbl text="Longitude" />
                  <input
                    className={fi("longitude")}
                    name="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="e.g. 77.2090"
                  />
                  <Err k="longitude" />
                </div>
                
                <div>
                  <Lbl text="Warehouse Type" req />
                  <select 
                    className={fi("warehouseType")} 
                    name="warehouseType" 
                    value={formData.warehouseType} 
                    onChange={handleChange}
                  >
                    <option value="">Select type…</option>
                    <option value="Main">Main</option>
                    <option value="Transit">Transit</option>
                    <option value="Cold Storage">Cold Storage</option>
                    <option value="Bonded">Bonded</option>
                    <option value="Distribution">Distribution</option>
                  </select>
                  <Err k="warehouseType" />
                </div>
              </div>

              {/* Country/State */}
              <div>
                <Lbl text="Country & State" req />
                <CountryStateSearch
                  valueCountry={formData.country ? { name: formData.country } : null}
                  valueState={formData.state ? { name: formData.state } : null}
                  onSelectCountry={handleSelectCountry}
                  onSelectState={handleSelectState}
                />
                {(errs.country || errs.state) && (
                  <p className="flex items-center gap-1 mt-1 text-[11px] text-red-500 font-medium">
                    <FaExclamationCircle className="text-[10px]" /> Country and State are required
                  </p>
                )}
              </div>

              {/* Default In Transit toggle */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, defaultInTransit: !p.defaultInTransit }))}
                  className={`relative w-9 h-5 rounded-full transition-all shrink-0 ${
                    formData.defaultInTransit ? "bg-indigo-500" : "bg-gray-200"
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    formData.defaultInTransit ? "translate-x-4" : "translate-x-0"
                  }`} />
                </button>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Default In Transit</p>
                  <p className="text-xs text-gray-400">Enable for transit/temporary holding warehouse</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-300 transition-all"
              >
                <FaTimes className="text-xs" /> Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                  : <><FaSave className="text-xs" /> Update Warehouse</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}