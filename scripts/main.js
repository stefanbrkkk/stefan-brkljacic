import {initLanguage} from './language.js';
import {initInquiry} from './inquiry.js';
import {initImages} from './images.js';
import {initEmail} from './email.js';
import {initBook} from './book.js';

try {
 const language=initLanguage(()=>document.dispatchEvent(new Event('portfolio-language')));
 language.commit();document.documentElement.classList.add('language-ready');
} catch(error){console.error('Language enhancement unavailable:',error);}
try{initInquiry();}catch(error){console.error('Inquiry enhancement unavailable:',error);}
try{initEmail();}catch(error){console.error('Email enhancement unavailable:',error);}
initImages();
initBook();
