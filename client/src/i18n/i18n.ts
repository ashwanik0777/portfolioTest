import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Hardcoded translations
const resources = {
  en: {
    translation: {
      "feedback": {
        "veryUnsatisfied": "Very Unsatisfied",
        "unsatisfied": "Unsatisfied",
        "neutral": "Neutral",
        "satisfied": "Satisfied",
        "verySatisfied": "Very Satisfied",
        "giveFeedback": "Feedback",
        "thankYou": "Thank you for your feedback!",
        "feedbackReceived": "Your feedback has been received.",
        "error": "Error",
        "errorSubmitting": "There was a problem submitting your feedback.",
        "shareExperience": "Share your experience",
        "howWasBrowsing": "How was your experience with this portfolio?",
        "additionalComments": "Additional comments (optional)",
        "tellUsMore": "Tell us more about your experience...",
        "submitting": "Submitting...",
        "submit": "Submit Feedback"
      },
      "nav": {
        "home": "Home",
        "about": "About",
        "skills": "Skills",
        "projects": "Projects",
        "experience": "Experience",
        "contact": "Contact",
        "blog": "Blog"
      },
      "blog": {
        "title": "Blog",
        "description": "Thoughts, stories and ideas from my journey as a developer",
        "searchPlaceholder": "Search posts by title, tags or content...",
        "readMore": "Read More",
        "noPostsFound": "No posts found",
        "tryDifferentSearch": "Try a different search term",
        "errorLoading": "Error loading blog posts",
        "backToBlog": "Back to Blog",
        "minRead": "min read",
        "comments": "Comments",
        "noComments": "No comments yet. Be the first to comment!",
        "leaveComment": "Leave a Comment",
        "name": "Name",
        "email": "Email",
        "comment": "Comment",
        "submitComment": "Submit Comment",
        "commentSubmitted": "Comment Submitted",
        "commentAddedMessage": "Your comment has been added successfully",
        "commentError": "Error Submitting Comment",
        "recentPosts": "Recent Posts",
        "popularTags": "Popular Tags",
        "loadMore": "Load More Posts",
        "publishedOn": "Published on",
        "updatedOn": "Updated on",
        "authorBy": "By",
        "relatedPosts": "Related Posts",
        "allPosts": "All Posts",
        "latestArticles": "Latest Articles",
        "featuredPosts": "Featured Posts",
        "clearSearch": "Clear Search",
        "categories": "Categories",
        "sharePost": "Share Post",
        "moreFromAuthor": "More from the Author",
        "subscribe": "Subscribe to Newsletter",
        "subscribeDescription": "Get the latest posts delivered right to your inbox",
        "subscribeButton": "Subscribe",
        "thanksForSubscribing": "Thanks for subscribing!",
        "content": "Content",
        "views": "views",
        "minRemaining": "min remaining",
        "like": "Like",
        "unlike": "Unlike",
        "bookmark": "Bookmark",
        "removeBookmark": "Remove Bookmark",
        "share": "Share",
        "linkCopied": "Link Copied",
        "linkCopiedDescription": "The link has been copied to your clipboard",
        "postLiked": "Post Liked",
        "earnedPoints": "You earned {{points}} points!",
        "postBookmarked": "Post Bookmarked",
        "postSavedForLater": "This post has been saved for later reading",
        "codeCopied": "Code Copied",
        "codeCopiedDescription": "The code snippet has been copied to clipboard",
        "articleRead": "Article Read",
        "enjoyedArticle": "Enjoyed this article?",
        "supportMessage": "Show your appreciation and engage with this content",
        "liked": "Liked",
        "likeThis": "Like this article",
        "bookmarked": "Bookmarked",
        "bookmarkForLater": "Bookmark for later",
        "scrollToTop": "Scroll to top",
        "postNotFound": "Post Not Found",
        "postMayBeRemoved": "The post you're looking for may have been removed or doesn't exist",
        "browsePosts": "Browse all posts",
        "validationError": "Validation Error",
        "allFieldsRequired": "All fields are required",
        "submitting": "Submitting..."
      },
      "hero": {
        "greeting": "Hi, I'm",
        "intro": "I'm a",
        "contactButton": "Contact Me",
        "downloadResume": "Download Resume",
        "scrollDown": "Scroll down to explore"
      },
      "about": {
        "title": "About Me",
        "experience": "Years of Experience",
        "projects": "Projects Completed",
        "clients": "Satisfied Clients"
      },
      "skills": {
        "title": "My Skills",
        "subtitle": "Expertise & Technologies"
      },
      "projects": {
        "title": "Projects",
        "subtitle": "My Recent Work",
        "viewProject": "View Project",
        "viewCode": "View Code"
      },
      "experience": {
        "title": "Experience",
        "subtitle": "My Professional Journey",
        "present": "Present",
        "responsibilities": "Responsibilities"
      },
      "contact": {
        "title": "Contact Me",
        "subtitle": "Get In Touch",
        "nameLabel": "Your Name",
        "emailLabel": "Your Email",
        "messageLabel": "Your Message",
        "submitButton": "Send Message",
        "successMessage": "Message sent successfully!",
        "errorMessage": "Something went wrong. Please try again."
      },
      "footer": {
        "copyright": "All rights reserved",
        "madeWith": "Made with"
      },
      "auth": {
        "login": "Login",
        "username": "Username",
        "password": "Password",
        "submit": "Submit",
        "loginError": "Invalid username or password",
        "adminPanel": "Admin Panel",
        "securePortal": "Secure Admin Portal",
        "managePortfolio": "Manage your portfolio content and showcase your work to the world.",
        "dynamicContent": "Dynamic Content",
        "dynamicContentDesc": "Update your portfolio content easily through the admin dashboard",
        "imageUpload": "Image Upload",
        "imageUploadDesc": "Upload and manage images for your projects and profile",
        "resumeManagement": "Resume Management",
        "resumeManagementDesc": "Upload and update your resume for visitors to download",
        "enhancedSecurity": "Enhanced Security",
        "enhancedSecurityDesc": "Advanced protection with account lockout prevention",
        "administratorAccess": "Administrator Access",
        "accessCredentials": "Enter your credentials to manage your portfolio",
        "adminUsername": "Administrator Username",
        "enterUsername": "Enter your username",
        "adminPassword": "Administrator Password",
        "enterPassword": "Enter your password",
        "accountLocked": "Account Temporarily Locked",
        "tooManyAttempts": "Too many failed login attempts",
        "tryAgainIn": "Please try again in",
        "seconds": "seconds",
        "warningAttempts": "Warning:",
        "loginAttemptsRemaining": "login attempt remaining",
        "loginAttemptsRemaining_plural": "login attempts remaining",
        "authenticating": "Authenticating...",
        "secureLogin": "Secure Login",
        "authorizedOnly": "For authorized personnel only",
        "returnToPortfolio": "Return to Portfolio",
        "loginSuccess": "Login Successful",
        "welcomeAdmin": "Welcome to the portfolio admin panel",
        "loginFailed": "Login Failed",
        "invalidCredentials": "Invalid credentials."
      }
    }
  },
  es: {
    translation: {
      "feedback": {
        "veryUnsatisfied": "Muy Insatisfecho",
        "unsatisfied": "Insatisfecho",
        "neutral": "Neutral",
        "satisfied": "Satisfecho",
        "verySatisfied": "Muy Satisfecho",
        "giveFeedback": "Comentarios",
        "thankYou": "¡Gracias por tus comentarios!",
        "feedbackReceived": "Tus comentarios han sido recibidos.",
        "error": "Error",
        "errorSubmitting": "Hubo un problema al enviar tus comentarios.",
        "shareExperience": "Comparte tu experiencia",
        "howWasBrowsing": "¿Cómo fue tu experiencia con este portafolio?",
        "additionalComments": "Comentarios adicionales (opcional)",
        "tellUsMore": "Cuéntanos más sobre tu experiencia...",
        "submitting": "Enviando...",
        "submit": "Enviar Comentarios"
      },
      "nav": {
        "home": "Inicio",
        "about": "Sobre Mí",
        "skills": "Habilidades",
        "projects": "Proyectos",
        "experience": "Experiencia",
        "contact": "Contacto",
        "blog": "Blog"
      },
      "blog": {
        "title": "Blog",
        "description": "Pensamientos, historias e ideas de mi viaje como desarrollador",
        "searchPlaceholder": "Buscar publicaciones por título, etiquetas o contenido...",
        "readMore": "Leer Más",
        "noPostsFound": "No se encontraron publicaciones",
        "tryDifferentSearch": "Intenta con un término de búsqueda diferente",
        "errorLoading": "Error al cargar publicaciones del blog",
        "backToBlog": "Volver al Blog",
        "minRead": "min de lectura",
        "comments": "Comentarios",
        "noComments": "Aún no hay comentarios. ¡Sé el primero en comentar!",
        "leaveComment": "Dejar un Comentario",
        "name": "Nombre",
        "email": "Correo electrónico",
        "comment": "Comentario",
        "submitComment": "Enviar Comentario",
        "commentSubmitted": "Comentario Enviado",
        "commentAddedMessage": "Tu comentario ha sido añadido exitosamente",
        "commentError": "Error al Enviar Comentario",
        "recentPosts": "Publicaciones Recientes",
        "popularTags": "Etiquetas Populares",
        "loadMore": "Cargar Más Publicaciones",
        "publishedOn": "Publicado el",
        "updatedOn": "Actualizado el",
        "authorBy": "Por",
        "relatedPosts": "Publicaciones Relacionadas",
        "allPosts": "Todas las Publicaciones",
        "latestArticles": "Últimos Artículos",
        "featuredPosts": "Publicaciones Destacadas",
        "clearSearch": "Limpiar Búsqueda",
        "categories": "Categorías",
        "sharePost": "Compartir Publicación",
        "moreFromAuthor": "Más del Autor",
        "subscribe": "Suscribirse al Boletín",
        "subscribeDescription": "Recibe las últimas publicaciones directamente en tu bandeja de entrada",
        "subscribeButton": "Suscribirse",
        "thanksForSubscribing": "¡Gracias por suscribirte!"
      },
      "hero": {
        "greeting": "Hola, soy",
        "intro": "Soy un",
        "contactButton": "Contáctame",
        "downloadResume": "Descargar CV",
        "scrollDown": "Desplázate para explorar"
      },
      "about": {
        "title": "Sobre Mí",
        "experience": "Años de Experiencia",
        "projects": "Proyectos Completados",
        "clients": "Clientes Satisfechos"
      },
      "skills": {
        "title": "Mis Habilidades",
        "subtitle": "Experiencia y Tecnologías"
      },
      "projects": {
        "title": "Proyectos",
        "subtitle": "Mi Trabajo Reciente",
        "viewProject": "Ver Proyecto",
        "viewCode": "Ver Código"
      },
      "experience": {
        "title": "Experiencia",
        "subtitle": "Mi Trayectoria Profesional",
        "present": "Presente",
        "responsibilities": "Responsabilidades"
      },
      "contact": {
        "title": "Contáctame",
        "subtitle": "Ponte en Contacto",
        "nameLabel": "Tu Nombre",
        "emailLabel": "Tu Email",
        "messageLabel": "Tu Mensaje",
        "submitButton": "Enviar Mensaje",
        "successMessage": "¡Mensaje enviado con éxito!",
        "errorMessage": "Algo salió mal. Por favor, inténtalo de nuevo."
      },
      "footer": {
        "copyright": "Todos los derechos reservados",
        "madeWith": "Hecho con"
      },
      "auth": {
        "login": "Iniciar Sesión",
        "username": "Usuario",
        "password": "Contraseña",
        "submit": "Enviar",
        "loginError": "Usuario o contraseña inválidos",
        "adminPanel": "Panel de Administrador",
        "securePortal": "Portal de Administrador Seguro",
        "managePortfolio": "Administra el contenido de tu portafolio y muestra tu trabajo al mundo.",
        "dynamicContent": "Contenido Dinámico",
        "dynamicContentDesc": "Actualiza el contenido de tu portafolio fácilmente a través del panel de administración",
        "imageUpload": "Carga de Imágenes",
        "imageUploadDesc": "Sube y administra imágenes para tus proyectos y perfil",
        "resumeManagement": "Gestión de Currículum",
        "resumeManagementDesc": "Sube y actualiza tu currículum para que los visitantes puedan descargarlo",
        "enhancedSecurity": "Seguridad Mejorada",
        "enhancedSecurityDesc": "Protección avanzada con prevención de bloqueo de cuenta",
        "administratorAccess": "Acceso de Administrador",
        "accessCredentials": "Ingresa tus credenciales para administrar tu portafolio",
        "adminUsername": "Nombre de Usuario de Administrador",
        "enterUsername": "Ingresa tu nombre de usuario",
        "adminPassword": "Contraseña de Administrador",
        "enterPassword": "Ingresa tu contraseña",
        "accountLocked": "Cuenta Temporalmente Bloqueada",
        "tooManyAttempts": "Demasiados intentos fallidos",
        "tryAgainIn": "Inténtalo de nuevo en",
        "seconds": "segundos",
        "warningAttempts": "Advertencia:",
        "loginAttemptsRemaining": "intento de inicio de sesión restante",
        "loginAttemptsRemaining_plural": "intentos de inicio de sesión restantes",
        "authenticating": "Autenticando...",
        "secureLogin": "Inicio de Sesión Seguro",
        "authorizedOnly": "Solo para personal autorizado",
        "returnToPortfolio": "Volver al Portafolio",
        "loginSuccess": "Inicio de Sesión Exitoso",
        "welcomeAdmin": "Bienvenido al panel de administrador del portafolio",
        "loginFailed": "Error de Inicio de Sesión",
        "invalidCredentials": "Credenciales inválidas."
      }
    }
  },
  hi: {
    translation: {
      "nav": {
        "home": "होम",
        "about": "परिचय",
        "skills": "कौशल",
        "projects": "प्रोजेक्ट्स",
        "experience": "अनुभव",
        "contact": "संपर्क",
        "blog": "ब्लॉग"
      },
      "blog": {
        "title": "ब्लॉग",
        "description": "मेरी डेवलपर यात्रा से विचार, कहानियां और आइडियाज",
        "searchPlaceholder": "शीर्षक, टैग या सामग्री द्वारा पोस्ट खोजें...",
        "readMore": "और पढ़ें",
        "noPostsFound": "कोई पोस्ट नहीं मिली",
        "tryDifferentSearch": "एक अलग खोज शब्द का प्रयास करें",
        "errorLoading": "ब्लॉग पोस्ट लोड करने में त्रुटि",
        "backToBlog": "ब्लॉग पर वापस जाएं",
        "minRead": "मिनट का पठन",
        "comments": "टिप्पणियां",
        "noComments": "अभी तक कोई टिप्पणी नहीं। टिप्पणी करने वाले पहले व्यक्ति बनें!",
        "leaveComment": "टिप्पणी छोड़ें",
        "name": "नाम",
        "email": "ईमेल",
        "comment": "टिप्पणी",
        "submitComment": "टिप्पणी जमा करें",
        "commentSubmitted": "टिप्पणी जमा की गई",
        "commentAddedMessage": "आपकी टिप्पणी सफलतापूर्वक जोड़ी गई है",
        "commentError": "टिप्पणी जमा करने में त्रुटि",
        "recentPosts": "हाल की पोस्ट",
        "popularTags": "लोकप्रिय टैग",
        "loadMore": "अधिक पोस्ट लोड करें",
        "publishedOn": "प्रकाशित",
        "updatedOn": "अपडेट किया गया",
        "authorBy": "द्वारा",
        "relatedPosts": "संबंधित पोस्ट",
        "allPosts": "सभी पोस्ट",
        "latestArticles": "नवीनतम लेख",
        "featuredPosts": "विशेष पोस्ट",
        "clearSearch": "खोज साफ करें",
        "categories": "श्रेणियाँ",
        "sharePost": "पोस्ट साझा करें",
        "moreFromAuthor": "लेखक से और",
        "subscribe": "न्यूजलेटर के लिए सदस्यता लें",
        "subscribeDescription": "नवीनतम पोस्ट सीधे अपने इनबॉक्स में प्राप्त करें",
        "subscribeButton": "सदस्यता लें",
        "thanksForSubscribing": "सदस्यता लेने के लिए धन्यवाद!"
      },
      "hero": {
        "greeting": "नमस्ते, मैं हूँ",
        "intro": "मैं एक",
        "contactButton": "संपर्क करें",
        "downloadResume": "रिज्यूमे डाउनलोड करें",
        "scrollDown": "नीचे स्क्रॉल करके देखें"
      },
      "about": {
        "title": "मेरे बारे में",
        "experience": "अनुभव के वर्ष",
        "projects": "पूरे किए गए प्रोजेक्ट्स",
        "clients": "संतुष्ट ग्राहक"
      },
      "skills": {
        "title": "मेरे कौशल",
        "subtitle": "विशेषज्ञता और प्रौद्योगिकियां"
      },
      "projects": {
        "title": "प्रोजेक्ट्स",
        "subtitle": "मेरा हाल का काम",
        "viewProject": "प्रोजेक्ट देखें",
        "viewCode": "कोड देखें"
      },
      "experience": {
        "title": "अनुभव",
        "subtitle": "मेरी पेशेवर यात्रा",
        "present": "वर्तमान",
        "responsibilities": "जिम्मेदारियां"
      },
      "contact": {
        "title": "मुझसे संपर्क करें",
        "subtitle": "संपर्क में रहें",
        "nameLabel": "आपका नाम",
        "emailLabel": "आपका ईमेल",
        "messageLabel": "आपका संदेश",
        "submitButton": "संदेश भेजें",
        "successMessage": "संदेश सफलतापूर्वक भेजा गया!",
        "errorMessage": "कुछ गलत हो गया। कृपया पुनः प्रयास करें।"
      },
      "auth": {
        "login": "लॉगिन",
        "username": "उपयोगकर्ता नाम",
        "password": "पासवर्ड",
        "submit": "सबमिट करें",
        "administratorAccess": "व्यवस्थापक एक्सेस",
        "accessCredentials": "अपने पोर्टफोलियो को प्रबंधित करने के लिए अपने क्रेडेंशियल दर्ज करें",
        "adminUsername": "व्यवस्थापक उपयोगकर्ता नाम",
        "enterUsername": "अपना उपयोगकर्ता नाम दर्ज करें",
        "adminPassword": "व्यवस्थापक पासवर्ड",
        "enterPassword": "अपना पासवर्ड दर्ज करें",
        "accountLocked": "अकाउंट अस्थायी रूप से लॉक है",
        "tooManyAttempts": "बहुत अधिक असफल लॉगिन प्रयास",
        "tryAgainIn": "कृपया इतने समय बाद पुनः प्रयास करें",
        "seconds": "सेकंड",
        "warningAttempts": "चेतावनी:",
        "loginAttemptsRemaining": "लॉगिन प्रयास शेष",
        "authenticating": "प्रमाणीकरण हो रहा है...",
        "secureLogin": "सुरक्षित लॉगिन",
        "authorizedOnly": "केवल अधिकृत कर्मियों के लिए",
        "returnToPortfolio": "पोर्टफोलियो पर वापस जाएं"
      }
    }
  },
  kn: {
    translation: {
      "nav": {
        "home": "ಮುಖಪುಟ",
        "about": "ನನ್ನ ಬಗ್ಗೆ",
        "skills": "ಕೌಶಲ್ಯಗಳು",
        "projects": "ಪ್ರಾಜೆಕ್ಟ್‌ಗಳು",
        "experience": "ಅನುಭವ",
        "contact": "ಸಂಪರ್ಕಿಸಿ"
      }
    }
  },
  mr: {
    translation: {
      "nav": {
        "home": "मुखपृष्ठ",
        "about": "माझ्याबद्दल",
        "skills": "कौशल्ये",
        "projects": "प्रकल्प",
        "experience": "अनुभव",
        "contact": "संपर्क"
      }
    }
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: true, // Enable debug temporarily
    
    // Define namespaces
    ns: ['translation'],
    defaultNS: 'translation',
    
    // Set default language
    lng: 'en',
    
    // Support language detection but don't auto-detect
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    
    // React settings
    react: {
      useSuspense: false, // Disable suspense for easier debugging
    },
    
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
  });

export default i18n;