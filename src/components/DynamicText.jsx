import { useDynamicTextColor } from '../hooks/useDynamicTextColor.js';

/**
 * Component that automatically adjusts text color based on background image brightness
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child content
 * @param {string} props.type - Text type ('primary', 'secondary', 'muted')
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.as - HTML element type (default: 'span')
 * @param {Object} props.options - Dynamic text color options
 * @param {Object} props...rest - Other props to pass to the element
 */
export default function DynamicText({
  children,
  type = 'primary',
  className = '',
  as: Component = 'span',
  options = {},
  ...rest
}) {
  const { getTextClass, hasBackgroundImage } = useDynamicTextColor(options);

  const dynamicTextClass = getTextClass(type);
  const combinedClassName = [dynamicTextClass, className].filter(Boolean).join(' ');

  return (
    <Component
      className={combinedClassName}
      data-dynamic-text={hasBackgroundImage ? 'true' : 'false'}
      {...rest}
    >
      {children}
    </Component>
  );
}

/**
 * Pre-configured components for common text types
 */
export const DynamicHeading = (props) => (
  <DynamicText {...props} type="primary" as="h1" />
);

export const DynamicSubtext = (props) => (
  <DynamicText {...props} type="secondary" as="p" />
);

export const DynamicMutedText = (props) => (
  <DynamicText {...props} type="muted" as="span" />
);

/**
 * Higher-order component that wraps any component with dynamic text colors
 * @param {React.Component} WrappedComponent
 * @param {Object} defaultOptions
 */
export const withDynamicTextColor = (WrappedComponent, defaultOptions = {}) => {
  return function DynamicTextWrapper(props) {
    const { textClasses, hasBackgroundImage } = useDynamicTextColor({
      ...defaultOptions,
      ...props.dynamicTextOptions
    });

    return (
      <WrappedComponent
        {...props}
        dynamicTextClasses={textClasses}
        hasBackgroundImage={hasBackgroundImage}
      />
    );
  };
};