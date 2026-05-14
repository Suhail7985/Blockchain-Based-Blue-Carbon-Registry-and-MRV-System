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
    blockchain: 'Blockchain Ledger',
    totalCO2: 'Total CO2 Offset',
    verifiedSites: 'Verified Sites',
    welcomeBack: 'Welcome back',
    notificationsTitle: 'Recent Notifications',
    activeProjects: 'Active Projects',
    buyCredits: 'Buy Credits',
    inventory: 'Inventory',
    pricePerTon: 'Price per Ton',
    integrityScore: 'Integrity Score',
    verificationTrail: 'Verification Trail',
    auditLineage: 'Audit Lineage',
    home: 'Home Page',
    landRegistration: 'Land Registration',
    myPlantations: 'My Plantations & Status',
    healthMonitoring: 'Health Monitoring',
    panchayatVerification: 'Panchayat Verification',
    nccrApproval: 'NCCR Approval',
    backToWebsite: 'Back to Website',
    verifyTitle: 'Verify Any Blue Carbon Credit',
    verifySubtitle: 'Input a Plantation ID, Wallet Address, or Blockchain Hash to trace the complete audit lineage.',
    exploreBtn: 'Explore',
    scientificId: 'Scientific ID',
    downloadCert: 'Download Certificate',
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
    totalCO2: 'মোট কার্বন ডাই অক্সাইড অফসেট',
    verifiedSites: 'যাচাইকৃত সাইট',
    welcomeBack: 'স্বাগতম ফিরে আসার জন্য',
    notificationsTitle: 'সাম্প্রতিক বিজ্ঞপ্তি',
    activeProjects: 'সক্রিয় প্রকল্প',
    buyCredits: 'ক্রেডিট কিনুন',
    inventory: 'ইনভেন্টরি',
    pricePerTon: 'টন প্রতি মূল্য',
    integrityScore: 'সততা স্কোর',
    verificationTrail: 'যাচাইকরণ ট্রেইল',
    auditLineage: 'অডিট লিনিয়েজ',
    home: 'হোম',
    backToWebsite: 'ওয়েবসাইটে ফিরে যান',
    verifyTitle: 'যেকোনো ব্লু কার্বন ক্রেডিট যাচাই করুন',
    verifySubtitle: 'অডিট লিনিয়েজ ট্রেস করতে প্ল্যান্টেশন আইডি, ওয়ালেট ঠিকানা বা ব্লকচেইন হ্যাশ ইনপুট করুন।',
    exploreBtn: 'অন্বেষণ করুন',
    scientificId: 'বৈজ্ঞানিক আইডি',
    downloadCert: 'শংসাপত্র ডাউনলোড করুন',
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
    totalCO2: 'மொத்த CO2 ஈடுசெய்தல்',
    verifiedSites: 'சரிபார்க்கப்பட்ட தளங்கள்',
    welcomeBack: 'மீண்டும் வருக',
    notificationsTitle: 'சமீபத்திய அறிவிப்புகள்',
    activeProjects: 'செயலில் உள்ள திட்டங்கள்',
    buyCredits: 'கிரிடிட்களை வாங்கவும்',
    inventory: 'சரக்கு',
    pricePerTon: 'ஒரு டன் விலை',
    integrityScore: 'நேர்மை மதிப்பெண்',
    verificationTrail: 'சரிபார்ப்பு பாதை',
    auditLineage: 'தணிக்கை வம்சாவளி',
    home: 'முகப்பு',
    backToWebsite: 'இணையதளத்திற்குச் செல்லவும்',
    verifyTitle: 'எந்தவொரு ப்ளூ கார்பன் கிரெடிட்டையும் சரிபார்க்கவும்',
    verifySubtitle: 'தணிக்கை வம்சாவளியை அறிய பிளான்டேஷன் ஐடி, வாலட் முகவரி அல்லது பிளாக்செயின் ஹாஷ் உள்ளிடுக.',
    exploreBtn: 'ஆராயுங்கள்',
    scientificId: 'அறிவியல் ஐடி',
    downloadCert: 'சான்றிதழை பதிவிறக்கவும்',
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
    totalCO2: 'કુલ CO2 ઓફસેટ',
    verifiedSites: 'ચકાસાયેલ સાઇટ્સ',
    welcomeBack: 'ફરી સ્વાગત છે',
    notificationsTitle: 'તાજેતરની સૂચનાઓ',
    activeProjects: 'સક્રિય પ્રોજેક્ટ્સ',
    buyCredits: 'ક્રેડિટ ખરીદો',
    inventory: 'ઇન્વેન્ટરી',
    pricePerTon: 'ટન દીઠ કિંમત',
    integrityScore: 'ઇન્ટિગ્રિટી સ્કોર',
    verificationTrail: 'ચકાસણી ટ્રેઇલ',
    auditLineage: 'ઓડિટ વંશાવળી',
    home: 'હોમ',
    backToWebsite: 'વેબસાઇટ પર પાછા ફરો',
    verifyTitle: 'કોઈપણ બ્લુ કાર્બન ક્રેડિટ ચકાસો',
    verifySubtitle: 'ઓડિટ વંશાવળી ટ્રેસ કરવા માટે પ્લાન્ટેશન ID, વૉલેટ ઍડ્રેસ અથવા બ્લોકચેન હેશ ઇનપુટ કરો.',
    exploreBtn: 'અન્વેષણ કરો',
    scientificId: 'વૈજ્ઞાનિક ID',
    downloadCert: 'પ્રમાણપત્ર ડાઉનલોડ કરો',
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
