import React from 'react'

const AdminAnalytics = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-5 shadow-sm h-96 flex items-center justify-center text-gray-500">
          Complaint Heatmap (map here)
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm h-96 flex items-center justify-center text-gray-500">
          Sentiment Trends (chart here)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-5 shadow-sm h-72 flex items-center justify-center text-gray-500">
          Success Prediction (table here)
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm h-72 flex items-center justify-center text-gray-500">
          Risky Scheme Alerts (list here)
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics
