import React, { useEffect, useState } from "react";
import api from "../api"; // ✅ axios instance with token interceptor
import { RefreshCw, Filter, Search, CheckCircle, Clock, AlertCircle, Settings } from "lucide-react";

// Clean IssueStepper component matching your design
const IssueStepper = ({ stage }) => {
  const steps = [
    { name: 'Pending', number: '1' },
    { name: 'Assigned', number: '2' },
    { name: 'In Progress', number: '3' },
    { name: 'Completed', number: '4' }
  ];

  return (
    <div className="flex items-center justify-between mt-6">
      {steps.map((step, index) => (
        <div key={step.name} className="flex flex-col items-center flex-1">
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
              ${index <= stage 
                ? 'bg-teal-600 text-white' 
                : 'bg-gray-300 text-gray-600'
              }
            `}
          >
            {step.number}
          </div>
          <span
            className={`
              mt-2 text-xs font-medium text-center
              ${index <= stage ? 'text-teal-600' : 'text-gray-500'}
            `}
          >
            {step.name}
          </span>
          {index < steps.length - 1 && (
            <div
              className={`
                absolute w-16 h-0.5 mt-4 ml-8 transition-all duration-300
                ${index < stage ? 'bg-teal-600' : 'bg-gray-300'}
              `}
              style={{ zIndex: -1 }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default function Issues() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClusters() {
      try {
        console.log("📡 Fetching clusters with progress...");
        const res = await api.get("/admin/clusters/progress"); // ✅ your original API call
        console.log("✅ Clusters with progress response:", res.data);
        setClusters(res.data || []);
      } catch (err) {
        console.error("❌ Error fetching clusters progress:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClusters();
  }, []);

  const getStageFromStatus = (status) => {
    switch (status) {
      case "Pending":
        return 0;
      case "Dept Assigned":
        return 1;
      case "In Progress":
        return 2;
      case "Completed":
        return 3;
      default:
        return 0;
    }
  };

  const getDepartmentInitial = (department) => {
    return department ? department.charAt(0).toUpperCase() : 'D';
  };

  const getStatusDisplay = (status) => {
    // Map your statuses to display names
    switch (status) {
      case "Completed":
        return "Resolved";
      case "In Progress":
        return "In Progress";
      case "Pending":
        return "Pending";
      case "Dept Assigned":
        return "Assigned";
      default:
        return status || "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <h2 className="mt-6 text-xl font-semibold text-gray-700">Loading Issues Dashboard</h2>
          <p className="mt-2 text-gray-500">Fetching latest data...</p>
        </div>
      </div>
    );
  }

  if (!clusters.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Issues Found</h2>
          <p className="text-gray-600 mb-6">There are currently no clusters or issues to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
      {/* Header with purple background matching your image */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Issues Dashboard</h1>
              <p className="text-purple-100">Track and manage reported issues across all departments</p>
            </div>
            <div className="flex gap-3">
              {[
                { icon: RefreshCw, label: "Refresh" },
                { icon: Filter, label: "Filter" },
                { icon: Search, label: "Search" }
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur text-white p-3 rounded-lg transition-all duration-200"
                  title={label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Issues Content */}
      <div className="max-w-7xl mx-auto p-6 -mt-4">
        <div className="space-y-8">
          {clusters.map((cluster, idx) => (
            <div key={cluster.clusterId || idx} className="space-y-6">
              {/* Cluster Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {cluster.clusterName || `Cluster ${idx + 1}`}
                </h2>
                
                {/* Cluster Stats */}
                {cluster.stats && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {Object.entries(cluster.stats).map(([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full"
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          status === 'Completed' ? 'bg-green-500' :
                          status === 'In Progress' ? 'bg-yellow-500' :
                          status === 'Pending' ? 'bg-red-500' : 'bg-gray-400'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-700">
                          {status}: {count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Issues Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cluster.issues && cluster.issues.map((issue, i) => (
                  <div
                    key={issue._id || i}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Issue Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                          {getDepartmentInitial(issue.department)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {getStatusDisplay(issue.status)}
                            </span>
                            <Settings className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Department Name */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600">
                        {issue.department || "Unknown Department"}
                      </p>
                    </div>

                    {/* Comment */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 italic">
                        {issue.adminComment || "No comment provided"}
                      </p>
                    </div>

                    {/* Status Stepper */}
                    <IssueStepper stage={getStageFromStatus(issue.status)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}