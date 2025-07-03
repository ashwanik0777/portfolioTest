import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

// Language options
const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },   // Hindi
  { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' },     // Kannada
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },    // Marathi
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  // Get current language information
  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    // Optional: store language preference in localStorage
    localStorage.setItem('i18nextLng', langCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="h-8 w-auto gap-1 px-1.5 xs:px-2 sm:px-3 text-xs sm:text-sm font-normal bg-primary/10 hover:bg-primary/20 hover:text-primary border-primary/20"
        >
          <motion.span 
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.2 }}
            className="text-base"
          >
            {currentLang.flag}
          </motion.span>
          <span className="hidden sm:inline-block text-xs sm:text-sm font-medium ml-1">{currentLang.label}</span>
          <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5 sm:ml-1 text-primary/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
        {languages.map(lang => (
          <DropdownMenuItem
            key={lang.code}
            className={`cursor-pointer ${lang.code === i18n.language ? 'bg-muted' : ''}`}
            onClick={() => handleLanguageChange(lang.code)}
          >
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center">
                <span className="mr-2 text-base">{lang.flag}</span>
                <span className="text-sm">{lang.label}</span>
              </span>
              {lang.code === i18n.language && (
                <svg className="w-4 h-4 text-primary ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}