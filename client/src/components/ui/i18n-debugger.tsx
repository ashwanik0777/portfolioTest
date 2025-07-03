import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export function I18nDebugger() {
  const { t, i18n } = useTranslation();
  
  useEffect(() => {
    console.log('Current language:', i18n.language);
    console.log('Hero greeting translation:', t('hero.greeting'));
    console.log('Auth login translation:', t('auth.login'));
    console.log('Available languages:', i18n.languages);
    console.log('Translation store:', i18n.store.data);
  }, [t, i18n]);
  
  return null; // This component doesn't render anything
}