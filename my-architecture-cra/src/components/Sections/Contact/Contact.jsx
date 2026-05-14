import React from 'react';
import './Contact.css';
import ContactForm from '../../UI/ContactForm/ContactForm.jsx';  // ← с .jsx
const Contact = () => {
  return (
    <section className="contact-section">
      <div className="container-inner">
        <ContactForm 
          title="НАПИШИТЕ НАМ"
          subtitle="Мы ответим на любые интересующие вас вопросы"
          buttonText="ОТПРАВИТЬ"
        />
      </div>
    </section>
  );
};

export default Contact;  // ← ЭТО ОЧЕНЬ ВАЖНО!