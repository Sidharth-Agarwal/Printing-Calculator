import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, doc, updateDoc, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import DefaultSettings from "./DefaultSettings";
import WastageConfig from "./WastageConfig";
import OverheadConfig from "./OverheadConfig";
import Button from "../../shared/Button";
import Spinner from "../../shared/Spinner";
import Toast from "../../shared/Toast";
import { Configuration } from "../../../models/ConfigurationParameter";

const SystemConfig = () => {
  const [activeTab, setActiveTab] = useState("default");
  const [configurations, setConfigurations] = useState({
    default: null,
    wastage: null,
    overhead: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  
  // Fetch current configurations
  useEffect(() => {
    const fetchConfigurations = async () => {
      setLoading(true);
      try {
        const configTypes = ["default", "wastage", "overhead"];
        const configData = {};
        
        for (const type of configTypes) {
          const configQuery = query(
            collection(db, "configurations"), 
            orderBy("createdAt", "desc"),
            limit(1)
          );
          
          const querySnapshot = await getDocs(configQuery);
          if (!querySnapshot.empty) {
            configData[type] = {
              id: querySnapshot.docs[0].id,
              ...querySnapshot.docs[0].data()
            };
          } else {
            // Set default values if no configurations exist
            configData[type] = new Configuration({ type });
          }
        }
        
        setConfigurations(configData);
      } catch (error) {
        console.error("Error fetching configurations:", error);
        setNotification({
          show: true,
          message: "Failed to load configurations. Please try again.",
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfigurations();
  }, []);
  
  // Save configuration changes
  const saveConfiguration = async (type, configData) => {
    setSaving(true);
    try {
      const configToSave = {
        ...configData,
        type,
        updatedAt: new Date(),
      };
      
      if (configurations[type]?.id) {
        // Update existing configuration
        const configRef = doc(db, "configurations", configurations[type].id);
        await updateDoc(configRef, configToSave);
      } else {
        // Create new configuration
        configToSave.createdAt = new Date();
        const configCollection = collection(db, "configurations");
        const docRef = await addDoc(configCollection, configToSave);
        configToSave.id = docRef.id;
      }
      
      // Update local state
      setConfigurations(prev => ({
        ...prev,
        [type]: configToSave
      }));
      
      setNotification({
        show: true,
        message: "Configuration saved successfully!",
        type: "success"
      });
    } catch (error) {
      console.error("Error saving configuration:", error);
      setNotification({
        show: true,
        message: "Failed to save configuration. Please try again.",
        type: "error"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const clearNotification = () => {
    setNotification({ show: false, message: "", type: "" });
  };
  
  // Render the appropriate configuration component based on active tab
  const renderConfigComponent = () => {
    switch (activeTab) {
      case "default":
        return (
          <DefaultSettings 
            configuration={configurations.default}
            onSave={(data) => saveConfiguration("default", data)}
            saving={saving}
          />
        );
      case "wastage":
        return (
          <WastageConfig 
            configuration={configurations.wastage}
            onSave={(data) => saveConfiguration("wastage", data)}
            saving={saving}
          />
        );
      case "overhead":
        return (
          <OverheadConfig 
            configuration={configurations.overhead}
            onSave={(data) => saveConfiguration("overhead", data)}
            saving={saving}
          />
        );
      default:
        return <div>Select a configuration tab</div>;
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded shadow">
      <h1 className="text-xl font-bold mb-6">SYSTEM CONFIGURATION</h1>
      
      {/* Notification Toast */}
      {notification.show && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={clearNotification}
        />
      )}
      
      {/* Configuration Tabs */}
      <div className="bg-white rounded-t-md shadow">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
              activeTab === "default"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => handleTabChange("default")}
          >
            Default Settings
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
              activeTab === "wastage"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => handleTabChange("wastage")}
          >
            Wastage Configuration
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
              activeTab === "overhead"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => handleTabChange("overhead")}
          >
            Overhead Configuration
          </button>
        </div>
        
        {/* Configuration Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
              <p className="ml-2 text-gray-600">Loading configuration...</p>
            </div>
          ) : (
            renderConfigComponent()
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;