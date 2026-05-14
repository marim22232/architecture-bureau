import './Typography.css'

const Typography = ({
  children,
  variant = 'body', // h1, h2, h3, h4, body, small, caption
  color = 'default', // default, primary, accent, white, dark
  align = 'justify', // left, center, right
  weight = 'normal', // normal, medium, semibold, bold
  className = '',
  as: Component, // ← НОВЫЙ ПРОП: позволяет переопределить HTML-тег
  ...props
}) => {
  const getElement = () => {
    // Если передан кастомный тег — используем его
    if (Component) return Component;
    
    switch (variant) {
      case 'h1':
        return 'h1';
      case 'h2':
        return 'h2';
      case 'h3':
        return 'h3';
      case 'h4':
        return 'h4';
      case 'span':
        return 'span';  // ← добавляем поддержку span
      case 'div':
        return 'div';   // ← добавляем поддержку div
      default:
        return 'p';
    }
  };

  const Element = getElement();

  return (
    <Element
      className={`typography typography-${variant} typography-${color} typography-${align} typography-weight-${weight} ${className}`}
      {...props}
    >
      {children}
    </Element>
  );
};

export default Typography;