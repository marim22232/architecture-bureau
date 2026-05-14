import jsPDF from 'jspdf';

export const exportContactToPDF = (contact) => {
    const doc = new jsPDF();
    
    // Заголовок
    doc.setFontSize(20);
    doc.setTextColor(160, 137, 114); // цвет #A08972
    doc.text('Архитектурное бюро M&Y', 20, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(31, 36, 40); // цвет #1F2428
    doc.text('Заявка на проект', 20, 35);
    
    doc.setFontSize(12);
    doc.setTextColor(75, 100, 115); // цвет #4B6473
    
    // Данные заявки
    let y = 55;
    
    doc.text(`Имя: ${contact.name || '-'}`, 20, y);
    y += 10;
    doc.text(`Телефон: ${contact.phone || '-'}`, 20, y);
    y += 10;
    doc.text(`Email: ${contact.email || '-'}`, 20, y);
    y += 10;
    doc.text(`Город: ${contact.city || '-'}`, 20, y);
    y += 10;
    
    // Сообщение
    doc.text('Сообщение:', 20, y);
    y += 7;
    
    // Разбиваем длинное сообщение на строки
    const message = contact.message || contact.question || '-';
    const lines = doc.splitTextToSize(message, 170);
    doc.text(lines, 20, y);
    y += lines.length * 7 + 10;
    
    // Статус
    const statusText = contact.status === 'new' ? 'Новая' : 
                       contact.status === 'in_progress' ? 'В работе' : 'Завершена';
    doc.text(`Статус: ${statusText}`, 20, y);
    y += 10;
    
    // Дата
    const date = new Date(contact.created_at).toLocaleString('ru-RU');
    doc.text(`Дата: ${date}`, 20, y);
    
    // Сохраняем PDF
    doc.save(`заявка_${contact.name || 'клиент'}_${Date.now()}.pdf`);
};