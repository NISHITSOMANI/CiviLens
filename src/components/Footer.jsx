import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CiviLens</h3>
            <p className="text-gray-400">Empowering citizens with transparent governance and efficient public services.</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition duration-300">Home</Link></li>
              <li><Link to="/complaints" className="text-gray-400 hover:text-white transition duration-300">Complaints</Link></li>
              <li><Link to="/schemes" className="text-gray-400 hover:text-white transition duration-300">Schemes</Link></li>
              <li><Link to="/discussions" className="text-gray-400 hover:text-white transition duration-300">Discussions</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/documents" className="text-gray-400 hover:text-white transition duration-300">Documents</Link></li>
              <li><Link to="/regions" className="text-gray-400 hover:text-white transition duration-300">Regions</Link></li>
              <li><Link to="/sentiment" className="text-gray-400 hover:text-white transition duration-300">Sentiment Analysis</Link></li>
              <li><Link to="/chat" className="text-gray-400 hover:text-white transition duration-300">Chat Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: support@civilens.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Governance St, City, State 12345</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; 2025 CiviLens. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
