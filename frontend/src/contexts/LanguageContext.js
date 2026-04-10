import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    dashboard: 'Dashboard',
    marketplace: 'CSR Marketplace',
    explorer: 'Integrity Explorer',
    nationalImpact: 'National Impact',
    gisMonitoring: 'GIS Monitoring',
    plantationSubmission: 'Plantation Submission',
    profile: 'Profile & KYC',
    logout: 'Logout',
    intelligenceLab: 'Intelligence Lab',
    welcome: 'Welcome to CarbonSetu',
    credits: 'Carbon Credits',
    blockchain: 'Blockchain Records',
  },
  bn: { // Bengali
    dashboard: 'ড্যাশবোর্ড',
    marketplace: 'সিএসআর মার্কেটপ্লেস',
    explorer: 'সততা এক্সপ্লোরার',
    nationalImpact: 'জাতীয় প্রভাব',
    gisMonitoring: 'জিআইএস মনিটরিং',
    plantationSubmission: 'বনায়ন জমা',
    profile: 'প্রোফাইল এবং কেওয়াইসি',
    logout: 'লগআউট',
    intelligenceLab: 'ইন্টেলিজেন্স ল্যাব',
    welcome: 'কার্বনসেতু-তে স্বাগতম',
    credits: 'কার্বন ক্রেডিট',
    blockchain: 'ব্লকচেইন রেকর্ড',
  },
  ta: { // Tamil
    dashboard: 'டாஷ்போர்டு',
    marketplace: 'சிஎஸ்ஆர் சந்தை',
    explorer: 'நேர்மை எக்ஸ்ப்ளோரர்',
    nationalImpact: 'தேசிய தாக்கம்',
    gisMonitoring: 'ஜிஐஎஸ் கண்காணிப்பு',
    plantationSubmission: 'தோட்ட சமர்ப்பிப்பு',
    profile: 'சுயவிவரம் & KYC',
    logout: 'வெளியேறு',
    intelligenceLab: 'இன்டெலிஜென்ஸ் லேப்',
    welcome: 'கார்பன் சேதுவுக்கு வரவேற்கிறோம்',
    credits: 'கார்பன் வரவுகள்',
    blockchain: 'பிளாக்செயின் பதிவுகள்',
  },
  gu: { // Gujarati
    dashboard: 'ડેશબોર્ડ',
    marketplace: 'CSR માર્કેટપ્લેસ',
    explorer: 'ઇન્ટિગ્રિટી એક્સપ્લોરર',
    nationalImpact: 'રાષ્ટ્રીય પ્રભાવ',
    gisMonitoring: 'GIS મોનિટરિંગ',
    plantationSubmission: 'પ્લાન્ટેશન સબમિશન',
    profile: 'પ્રોફાઇલ અને KYC',
    logout: 'લોગઆઉટ',
    intelligenceLab: 'ઇન્ટેલિજન્સ લેબ',
    welcome: 'કાર્બનસેતુમાં આપનું સ્વાગત છે',
    credits: 'કાર્બન ક્રેડિટ્સ',
    blockchain: 'બ્લોકચેન રેકોર્ડ્સ',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('preferredLang') || 'en');

  const t = (key) => {
    return translations[lang]?.[key] || translations['en'][key] || key;
  };

  useEffect(() => {
    localStorage.setItem('preferredLang', lang);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);

export const languages = [
  { code: 'en', name: 'English' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' }
];
