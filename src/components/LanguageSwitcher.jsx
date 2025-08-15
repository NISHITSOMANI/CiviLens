import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const LanguageSwitcher = () => {
  const { language, updateLanguage, languages } = useLanguage()
  
  const languageNames = {
    en: 'English',
    hi: 'हिंदी',
    ta: 'தமிழ்'
  }
  
  return (
    <div className="relative group">
      <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="hidden md:inline">{languageNames[language]}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block z-50 border border-gray-200">
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => updateLanguage(lang)}
            className={`block w-full text-left px-4 py-2 text-sm ${language === lang ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            {languageNames[lang]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default LanguageSwitcher
