import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white mt-16 border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CiviLens</h3>
            <p className="text-white/80">Empowering citizens with transparent governance and efficient public services.</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><FLink to="/">Home</FLink></li>
              <li><FLink to="/complaints">Complaints</FLink></li>
              <li><FLink to="/schemes">Schemes</FLink></li>
              <li><FLink to="/discussions">Discussions</FLink></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><FLink to="/documents">Documents</FLink></li>
              <li><FLink to="/regions">Regions</FLink></li>
              <li><FLink to="/sentiment">Sentiment Analysis</FLink></li>
              <li><FLink to="/chat">Chat Support</FLink></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-white/85">
              <li>Email: support@civilens.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Governance St, City, State 12345</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-6 text-center text-white/80">
          <p>© 2025 CiviLens. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

const FLink = ({ to, children }) => (
  <Link to={to} className="relative inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded px-1 text-white/85 hover:text-white transition">
    <span className="after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-white/80 after:transition-all after:duration-300 hover:after:w-full">
      {children}
    </span>
  </Link>
)

export default Footer
