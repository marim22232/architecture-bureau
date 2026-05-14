import { useEffect, useRef } from "react";

export const useObserver = (ref, canLoad, isLoading, callback) => {
    const observer = useRef();

    useEffect(() => {
        // Если идет загрузка - выходим
        if (isLoading) return;
        
        // Отключаем предыдущий observer
        if (observer.current) {
            observer.current.disconnect();
        }

        const cb = function(entries) {
            if (entries[0].isIntersecting && canLoad) {
                callback();
            }
        };
        
        // Создаем новый observer
        observer.current = new IntersectionObserver(cb);
        
        // ВАЖНО: проверяем, что ref.current существует и является элементом
        if (ref.current) {
            observer.current.observe(ref.current);
        } else {
            console.log('ref.current не существует');
        }

        // Очистка при размонтировании
        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, [isLoading, canLoad, callback, ref]); // Добавляем зависимости
}