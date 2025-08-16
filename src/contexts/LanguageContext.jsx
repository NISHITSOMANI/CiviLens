import React, { createContext, useContext, useState, useEffect } from 'react'

// Define translations
const translations = {
  en: {
    // Home page
    home_hero_title: 'Empowering Citizens with AI-Powered Governance',
    home_hero_subtitle: 'Access government schemes, file complaints, and engage with your community',
    home_hero_button: 'Get Started',
    
    // Login page
    login_title: 'Welcome Back',
    login_subtitle: 'Sign in to your CiviLens account',
    login_email: 'Email Address',
    login_email_placeholder: 'Enter your email',
    login_password: 'Password',
    login_password_placeholder: 'Enter your password',
    login_remember_me: 'Remember me',
    login_forgot_password: 'Forgot your password?',
    login_sign_in: 'Sign In',
    login_signing_in: 'Signing In...',
    login_no_account: 'Don\'t have an account?',
    login_sign_up: 'Sign up',
    
    // Signup page
    signup_title: 'Create Account',
    signup_subtitle: 'Join CiviLens to access government services',
    signup_username: 'Username',
    signup_username_placeholder: 'Enter your username',
    signup_email: 'Email Address',
    signup_email_placeholder: 'Enter your email',
    signup_password: 'Password',
    signup_password_placeholder: 'Enter your password',
    signup_confirm_password: 'Confirm Password',
    signup_confirm_password_placeholder: 'Confirm your password',
    signup_role: 'Role',
    signup_role_citizen: 'Citizen',
    signup_role_official: 'Government Official',
    signup_role_admin: 'Administrator',
    signup_creating_account: 'Creating Account...',
    signup_sign_up: 'Sign Up',
    signup_already_have_account: 'Already have an account?',
    signup_sign_in: 'Sign in',
    
    // Scheme Detail page
    scheme_detail_not_found_title: 'Scheme Not Found',
    scheme_detail_not_found_message: 'The scheme you\'re looking for doesn\'t exist or has been removed.',
    scheme_detail_back_to_schemes: 'Back to Schemes',
    scheme_detail_export_infographic: 'Export Infographic',
    scheme_detail_overview: 'Scheme Overview',
    scheme_detail_rate_scheme: 'Rate this Scheme',
    scheme_detail_score: 'Score',
    scheme_detail_upvotes: 'upvotes',
    scheme_detail_downvotes: 'downvotes',
    scheme_detail_key_details: 'Key Details',
    scheme_detail_eligibility: 'Eligibility',
    scheme_detail_benefits: 'Benefits',
    scheme_detail_deadline: 'Deadline',
    scheme_detail_applicants: 'Applicants',
    scheme_detail_objectives: 'Objectives',
    scheme_detail_detailed_overview: 'Detailed Overview',
    scheme_detail_required_documents: 'Required Documents',
    scheme_detail_faq: 'Frequently Asked Questions',
    scheme_detail_apply_button: 'Apply for this Scheme',
    
    // Discussions page
    discussions_loading: 'Loading discussions...',
    discussions_title: 'Community Discussions',
    discussions_subtitle: 'Engage in meaningful conversations with your community',
    discussions_start_new: 'Start New Discussion',
    discussions_all: 'All Discussions',
    discussions_comments: 'comments',
    discussions_likes: 'likes',
    discussions_view: 'View Discussion',
    
    home: {
      hero: {
        title: 'Welcome to CiviLens',
        subtitle: 'Empowering citizens with transparent governance and efficient public services',
        voiceFinder: {
          title: 'Voice-Enabled Scheme Finder',
          listening: 'Listening...',
          speak: 'Speak to Find Schemes',
          placeholder: 'Try saying: "schemes for education in Delhi"'
        },
        buttons: {
          fileComplaint: 'File a Complaint',
          getStarted: 'Get Started',
          login: 'Login'
        }
      },
      features: {
        title: 'Our Features',
        complaintManagement: {
          title: 'Complaint Management',
          description: 'File, track, and resolve complaints with our efficient system.'
        },
        governmentSchemes: {
          title: 'Government Schemes',
          description: 'Discover and apply for various government schemes and programs.'
        },
        communityDiscussions: {
          title: 'Community Discussions',
          description: 'Engage in meaningful discussions with your community members.'
        },
        liveChatSupport: {
          title: 'Live Chat Support',
          description: 'Get instant support through our live chat system.'
        },
        documentManagement: {
          title: 'Document Management',
          description: 'Upload, manage, and access important documents securely.'
        },
        sentimentAnalysis: {
          title: 'Sentiment Analysis',
          description: 'Understand public sentiment through our advanced analytics.'
        }
      },
      heatmap: {
        title: 'Live Regional Heatmap Preview',
        sentimentByRegion: 'Sentiment by Region',
        complaintsByRegion: 'Complaints by Region',
        viewFullDashboard: 'View Full Regional Dashboard'
      },
      stats: {
        title: 'Our Impact',
        complaintsResolved: 'Complaints Resolved',
        governmentSchemes: 'Government Schemes',
        satisfactionRate: 'Satisfaction Rate'
      }
    },
    
    // Navigation
    nav_home: 'Home',
    nav_schemes: 'Schemes',
    nav_complaints: 'Complaints',
    nav_discussions: 'Discussions',
    nav_chat: 'AI Chat',
    nav_documents: 'Documents',
    nav_regions: 'Regions',
    nav_sentiment: 'Sentiment',
    nav_admin: 'Admin',
    nav_profile: 'Profile',
    nav_logout: 'Logout',
    nav_login: 'Login',
    nav_signup: 'Sign Up',
    
    // Schemes page
    schemes_title: 'Government Schemes',
    schemes_subtitle: 'Discover and apply for government schemes',
    schemes_search_placeholder: 'Search schemes...',
    schemes_category_all: 'All Categories',
    schemes_infographic_export: 'Export Infographic',
    schemes_fake_detector: 'Fake Scheme Detector',
    schemes_fake_detector_placeholder: 'Paste forwarded scheme message here...',
    schemes_fake_detector_check: 'Verify Message',
    
    // Complaints page
    complaints_title: 'Complaints',
    complaints_subtitle: 'View and manage your complaints',
    complaints_new: 'File New Complaint',
    complaints_all: 'All Complaints',
    complaints_pending: 'Pending',
    complaints_in_progress: 'In Progress',
    complaints_resolved: 'Resolved',
    
    // New Complaint page
    new_complaint_title: 'File New Complaint',
    new_complaint_subtitle: 'Submit a new complaint to the relevant authorities',
    new_complaint_title_label: 'Complaint Title',
    new_complaint_title_placeholder: 'Briefly describe your complaint',
    new_complaint_description: 'Description',
    new_complaint_description_placeholder: 'Provide detailed information about your complaint',
    new_complaint_category: 'Category',
    new_complaint_location: 'Location',
    new_complaint_location_placeholder: 'Enter the location of the issue',
    new_complaint_upload: 'Upload Document (for OCR)',
    new_complaint_ocr: 'Extract Text (OCR)',
    new_complaint_submit: 'Submit Complaint',
    new_complaint_cancel: 'Cancel',
    
    // Profile page
    profile_title: 'User Profile',
    profile_subtitle: 'Manage your account settings',
    profile_username: 'Username',
    profile_email: 'Email',
    profile_first_name: 'First Name',
    profile_last_name: 'Last Name',
    profile_phone: 'Phone Number',
    profile_address: 'Address',
    profile_save: 'Save Changes',
    
    // Admin Panel
    adminPanel: {
      title: 'Admin Panel',
      subtitle: 'Manage users and system settings',
      searchPlaceholder: 'Search users...',
      filterAll: 'All',
      filterAdmin: 'Admin',
      filterOfficials: 'Officials',
      filterCitizens: 'Citizens',
      addNewUser: 'Add New User',
      noUsersFound: 'No users found',
      adjustSearch: 'Try adjusting your search or filter criteria',
      deactivate: 'Deactivate',
      activate: 'Activate',
      delete: 'Delete',
      table: {
        user: 'User',
        role: 'Role',
        activity: 'Activity',
        contributions: 'Contributions',
        status: 'Status',
        actions: 'Actions'
      },
      stats: {
        totalUsers: 'Total Users',
        activeUsers: 'Active Users',
        officials: 'Officials',
        admins: 'Admins'
      }
    },
    
    // Sentiment Analysis
    sentiment: {
      title: 'Sentiment Analysis',
      subtitle: 'Public sentiment insights across government services',
      dataNotAvailable: 'Sentiment Data Not Available',
      unableToLoad: 'Unable to load sentiment analysis data.',
      timeRange: {
        week: 'Week',
        month: 'Month',
        quarter: 'Quarter'
      },
      overall: {
        title: 'Overall Public Sentiment',
        positiveLabel: 'Positive Sentiment'
      },
      trends: {
        title: 'Sentiment Trends'
      },
      category: {
        title: 'Sentiment by Category'
      },
      keywords: {
        title: 'Key Keywords'
      }
    },
    
    // Documents page
    documents_loading: 'Loading documents...',
    documents_title: 'Document Management',
    documents_subtitle: 'Upload, manage, and access your important documents',
    documents_upload_title: 'Upload New Document',
    documents_uploading: 'Uploading...',
    documents_upload: 'Upload',
    documents_your_documents: 'Your Documents',
    documents_size: 'Size',
    documents_category: 'Category',
    documents_uploaded: 'Uploaded',
    documents_view: 'View',
    documents_download: 'Download',
    documents_delete: 'Delete',
    documents_no_documents: 'No documents',
    documents_no_documents_message: 'Get started by uploading a new document.',
    
    // Regions page
    regions_loading: 'Loading regions...',
    regions_title: 'Regional Overview',
    regions_subtitle: 'Explore governance data across different regions',
    regions_population: 'Population',
    regions_active_complaints: 'Active Complaints',
    regions_schemes: 'Schemes',
    regions_officials: 'Officials',
    regions_performance: 'Performance',
    regions_details: 'Details',
    regions_performance_score: 'Performance Score',
    regions_government_schemes: 'Government Schemes',
    regions_government_officials: 'Government Officials',
    regions_performance_metrics: 'Performance Metrics',
    regions_complaint_resolution_rate: 'Complaint Resolution Rate',
    regions_scheme_implementation: 'Scheme Implementation',
    regions_citizen_satisfaction: 'Citizen Satisfaction',
    
    // Common
    loading: 'Loading...',
    back: 'Back',
    view_details: 'View Details',
    no_data: 'No data available'
  },
  hi: {
    // Home page
    home_hero_title: 'AI-संचालित शासन के साथ नागरिकों को सशक्त बनाना',
    home_hero_subtitle: 'सरकारी योजनाओं तक पहुंचें, शिकायत दर्ज करें और अपने समुदाय के साथ जुड़ें',
    home_hero_button: 'आरंभ करें',
    
    // Login page
    login_title: 'वापसी पर स्वागत है',
    login_subtitle: 'अपने CiviLens खाते में साइन इन करें',
    login_email: 'ईमेल पता',
    login_email_placeholder: 'अपना ईमेल दर्ज करें',
    login_password: 'पासवर्ड',
    login_password_placeholder: 'अपना पासवर्ड दर्ज करें',
    login_remember_me: 'मुझे याद रखें',
    login_forgot_password: 'क्या आप पासवर्ड भूल गए?',
    login_sign_in: 'साइन इन करें',
    login_signing_in: 'साइन इन कर रहे हैं...',
    login_no_account: 'क्या आपके पास खाता नहीं है?',
    login_sign_up: 'साइन अप करें',
    
    // Signup page
    signup_title: 'खाता बनाएं',
    signup_subtitle: 'सरकारी सेवाओं तक पहुंच प्राप्त करने के लिए CiviLens से जुड़ें',
    signup_username: 'उपयोगकर्ता नाम',
    signup_username_placeholder: 'अपना उपयोगकर्ता नाम दर्ज करें',
    signup_email: 'ईमेल पता',
    signup_email_placeholder: 'अपना ईमेल दर्ज करें',
    signup_password: 'पासवर्ड',
    signup_password_placeholder: 'अपना पासवर्ड दर्ज करें',
    signup_confirm_password: 'पासवर्ड की पुष्टि करें',
    signup_confirm_password_placeholder: 'अपने पासवर्ड की पुष्टि करें',
    signup_role: 'भूमिका',
    signup_role_citizen: 'नागरिक',
    signup_role_official: 'सरकारी अधिकारी',
    signup_role_admin: 'प्रशासक',
    signup_creating_account: 'खाता बनाया जा रहा है...',
    signup_sign_up: 'साइन अप करें',
    signup_already_have_account: 'क्या आपके पास पहले से एक खाता है?',
    signup_sign_in: 'साइन इन करें',
    
    // Scheme Detail page
    scheme_detail_not_found_title: 'योजना नहीं मिली',
    scheme_detail_not_found_message: 'जिस योजना की आप तलाश कर रहे हैं वह मौजूद नहीं है या हटा दी गई है।',
    scheme_detail_back_to_schemes: 'योजनाओं पर वापस जाएं',
    scheme_detail_export_infographic: 'इन्फोग्राफिक निर्यात करें',
    scheme_detail_overview: 'योजना का अवलोकन',
    scheme_detail_rate_scheme: 'इस योजना को रेट करें',
    scheme_detail_score: 'स्कोर',
    scheme_detail_upvotes: 'अपवोट',
    scheme_detail_downvotes: 'डाउनवोट',
    scheme_detail_key_details: 'मुख्य विवरण',
    scheme_detail_eligibility: 'पात्रता',
    scheme_detail_benefits: 'लाभ',
    scheme_detail_deadline: 'अंतिम तिथि',
    scheme_detail_applicants: 'आवेदक',
    scheme_detail_objectives: 'उद्देश्य',
    scheme_detail_detailed_overview: 'विस्तृत अवलोकन',
    scheme_detail_required_documents: 'आवश्यक दस्तावेज',
    scheme_detail_faq: 'अक्सर पूछे जाने वाले प्रश्न',
    scheme_detail_apply_button: 'इस योजना के लिए आवेदन करें',
    
    // Discussions page
    discussions_loading: 'चर्चाएँ लोड हो रही हैं...',
    discussions_title: 'सामुदायिक चर्चाएँ',
    discussions_subtitle: 'अपने समुदाय के साथ सार्थक वार्तालाप में शामिल हों',
    discussions_start_new: 'नई चर्चा शुरू करें',
    discussions_all: 'सभी चर्चाएँ',
    discussions_comments: 'टिप्पणियाँ',
    discussions_likes: 'पसंद',
    discussions_view: 'चर्चा देखें',
    
    home: {
      hero: {
        title: 'CiviLens में आपका स्वागत है',
        subtitle: 'पारदर्शी शासन और कुशल सार्वजनिक सेवाओं के साथ नागरिकों को सशक्त बनाना',
        voiceFinder: {
          title: 'आवाज-सक्षम योजना खोजक',
          listening: 'सुन रहे हैं...',
          speak: 'योजनाएं खोजने के लिए बोलें',
          placeholder: 'कहने का प्रयास करें: "दिल्ली में शिक्षा के लिए योजनाएं"'
        },
        buttons: {
          fileComplaint: 'शिकायत दर्ज करें',
          getStarted: 'आरंभ करें',
          login: 'लॉग इन करें'
        }
      },
      features: {
        title: 'हमारी विशेषताएं',
        complaintManagement: {
          title: 'शिकायत प्रबंधन',
          description: 'हमारी कुशल प्रणाली के साथ शिकायतें दर्ज करें, ट्रैक करें और हल करें।'
        },
        governmentSchemes: {
          title: 'सरकारी योजनाएं',
          description: 'विभिन्न सरकारी योजनाओं और कार्यक्रमों की खोज करें और आवेदन करें।'
        },
        communityDiscussions: {
          title: 'सामुदायिक चर्चाएं',
          description: 'अपने समुदाय के सदस्यों के साथ सार्थक चर्चा में शामिल हों।'
        },
        liveChatSupport: {
          title: 'लाइव चैट समर्थन',
          description: 'हमारी लाइव चैट प्रणाली के माध्यम से तुरंत समर्थन प्राप्त करें।'
        },
        documentManagement: {
          title: 'दस्तावेज प्रबंधन',
          description: 'महत्वपूर्ण दस्तावेजों को सुरक्षित रूप से अपलोड, प्रबंधित और पहुंच प्राप्त करें।'
        },
        sentimentAnalysis: {
          title: 'भावना विश्लेषण',
          description: 'हमारे उन्नत विश्लेषण के माध्यम से जनता की भावना को समझें।'
        }
      },
      heatmap: {
        title: 'लाइव क्षेत्रीय हीटमैप पूर्वावलोकन',
        sentimentByRegion: 'क्षेत्र के अनुसार भावना',
        complaintsByRegion: 'क्षेत्र के अनुसार शिकायतें',
        viewFullDashboard: 'पूर्ण क्षेत्रीय डैशबोर्ड देखें'
      },
      stats: {
        title: 'हमारा प्रभाव',
        complaintsResolved: 'शिकायतें हल की गई',
        governmentSchemes: 'सरकारी योजनाएं',
        satisfactionRate: 'संतुष्टि दर'
      }
    },
    
    // Navigation
    nav_home: 'होम',
    nav_schemes: 'योजनाएँ',
    nav_complaints: 'शिकायतें',
    nav_discussions: 'चर्चाएँ',
    nav_chat: 'AI चैट',
    nav_documents: 'दस्तावेज़',
    nav_regions: 'क्षेत्र',
    nav_sentiment: 'भावना विश्लेषण',
    nav_admin: 'व्यवस्थापक',
    nav_profile: 'प्रोफ़ाइल',
    nav_logout: 'लॉगआउट',
    nav_login: 'लॉगिन',
    nav_signup: 'साइन अप',
    
    // Schemes page
    schemes_title: 'सरकारी योजनाएँ',
    schemes_subtitle: 'सरकारी योजनाओं की खोज करें और आवेदन करें',
    schemes_search_placeholder: 'योजनाओं की खोज करें...',
    schemes_category_all: 'सभी श्रेणियाँ',
    schemes_infographic_export: 'इन्फोग्राफ़िक निर्यात करें',
    schemes_fake_detector: 'नकली योजना का पता लगाने वाला',
    schemes_fake_detector_placeholder: 'अग्रेषित योजना संदेश यहाँ पेस्ट करें...',
    schemes_fake_detector_check: 'संदेश सत्यापित करें',
    
    // Complaints page
    complaints_title: 'शिकायतें',
    complaints_subtitle: 'अपनी शिकायतों को देखें और प्रबंधित करें',
    complaints_new: 'नई शिकायत दर्ज करें',
    complaints_all: 'सभी शिकायतें',
    complaints_pending: 'लंबित',
    complaints_in_progress: 'प्रगति पर है',
    complaints_resolved: 'हल हो गया',
    
    // New Complaint page
    new_complaint_title: 'नई शिकायत दर्ज करें',
    new_complaint_subtitle: 'प्रासंगिक प्राधिकरण को एक नई शिकायत सबमिट करें',
    new_complaint_title_label: 'शिकायत शीर्षक',
    new_complaint_title_placeholder: 'अपनी शिकायत का संक्षिप्त वर्णन करें',
    new_complaint_description: 'विवरण',
    new_complaint_description_placeholder: 'अपनी शिकायत के बारे में विस्तृत जानकारी प्रदान करें',
    new_complaint_category: 'श्रेणी',
    new_complaint_location: 'स्थान',
    new_complaint_location_placeholder: 'समस्या के स्थान को दर्ज करें',
    new_complaint_upload: 'दस्तावेज़ अपलोड करें (OCR के लिए)',
    new_complaint_ocr: 'पाठ निकालें (OCR)',
    new_complaint_submit: 'शिकायत सबमिट करें',
    new_complaint_cancel: 'रद्द करें',
    
    // Profile page
    profile_title: 'उपयोगकर्ता प्रोफ़ाइल',
    profile_subtitle: 'अपनी खाता सेटिंग्स प्रबंधित करें',
    profile_username: 'उपयोगकर्ता नाम',
    profile_email: 'ईमेल',
    profile_first_name: 'पहला नाम',
    profile_last_name: 'अंतिम नाम',
    profile_phone: 'फ़ोन नंबर',
    profile_address: 'पता',
    profile_save: 'परिवर्तन सहेजें',
    
    // Admin Panel
    adminPanel: {
      title: 'व्यवस्थापक पटल',
      subtitle: 'उपयोगकर्ताओं और प्रणाली सेटिंग्स का प्रबंधन करें',
      searchPlaceholder: 'उपयोगकर्ताओं की खोज करें...',
      filterAll: 'सभी',
      filterAdmin: 'व्यवस्थापक',
      filterOfficials: 'अधिकारी',
      filterCitizens: 'नागरिक',
      addNewUser: 'नया उपयोगकर्ता जोड़ें',
      noUsersFound: 'कोई उपयोगकर्ता नहीं मिला',
      adjustSearch: 'अपनी खोज या फ़िल्टर मानदंड को समायोजित करने का प्रयास करें',
      deactivate: 'निष्क्रिय करें',
      activate: 'सक्रिय करें',
      delete: 'हटाएं',
      table: {
        user: 'उपयोगकर्ता',
        role: 'भूमिका',
        activity: 'गतिविधि',
        contributions: 'योगदान',
        status: 'स्थिति',
        actions: 'कार्रवाई'
      },
      stats: {
        totalUsers: 'कुल उपयोगकर्ता',
        activeUsers: 'सक्रिय उपयोगकर्ता',
        officials: 'अधिकारी',
        admins: 'व्यवस्थापक'
      }
    },
    
    // Sentiment Analysis
    sentiment: {
      title: 'भावना विश्लेषण',
      subtitle: 'सरकारी सेवाओं में जनता की भावनाओं की अंतर्दृष्टि',
      dataNotAvailable: 'भावना डेटा उपलब्ध नहीं है',
      unableToLoad: 'भावना विश्लेषण डेटा लोड करने में असमर्थ।',
      timeRange: {
        week: 'सप्ताह',
        month: 'महीना',
        quarter: 'तिमाही'
      },
      overall: {
        title: 'समग्र जनता की भावना',
        positiveLabel: 'सकारात्मक भावना'
      },
      trends: {
        title: 'भावना प्रवृत्तियाँ'
      },
      category: {
        title: 'श्रेणी के अनुसार भावना'
      },
      keywords: {
        title: 'प्रमुख खोजशब्द'
      }
    },
    
    // Documents page
    documents_loading: 'दस्तावेज़ लोड हो रहे हैं...',
    documents_title: 'दस्तावेज़ प्रबंधन',
    documents_subtitle: 'अपने महत्वपूर्ण दस्तावेज़ अपलोड करें, प्रबंधित करें और पहुंचें',
    documents_upload_title: 'नया दस्तावेज़ अपलोड करें',
    documents_uploading: 'अपलोड हो रहा है...',
    documents_upload: 'अपलोड करें',
    documents_your_documents: 'आपके दस्तावेज़',
    documents_size: 'आकार',
    documents_category: 'श्रेणी',
    documents_uploaded: 'अपलोड किया गया',
    documents_view: 'देखें',
    documents_download: 'डाउनलोड करें',
    documents_delete: 'हटाएं',
    documents_no_documents: 'कोई दस्तावेज़ नहीं',
    documents_no_documents_message: 'एक नया दस्तावेज़ अपलोड करके आरंभ करें।',
    
    // Regions page
    regions_loading: 'क्षेत्र लोड हो रहे हैं...',
    regions_title: 'क्षेत्रीय अवलोकन',
    regions_subtitle: 'विभिन्न क्षेत्रों में शासन डेटा का अन्वेषण करें',
    regions_population: 'जनसंख्या',
    regions_active_complaints: 'सक्रिय शिकायतें',
    regions_schemes: 'योजनाएं',
    regions_officials: 'अधिकारी',
    regions_performance: 'प्रदर्शन',
    regions_details: 'विवरण',
    regions_performance_score: 'प्रदर्शन स्कोर',
    regions_government_schemes: 'सरकारी योजनाएं',
    regions_government_officials: 'सरकारी अधिकारी',
    regions_performance_metrics: 'प्रदर्शन मेट्रिक्स',
    regions_complaint_resolution_rate: 'शिकायत निराकरण दर',
    regions_scheme_implementation: 'योजना कार्यान्वयन',
    regions_citizen_satisfaction: 'नागरिक संतुष्टि',
    
    // Common
    loading: 'लोड हो रहा है...',
    back: 'वापस',
    view_details: 'विवरण देखें',
    no_data: 'कोई डेटा उपलब्ध नहीं है'
  },
  ta: {
    // Home page
    home_hero_title: 'AI-இயக்கும் ஆளுநரகத்துடன் குடிமக்களை மேம்படுத்துதல்',
    home_hero_subtitle: 'அரசு திட்டங்களை அணுகவும், முறையிடுகைகளை கோப்புபதிவு செய்யவும், உங்கள் சமூகத்துடன் ஈடுபடவும்',
    home_hero_button: 'தொடங்கு',
    
    // Login page
    login_title: 'மீண்டும் வரவேற்கிறோம்',
    login_subtitle: 'உங்கள் CiviLens கணக்கில் உள்நுழைக',
    login_email: 'மின்னஞ்சல் முகவரி',
    login_email_placeholder: 'உங்கள் மின்னஞ்சலை உள்ளிடவும்',
    login_password: 'கடவுச்சொல்',
    login_password_placeholder: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்',
    login_remember_me: 'என்னை நினைவில் கொள்',
    login_forgot_password: 'உங்கள் கடவுச்சொல்லை மறந்துவிட்டீர்களா?',
    login_sign_in: 'உள்நுழைய',
    login_signing_in: 'உள்நுழைகிறது...',
    login_no_account: 'கணக்கு இல்லையா?',
    login_sign_up: 'பதிவு செய்யவும்',
    
    // Signup page
    signup_title: 'கணக்கை உருவாக்கவும்',
    signup_subtitle: 'அரசு சேவைகளை அணுக சிவிலென்ஸ் இல் சேரவும்',
    signup_username: 'பயனர்பெயர்',
    signup_username_placeholder: 'உங்கள் பயனர்பெயரை உள்ளிடவும்',
    signup_email: 'மின்னஞ்சல் முகவரி',
    signup_email_placeholder: 'உங்கள் மின்னஞ்சலை உள்ளிடவும்',
    signup_password: 'கடவுச்சொல்',
    signup_password_placeholder: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்',
    signup_confirm_password: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    signup_confirm_password_placeholder: 'உங்கள் கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    signup_role: 'பங்கு',
    signup_role_citizen: 'குடிமகன்',
    signup_role_official: 'அரசு அதிகாரி',
    signup_role_admin: 'நிர்வாகி',
    signup_creating_account: 'கணக்கு உருவாக்கப்படுகிறது...',
    signup_sign_up: 'பதிவு செய்யவும்',
    signup_already_have_account: 'ஏற்கனவே ஒரு கணக்கு உள்ளதா?',
    signup_sign_in: 'உள்நுழைய',
    
    // Scheme Detail page
    scheme_detail_not_found_title: 'திட்டம் காணப்படவில்லை',
    scheme_detail_not_found_message: 'நீங்கள் தேடும் திட்டம் இல்லை அல்லது நீக்கப்பட்டுவிட்டது.',
    scheme_detail_back_to_schemes: 'திட்டங்களுக்குத் திரும்பு',
    scheme_detail_export_infographic: 'இன்ஃபோகிராஃபிக் ஏற்றுமதி செய்',
    scheme_detail_overview: 'திட்ட மேலோட்டம்',
    scheme_detail_rate_scheme: 'இந்த திட்டத்தை மதிப்பிடுங்கள்',
    scheme_detail_score: 'ஸ்கோர்',
    scheme_detail_upvotes: 'வாக்களிப்புகள்',
    scheme_detail_downvotes: 'கீழ்வாக்குகள்',
    scheme_detail_key_details: 'முக்கிய விவரங்கள்',
    scheme_detail_eligibility: 'தகுதி',
    scheme_detail_benefits: 'நன்மைகள்',
    scheme_detail_deadline: 'கடைசி தேதி',
    scheme_detail_applicants: 'விண்ணப்பதாரர்கள்',
    scheme_detail_objectives: 'நோக்கங்கள்',
    scheme_detail_detailed_overview: 'விரிவான மேலோட்டம்',
    scheme_detail_required_documents: 'தேவையான ஆவணங்கள்',
    scheme_detail_faq: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
    scheme_detail_apply_button: 'இந்த திட்டத்திற்கு விண்ணப்பிக்கவும்',
    
    // Discussions page
    discussions_loading: 'விவாதங்கள் ஏற்றப்படுகின்றன...',
    discussions_title: 'சமூக விவாதங்கள்',
    discussions_subtitle: 'உங்கள் சமூகத்துடன் பொருத்தமான உரையாடல்களில் ஈடுபடவும்',
    discussions_start_new: 'புதிய விவாதத்தைத் தொடங்கவும்',
    discussions_all: 'அனைத்து விவாதங்கள்',
    discussions_comments: 'கருத்துகள்',
    discussions_likes: 'விருப்பங்கள்',
    discussions_view: 'விவாதத்தைப் பார்க்கவும்',
    
    home: {
      hero: {
        title: 'CiviLens-க்கு வரவேற்கிறோம்',
        subtitle: 'வெளிப்படையான ஆளுநரகம் மற்றும் திறமையான பொது சேவைகளுடன் குடிமக்களை மேம்படுத்துதல்',
        voiceFinder: {
          title: 'குரல்-இயக்கும் திட்ட கண்டுபிடிப்பான்',
          listening: 'கேட்டுக் கொண்டிருக்கிறது...',
          speak: 'திட்டங்களைக் கண்டுபிடிக்க பேசவும்',
          placeholder: 'இவ்வாறு சொல்ல முயற்சிக்கவும்: "தில்லியில் கல்விக்கான திட்டங்கள்"'
        },
        buttons: {
          fileComplaint: 'முறையிடுகை கோப்புபதிவு செய்யவும்',
          getStarted: 'தொடங்கு',
          login: 'உள்நுழைய'
        }
      },
      features: {
        title: 'எங்கள் அம்சங்கள்',
        complaintManagement: {
          title: 'முறையிடுகை மேலாண்மை',
          description: 'எங்கள் திறமையான கணினியுடன் முறையிடுகைகளை கோப்புபதிவு செய்து, கண்காணித்து, தீர்க்கவும்.'
        },
        governmentSchemes: {
          title: 'அரசு திட்டங்கள்',
          description: 'பல்வேறு அரசு திட்டங்கள் மற்றும் நிகழ்ச்சிகளைக் கண்டுபிடித்து விண்ணப்பிக்கவும்.'
        },
        communityDiscussions: {
          title: 'சமூக விவாதங்கள்',
          description: 'உங்கள் சமூக உறுப்பினர்களுடன் பொருத்தமான விவாதங்களில் ஈடுபடவும்.'
        },
        liveChatSupport: {
          title: 'நேரடி அரட்டை ஆதரவு',
          description: 'எங்கள் நேரடி அரட்டை கணினியின் மூலம் உடனடி ஆதரவைப் பெறுங்கள்.'
        },
        documentManagement: {
          title: 'ஆவண மேலாண்மை',
          description: 'முக்கியமான ஆவணங்களைப் பாதுகாப்பாகப் பதிவேற்றி, நிர்வகித்து, அணுகவும்.'
        },
        sentimentAnalysis: {
          title: 'உணர்வு பகுப்பாய்வு',
          description: 'எங்கள் மேம்பட்ட பகுப்பாய்வின் மூலம் பொது உணர்வைப் புரிந்துகொள்ளுங்கள்.'
        }
      },
      heatmap: {
        title: 'நேரடி பிராந்திய வெப்ப வரைபட முன்னோட்டம்',
        sentimentByRegion: 'பிராந்தியத்தின் உணர்வு',
        complaintsByRegion: 'பிராந்தியத்தின் முறையிடுகைகள்',
        viewFullDashboard: 'முழு பிராந்திய டாஷ்போர்டைப் பார்வையிடவும்'
      },
      stats: {
        title: 'எங்கள் தாக்கம்',
        complaintsResolved: 'முறையிடுகைகள் தீர்க்கப்பட்டன',
        governmentSchemes: 'அரசு திட்டங்கள்',
        satisfactionRate: 'திருப்தி விகிதம்'
      }
    },
    
    // Navigation
    nav_home: 'முகப்பு',
    nav_schemes: 'திட்டங்கள்',
    nav_complaints: 'முறையிடுகைகள்',
    nav_discussions: 'விவாதங்கள்',
    nav_chat: 'AI அரட்டை',
    nav_documents: 'ஆவணங்கள்',
    nav_regions: 'பிராந்தியங்கள்',
    nav_sentiment: 'உணர்வு பகுப்பாய்வு',
    nav_admin: 'நிர்வாகம்',
    nav_profile: 'சுயவிவரம்',
    nav_logout: 'வெளியேறு',
    nav_login: 'உள்நுழை',
    nav_signup: 'பதிவு செய்',
    
    // Schemes page
    schemes_title: 'அரசு திட்டங்கள்',
    schemes_subtitle: 'அரசு திட்டங்களைக் கண்டறிந்து விண்ணப்பிக்கவும்',
    schemes_search_placeholder: 'திட்டங்களைத் தேடு...',
    schemes_category_all: 'அனைத்து வகைகள்',
    schemes_infographic_export: 'இன்ஃபோகிராஃபிக் ஏற்றுமதி',
    schemes_fake_detector: 'போலி திட்டம் கண்டறிவி',
    schemes_fake_detector_placeholder: 'முன்னோக்கப்பட்ட திட்ட செய்தியை இங்கே ஒட்டவும்...',
    schemes_fake_detector_check: 'செய்தியை சரிபார்க்கவும்',
    
    // Complaints page
    complaints_title: 'முறையிடுகைகள்',
    complaints_subtitle: 'உங்கள் முறையிடுகைகளைப் பார்த்து நிர்வகிக்கவும்',
    complaints_new: 'புதிய முறையிடுகையை கோப்புபதிவு செய்',
    complaints_all: 'அனைத்து முறையிடுகைகள்',
    complaints_pending: 'நிலுவையிலுள்ள',
    complaints_in_progress: 'செயலில் உள்ளது',
    complaints_resolved: 'தீர்க்கப்பட்டது',
    
    // New Complaint page
    new_complaint_title: 'புதிய முறையிடுகையை கோப்புபதிவு செய்',
    new_complaint_subtitle: 'தொடர்புடைய அதிகாரிகளுக்கு புதிய முறையிடுகையை சமர்ப்பிக்கவும்',
    new_complaint_title_label: 'முறையிடுகை தலைப்பு',
    new_complaint_title_placeholder: 'உங்கள் முறையிடுகையை சுருக்கமாக விளக்கவும்',
    new_complaint_description: 'விளக்கம்',
    new_complaint_description_placeholder: 'உங்கள் முறையிடுகை பற்றி விரிவான தகவலை வழங்கவும்',
    new_complaint_category: 'வகை',
    new_complaint_location: 'இடம்',
    new_complaint_location_placeholder: 'சிக்கலின் இடத்தை உள்ளிடவும்',
    new_complaint_upload: 'ஆவணத்தைப் பதிவேற்று (OCR-க்காக)',
    new_complaint_ocr: 'உரையை பிரித்தெடு (OCR)',
    new_complaint_submit: 'முறையிடுகையை சமர்ப்பி',
    new_complaint_cancel: 'ரத்துசெய்',
    
    // Profile page
    profile_title: 'பயனர் சுயவிவரம்',
    profile_subtitle: 'உங்கள் கணக்கு அமைப்புகளை நிர்வகிக்கவும்',
    profile_username: 'பயனர்பெயர்',
    profile_email: 'மின்னஞ்சல்',
    profile_first_name: 'முதல் பெயர்',
    profile_last_name: 'கடைசி பெயர்',
    profile_phone: 'தொலைபேசி எண்',
    profile_address: 'முகவரி',
    profile_save: 'மாற்றங்களை சேமி',
    
    // Admin Panel
    adminPanel: {
      title: 'நிர்வாக பலகம்',
      subtitle: 'பயனர்கள் மற்றும் கணினி அமைப்புகளை நிர்வகிக்கவும்',
      searchPlaceholder: 'பயனர்களை தேடு...',
      filterAll: 'அனைத்தும்',
      filterAdmin: 'நிர்வாகி',
      filterOfficials: 'அதிகாரிகள்',
      filterCitizens: 'குடிமக்கள்',
      addNewUser: 'புதிய பயனரை சேர்',
      noUsersFound: 'பயனர்கள் எதுவும் கிடைக்கவில்லை',
      adjustSearch: 'உங்கள் தேடல் அல்லது வடிகட்டி மானத்தை சரிசெய்ய முயற்சிக்கவும்',
      deactivate: 'செயல்நீக்கு',
      activate: 'செயல்படுத்து',
      delete: 'நீக்கு',
      table: {
        user: 'பயனர்',
        role: 'பங்கு',
        activity: 'செயல்பாடு',
        contributions: 'பங்களிப்புகள்',
        status: 'நிலை',
        actions: 'செயல்கள்'
      },
      stats: {
        totalUsers: 'மொத்த பயனர்கள்',
        activeUsers: 'செயலில் உள்ள பயனர்கள்',
        officials: 'அதிகாரிகள்',
        admins: 'நிர்வாகிகள்'
      }
    },
    
    // Sentiment Analysis
    sentiment: {
      title: 'உணர்வு பகுப்பாய்வு',
      subtitle: 'அரசாங்க சேவைகள் மீதான பொது உணர்வு நுண்ணறிவு',
      dataNotAvailable: 'உணர்வு தரவு கிடைக்கவில்லை',
      unableToLoad: 'உணர்வு பகுப்பாய்வு தரவை ஏற்ற முடியவில்லை.',
      timeRange: {
        week: 'வாரம்',
        month: 'மாதம்',
        quarter: 'காலாண்டு'
      },
      overall: {
        title: 'ஒட்டுமொத்த பொது உணர்வு',
        positiveLabel: 'நேர்மறை உணர்வு'
      },
      trends: {
        title: 'உணர்வு போக்குகள்'
      },
      category: {
        title: 'வகைப்படி உணர்வு'
      },
      keywords: {
        title: 'முக்கிய முக்கிய சொற்கள்'
      }
    },
    
    // Documents page
    documents_loading: 'ஆவணங்கள் ஏற்றப்படுகின்றன...',
    documents_title: 'ஆவண மேலாண்மை',
    documents_subtitle: 'உங்கள் முக்கியமான ஆவணங்களை பதிவேற்றம் செய்யவும், நிர்வகிக்கவும் மற்றும் அணுகவும்',
    documents_upload_title: 'புதிய ஆவணத்தை பதிவேற்றவும்',
    documents_uploading: 'பதிவேற்றம் செய்யப்படுகிறது...',
    documents_upload: 'பதிவேற்றவும்',
    documents_your_documents: 'உங்கள் ஆவணங்கள்',
    documents_size: 'அளவு',
    documents_category: 'வகை',
    documents_uploaded: 'பதிவேற்றப்பட்டது',
    documents_view: 'பார்வையிடு',
    documents_download: 'பதிவிறக்கம் செய்',
    documents_delete: 'நீக்கு',
    documents_no_documents: 'ஆவணங்கள் இல்லை',
    documents_no_documents_message: 'புதிய ஆவணத்தை பதிவேற்றம் செய்வதன் மூலம் தொடங்கவும்.',
    
    // Regions page
    regions_loading: 'பகுதிகள் ஏற்றப்படுகின்றன...',
    regions_title: 'பகுதிகளின் கண்ணோட்டம்',
    regions_subtitle: 'வெவ்வேறு பகுதிகளில் ஆளுநர் தரவை ஆராய்க',
    regions_population: 'மக்கள் தொகை',
    regions_active_complaints: 'செயலில் உள்ள முறையிடுகைகள்',
    regions_schemes: 'திட்டங்கள்',
    regions_officials: 'அதிகாரிகள்',
    regions_performance: 'செயல்திறன்',
    regions_details: 'விவரங்கள்',
    regions_performance_score: 'செயல்திறன் மதிப்பெண்',
    regions_government_schemes: 'அரசு திட்டங்கள்',
    regions_government_officials: 'அரசு அதிகாரிகள்',
    regions_performance_metrics: 'செயல்திறன் அளவீடுகள்',
    regions_complaint_resolution_rate: 'முறையிடுகை தீர்வு விகிதம்',
    regions_scheme_implementation: 'திட்ட செயல்படுத்தல்',
    regions_citizen_satisfaction: 'குடிமக்கள் திருப்தி',
    
    // Common
    loading: 'ஏற்றுகிறது...',
    back: 'பின் செல்',
    view_details: 'விவரங்களை பார்',
    no_data: 'தரவு எதுவும் கிடைக்கவில்லை'
  }
}

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en')
  
  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language')
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage)
    }
  }, [])
  
  // Save language preference to localStorage
  const updateLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage)
      localStorage.setItem('language', newLanguage)
    }
  }
  
  // Get translated text with support for nested keys
  const t = (key) => {
    // Handle nested keys (e.g., 'home.hero.title')
    const keys = key.split('.')
    let value = translations[language] || {}
    let defaultValue = translations['en'] || {}
    
    // Traverse the nested keys
    for (const k of keys) {
      value = value?.[k]
      defaultValue = defaultValue?.[k]
      
      // If we hit an undefined value, break early
      if (value === undefined && defaultValue === undefined) {
        break
      }
    }
    
    // Return the translation or fallback to English or the key itself
    return value || defaultValue || key
  }
  
  const value = {
    language,
    updateLanguage,
    t,
    languages: Object.keys(translations)
  }
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export default LanguageContext
